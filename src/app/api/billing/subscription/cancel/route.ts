import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { badRequest, handle, json } from "@/lib/http";

// Agenda o cancelamento da assinatura para o fim do período vigente.
export const POST = handle(async () => {
  const user = await requireUser();
  if (!user.gateway_subscription_id) {
    throw badRequest("Nenhuma assinatura ativa encontrada");
  }

  await stripe.subscriptions.update(user.gateway_subscription_id, {
    cancel_at_period_end: true,
  });

  await prisma.users.update({
    where: { id: user.id },
    data: { cancel_at_period_end: true, subscription_cancelled_at: new Date() },
  });

  return json({ ok: true });
});
