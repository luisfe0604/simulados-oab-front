// Acesso centralizado e validado às variáveis de ambiente do servidor.
// Lança erro claro em vez de falhar silenciosamente com `undefined`.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. ` +
        `Defina-a no .env (local) ou nas configurações do Vercel.`,
    );
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  get jwtSecret() {
    return required("JWT_SECRET");
  },
  get appUrl() {
    return optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  },
  get googleClientId() {
    return required("GOOGLE_CLIENT_ID");
  },
  get googleClientSecret() {
    return required("GOOGLE_CLIENT_SECRET");
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY");
  },
  get stripePriceId() {
    return required("STRIPE_PRICE_ID");
  },
  get stripeWebhookSecret() {
    return required("STRIPE_WEBHOOK_SECRET");
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};
