import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { getUserIdParam } from "@/lib/admin-params";

// Revoga o acesso premium (volta ao plano gratuito/inativo).
export const PATCH = handle(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    await requireAdmin();
    const userId = await getUserIdParam(params);

    const updated = await prisma.users.update({
      where: { id: userId },
      data: { plan: "free", subscription_status: "inactive" },
      select: { id: true, plan: true, subscription_status: true },
    });

    return json(updated);
  },
);
