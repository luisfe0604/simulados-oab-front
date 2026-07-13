"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api, ApiClientError } from "@/lib/api-client";
import { RingScore } from "@/components/RingScore";
import { IconClock, IconExam, IconHistory, IconNewQuestion, IconX } from "@/components/icons";
import { formatClock, formatDuration } from "@/lib/format";
import { QuestionCard } from "./QuestionCard";
import type {
  OptionKey,
  ReviewQuestion,
  RunnerQuestion,
  RunnerSubject,
} from "./types";
import styles from "./SimuladoRunner.module.css";

type Phase = "idle" | "loading" | "running" | "submitting" | "result";

interface SubmitResult {
  id: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

interface SimuladoRunnerProps {
  subjects: RunnerSubject[];
  /** Se fornecido, pula a seleção de modo e já inicia a prova (fluxo "refazer"). */
  initialQuestions?: RunnerQuestion[];
}

export function SimuladoRunner({ subjects, initialQuestions }: SimuladoRunnerProps) {
  const [phase, setPhase] = useState<Phase>(
    initialQuestions?.length ? "running" : "idle",
  );
  const [questions, setQuestions] = useState<RunnerQuestion[]>(
    initialQuestions ?? [],
  );
  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const [result, setResult] = useState<SubmitResult | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);

  const startRef = useRef<number>(Date.now());
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Cronômetro — roda somente durante a prova.
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [phase]);

  const answeredCount = Object.keys(answers).length;

  async function begin(fetcher: () => Promise<RunnerQuestion[]>) {
    setError(null);
    setPhase("loading");
    try {
      const qs = await fetcher();
      if (!qs.length) {
        setError("Nenhuma questão disponível para este modo no momento.");
        setPhase("idle");
        return;
      }
      setQuestions(qs);
      setAnswers({});
      setElapsed(0);
      startRef.current = Date.now();
      setPhase("running");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Falha ao gerar o simulado.");
      setPhase("idle");
    }
  }

  function select(questionId: number, key: OptionKey) {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  }

  async function finish() {
    if (answeredCount < questions.length) {
      const ok = window.confirm(
        `Você respondeu ${answeredCount} de ${questions.length} questões. As não respondidas contam como erro. Finalizar mesmo assim?`,
      );
      if (!ok) return;
    }
    setPhase("submitting");
    setError(null);
    try {
      const payload = {
        duration_seconds: elapsed,
        answers: questions.map((q) => ({
          question_id: q.id,
          selected_option: answers[q.id] ?? null,
        })),
      };
      const res = await api.post<SubmitResult>("/simulados", payload);
      const detail = await api.get<{ questions: ReviewQuestion[] }>(
        `/simulados/${res.id}`,
      );
      setResult(res);
      setReviewQuestions(detail.questions);
      setPhase("result");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Falha ao enviar o simulado.");
      setPhase("running");
    }
  }

  function reset() {
    setPhase("idle");
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setReviewQuestions([]);
    setElapsed(0);
  }

  function scrollTo(questionId: number) {
    setNavOpen(false);
    cardRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (phase === "loading" || phase === "submitting") {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className="mono">
          {phase === "loading" ? "Montando seu simulado…" : "Corrigindo suas respostas…"}
        </p>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <ResultView
        result={result}
        elapsed={elapsed}
        reviewQuestions={reviewQuestions}
        onReset={reset}
      />
    );
  }

  if (phase === "running") {
    const progressPct = questions.length
      ? (answeredCount / questions.length) * 100
      : 0;
    return (
      <div>
        <div className={styles.runBar}>
          <span className={styles.timer}>
            <IconClock size={20} />
            {formatClock(elapsed)}
          </span>
          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
              <span>
                {answeredCount}{" "}
                {answeredCount === 1 ? "respondida" : "respondidas"}
              </span>
              <span>{questions.length} questões</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className={styles.runActions}>
            <button className={styles.navToggle} onClick={() => setNavOpen(true)}>
              Navegar
            </button>
            <button className="btn btn-primary" onClick={finish}>
              Finalizar
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "var(--erro-wash)",
              color: "var(--erro)",
              padding: "0.7rem 1rem",
              borderRadius: "var(--radius)",
              marginBottom: "1rem",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div className={styles.cards}>
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              ref={(el) => {
                cardRefs.current[q.id] = el;
              }}
              index={i}
              total={questions.length}
              question={q}
              selected={answers[q.id] ?? null}
              onSelect={(key) => select(q.id, key)}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <button className="btn btn-primary btn-lg" onClick={finish}>
            Finalizar e corrigir
          </button>
        </div>

        {navOpen && (
          <div className={styles.overlay} onClick={() => setNavOpen(false)}>
            <div className={styles.navPanel} onClick={(e) => e.stopPropagation()}>
              <div className={styles.navHead}>
                <h3 className="display" style={{ fontSize: "1.2rem" }}>
                  Navegar
                </h3>
                <button
                  className={styles.navToggle}
                  onClick={() => setNavOpen(false)}
                  aria-label="Fechar"
                >
                  <IconX size={16} />
                </button>
              </div>
              <div className={styles.navGrid}>
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    className={`${styles.navCell} ${answers[q.id] ? styles.navCellDone : ""}`}
                    onClick={() => scrollTo(q.id)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className={styles.navLegend}>
                <span>
                  <span
                    className={styles.legendDot}
                    style={{ background: "var(--rubi)" }}
                  />
                  Respondida
                </span>
                <span>
                  <span
                    className={styles.legendDot}
                    style={{
                      background: "var(--surface)",
                      border: "1.5px solid var(--line-strong)",
                    }}
                  />
                  Em branco
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // phase === "idle" — seleção de modo
  return (
    <ModeSelection subjects={subjects} error={error} onStart={begin} />
  );
}

/* ------------------------------------------------------------------ */

function ModeSelection({
  subjects,
  error,
  onStart,
}: {
  subjects: RunnerSubject[];
  error: string | null;
  onStart: (fetcher: () => Promise<RunnerQuestion[]>) => void;
}) {
  const [customSubject, setCustomSubject] = useState<string>("");
  const [customLimit, setCustomLimit] = useState(20);
  const [wrongLimit, setWrongLimit] = useState(20);

  return (
    <div>
      {error && (
        <div
          style={{
            background: "var(--erro-wash)",
            color: "var(--erro)",
            padding: "0.8rem 1rem",
            borderRadius: "var(--radius)",
            marginBottom: "1.4rem",
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
      <div className={styles.modes}>
        {/* Simulado OAB */}
        <div className={`${styles.mode} ${styles.modeFeatured}`}>
          <span className={styles.modeIcon}>
            <IconExam size={28} />
          </span>
          <span className={styles.modeName}>Simulado OAB</span>
          <p className={styles.modeDesc}>
            80 questões na distribuição oficial da 1ª fase — todas as matérias,
            nas proporções reais do exame.
          </p>
          <button
            className="btn btn-primary"
            onClick={() =>
              onStart(() => api.get<RunnerQuestion[]>("/simulados/questions/oab"))
            }
          >
            Iniciar Simulado OAB
          </button>
        </div>

        {/* Personalizado */}
        <div className={styles.mode}>
          <span className={styles.modeIcon}>
            <IconNewQuestion size={28} />
          </span>
          <span className={styles.modeName}>Personalizado</span>
          <p className={styles.modeDesc}>
            Escolha uma matéria e a quantidade de questões para treinar um tema
            específico.
          </p>
          <div className={styles.modeControls}>
            <div className={styles.modeField}>
              <label className="field-label">Matéria</label>
              <select
                className="select"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              >
                <option value="">Todas</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.modeField} style={{ maxWidth: 90 }}>
              <label className="field-label">Qtd.</label>
              <input
                type="number"
                className="input"
                min={1}
                max={100}
                value={customLimit}
                onChange={(e) => setCustomLimit(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() =>
              onStart(() => {
                const q = new URLSearchParams({ limit: String(customLimit) });
                if (customSubject) q.set("subject_id", customSubject);
                return api.get<RunnerQuestion[]>(`/questions/generate?${q}`);
              })
            }
          >
            Iniciar treino
          </button>
        </div>

        {/* Revisar erros */}
        <div className={styles.mode}>
          <span className={styles.modeIcon}>
            <IconHistory size={28} />
          </span>
          <span className={styles.modeName}>Revisar erros</span>
          <p className={styles.modeDesc}>
            Refaça as questões que você já errou em simulados anteriores e feche
            suas lacunas.
          </p>
          <div className={styles.modeControls}>
            <div className={styles.modeField} style={{ maxWidth: 90 }}>
              <label className="field-label">Qtd.</label>
              <input
                type="number"
                className="input"
                min={1}
                max={100}
                value={wrongLimit}
                onChange={(e) => setWrongLimit(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() =>
              onStart(() =>
                api.get<RunnerQuestion[]>(
                  `/simulados/questions/generate-wrong?limit=${wrongLimit}`,
                ),
              )
            }
          >
            Revisar erros
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ResultView({
  result,
  elapsed,
  reviewQuestions,
  onReset,
}: {
  result: SubmitResult;
  elapsed: number;
  reviewQuestions: ReviewQuestion[];
  onReset: () => void;
}) {
  const approved = result.score >= 50;
  return (
    <div>
      <div className={styles.result}>
        <RingScore score={result.score} size={200} showLabel={false} />
        <h2
          className={`${styles.resultVerdict} ${approved ? styles.resultApproved : styles.resultBelow}`}
        >
          {approved ? "Acima da linha de corte" : "Abaixo da linha de corte"}
        </h2>
        <div className={styles.resultMeta}>
          <div className={styles.resultMetaItem}>
            <span className={styles.resultMetaNum}>
              {result.correctAnswers}/{result.totalQuestions}
            </span>
            <span className={styles.resultMetaLabel}>Acertos</span>
          </div>
          <div className={styles.resultMetaItem}>
            <span className={styles.resultMetaNum}>
              {result.score.toFixed(1)}%
            </span>
            <span className={styles.resultMetaLabel}>Aproveitamento</span>
          </div>
          <div className={styles.resultMetaItem}>
            <span className={styles.resultMetaNum}>{formatDuration(elapsed)}</span>
            <span className={styles.resultMetaLabel}>Tempo</span>
          </div>
        </div>
        <div className={styles.resultActions}>
          <button className="btn btn-primary" onClick={onReset}>
            Novo simulado
          </button>
          <Link href="/historico" className="btn btn-ghost">
            Ver no histórico
          </Link>
        </div>
      </div>

      <h3 className={styles.reviewTitle}>Revisão · gabarito comentado</h3>
      <div className={styles.cards}>
        {reviewQuestions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            total={reviewQuestions.length}
            question={q}
            selected={(q.selected_option as OptionKey) ?? null}
            review={{ correct: q.correct_option, selected: q.selected_option }}
          />
        ))}
      </div>
    </div>
  );
}
