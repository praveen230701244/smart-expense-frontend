import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { ready } = useAuth();
  if (!ready) {
    return (
      <div className="mainContentInner">
        <div className="muted">Loading session…</div>
      </div>
    );
  }
  return children;
}
