import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie, toSafeUser } from "@/lib/auth";
import { handle, json, unauthorized } from "@/lib/http";
import { parseBody } from "@/lib/validation";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const POST = handle(async (request: Request) => {
  const { email, password } = await parseBody(request, schema);

  const user = await prisma.users.findUnique({ where: { email } });
  // Mensagem genérica (não revela se o e-mail existe) — evita enumeração de contas.
  if (!user) throw unauthorized("E-mail ou senha inválidos");

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) throw unauthorized("E-mail ou senha inválidos");

  await setSessionCookie(user.id);
  return json({ user: toSafeUser(user) });
});
