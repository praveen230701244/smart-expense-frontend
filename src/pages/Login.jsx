import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiGetProfile } from "../services/api.js";

export default function Login() {
  const { user, ready } = useAuth();
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (!ready || !user) return undefined;
    let alive = true;
    (async () => {
      try {
        const res = await apiGetProfile();
        if (alive) setRedirect(res?.exists ? "/dashboard" : "/setup-profile");
      } catch {
        if (alive) setRedirect("/dashboard");
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, user]);

  if (ready && user && redirect !== null) {
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="loginPage">
      <div className="loginBrandMark" aria-hidden="true" />
      <div className="loginCardWrap">
        <div className="dashTitle" style={{ marginBottom: 8 }}>
          AI Financial Co-Pilot
        </div>
        <div className="dashSubtitle" style={{ marginBottom: 20 }}>
          {ready && user && redirect === null ? "Checking your profile…" : "Redirecting to dashboard..."}
        </div>
        <div className="card loginCard" style={{ padding: 22 }}>
          <div className="muted">Mock auth enabled. You are signed in as Guest User.</div>
        </div>
      </div>
    </div>
  );
}
