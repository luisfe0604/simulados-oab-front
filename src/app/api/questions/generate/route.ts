import { z } from "zod";
import { requirePaid } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { parseQuery } from "@/lib/validation";
import { generateQuestions } from "@/lib/questions";

const querySchema = z.object({
  subject_id: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Geração livre de questões aleatórias (modo "Personalizado"), sem gabarito.
export const GET = handle(async (request: Request) => {
  await requirePaid();
  const { searchParams } = new URL(request.url);
  const { subject_id, limit } = parseQuery(searchParams, querySchema);

  const questions = await generateQuestions(subject_id, limit);
  return json(questions);
});
