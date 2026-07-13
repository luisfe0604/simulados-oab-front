import { requireUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";

// Estado da assinatura do usuário autenticado (consumido pelo frontend para
// liberar conteúdo e exibir o status na conta).
export const GET = handle(async () => {
  const user = await requireUser();
  return json({
    subscription_status: user.subscription_status,
    plan: user.plan,
    cancel_at_period_end: user.cancel_at_period_end,
    subscription_cancelled_at: user.subscription_cancelled_at,
    trial_end: user.trial_end,
    is_admin: user.is_admin,
  });
});
