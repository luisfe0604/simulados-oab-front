import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { badRequest, handle, json } from "@/lib/http";

// Reverte um cancelamento agendado (reativa a renovação automática).
export const POST = handle(async () => {
  const user = await requireUser();
  if (!user.gateway_subscription_id) {
    throw badRequest("Nenhuma assinatura encontrada");
  }

  await stripe.subscriptions.update(user.gateway_subscription_id, {
    cancel_at_period_end: false,
  });

  await prisma.users.update({
    where: { id: user.id },
    data: { cancel_at_period_end: false, subscription_cancelled_at: null },
  });

  return json({ ok: true });
});
