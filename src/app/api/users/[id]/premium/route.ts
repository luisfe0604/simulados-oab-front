import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { getUserIdParam } from "@/lib/admin-params";

// Concede acesso premium manualmente (sem envolver o Stripe).
export const PATCH = handle(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    await requireAdmin();
    const userId = await getUserIdParam(params);

    const updated = await prisma.users.update({
      where: { id: userId },
      data: { plan: "premium", subscription_status: "active" },
      select: { id: true, plan: true, subscription_status: true },
    });

    return json(updated);
  },
);
