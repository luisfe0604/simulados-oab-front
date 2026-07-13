import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { setSessionCookie } from "@/lib/auth";
import { OAUTH_STATE_COOKIE } from "@/lib/constants";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

interface GoogleUserInfo {
  email?: string;
  name?: string;
  verified_email?: boolean;
}

// Callback do OAuth do Google: valida o state, troca o code por tokens, busca o
// perfil, cria/recupera o usuário e estabelece a sessão.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);

  const loginRedirect = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, env.appUrl));

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect("oauth_state");
  }

  // Troca o authorization code por um access token.
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: `${env.appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return loginRedirect("oauth_token");

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) return loginRedirect("oauth_token");

  // Busca o perfil do usuário.
  const infoRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!infoRes.ok) return loginRedirect("oauth_userinfo");

  const info = (await infoRes.json()) as GoogleUserInfo;
  const email = info.email?.toLowerCase();
  if (!email) return loginRedirect("oauth_email");

  // findOrCreate por e-mail (contas Google não têm senha). Novos cadastros
  // ganham 7 dias de trial local, igual ao cadastro por e-mail.
  const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const user =
    (await prisma.users.findUnique({ where: { email } })) ??
    (await prisma.users.create({
      data: {
        email,
        name: info.name ?? null,
        plan: "trial",
        subscription_status: "trial",
        trial_end: trialEnd,
      },
    }));

  await setSessionCookie(user.id);
  return NextResponse.redirect(new URL("/dashboard", env.appUrl));
}
