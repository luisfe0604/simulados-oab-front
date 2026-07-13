import Stripe from "stripe";
import { env } from "./env";

// Singleton do cliente Stripe (reutilizado entre invocações no mesmo processo).
const globalForStripe = globalThis as unknown as { stripe: Stripe | undefined };

export const stripe =
  globalForStripe.stripe ?? new Stripe(env.stripeSecretKey);

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}

// Status de assinatura por ordem de prioridade — usado ao reconciliar quando um
// cliente possui mais de uma assinatura no Stripe.
export const STATUS_PRIORITY: Record<string, number> = {
  active: 5,
  trialing: 4,
  past_due: 3,
  incomplete: 2,
  canceled: 1,
};
