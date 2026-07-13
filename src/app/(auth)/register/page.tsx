"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiClientError } from "@/lib/api-client";
import { AuthHero } from "../AuthHero";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Falha ao criar conta.",
      );
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <AuthHero />
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Criar conta</h2>
          <p className={styles.formLead}>
            Comece agora — leva menos de um minuto.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <div>
              <label className="field-label" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--ink-faint)",
                  marginTop: "0.35rem",
                  display: "block",
                }}
              >
                Mínimo de 6 caracteres.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? "Criando…" : "Criar conta"}
            </button>
          </form>

          <div className={styles.divider}>ou</div>

          <a className={styles.google} href="/api/auth/google">
            Continuar com o Google
          </a>

          <p className={styles.switch}>
            Já tem conta? <Link href="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
