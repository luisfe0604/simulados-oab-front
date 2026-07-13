// Tipo de sessão compartilhado entre servidor e cliente (sem dependências Node).

export interface SessionUser {
  id: number;
  name: string | null;
  email: string;
  plan: string | null;
  subscription_status: string | null;
  is_admin: boolean;
  hasPaid: boolean;
  cancel_at_period_end: boolean;
  subscription_cancelled_at: string | null;
  trial_end: string | null;
}
