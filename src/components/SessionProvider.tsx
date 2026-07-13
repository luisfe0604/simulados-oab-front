"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/session-types";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Sessão do usuário logado (garantida dentro do grupo de rotas (app)). */
export function useSession(): SessionUser {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession deve ser usado dentro de <SessionProvider>");
  }
  return ctx;
}
