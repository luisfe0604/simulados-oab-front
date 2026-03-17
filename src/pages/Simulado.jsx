import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import QuestionCard from "../components/QuestionCard";
import { useParams } from "react-router-dom";
import styles from "./Simulado.module.css";

export default function Simulado() {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [subject, setSubject] = useState("");
  const [limit, setLimit] = useState(10);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState("custom");
  const [showNavigator, setShowNavigator] = useState(false);

  const { id } = useParams();

  const simuladoAtivo = questions.length > 0 && !result;

  useEffect(() => {
    if (id) {
      loadRetrySimulado();
    }
    async function loadSubjects() {
      const data = await apiFetch("/subjects");
      setSubjects(data);
    }

    loadSubjects();
  }, []);

  useEffect(() => {
    if (!startTime || result) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, result]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function generateSimulado() {
    const params = new URLSearchParams();

    if (subject) params.append("subject_id", subject);
    if (limit) params.append("limit", limit);

    const data = await apiFetch(`/questions/generate?${params.toString()}`);

    setQuestions(data);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
    setElapsed(0);
  }

  async function generateWrongSimulado() {
    const data = await apiFetch(
      `/simulados/questions/generate-wrong?limit=${limit}`,
    );

    setQuestions(data);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
    setElapsed(0);
  }

  async function generateOABSimulado() {
    const data = await apiFetch(`/simulados/questions/oab`);

    setQuestions(data);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
    setElapsed(0);
  }

  async function loadRetrySimulado() {
    const data = await apiFetch(`/simulados/${id}`);

    const cleanedQuestions = data.questions.map((q) => ({
      ...q,
      id: q.id || q.question_id,
      selected_option: null,
    }));

    setQuestions(cleanedQuestions);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
    setElapsed(0);
  }

  function handleSelect(id, option) {
    setAnswers({ ...answers, [id]: option });
  }

  async function finish() {
    const payload = {
      duration_seconds: elapsed,
      answers: questions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id] || "",
      })),
    };

    const data = await apiFetch("/simulados", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setResult(data);
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Novo Simulado</h1>

      <div className={styles.simuladoModes}>
        <div
          className={`
            ${styles.modeCard}
            ${mode === "custom" ? styles.modeActive : ""}
            ${simuladoAtivo ? styles.modeLocked : ""}
          `}
          onClick={() => {
            if (!simuladoAtivo) setMode("custom");
          }}
        >
          <div className={styles.modeTitle}>📚 Personalizado</div>
          <div className={styles.modeDescription}>
            Escolha assuntos e quantidade de questões
          </div>
        </div>

        <div
          className={`
            ${styles.modeCard}
            ${mode === "wrong" ? styles.modeActive : ""}
            ${simuladoAtivo ? styles.modeLocked : ""}
          `}
          onClick={() => {
            if (!simuladoAtivo) setMode("wrong");
          }}
        >
          <div className={styles.modeTitle}>🔁 Revisar erros</div>
          <div className={styles.modeDescription}>
            Refazer questões que você errou
          </div>
        </div>

        <div
          className={`
            ${styles.modeCard}
            ${mode === "oab" ? styles.modeActive : ""}
            ${simuladoAtivo ? styles.modeLocked : ""}
          `}
          onClick={() => {
            if (!simuladoAtivo) setMode("oab");
          }}
        >
          <div className={styles.modeTitle}>⚖️ Simulado OAB</div>
          <div className={styles.modeDescription}>
            Simulação completa da prova
          </div>
        </div>
      </div>

      {simuladoAtivo && (
        <p className={styles.lockMessage}>
          Finalize o simulado atual para mudar o tipo.
        </p>
      )}

      {/* FILTROS */}
      {mode === "custom" && (
        <div className={styles.filters}>
          <select
            value={subject}
            disabled={simuladoAtivo}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Todos os Assuntos</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            max="100"
            value={limit}
            disabled={simuladoAtivo}
            onChange={(e) => setLimit(e.target.value)}
          />

          <button className={styles.generateBtn} onClick={generateSimulado}>
            Iniciar
          </button>
        </div>
      )}

      {mode === "wrong" && (
        <div className={styles.filters}>
          <input
            type="number"
            min="5"
            max="100"
            value={limit}
            disabled={simuladoAtivo}
            onChange={(e) => setLimit(e.target.value)}
          />

          <button
            className={styles.generateBtn}
            onClick={generateWrongSimulado}
          >
            Revisar
          </button>
        </div>
      )}

      {mode === "oab" && (
        <div className={styles.filters}>
          <button className={styles.generateBtn} onClick={generateOABSimulado}>
            Iniciar Simulado OAB
          </button>
        </div>
      )}

      {questions.length > 0 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span>
              {Object.keys(answers).length} / {questions.length} respondidas
            </span>

            <div className={styles.progressActions}>
              <button
                className={styles.navigatorBtn}
                onClick={() => setShowNavigator(true)}
              >
                Questões
              </button>

              <span className={styles.timer}>{formatTime(elapsed)}</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${(Object.keys(answers).length / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* QUESTÕES */}
      {questions.map((q, index) => (
        <div id={`question-${index}`} key={q.id}>
          <QuestionCard
            q={q}
            index={index}
            answers={answers}
            result={result}
            onSelect={handleSelect}
            disabled={!!result}
          />
        </div>
      ))}

      {result && (
        <div className={styles.resultInline}>
          <h2>Resultado</h2>
          <p className={styles.score}>{result.score.toFixed(2)}%</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className={styles.footer}>
          {!result ? (
            <button
              onClick={finish}
              disabled={Object.keys(answers).length === 0}
              className={styles.finishBtn}
            >
              Finalizar Simulado
            </button>
          ) : (
            <button onClick={generateSimulado} className={styles.finishBtn}>
              Gerar Novo Simulado
            </button>
          )}
        </div>
      )}
      {showNavigator && (
        <div
          className={styles.navigatorOverlay}
          onClick={() => setShowNavigator(false)}
        >
          <div
            className={styles.navigatorModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Navegar pelas questões</h3>

            <div className={styles.navigatorGrid}>
              {questions.map((q, index) => {
                const answered = answers[q.id];

                return (
                  <button
                    key={q.id}
                    className={`${styles.navItem} ${
                      answered ? styles.navAnswered : ""
                    }`}
                    onClick={() => {
                      document
                        .getElementById(`question-${index}`)
                        ?.scrollIntoView({ behavior: "smooth" });

                      setShowNavigator(false);
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
