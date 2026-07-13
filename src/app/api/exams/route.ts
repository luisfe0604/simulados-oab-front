import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handle, json } from "@/lib/http";

// Lista as provas de origem das questões (usado no formulário de cadastro de questão).
export const GET = handle(async () => {
  await requireAdmin();

  const exams = await prisma.exams.findMany({
    orderBy: [{ year: "desc" }, { name: "asc" }],
  });

  return json(exams);
});
