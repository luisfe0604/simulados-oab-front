import Link from "next/link";
import { RubiRing } from "./icons";

// Bloqueio para conteúdo pago — direciona para a assinatura.
export function Paywall({
  title = "Conteúdo exclusivo para assinantes",
  text = "Assine para liberar os simulados completos, a correção e o histórico de desempenho.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "1rem",
        padding: "3.5rem 1.5rem",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <RubiRing size={48} />
      <h2 className="display" style={{ fontSize: "var(--step-2)" }}>
        {title}
      </h2>
      <p style={{ color: "var(--ink-faint)", maxWidth: "42ch" }}>{text}</p>
      <Link href="/conta" className="btn btn-primary btn-lg">
        Ver planos
      </Link>
    </div>
  );
}
