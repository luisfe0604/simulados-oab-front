import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { handle, json, notFound } from "@/lib/http";
import { getUserIdParam } from "@/lib/admin-params";

// Cancela a assinatura de um usuário (admin). Corrige a rota quebrada do backend
// antigo, que referenciava imports inexistentes.
export const DELETE = handle(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    await requireAdmin();
    const userId = await getUserIdParam(params);

    const target = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, gateway_subscription_id: true },
    });
    if (!target) throw notFound("Usuário não encontrado");

    if (target.gateway_subscription_id) {
      // Cancela imediatamente no Stripe (ignora erro se já não existir lá).
      try {
        await stripe.subscriptions.cancel(target.gateway_subscription_id);
      } catch (err) {
        console.error("Falha ao cancelar assinatura no Stripe:", err);
      }
    }

    await prisma.users.update({
      where: { id: userId },
      data: {
        subscription_status: "canceled",
        plan: "free",
        cancel_at_period_end: false,
        subscription_cancelled_at: new Date(),
      },
    });

    return json({ ok: true });
  },
);
