import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, authDisabled, googleProvider } from "../firebase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authDisabled ? { uid: "dev-local" } : null);
  const [ready, setReady] = useState(!!authDisabled);

  useEffect(() => {
    if (authDisabled || !auth) {
      setReady(true);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const getIdToken = useCallback(async () => {
    if (authDisabled) return null;
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  const loginEmail = useCallback(async (email, password) => {
    if (!auth) throw new Error("Firebase not configured");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signupEmail = useCallback(async (email, password) => {
    if (!auth) throw new Error("Firebase not configured");
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const loginGoogle = useCallback(async () => {
    if (!auth || !googleProvider) throw new Error("Firebase not configured");
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    if (authDisabled) return;
    if (auth) await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      authDisabled,
      getIdToken,
      loginEmail,
      signupEmail,
      loginGoogle,
      logout,
    }),
    [user, ready, getIdToken, loginEmail, signupEmail, loginGoogle, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth needs AuthProvider");
  return ctx;
}
