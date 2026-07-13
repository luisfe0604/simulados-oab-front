import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { badRequest, handle, json } from "@/lib/http";
import { parseBody } from "@/lib/validation";

const schema = z.object({
  statement: z.string().trim().min(1, "Enunciado é obrigatório"),
  option_a: z.string().trim().min(1, "Alternativa A é obrigatória"),
  option_b: z.string().trim().min(1, "Alternativa B é obrigatória"),
  option_c: z.string().trim().min(1, "Alternativa C é obrigatória"),
  option_d: z.string().trim().optional().nullable(),
  option_e: z.string().trim().optional().nullable(),
  correct_option: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.enum(["a", "b", "c", "d", "e"])),
  difficulty: z.coerce.number().int().min(1).max(5).optional().default(1),
  exam_id: z.coerce.number().int().positive().optional().nullable(),
  subjects: z.array(z.coerce.number().int().positive()).optional().default([]),
});

// Criação de questão — restrita a ADMIN (o backend antigo liberava para qualquer
// assinante; a tela de cadastro do frontend já era admin-only, então alinhamos).
export const POST = handle(async (request: Request) => {
  const data = await parseBody(request, schema);

  // Garante que a alternativa correta aponta para uma opção efetivamente preenchida.
  const optionValue: Record<string, string | null | undefined> = {
    a: data.option_a,
    b: data.option_b,
    c: data.option_c,
    d: data.option_d,
    e: data.option_e,
  };
  if (!optionValue[data.correct_option]) {
    throw badRequest(
      `A alternativa correta (${data.correct_option.toUpperCase()}) está vazia`,
    );
  }

  const question = await prisma.questions.create({
    data: {
      statement: data.statement,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c,
      option_d: data.option_d || null,
      option_e: data.option_e || null,
      correct_option: data.correct_option,
      difficulty: data.difficulty,
      exam_id: data.exam_id ?? null,
      question_subjects: {
        create: data.subjects.map((subject_id) => ({ subject_id })),
      },
    },
    include: { question_subjects: true },
  });

  return json(question, 201);
});
