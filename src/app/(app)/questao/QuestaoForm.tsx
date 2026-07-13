"use client";

import { useState } from "react";
import { api, ApiClientError } from "@/lib/api-client";
import type { OptionKey } from "@/components/simulado/types";
import styles from "./questao.module.css";

interface Option {
  id: number;
  name: string;
}
interface ExamOption {
  id: number;
  name: string | null;
  year: number | null;
}

const OPTION_KEYS: OptionKey[] = ["a", "b", "c", "d", "e"];

export function QuestaoForm({
  subjects,
  exams,
}: {
  subjects: Option[];
  exams: ExamOption[];
}) {
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState<Record<OptionKey, string>>({
    a: "",
    b: "",
    c: "",
    d: "",
    e: "",
  });
  const [correct, setCorrect] = useState<OptionKey>("a");
  const [difficulty, setDifficulty] = useState(1);
  const [examId, setExamId] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleSubject(id: number) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function resetForm() {
    setStatement("");
    setOptions({ a: "", b: "", c: "", d: "", e: "" });
    setCorrect("a");
    setDifficulty(1);
    setExamId("");
    setSelectedSubjects([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await api.post("/questions", {
        statement,
        option_a: options.a,
        option_b: options.b,
        option_c: options.c,
        option_d: options.d || null,
        option_e: options.e || null,
        correct_option: correct,
        difficulty,
        exam_id: examId ? Number(examId) : null,
        subjects: selectedSubjects,
      });
      setMsg({ ok: true, text: "Questão cadastrada com sucesso." });
      resetForm();
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof ApiClientError ? err.message : "Falha ao cadastrar.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.card}>
        <div className={styles.cardHead}>Enunciado</div>
        <textarea
          className="textarea"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Texto da questão. Use <<...>> para destacar uma citação legal."
          required
          style={{ minHeight: 140 }}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>Alternativas · marque a correta</div>
        {OPTION_KEYS.map((key) => (
          <div className={styles.optionRow} key={key}>
            <span className={styles.optionLetter}>{key}</span>
            <input
              className="input"
              value={options[key]}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={
                key === "d" || key === "e"
                  ? `Alternativa ${key.toUpperCase()} (opcional)`
                  : `Alternativa ${key.toUpperCase()}`
              }
              required={key === "a" || key === "b" || key === "c"}
            />
            <label className={styles.optionCorrect}>
              <input
                type="radio"
                name="correct"
                checked={correct === key}
                onChange={() => setCorrect(key)}
              />
              correta
            </label>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>Classificação</div>
        <div className={styles.grid2}>
          <div>
            <label className="field-label">Prova de origem</label>
            <select
              className="select"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            >
              <option value="">Nenhuma</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name || `Prova #${ex.id}`}
                  {ex.year ? ` (${ex.year})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Dificuldade (1–5)</label>
            <input
              type="number"
              className="input"
              min={1}
              max={5}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ marginTop: "1.2rem" }}>
          <label className="field-label">Matérias</label>
          <div className={styles.subjectsGrid}>
            {subjects.map((s) => (
              <label
                key={s.id}
                className={`${styles.subjectChk} ${selectedSubjects.includes(s.id) ? styles.subjectChkOn : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(s.id)}
                  onChange={() => toggleSubject(s.id)}
                  style={{ display: "none" }}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? "Salvando…" : "Cadastrar questão"}
        </button>
        {msg && (
          <span className={msg.ok ? styles.msgOk : styles.msgErr}>{msg.text}</span>
        )}
      </div>
    </form>
  );
}
