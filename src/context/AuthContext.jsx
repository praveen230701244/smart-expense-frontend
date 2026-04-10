import { createContext, useContext, useMemo } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const user = useMemo(
    () => ({ uid: "guest-local", name: "Guest User", email: "guest@local" }),
    []
  );
  const ready = true;

  const value = useMemo(
    () => ({
      user,
      ready,
      authDisabled: true,
      getIdToken: async () => null,
      loginEmail: async () => {},
      signupEmail: async () => {},
      loginGoogle: async () => {},
      logout: async () => {},
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth needs AuthProvider");
  return ctx;
}
