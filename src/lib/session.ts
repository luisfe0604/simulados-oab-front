import { getCurrentUser, hasPaidAccess } from "./auth";
import type { SessionUser } from "./session-types";

/** Monta o view-model de sessão a partir do usuário autenticado. Null se deslogado. */
export async function getSession(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    subscription_status: user.subscription_status,
    is_admin: Boolean(user.is_admin),
    hasPaid: hasPaidAccess(user),
    cancel_at_period_end: Boolean(user.cancel_at_period_end),
    subscription_cancelled_at:
      user.subscription_cancelled_at?.toISOString() ?? null,
    trial_end: user.trial_end?.toISOString() ?? null,
  };
}
