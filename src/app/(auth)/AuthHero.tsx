import { JurisLogo } from "@/components/icons";
import styles from "./auth.module.css";

// Marca d'água evocando um código de lei (artigos numerados) — vernáculo real
// do universo jurídico, não enfeite.
const WATERMARK = Array.from({ length: 22 }, (_, i) => {
  const art = i + 1;
  return `Art. ${art}º  —  §${((i * 3) % 5) + 1}  inc. ${["I", "II", "III", "IV", "V"][i % 5]}`;
}).join("\n");

export function AuthHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroWatermark} aria-hidden="true">
        {WATERMARK}
      </div>

      <div className={styles.heroTop}>
        <span className={styles.heroBrandRing} style={{ color: "#f4e9df" }}>
          <JurisLogo size={30} />
        </span>
        <span className={styles.heroWordmark}>JurisAprova</span>
      </div>

      <div className={styles.heroCenter}>
        <p className={styles.heroEyebrow}>1ª fase · Exame de Ordem</p>
        <h1 className={styles.heroTitle}>
          A distância entre você e o <em>anel de rubi</em> são 40 questões.
        </h1>
        <p className={styles.heroText}>
          Monte o simulado no formato oficial da OAB, corrija na hora e veja sua
          nota contra a linha de corte de 50%. Cada tentativa aproxima a
          aprovação.
        </p>
      </div>

      <div className={styles.heroStats}>
        <div className={styles.heroStat}>
          <span className={styles.heroStatNum}>80</span>
          <span className={styles.heroStatLabel}>Questões por simulado</span>
        </div>
        <div className={styles.heroStat}>
          <span className={styles.heroStatNum}>20</span>
          <span className={styles.heroStatLabel}>Matérias</span>
        </div>
        <div className={styles.heroStat}>
          <span className={styles.heroStatNum}>50%</span>
          <span className={styles.heroStatLabel}>Linha de corte</span>
        </div>
      </div>
    </section>
  );
}
