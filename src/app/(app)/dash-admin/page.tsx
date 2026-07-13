import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAdminMetrics } from "@/lib/data";
import { PageHeader, StatGrid, Stat } from "@/components/ui";
import { AdminGrowthChart } from "./AdminGrowthChart";
import { AdminUsers } from "./AdminUsers";
import styles from "./dash-admin.module.css";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  active: "#2E5E4E",
  trialing: "#B08D57",
  trial: "#B08D57",
  past_due: "#A33A2C",
  canceled: "#7a6f68",
  inactive: "#c7bdae",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativos",
  trialing: "Em teste",
  trial: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelados",
  inactive: "Inativos",
  admin: "Admin",
  unknown: "Sem status",
};

export default async function DashAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.is_admin) redirect("/dashboard");

  const metrics = await getAdminMetrics();
  const activeLike =
    (metrics.status.active ?? 0) +
    (metrics.status.trialing ?? 0) +
    (metrics.status.trial ?? 0);

  return (
    <div>
      <PageHeader
        eyebrow="Administração"
        title="Painel administrativo"
        lead="Visão geral da base de usuários, assinaturas e atividade na plataforma."
      />

      <StatGrid>
        <Stat label="Usuários totais" value={metrics.total_users} />
        <Stat label="Assinantes ativos" value={activeLike} />
        <Stat label="Simulados realizados" value={metrics.simulados_total} />
      </StatGrid>

      <AdminGrowthChart data={metrics.users_growth} />

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Distribuição por status</h3>
        <p className={styles.chartSub}>Situação atual das assinaturas.</p>
        <div className={styles.statusRow}>
          {Object.entries(metrics.status)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => (
              <span key={status} className={styles.statusPill}>
                <span
                  className={styles.dot}
                  style={{ background: STATUS_COLORS[status] ?? "#c7bdae" }}
                />
                {STATUS_LABELS[status] ?? status} <b>{count}</b>
              </span>
            ))}
        </div>
      </div>

      <AdminUsers />
    </div>
  );
}
