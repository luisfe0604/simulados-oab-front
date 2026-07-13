"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { QuestionCard } from "@/components/simulado/QuestionCard";
import type { OptionKey, ReviewQuestion } from "@/components/simulado/types";
import type { SimuladoSummary } from "@/lib/data";
import { formatDate, formatDuration } from "@/lib/format";
import { EmptyState } from "@/components/ui";
import styles from "./historico.module.css";

type Filter = "todos" | "7d" | "30d" | "aprovados" | "reprovados";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "aprovados", label: "Acima de 50%" },
  { key: "reprovados", label: "Abaixo de 50%" },
];

function scoreColor(score: number) {
  if (score >= 50) return "var(--verde)";
  if (score >= 30) return "var(--ouro-deep)";
  return "var(--erro)";
}

export function HistoricoList({ initial }: { initial: SimuladoSummary[] }) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const now = Date.now();
    return initial.filter((s) => {
      const t = s.created_at ? new Date(s.created_at).getTime() : 0;
      switch (filter) {
        case "7d":
          return now - t <= 7 * 864e5;
        case "30d":
          return now - t <= 30 * 864e5;
        case "aprovados":
          return s.score >= 50;
        case "reprovados":
          return s.score < 50;
        default:
          return true;
      }
    });
  }, [initial, filter]);

  if (initial.length === 0) {
    return (
      <EmptyState
        title="Nenhum simulado ainda"
        text="Quando você finalizar um simulado, ele aparece aqui com a nota, o tempo e a revisão completa."
        action={
          <Link href="/simulado" className="btn btn-primary btn-lg">
            Fazer meu primeiro simulado
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.chip} ${filter === f.key ? styles.chipActive : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "var(--ink-faint)", padding: "1.5rem 0" }}>
          Nenhum simulado neste filtro.
        </p>
      ) : (
        <div className={styles.list}>
          {filtered.map((s) => (
            <div key={s.id} className={styles.item}>
              <div className={styles.row}>
                <span
                  className={styles.score}
                  style={{
                    color: scoreColor(s.score),
                    borderColor: scoreColor(s.score),
                  }}
                >
                  {Math.round(s.score)}
                </span>
                <span>
                  <span className={styles.cellLabel}>Data</span>
                  <span className={styles.cellValue}>
                    {formatDate(s.created_at)}
                  </span>
                </span>
                <span className={styles.hideSm}>
                  <span className={styles.cellLabel}>Acertos</span>
                  <span className={styles.cellValue}>
                    {s.correct_answers}/{s.total_questions}
                  </span>
                </span>
                <span className={styles.hideSm}>
                  <span className={styles.cellLabel}>Tempo</span>
                  <span className={styles.cellValue}>
                    {formatDuration(s.duration_seconds)}
                  </span>
                </span>
                <span className={styles.rowActions}>
                  <button
                    className={styles.expandBtn}
                    onClick={() =>
                      setExpanded(expanded === s.id ? null : s.id)
                    }
                  >
                    {expanded === s.id ? "Fechar" : "Revisar"}
                  </button>
                  <Link
                    href={`/simulado/refazer/${s.id}`}
                    className="btn btn-ghost"
                    style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}
                  >
                    Refazer
                  </Link>
                </span>
              </div>

              {expanded === s.id && <ReviewDetail id={s.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewDetail({ id }: { id: number }) {
  const [questions, setQuestions] = useState<ReviewQuestion[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get<{ questions: ReviewQuestion[] }>(`/simulados/${id}`)
      .then((d) => {
        if (alive) setQuestions(d.questions);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <div className={styles.detail}>
      {error ? (
        <p className={styles.detailLoading}>Não foi possível carregar a revisão.</p>
      ) : !questions ? (
        <p className={styles.detailLoading}>Carregando revisão…</p>
      ) : (
        <div className={styles.detailCards}>
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              index={i}
              total={questions.length}
              question={q}
              selected={(q.selected_option as OptionKey) ?? null}
              review={{ correct: q.correct_option, selected: q.selected_option }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
