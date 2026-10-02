"use client";

import { createContext, useContext } from "react";

export interface ClientUser {
  sub: string;
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
}

const SessionContext = createContext<ClientUser | null>(null);

export function SessionProvider({ user, children }: { user: ClientUser; children: React.ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useUser() {
  const user = useContext(SessionContext);
  if (!user) throw new Error("useUser must be used inside SessionProvider");
  return user;
}
