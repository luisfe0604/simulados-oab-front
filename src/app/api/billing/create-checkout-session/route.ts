import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { handle, json } from "@/lib/http";

// Cria uma sessão de checkout de assinatura no Stripe (com 7 dias de trial) e
// devolve a URL para redirecionamento no cliente.
export const POST = handle(async () => {
  const user = await requireUser();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: String(user.id),
    metadata: { userId: String(user.id) },
    line_items: [{ price: env.stripePriceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${env.appUrl}/conta?checkout=success`,
    cancel_url: `${env.appUrl}/conta?checkout=cancel`,
  });

  return json({ url: session.url });
});
