import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, ready } = useAuth();
  if (ready && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="loginPage">
      <div className="loginBrandMark" aria-hidden="true" />
      <div className="loginCardWrap">
        <div className="dashTitle" style={{ marginBottom: 8 }}>
          AI Financial Co-Pilot
        </div>
        <div className="dashSubtitle" style={{ marginBottom: 20 }}>
          Redirecting to dashboard...
        </div>
        <div className="card loginCard" style={{ padding: 22 }}>
          <div className="muted">Mock auth enabled. You are signed in as Guest User.</div>
        </div>
      </div>
    </div>
  );
}
