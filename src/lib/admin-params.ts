import { notFound } from "./http";

/** Extrai e valida o :id numérico dos params de uma rota dinâmica. */
export async function getUserIdParam(
  params: Promise<{ id: string }>,
): Promise<number> {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) throw notFound("Usuário não encontrado");
  return userId;
}
