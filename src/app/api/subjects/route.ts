import { prisma } from "@/lib/prisma";
import { requirePaid } from "@/lib/auth";
import { handle, json } from "@/lib/http";

// Lista matérias com a contagem de questões associadas (ordenadas por nome).
export const GET = handle(async () => {
  await requirePaid();

  const subjects = await prisma.subjects.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { question_subjects: true } } },
  });

  return json(
    subjects.map((s) => ({
      id: s.id,
      name: s.name,
      question_count: s._count.question_subjects,
    })),
  );
});
