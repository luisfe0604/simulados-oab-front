import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// Distribuição oficial do Exame de Ordem (80 questões) por matéria. Mapeada por
// NOME — os IDs são resolvidos em runtime, para não quebrar se os ids do banco
// mudarem entre ambientes (o backend antigo fixava os ids no código).
export const OAB_DISTRIBUTION: ReadonlyArray<readonly [string, number]> = [
  ["Ética Profissional", 8],
  ["Filosofia do Direito", 2],
  ["Direito Constitucional", 6],
  ["Direitos Humanos", 2],
  ["Direito Eleitoral", 2],
  ["Direito Internacional", 2],
  ["Direito Financeiro", 2],
  ["Direito Tributário", 5],
  ["Direito Administrativo", 5],
  ["Direito Ambiental", 2],
  ["Direito Civil", 6],
  ["ECA", 2],
  ["Direito do Consumidor", 2],
  ["Direito Empresarial", 4],
  ["Processo Civil", 6],
  ["Direito Penal", 6],
  ["Processo Penal", 6],
  ["Direito Previdenciário", 2],
  ["Direito do Trabalho", 5],
  ["Processo do Trabalho", 5],
];

// Campos enviados ao cliente durante a prova — SEM correct_option, para que o
// gabarito não trafegue para o navegador antes da correção.
export const publicQuestionSelect = {
  id: true,
  statement: true,
  option_a: true,
  option_b: true,
  option_c: true,
  option_d: true,
  option_e: true,
  difficulty: true,
  exam_id: true,
  exams: { select: { id: true, name: true, year: true } },
  question_subjects: {
    select: { subjects: { select: { id: true, name: true } } },
  },
} satisfies Prisma.questionsSelect;

export type PublicQuestion = Prisma.questionsGetPayload<{
  select: typeof publicQuestionSelect;
}>;

/** Busca questões públicas por lista de ids, preservando a ordem dada e sem duplicatas. */
async function fetchPublicQuestionsOrdered(
  ids: number[],
): Promise<PublicQuestion[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];

  const rows = await prisma.questions.findMany({
    where: { id: { in: unique } },
    select: publicQuestionSelect,
  });
  const byId = new Map(rows.map((q) => [q.id, q]));
  return unique
    .map((id) => byId.get(id))
    .filter((q): q is PublicQuestion => q !== undefined);
}

/** Monta o simulado padrão OAB (80 questões) conforme a distribuição por matéria. */
export async function generateOabSimulado(): Promise<PublicQuestion[]> {
  // Resolve nome → id das matérias da distribuição.
  const names = OAB_DISTRIBUTION.map(([name]) => name);
  const subjects = await prisma.subjects.findMany({
    where: { name: { in: names as string[] } },
    select: { id: true, name: true },
  });
  const idByName = new Map(subjects.map((s) => [s.name, s.id]));

  // Tabela (subject_id, limite) para a seleção aleatória por matéria.
  const pairs: Prisma.Sql[] = [];
  for (const [name, limit] of OAB_DISTRIBUTION) {
    const id = idByName.get(name);
    if (id !== undefined) pairs.push(Prisma.sql`(${id}::int, ${limit}::int)`);
  }
  if (pairs.length === 0) return [];

  // Uma única query: seleciona aleatoriamente `limite` questões por matéria via
  // ROW_NUMBER() particionado, ordenando o resultado por matéria.
  const rows = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
    WITH limits(subject_id, lim) AS (VALUES ${Prisma.join(pairs)}),
    ranked AS (
      SELECT q.id,
             qs.subject_id,
             row_number() OVER (PARTITION BY qs.subject_id ORDER BY random()) AS rn,
             l.lim
      FROM questions q
      JOIN question_subjects qs ON qs.question_id = q.id
      JOIN limits l ON l.subject_id = qs.subject_id
    )
    SELECT id FROM ranked WHERE rn <= lim ORDER BY subject_id, rn
  `);

  return fetchPublicQuestionsOrdered(rows.map((r) => r.id));
}

/** Geração livre (modo "Personalizado"): aleatórias, opcionalmente por matéria. */
export async function generateQuestions(
  subjectId: number | undefined,
  limit: number,
): Promise<PublicQuestion[]> {
  const rows = subjectId
    ? await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT q.id FROM questions q
        JOIN question_subjects qs ON qs.question_id = q.id
        WHERE qs.subject_id = ${subjectId}
        ORDER BY random() LIMIT ${limit}
      `)
    : await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT id FROM questions ORDER BY random() LIMIT ${limit}
      `);

  return fetchPublicQuestionsOrdered(rows.map((r) => r.id));
}

/** Questões que o usuário ERROU em simulados anteriores (revisão de erros). */
export async function generateWrongQuestions(
  userId: number,
  limit: number,
): Promise<PublicQuestion[]> {
  // DISTINCT em subquery: o Postgres não permite ORDER BY random() junto de
  // SELECT DISTINCT, então isolamos a deduplicação antes de sortear.
  const rows = await prisma.$queryRaw<{ question_id: number }[]>(Prisma.sql`
    SELECT question_id FROM (
      SELECT DISTINCT seq.question_id
      FROM simulated_exam_questions seq
      JOIN simulated_exams se ON se.id = seq.simulated_exam_id
      WHERE se.user_id = ${userId}
        AND seq.is_correct = false
        AND seq.question_id IS NOT NULL
    ) sub
    ORDER BY random() LIMIT ${limit}
  `);

  return fetchPublicQuestionsOrdered(rows.map((r) => r.question_id));
}
