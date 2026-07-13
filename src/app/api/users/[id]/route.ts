import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json, notFound } from "@/lib/http";

// Detalhe de um usuário (admin).
export const GET = handle(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    await requireAdmin();
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId)) throw notFound("Usuário não encontrado");

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        subscription_status: true,
        is_admin: true,
        created_at: true,
        trial_end: true,
        cancel_at_period_end: true,
        subscription_started_at: true,
        subscription_cancelled_at: true,
      },
    });
    if (!user) throw notFound("Usuário não encontrado");

    return json(user);
  },
);
