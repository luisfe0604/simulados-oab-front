import { requireUser, toSafeUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";

// Retorna o usuário autenticado SEM o password_hash (corrige o vazamento do
// backend antigo, que fazia SELECT *).
export const GET = handle(async () => {
  const user = await requireUser();
  return json({ user: toSafeUser(user) });
});
