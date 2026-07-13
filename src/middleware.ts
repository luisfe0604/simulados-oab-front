import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Rotas públicas (não exigem sessão).
const PUBLIC_PATHS = ["/login", "/register", "/auth-success"];

// Gate leve na borda: apenas verifica a PRESENÇA do cookie de sessão. A
// verificação criptográfica do JWT e a checagem de papel/assinatura acontecem
// server-side (getCurrentUser/requireUser) nas rotas de API e nos layouts.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Usuário já logado tentando acessar login/registro → manda para o dashboard.
  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Rota protegida sem sessão → manda para o login.
  if (!isPublic && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Aplica a tudo, exceto assets internos do Next, a API e arquivos estáticos.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
