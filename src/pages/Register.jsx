import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import styles from "./Login.module.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // 🔹 1. cria usuário
      const data = await apiFetch("/users/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // 🔥 2. salva token
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_name", data.email);
      }

      // 🔥 3. cria checkout no backend
      const res = await fetch(
       `${import.meta.env.VITE_API_URL}/billing/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`, // 👈 importante se usar auth
          },
          body: JSON.stringify({
            userId: data.user?.id, // ou data.id dependendo do retorno
            email: data.email,
          }),
        },
      );

      const checkout = await res.json();

      // 🔥 4. redireciona pro Stripe
      window.location.href = checkout.url;
    } catch {
      alert("Erro ao criar conta");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>Comece seu teste gratuito de 7 dias</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Nome</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="seuemail@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button}>
            Criar conta
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          Já tem conta?{" "}
          <span
            style={{ color: "#1976d2", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Entrar
          </span>
        </div>
      </div>
    </div>
  );
}
