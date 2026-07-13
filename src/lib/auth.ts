import { cookies } from "next/headers";
import type { users as User } from "@prisma/client";
import { prisma } from "./prisma";
import { signSession, verifySession } from "./jwt";
import { forbidden, unauthorized } from "./http";
import { SESSION_COOKIE } from "./constants";

export { SESSION_COOKIE };
const SEVEN_DAYS = 60 * 60 * 24 * 7;

// Status de assinatura que liberam acesso ao conteúdo pago.
const PAID_STATUSES = new Set(["active", "trialing", "trial"]);

/** Usuário sem o campo sensível password_hash — formato seguro para respostas. */
export type SafeUser = Omit<User, "password_hash">;

export function toSafeUser(user: User): SafeUser {
  const { password_hash: _omit, ...safe } = user;
  void _omit;
  return safe;
}

export async function setSessionCookie(userId: number): Promise<void> {
  const token = signSession({ userId });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Lê a sessão do cookie e carrega o usuário do banco. Null se ausente/inválido. */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySession(token);
  if (!payload) return null;

  return prisma.users.findUnique({ where: { id: payload.userId } });
}

/** Exige usuário autenticado; lança 401 caso contrário. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

/** Exige usuário admin; lança 401/403. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!user.is_admin) throw forbidden();
  return user;
}

export function hasPaidAccess(user: User): boolean {
  return Boolean(user.is_admin) || PAID_STATUSES.has(user.subscription_status ?? "");
}

/** Exige assinatura ativa (ou admin); lança 401/403. */
export async function requirePaid(): Promise<User> {
  const user = await requireUser();
  if (!hasPaidAccess(user)) throw forbidden("Plano inativo");
  return user;
}
