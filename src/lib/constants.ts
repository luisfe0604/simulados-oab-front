// Constantes leves, sem dependências Node — seguras para importar no middleware
// (runtime Edge), onde jsonwebtoken/Prisma não podem ser carregados.

export const SESSION_COOKIE = "token";

// Cookie efêmero anti-CSRF do fluxo OAuth do Google.
export const OAUTH_STATE_COOKIE = "g_oauth_state";
