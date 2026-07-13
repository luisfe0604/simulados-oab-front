import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePaid } from "@/lib/auth";
import { badRequest, handle, json } from "@/lib/http";
import { parseBody, parseQuery } from "@/lib/validation";

const answerSchema = z.object({
  question_id: z.coerce.number().int().positive(),
  // Alternativa marcada; vazia/nula = questão não respondida.
  selected_option: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(["a", "b", "c", "d", "e"]))
    .nullable()
    .optional(),
});

const submitSchema = z.object({
  answers: z.array(answerSchema).min(1, "Nenhuma resposta enviada"),
  duration_seconds: z.coerce.number().int().min(0).optional().default(0),
});

// Finaliza e corrige um simulado: calcula acertos/score e persiste o resultado
// e o snapshot de cada resposta, tudo em uma transação.
export const POST = handle(async (request: Request) => {
  const user = await requirePaid();
  const { answers, duration_seconds } = await parseBody(request, submitSchema);

  const questionIds = answers.map((a) => a.question_id);
  const questions = await prisma.questions.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, correct_option: true },
  });
  const correctById = new Map(questions.map((q) => [q.id, q.correct_option]));

  const total = answers.length;
  let correct = 0;
  const questionRows = answers.map((a) => {
    // O gabarito no banco pode estar em maiúsculo ("D"); a resposta do usuário é
    // normalizada para minúsculo. Comparamos ambos em minúsculo.
    const correctOption = correctById.get(a.question_id)?.toLowerCase() ?? null;
    const selected = a.selected_option ?? null;
    const isCorrect = selected !== null && selected === correctOption;
    if (isCorrect) correct += 1;
    return {
      question_id: a.question_id,
      selected_option: selected,
      is_correct: isCorrect,
    };
  });

  const score = total > 0 ? new Prisma.Decimal((correct / total) * 100) : new Prisma.Decimal(0);

  const created = await prisma.$transaction(async (tx) => {
    const exam = await tx.simulated_exams.create({
      data: {
        user_id: user.id,
        total_questions: total,
        correct_answers: correct,
        score,
        duration_seconds,
      },
    });
    await tx.simulated_exam_questions.createMany({
      data: questionRows.map((r) => ({
        simulated_exam_id: exam.id,
        question_id: r.question_id,
        selected_option: r.selected_option,
        is_correct: r.is_correct,
      })),
    });
    return exam;
  });

  return json(
    {
      id: created.id,
      totalQuestions: total,
      correctAnswers: correct,
      score: Number(score),
    },
    201,
  );
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// Lista paginada dos simulados do usuário autenticado (mais recentes primeiro).
export const GET = handle(async (request: Request) => {
  const user = await requirePaid();
  const { searchParams } = new URL(request.url);
  const { page, limit } = parseQuery(searchParams, listQuerySchema);

  const [total, data] = await Promise.all([
    prisma.simulated_exams.count({ where: { user_id: user.id } }),
    prisma.simulated_exams.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        total_questions: true,
        correct_answers: true,
        score: true,
        duration_seconds: true,
        created_at: true,
      },
    }),
  ]);

  if (total > 0 && data.length === 0 && page > 1) {
    throw badRequest("Página fora do intervalo");
  }

  return json({
    data: data.map((s) => ({ ...s, score: s.score ? Number(s.score) : 0 })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
