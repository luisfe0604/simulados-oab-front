import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { parseQuery } from "@/lib/validation";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional().default(""),
});

// Lista paginada de usuários com busca por nome/e-mail (admin).
export const GET = handle(async (request: Request) => {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const { page, limit, search } = parseQuery(searchParams, querySchema);

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.users.count({ where }),
    prisma.users.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        subscription_status: true,
        is_admin: true,
        created_at: true,
      },
    }),
  ]);

  return json({ total, page, limit, users });
});
