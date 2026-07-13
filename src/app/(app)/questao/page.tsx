import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSubjects } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { QuestaoForm } from "./QuestaoForm";

export const dynamic = "force-dynamic";

export default async function QuestaoPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.is_admin) redirect("/dashboard");

  const [subjects, exams] = await Promise.all([
    getSubjects(),
    prisma.exams.findMany({
      orderBy: [{ year: "desc" }, { name: "asc" }],
      select: { id: true, name: true, year: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Administração"
        title="Nova questão"
        lead="Cadastre uma questão no banco. Ela passa a compor os simulados imediatamente."
      />
      <QuestaoForm subjects={subjects} exams={exams} />
    </div>
  );
}
