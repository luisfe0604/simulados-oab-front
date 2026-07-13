import type Stripe from "stripe";
import { prisma } from "./prisma";
import { stripe } from "./stripe";

function toDate(unixSeconds: number | null | undefined): Date | null {
  return unixSeconds ? new Date(unixSeconds * 1000) : null;
}

// Processa os eventos de webhook do Stripe, refletindo o estado da assinatura na
// tabela `users`. Cada handler é idempotente (pode reprocessar o mesmo evento).
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = Number(session.metadata?.userId);
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;
      if (!userId || !subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await prisma.users.update({
        where: { id: userId },
        data: {
          plan: "premium",
          subscription_status: subscription.status,
          gateway_customer_id:
            typeof session.customer === "string" ? session.customer : null,
          gateway_subscription_id: subscription.id,
          trial_end: toDate(subscription.trial_end),
          subscription_started_at: new Date(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;
      if (!customerId) break;
      await prisma.users.updateMany({
        where: { gateway_customer_id: customerId },
        data: { subscription_status: "active", plan: "premium" },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.users.updateMany({
        where: { gateway_subscription_id: subscription.id },
        data: {
          subscription_status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          subscription_cancelled_at: subscription.cancel_at_period_end
            ? new Date()
            : null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;
      if (!customerId) break;
      await prisma.users.updateMany({
        where: { gateway_customer_id: customerId },
        data: { subscription_status: "past_due" },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.users.updateMany({
        where: { gateway_subscription_id: subscription.id },
        data: {
          subscription_status: "canceled",
          plan: "free",
          cancel_at_period_end: false,
        },
      });
      break;
    }

    default:
      // Evento não tratado — ignorado silenciosamente.
      break;
  }
}
