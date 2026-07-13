import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json, notFound } from "@/lib/http";
import { getUserIdParam } from "@/lib/admin-params";

// Alterna o papel de admin do usuário alvo.
export const PATCH = handle(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    await requireAdmin();
    const userId = await getUserIdParam(params);

    const target = await prisma.users.findUnique({
      where: { id: userId },
      select: { is_admin: true },
    });
    if (!target) throw notFound("Usuário não encontrado");

    const updated = await prisma.users.update({
      where: { id: userId },
      data: { is_admin: !target.is_admin },
      select: { id: true, is_admin: true },
    });

    return json(updated);
  },
);
