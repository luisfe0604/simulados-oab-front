export default async function AdminRoute({ children }) {
  const sub = await apiFetch("/billing/subscription");

  console.log(sub)

  if (!sub) return <h2>Não autenticado</h2>;

  if (!sub.is_admin) {
    return <h2>Sem permissão</h2>;
  }

  return children;
}
