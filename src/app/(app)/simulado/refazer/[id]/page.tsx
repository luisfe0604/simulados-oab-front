import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getSimuladoForRetake } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { Paywall } from "@/components/Paywall";
import { SimuladoRunner } from "@/components/simulado/SimuladoRunner";

export const dynamic = "force-dynamic";

export default async function RefazerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.hasPaid) {
    return (
      <div>
        <PageHeader eyebrow="Refazer" title="Refazer simulado" />
        <Paywall />
      </div>
    );
  }

  const { id } = await params;
  const simuladoId = Number(id);
  if (!Number.isInteger(simuladoId)) notFound();

  const questions = await getSimuladoForRetake(session.id, simuladoId);
  if (!questions || questions.length === 0) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Refazer"
        title="Refazendo simulado"
        lead={`As mesmas ${questions.length} questões, sem suas respostas anteriores. Bom treino.`}
        action={
          <Link href="/historico" className="btn btn-ghost">
            Voltar ao histórico
          </Link>
        }
      />
      <SimuladoRunner subjects={[]} initialQuestions={questions} />
    </div>
  );
}
