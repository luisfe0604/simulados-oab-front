import { NextResponse } from "next/server";

// Erro de aplicação com status HTTP associado. Rotas lançam ApiError e o wrapper
// `handle` converte em resposta JSON — evita try/catch repetitivo em cada rota.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const badRequest = (msg: string) => new ApiError(400, msg);
export const unauthorized = (msg = "Não autenticado") => new ApiError(401, msg);
export const forbidden = (msg = "Acesso negado") => new ApiError(403, msg);
export const notFound = (msg = "Não encontrado") => new ApiError(404, msg);

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

type RouteHandler = (...args: never[]) => Promise<NextResponse> | NextResponse;

// Envolve um handler de rota capturando ApiError (e erros inesperados) e
// devolvendo JSON consistente `{ error: string }`.
export function handle<H extends RouteHandler>(fn: H): H {
  return (async (...args: Parameters<H>) => {
    try {
      return await fn(...(args as never[]));
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("Erro não tratado na rota:", err);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  }) as H;
}
