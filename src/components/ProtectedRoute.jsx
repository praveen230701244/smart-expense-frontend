import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { auth, authDisabled } from "../firebase";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (authDisabled) return children;
  if (!ready) {
    return (
      <div className="mainContentInner">
        <div className="muted">Loading session…</div>
      </div>
    );
  }
  if (!auth) {
    return (
      <div className="mainContentInner">
        <div className="errorBox">Firebase is not configured. Set VITE_FIREBASE_* or VITE_AUTH_DISABLED=true for local dev.</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
