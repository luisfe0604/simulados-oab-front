"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiClientError } from "@/lib/api-client";
import { useSession } from "@/components/SessionProvider";
import { IconCheck } from "@/components/icons";
import { formatDate } from "@/lib/format";
import styles from "./conta.module.css";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active: { label: "Assinatura ativa", cls: "badge-green" },
  trialing: { label: "Período de teste", cls: "badge-gold" },
  trial: { label: "Período de teste", cls: "badge-gold" },
  past_due: { label: "Pagamento pendente", cls: "badge-rubi" },
  canceled: { label: "Cancelada", cls: "badge-muted" },
  inactive: { label: "Inativa", cls: "badge-muted" },
};

const PERKS = [
  "Simulado OAB completo (80 questões, formato oficial)",
  "Treinos personalizados por matéria",
  "Revisão dos seus erros anteriores",
  "Correção na hora e histórico de desempenho",
];

function ContaInner() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");

  const [banner, setBanner] = useState<{ kind: "ok" | "info"; text: string } | null>(
    null,
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Retorno do Stripe Checkout: sincroniza e atualiza a sessão.
  useEffect(() => {
    if (checkout === "success") {
      setBanner({
        kind: "ok",
        text: "Pagamento confirmado! Estamos ativando seu acesso…",
      });
      api
        .post("/billing/sync-subscription")
        .catch(() => {})
        .finally(() => router.refresh());
    } else if (checkout === "cancel") {
      setBanner({ kind: "info", text: "Checkout cancelado. Você pode assinar quando quiser." });
    }
  }, [checkout, router]);

  const status = session.subscription_status ?? "inactive";
  const meta = STATUS_LABEL[status] ?? STATUS_LABEL.inactive;
  const isTrial = status === "trial";
  // Assinatura de fato paga/gerenciada pelo Stripe (o trial local não é).
  const hasStripeSub = status === "active" || status === "trialing";
  const showSubscribe = !session.is_admin && !hasStripeSub;
  const showCancel = hasStripeSub && !session.cancel_at_period_end && !session.is_admin;
  const showReactivate = session.cancel_at_period_end;

  async function run(label: string, fn: () => Promise<unknown>) {
    setLoading(label);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Ação não concluída.");
    } finally {
      setLoading(null);
    }
  }

  async function subscribe() {
    setLoading("subscribe");
    setError(null);
    try {
      const { url } = await api.post<{ url: string | null }>(
        "/billing/create-checkout-session",
      );
      if (url) window.location.href = url;
      else throw new Error("URL de checkout indisponível.");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Não foi possível iniciar o checkout.");
      setLoading(null);
    }
  }

  return (
    <>
      {banner && (
        <div
          className={`${styles.banner} ${banner.kind === "ok" ? styles.bannerOk : styles.bannerInfo}`}
        >
          {banner.text}
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Seus dados</h2>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nome</span>
            <span className={styles.infoValue}>{session.name || "—"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>E-mail</span>
            <span className={styles.infoValue}>{session.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Plano</span>
            <span className={styles.infoValue}>
              {session.plan === "premium"
                ? "Premium"
                : session.plan === "trial"
                  ? "Teste grátis"
                  : "Gratuito"}
            </span>
          </div>
          {session.is_admin && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Perfil</span>
              <span className={styles.infoValue}>Administrador</span>
            </div>
          )}
        </div>

        <div className={styles.subCard}>
          <div className={styles.subStatus}>
            <span className={`badge ${meta.cls}`}>{meta.label}</span>
            {session.cancel_at_period_end && (
              <span className="badge badge-muted">Cancelamento agendado</span>
            )}
          </div>

          <div className={styles.subPlan}>
            {isTrial
              ? "Período de teste"
              : session.hasPaid
                ? "Acesso completo"
                : "Assine a Rubi"}
          </div>
          <p className={styles.subLead}>
            {isTrial
              ? "Você está no teste grátis, com acesso completo à plataforma. Assine para manter o acesso quando o período acabar."
              : hasStripeSub
                ? "Você tem acesso a todos os simulados e recursos. Bons estudos rumo à aprovação."
                : "Libere todos os simulados no formato oficial da OAB, com correção e histórico. 7 dias de teste grátis."}
          </p>

          {showSubscribe && (
            <div style={{ marginBottom: "1.4rem" }}>
              {PERKS.map((p) => (
                <div key={p} className={styles.perk}>
                  <IconCheck size={18} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div
              className={styles.banner}
              style={{
                background: "var(--erro-wash)",
                color: "var(--erro)",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <div className={styles.subActions}>
            {showSubscribe && (
              <button
                className="btn btn-primary btn-lg"
                onClick={subscribe}
                disabled={loading === "subscribe"}
              >
                {loading === "subscribe" ? "Redirecionando…" : "Assinar — 7 dias grátis"}
              </button>
            )}
            {showReactivate && (
              <button
                className="btn btn-gold"
                onClick={() =>
                  run("reactivate", () => api.post("/billing/subscription/reactivate"))
                }
                disabled={loading === "reactivate"}
              >
                {loading === "reactivate" ? "Reativando…" : "Reativar assinatura"}
              </button>
            )}
            {showCancel && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  if (
                    window.confirm(
                      "Cancelar a renovação? Você mantém o acesso até o fim do período já pago.",
                    )
                  ) {
                    run("cancel", () => api.post("/billing/subscription/cancel"));
                  }
                }}
                disabled={loading === "cancel"}
              >
                {loading === "cancel" ? "Cancelando…" : "Cancelar renovação"}
              </button>
            )}
          </div>

          {session.trial_end && session.hasPaid && (
            <p className={styles.subFine}>
              Teste válido até {formatDate(session.trial_end)}.
            </p>
          )}
          {session.cancel_at_period_end && (
            <p className={styles.subFine}>
              Sua assinatura não será renovada. O acesso continua até o fim do período atual.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function ContaClient() {
  return (
    <Suspense fallback={null}>
      <ContaInner />
    </Suspense>
  );
}
