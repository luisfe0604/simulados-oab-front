import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboardData } from "@/lib/data";
import { PageHeader, StatGrid, Stat, EmptyState } from "@/components/ui";
import { RingScore } from "@/components/RingScore";
import { IconArrow } from "@/components/icons";
import { formatDate, formatDuration } from "@/lib/format";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

function scoreColor(score: number) {
  if (score >= 50) return "var(--verde)";
  if (score >= 30) return "var(--ouro-deep)";
  return "var(--erro)";
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getDashboardData(session.id);
  const firstName = (session.name || "").trim().split(" ")[0];

  return (
    <div>
      <PageHeader
        eyebrow="Painel"
        title={firstName ? `Olá, ${firstName}` : "Seu painel"}
        lead="Acompanhe sua evolução e comece um novo simulado quando quiser."
        action={
          <Link href="/simulado" className="btn btn-primary">
            Novo simulado <IconArrow size={16} />
          </Link>
        }
      />

      {!session.hasPaid && (
        <div className={styles.notice}>
          <div className={styles.noticeText}>
            <strong>Seu acesso está inativo.</strong>
            <p>Assine para liberar todos os simulados e a correção completa.</p>
          </div>
          <Link href="/conta" className="btn btn-primary">
            Ver planos
          </Link>
        </div>
      )}

      {data.total === 0 ? (
        <EmptyState
          title="Sua trajetória começa aqui"
          text="Você ainda não fez nenhum simulado. Comece pelo Simulado OAB completo — 80 questões no formato oficial da 1ª fase."
          action={
            <Link href="/simulado" className="btn btn-primary btn-lg">
              Iniciar Simulado OAB
            </Link>
          }
        />
      ) : (
        <>
          <div className={styles.hero}>
            <div className={styles.heroMain}>
              <div>
                <div className="eyebrow">Desempenho geral</div>
                <p
                  style={{
                    color: "var(--ink-soft)",
                    marginTop: "0.8rem",
                    maxWidth: "38ch",
                    lineHeight: 1.6,
                  }}
                >
                  {data.avgScore >= 50
                    ? "Sua média está acima da linha de corte. Mantenha o ritmo para consolidar a aprovação."
                    : "Sua média ainda está abaixo dos 50% de aprovação. Cada simulado é uma chance de subir."}
                </p>
              </div>
              <StatGrid>
                <Stat label="Simulados feitos" value={data.total} />
                <Stat
                  label="Melhor nota"
                  value={Math.round(data.bestScore)}
                  unit="/100"
                />
              </StatGrid>
            </div>

            <div className={styles.heroRing}>
              <span className={styles.heroRingLabel}>Nota média</span>
              <RingScore score={data.avgScore} size={168} />
            </div>
          </div>

          <StatGrid>
            <Stat label="Questões respondidas" value={data.questionsAnswered} />
            <Stat
              label="Tempo médio / questão"
              value={formatDuration(Math.round(data.avgSecondsPerQuestion))}
            />
            <Stat
              label="Taxa de aprovação"
              value={
                data.total
                  ? Math.round(
                      (data.recent.filter((r) => r.score >= 50).length /
                        Math.min(data.recent.length, data.total)) *
                        100,
                    )
                  : 0
              }
              unit="% recentes"
            />
          </StatGrid>

          <section className={styles.recent}>
            <div className={styles.recentHead}>
              <h2 className="display" style={{ fontSize: "var(--step-2)" }}>
                Simulados recentes
              </h2>
              <Link href="/historico">Ver histórico completo</Link>
            </div>
            <div className={styles.rows}>
              {data.recent.map((s) => (
                <Link
                  key={s.id}
                  href={`/simulado/refazer/${s.id}`}
                  className={styles.row}
                >
                  <span
                    className={styles.rowScore}
                    style={{
                      color: scoreColor(s.score),
                      borderColor: scoreColor(s.score),
                    }}
                  >
                    {Math.round(s.score)}
                  </span>
                  <span>
                    <span className={styles.rowDate} style={{ display: "block" }}>
                      {formatDate(s.created_at)}
                    </span>
                    <span className={styles.rowMeta}>
                      {s.correct_answers}/{s.total_questions} acertos
                    </span>
                  </span>
                  <span
                    className={`${styles.rowMeta} ${styles.rowMetaHide}`}
                  >
                    {formatDuration(s.duration_seconds)}
                  </span>
                  <IconArrow size={16} />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
