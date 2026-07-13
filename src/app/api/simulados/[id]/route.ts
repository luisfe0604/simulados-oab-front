import { prisma } from "@/lib/prisma";
import { requirePaid } from "@/lib/auth";
import { handle, json, notFound } from "@/lib/http";

// Detalhe de um simulado do usuário: inclui cada questão com gabarito, resposta
// marcada e acerto/erro (usado na revisão e no "refazer").
export const GET = handle(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    const user = await requirePaid();
    const { id } = await params;
    const simuladoId = Number(id);
    if (!Number.isInteger(simuladoId)) throw notFound("Simulado não encontrado");

    const exam = await prisma.simulated_exams.findFirst({
      where: { id: simuladoId, user_id: user.id },
      select: {
        id: true,
        total_questions: true,
        correct_answers: true,
        score: true,
        duration_seconds: true,
        created_at: true,
        simulated_exam_questions: {
          select: {
            selected_option: true,
            is_correct: true,
            questions: {
              select: {
                id: true,
                statement: true,
                option_a: true,
                option_b: true,
                option_c: true,
                option_d: true,
                option_e: true,
                correct_option: true,
                question_subjects: {
                  select: { subjects: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!exam) throw notFound("Simulado não encontrado");

    return json({
      id: exam.id,
      total_questions: exam.total_questions,
      correct_answers: exam.correct_answers,
      score: exam.score ? Number(exam.score) : 0,
      duration_seconds: exam.duration_seconds,
      created_at: exam.created_at,
      questions: exam.simulated_exam_questions.map((row) => ({
        ...row.questions,
        // Normaliza para minúsculo (o banco tem gabaritos em maiúsculo).
        correct_option: row.questions?.correct_option?.toLowerCase() ?? null,
        selected_option: row.selected_option,
        is_correct: row.is_correct,
        subjects: row.questions?.question_subjects.map((qs) => qs.subjects) ?? [],
      })),
    });
  },
);
