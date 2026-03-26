import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import styles from "./NewQuestion.module.css";

export default function CreateQuestion() {
  const [form, setForm] = useState({
    statement: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correct_option: "",
    exam_id: "",
    subjects: [],
    explanation: "",
  });

  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchExams();
  }, []);

  const fetchSubjects = async () => {
    console.log("subjects:", await apiFetch("/subjects"));

    const data = await apiFetch("/subjects");
    setSubjects(data);
  };

  const fetchExams = async () => {
    console.log("exams:", await apiFetch("/exams"));

    const data = await apiFetch("/exams");
    setExams(data);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.statement) return alert("Enunciado obrigatório");
    if (!form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      return alert("Preencha A, B, C e D");
    }
    if (!form.correct_option) {
      return alert("Selecione a alternativa correta");
    }
    if (!form.exam_id) {
      return alert("Selecione uma prova");
    }
    if (form.subjects.length === 0) {
      return alert("Selecione um assunto");
    }

    const payload = {
      ...form,
      option_e: form.option_e || null,
    };

    const res = await apiFetch("/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Questão criada com sucesso!");

      setForm((prev) => ({
        ...prev,
        statement: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        option_e: "",
        correct_option: "",
        explanation: "",
      }));
    } else {
      alert("Erro ao criar questão");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Criar Questão</h2>

      <form onSubmit={handleSubmit} className={styles.card}>
        {/* 📚 Assunto */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Assunto</label>
          <select
            className={styles.select}
            onChange={(e) => handleChange("subjects", [Number(e.target.value)])}
          >
            <option value="">Selecione</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* 📝 Prova */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Prova</label>
          <select
            className={styles.select}
            onChange={(e) => handleChange("exam_id", Number(e.target.value))}
          >
            <option value="">Selecione</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✍️ Enunciado */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Enunciado</label>
          <textarea
            className={styles.textarea}
            value={form.statement}
            onChange={(e) => handleChange("statement", e.target.value)}
            rows={4}
          />
        </div>

        {/* 🔘 Alternativas */}
        <h4 className={styles.sectionTitle}>Alternativas</h4>

        <div className={styles.options}>
          {["a", "b", "c", "d", "e"].map((letter) => (
            <div key={letter} className={styles.optionRow}>
              <input
                type="radio"
                name="correct"
                value={letter.toUpperCase()}
                className={styles.radio}
                onChange={(e) => handleChange("correct_option", e.target.value)}
              />

              <input
                type="text"
                className={`${styles.input} ${styles.optionInput}`}
                placeholder={`Alternativa ${letter.toUpperCase()} ${
                  letter === "e" ? "(opcional)" : ""
                }`}
                value={form[`option_${letter}`]}
                onChange={(e) =>
                  handleChange(`option_${letter}`, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        {/* 📘 Explicação */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Explicação (opcional)</label>
          <textarea
            className={styles.textarea}
            value={form.explanation}
            onChange={(e) => handleChange("explanation", e.target.value)}
            rows={3}
          />
        </div>

        {/* 🚀 Botão */}
        <button type="submit" className={styles.submitBtn}>
          Criar Questão
        </button>
      </form>
    </div>
  );
}
