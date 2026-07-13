import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHistorico } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { Paywall } from "@/components/Paywall";
import { HistoricoList } from "./HistoricoList";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <PageHeader
        eyebrow="Histórico"
        title="Seus simulados"
        lead="Revise cada tentativa com o gabarito comentado e acompanhe sua evolução."
      />
      {session.hasPaid ? (
        <HistoricoList initial={await getHistorico(session.id)} />
      ) : (
        <Paywall text="Assine para acessar o histórico completo e a revisão de cada simulado." />
      )}
    </div>
  );
}
