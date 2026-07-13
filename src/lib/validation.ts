import { z } from "zod";
import { badRequest } from "./http";

/** Faz o parse do corpo JSON contra um schema Zod; lança 400 com mensagem amigável. */
export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw badRequest("Corpo da requisição inválido (JSON esperado)");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    throw badRequest(first?.message ?? "Dados inválidos");
  }
  return result.data;
}

/** Faz o parse de query params (URLSearchParams) contra um schema Zod. */
export function parseQuery<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T,
): z.infer<T> {
  const obj = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    const first = result.error.issues[0];
    throw badRequest(first?.message ?? "Parâmetros inválidos");
  }
  return result.data;
}
