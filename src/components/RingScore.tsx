// Assinatura visual do JurisAprova: o anel de progresso da nota.
// A linha de corte marca 50% — a nota real de aprovação na 1ª fase da OAB
// (40 de 80 questões). Abaixo disso o anel fica incompleto; a partir de 50%
// ele fecha e ganha o brilho de ouro-velho ("Aprovado").

interface RingScoreProps {
  /** Nota de 0 a 100. */
  score: number;
  size?: number;
  /** Mostra o rótulo textual abaixo do número. */
  showLabel?: boolean;
  strokeWidth?: number;
}

const CUT_LINE = 50;

export function RingScore({
  score,
  size = 160,
  showLabel = true,
  strokeWidth,
}: RingScoreProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const approved = clamped >= CUT_LINE;

  const sw = strokeWidth ?? Math.max(6, Math.round(size * 0.055));
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (clamped / 100) * circumference;

  // Posição da linha de corte (50% = base do anel, pois começamos no topo).
  const cutTickOuter = r + sw * 0.9;
  const cutTickInner = r - sw * 0.9;

  const ringColor = approved ? "var(--ouro)" : "var(--rubi)";

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
          aria-hidden="true"
        >
          {/* Trilho */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--line)"
            strokeWidth={sw}
          />
          {/* Progresso */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{
              transition: "stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)",
              filter: approved
                ? "drop-shadow(0 0 6px rgba(176,141,87,0.55))"
                : "none",
            }}
          />
          {/* Linha de corte (50%) — marcada na base, na orientação já rotacionada */}
          <line
            x1={cx}
            y1={cy - cutTickOuter}
            x2={cx}
            y2={cy - cutTickInner}
            stroke="var(--ink)"
            strokeWidth={2}
            transform={`rotate(180 ${cx} ${cy})`}
            opacity={0.55}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <span
            className="display mono"
            style={{
              fontSize: size * 0.28,
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            {Math.round(clamped)}
          </span>
          <span
            className="mono"
            style={{
              fontSize: Math.max(9, size * 0.075),
              color: "var(--ink-faint)",
              letterSpacing: "0.1em",
              marginTop: size * 0.02,
            }}
          >
            / 100
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className="badge"
          style={{
            background: approved ? "rgba(176,141,87,0.16)" : "var(--surface-2)",
            color: approved ? "var(--ouro-deep)" : "var(--ink-faint)",
          }}
        >
          {approved ? "Acima da linha de corte" : "Abaixo da linha de corte"}
        </span>
      )}
    </div>
  );
}
