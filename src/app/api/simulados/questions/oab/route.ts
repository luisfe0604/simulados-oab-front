import { requirePaid } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { generateOabSimulado } from "@/lib/questions";

// Monta o simulado padrão OAB (80 questões, distribuição oficial por matéria).
export const GET = handle(async () => {
  await requirePaid();
  const questions = await generateOabSimulado();
  return json(questions);
});
