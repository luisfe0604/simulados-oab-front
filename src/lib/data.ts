import { prisma } from "./prisma";

export interface SimuladoSummary {
  id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration_seconds: number | null;
  created_at: string | null;
}

function toSummary(s: {
  id: number;
  total_questions: number;
  correct_answers: number;
  score: unknown;
  duration_seconds: number | null;
  created_at: Date | null;
}): SimuladoSummary {
  return {
    id: s.id,
    total_questions: s.total_questions,
    correct_answers: s.correct_answers,
    score: s.score ? Number(s.score) : 0,
    duration_seconds: s.duration_seconds,
    created_at: s.created_at?.toISOString() ?? null,
  };
}

export interface DashboardData {
  total: number;
  avgScore: number;
  bestScore: number;
  questionsAnswered: number;
  avgSecondsPerQuestion: number;
  recent: SimuladoSummary[];
}

export async function getDashboardData(userId: number): Promise<DashboardData> {
  const exams = await prisma.simulated_exams.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      total_questions: true,
      correct_answers: true,
      score: true,
      duration_seconds: true,
      created_at: true,
    },
  });

  const total = exams.length;
  const scores = exams.map((e) => (e.score ? Number(e.score) : 0));
  const avgScore = total ? scores.reduce((a, b) => a + b, 0) / total : 0;
  const bestScore = total ? Math.max(...scores) : 0;
  const questionsAnswered = exams.reduce((a, e) => a + e.total_questions, 0);
  const totalDuration = exams.reduce((a, e) => a + (e.duration_seconds ?? 0), 0);
  const avgSecondsPerQuestion = questionsAnswered
    ? totalDuration / questionsAnswered
    : 0;

  return {
    total,
    avgScore,
    bestScore,
    questionsAnswered,
    avgSecondsPerQuestion,
    recent: exams.slice(0, 5).map(toSummary),
  };
}

export interface RetakeQuestion {
  id: number;
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string | null;
  option_e: string | null;
  subjects: { id: number; name: string }[];
}

/** Questões de um simulado passado (do próprio usuário) para refazer — SEM gabarito. */
export async function getSimuladoForRetake(
  userId: number,
  simuladoId: number,
): Promise<RetakeQuestion[] | null> {
  const exam = await prisma.simulated_exams.findFirst({
    where: { id: simuladoId, user_id: userId },
    select: {
      simulated_exam_questions: {
        select: {
          questions: {
            select: {
              id: true,
              statement: true,
              option_a: true,
              option_b: true,
              option_c: true,
              option_d: true,
              option_e: true,
              question_subjects: {
                select: { subjects: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!exam) return null;

  return exam.simulated_exam_questions
    .map((row) => row.questions)
    .filter((q): q is NonNullable<typeof q> => q !== null)
    .map((q) => ({
      id: q.id,
      statement: q.statement,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      option_e: q.option_e,
      subjects: q.question_subjects.map((qs) => qs.subjects),
    }));
}

export async function getSubjects(): Promise<{ id: number; name: string }[]> {
  return prisma.subjects.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export interface AdminMetrics {
  total_users: number;
  status: Record<string, number>;
  users_growth: { month: string; count: number }[];
  simulados_total: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [totalUsers, byStatus, growth, simuladosTotal] = await Promise.all([
    prisma.users.count(),
    prisma.users.groupBy({
      by: ["subscription_status"],
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ month: string; count: number }[]>`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
             count(*)::int AS count
      FROM users WHERE created_at IS NOT NULL
      GROUP BY 1 ORDER BY 1
    `,
    prisma.simulated_exams.count(),
  ]);

  const status: Record<string, number> = {};
  for (const row of byStatus) {
    status[row.subscription_status ?? "unknown"] = row._count._all;
  }

  return {
    total_users: totalUsers,
    status,
    users_growth: growth,
    simulados_total: simuladosTotal,
  };
}

export async function getHistorico(userId: number): Promise<SimuladoSummary[]> {
  const exams = await prisma.simulated_exams.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      total_questions: true,
      correct_answers: true,
      score: true,
      duration_seconds: true,
      created_at: true,
    },
  });
  return exams.map(toSummary);
}
