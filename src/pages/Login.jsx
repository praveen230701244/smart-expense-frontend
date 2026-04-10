import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { auth } from "../firebase";

export default function Login() {
  const { user, ready, authDisabled: ad, loginEmail, signupEmail, loginGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  if (ad) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!auth) {
    return (
      <div className="mainContentInner">
        <div className="errorBox">
          Add Firebase env vars (VITE_FIREBASE_*) or set VITE_AUTH_DISABLED=true for local dev without auth.
        </div>
      </div>
    );
  }
  if (ready && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") await loginEmail(email, password);
      else await signupEmail(email, password);
    } catch (err) {
      setError(err?.message || "Auth failed");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginBrandMark" aria-hidden="true" />
      <div className="loginCardWrap">
      <div className="dashTitle" style={{ marginBottom: 8 }}>
        AI Financial Co-Pilot
      </div>
      <div className="dashSubtitle" style={{ marginBottom: 20 }}>
        Sign in to sync your expenses securely. Firebase JWT protects every API call.
      </div>
      <div className="card loginCard" style={{ padding: 22 }}>
        {error ? <div className="errorBox" style={{ marginBottom: 12 }}>{error}</div> : null}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button
            type="button"
            className={mode === "login" ? "btn" : "btnSecondary"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "btn" : "btnSecondary"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn">
            {mode === "login" ? "Continue" : "Create account"}
          </button>
        </form>
        <div style={{ margin: "14px 0", textAlign: "center", color: "rgba(229,231,235,0.55)" }}>or</div>
        <button type="button" className="btnSecondary" style={{ width: "100%" }} onClick={() => loginGoogle().catch((e) => setError(e?.message || "Google sign-in failed"))}>
          Continue with Google
        </button>
      </div>
      </div>
    </div>
  );
}
