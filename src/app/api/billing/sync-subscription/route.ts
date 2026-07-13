import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { stripe, STATUS_PRIORITY } from "@/lib/stripe";
import { handle, json } from "@/lib/http";

// Reconcilia o status da assinatura do usuário autenticado a partir do Stripe.
// IMPORTANTE: diferente do backend antigo (que aceitava um customer_id arbitrário
// SEM autenticação), aqui só sincronizamos a assinatura do PRÓPRIO usuário logado,
// derivada do gateway_customer_id armazenado — fecha a brecha de segurança.
export const POST = handle(async () => {
  const user = await requireUser();
  if (!user.gateway_customer_id) {
    return json({ synced: false, reason: "sem_customer" });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.gateway_customer_id,
    status: "all",
    limit: 100,
  });

  if (subscriptions.data.length === 0) {
    await prisma.users.update({
      where: { id: user.id },
      data: { subscription_status: "inactive", plan: "free" },
    });
    return json({ synced: true, status: "inactive" });
  }

  // Escolhe a assinatura mais relevante por prioridade de status.
  const best = subscriptions.data.reduce((acc, sub) =>
    (STATUS_PRIORITY[sub.status] ?? 0) > (STATUS_PRIORITY[acc.status] ?? 0)
      ? sub
      : acc,
  );

  await prisma.users.update({
    where: { id: user.id },
    data: {
      subscription_status: best.status,
      plan: best.status === "active" || best.status === "trialing" ? "premium" : "free",
      gateway_subscription_id: best.id,
      cancel_at_period_end: best.cancel_at_period_end,
      subscription_cancelled_at: best.cancel_at_period_end ? new Date() : null,
      trial_end: best.trial_end ? new Date(best.trial_end * 1000) : null,
    },
  });

  return json({ synced: true, status: best.status });
});
