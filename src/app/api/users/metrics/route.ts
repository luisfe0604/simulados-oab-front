import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json } from "@/lib/http";

// Métricas agregadas para o painel administrativo.
export const GET = handle(async () => {
  await requireAdmin();

  const [totalUsers, byStatus, usersGrowth, subsGrowth] = await Promise.all([
    prisma.users.count(),
    prisma.users.groupBy({
      by: ["subscription_status"],
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ month: string; count: number }[]>`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
             count(*)::int AS count
      FROM users
      WHERE created_at IS NOT NULL
      GROUP BY 1 ORDER BY 1
    `,
    prisma.$queryRaw<{ month: string; count: number }[]>`
      SELECT to_char(date_trunc('month', subscription_started_at), 'YYYY-MM') AS month,
             count(*)::int AS count
      FROM users
      WHERE subscription_started_at IS NOT NULL
      GROUP BY 1 ORDER BY 1
    `,
  ]);

  const status: Record<string, number> = {};
  for (const row of byStatus) {
    status[row.subscription_status ?? "unknown"] = row._count._all;
  }

  return json({
    total_users: totalUsers,
    status,
    users_growth: usersGrowth,
    subscriptions_growth: subsGrowth,
  });
});
