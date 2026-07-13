import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSubjects } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { Paywall } from "@/components/Paywall";
import { SimuladoRunner } from "@/components/simulado/SimuladoRunner";

export const dynamic = "force-dynamic";

export default async function SimuladoPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <PageHeader
        eyebrow="Simulados"
        title="Escolha seu treino"
        lead="Faça o simulado completo da OAB, monte um treino por matéria ou revise seus erros."
      />
      {session.hasPaid ? (
        <SimuladoRunner subjects={await getSubjects()} />
      ) : (
        <Paywall />
      )}
    </div>
  );
}
