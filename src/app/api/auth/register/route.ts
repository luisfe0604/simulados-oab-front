import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie, toSafeUser } from "@/lib/auth";
import { badRequest, handle, json } from "@/lib/http";
import { parseBody } from "@/lib/validation";

const schema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(150),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const POST = handle(async (request: Request) => {
  const { name, email, password } = await parseBody(request, schema);

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) throw badRequest("E-mail já cadastrado");

  const password_hash = await hashPassword(password);

  // Novas contas começam sem assinatura ativa (paridade com o backend atual):
  // o acesso ao conteúdo pago exige checkout/trial via Stripe.
  const user = await prisma.users.create({
    data: {
      name,
      email,
      password_hash,
      plan: "free",
      subscription_status: "inactive",
    },
  });

  await setSessionCookie(user.id);
  return json({ user: toSafeUser(user) }, 201);
});
