import { z } from "zod";
import { requirePaid } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { parseQuery } from "@/lib/validation";
import { generateWrongQuestions } from "@/lib/questions";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Questões que o usuário errou em simulados anteriores (revisão de erros).
export const GET = handle(async (request: Request) => {
  const user = await requirePaid();
  const { searchParams } = new URL(request.url);
  const { limit } = parseQuery(searchParams, querySchema);

  const questions = await generateWrongQuestions(user.id, limit);
  return json(questions);
});
