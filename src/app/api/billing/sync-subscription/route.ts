import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { stripe, STATUS_PRIORITY } from "@/lib/stripe";
import { handle, json } from "@/lib/http";

// Reconcilia o status da assinatura do usuário autenticado a partir do Stripe.
// Segurança: só sincroniza a assinatura do PRÓPRIO usuário logado (por
// gateway_customer_id ou pelo e-mail dele) — nunca por um id arbitrário.
//
// Resiliência: se o gateway_customer_id ainda não foi gravado (o webhook de
// checkout.session.completed não chegou), buscamos o customer no Stripe pelo
// e-mail. Assim a ativação pós-checkout funciona mesmo sem o webhook.
export const POST = handle(async () => {
  const user = await requireUser();

  // Descobre em quais customers procurar. Cada checkout com customer_email cria
  // um customer NOVO no Stripe, então um usuário pode ter vários — buscamos por
  // e-mail (todos) e incluímos também o gateway_customer_id já gravado.
  const customerIds = new Set<string>();
  if (user.gateway_customer_id) customerIds.add(user.gateway_customer_id);
  const customers = await stripe.customers.list({
    email: user.email,
    limit: 20,
  });
  customers.data.forEach((c) => customerIds.add(c.id));

  if (customerIds.size === 0) {
    return json({ synced: false, reason: "sem_customer" });
  }

  // Reúne as assinaturas de todos os customers e escolhe a mais relevante.
  let best: { sub: Stripe.Subscription; customerId: string } | null = null;
  for (const customerId of customerIds) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    for (const sub of subs.data) {
      const better =
        !best ||
        (STATUS_PRIORITY[sub.status] ?? 0) >
          (STATUS_PRIORITY[best.sub.status] ?? 0);
      if (better) best = { sub, customerId };
    }
  }

  if (!best) {
    // Cliente existe no Stripe mas sem nenhuma assinatura.
    await prisma.users.update({
      where: { id: user.id },
      data: {
        subscription_status: "inactive",
        plan: "free",
        gateway_customer_id: [...customerIds][0],
      },
    });
    return json({ synced: true, status: "inactive" });
  }

  const { sub, customerId } = best;
  const isActive = sub.status === "active" || sub.status === "trialing";

  await prisma.users.update({
    where: { id: user.id },
    data: {
      subscription_status: sub.status,
      plan: isActive ? "premium" : "free",
      gateway_customer_id: customerId,
      gateway_subscription_id: sub.id,
      cancel_at_period_end: sub.cancel_at_period_end,
      subscription_cancelled_at: sub.cancel_at_period_end ? new Date() : null,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
    },
  });

  return json({ synced: true, status: sub.status });
});
