import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { handleStripeEvent } from "@/lib/billing";

// Route handlers não fazem parse do corpo por padrão, então usamos request.text()
// para obter o corpo bruto exigido pela verificação de assinatura do Stripe.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "assinatura inválida";
    return NextResponse.json(
      { error: `Webhook inválido: ${message}` },
      { status: 400 },
    );
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("Erro ao processar webhook Stripe:", err);
    return NextResponse.json(
      { error: "Falha ao processar evento" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
