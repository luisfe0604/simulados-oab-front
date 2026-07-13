import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SessionProvider } from "@/components/SessionProvider";
import { AppShell } from "@/components/AppShell";

// Layout do app autenticado. Aqui acontece a proteção REAL (verifica o JWT e
// carrega o usuário) — o middleware é só o gate leve na borda.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <SessionProvider value={session}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
