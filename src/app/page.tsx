// Página raiz temporária (scaffold). As rotas reais — (auth)/login, (app)/dashboard,
// etc. — e o middleware de autenticação serão adicionados nas próximas etapas.
export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem" }}>Simulados OAB</h1>
      <p style={{ color: "#666" }}>
        Migração para Next.js em andamento — base do projeto inicializada.
      </p>
    </main>
  );
}
