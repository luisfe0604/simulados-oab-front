import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import styles from "./Conta.module.css";

export default function Conta() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const sub = await apiFetch("/billing/subscription");
      const me = await apiFetch("/users/me");

      setSubscription(sub);
      setUser(me);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe() {
    try {
      const data = await apiFetch("/billing/subscription/checkout", {
        method: "POST",
      });

      window.location.href = data.url;
    } catch {
      alert("Erro ao iniciar assinatura");
    }
  }

  async function handleCancel() {
    if (!window.confirm("Tem certeza que deseja cancelar?")) return;

    await apiFetch("/billing/subscription/cancel", { method: "POST" });
    loadData();
  }

  async function handleReactivate() {
    await apiFetch("/billing/subscription/reactivate", { method: "POST" });
    loadData();
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const isActive = ["active", "trialing"].includes(
    subscription.subscription_status
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Minha Conta</h1>
        <p className={styles.subtitle}>
          Gerencie sua assinatura e seus dados
        </p>

        {/* USUÁRIO */}
        <div className={styles.inputGroup}>
          <label>Nome</label>
          <input value={user.name} disabled />
        </div>

        <div className={styles.inputGroup}>
          <label>Email</label>
          <input value={user.email} disabled />
        </div>

        {/* ASSINATURA */}
        <div className={styles.inputGroup}>
          <label>Status</label>
          <input value={subscription.subscription_status} disabled />
        </div>

        <div className={styles.inputGroup}>
          <label>Plano</label>
          <input value={subscription.plan} disabled />
        </div>

        <div className={styles.inputGroup}>
          <label>Expira em</label>
          <input
            value={
              subscription.subscription_cancelled_at
                ? new Date(
                    subscription.subscription_cancelled_at
                  ).toLocaleDateString()
                : "-"
            }
            disabled
          />
        </div>

        {/* AÇÕES */}
        <div style={{ marginTop: 20 }}>
          {!isActive && (
            <button className={styles.button} onClick={handleSubscribe}>
              Assinar Premium
            </button>
          )}

          {isActive && !subscription.cancel_at_period_end && (
            <button className={styles.button} onClick={handleCancel}>
              Cancelar assinatura
            </button>
          )}

          {subscription.cancel_at_period_end && (
            <button
              className={styles.registerButton}
              onClick={handleReactivate}
            >
              Reativar assinatura
            </button>
          )}
        </div>

        {/* AVISO */}
        {subscription.cancel_at_period_end && (
          <p className={styles.subtitle} style={{ marginTop: 10 }}>
            Sua assinatura será cancelada ao final do período.
          </p>
        )}
      </div>
    </div>
  );
}