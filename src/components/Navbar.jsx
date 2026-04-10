import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authDisabled } from "../firebase";

export default function Navbar() {
  const location = useLocation();
  const activePath = location.pathname;
  const { logout, user } = useAuth();

  const linkClass = (path) =>
    activePath === path ? "navLink navLinkActive" : "navLink";

  return (
    <header className="navbar">
      <div className="navbarInner">
        <div className="brand">
          AI Financial Co-Pilot
          <div className="brandSub">Secure · multi-user · intelligent</div>
        </div>

        <nav className="navbarNav">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/upload" className={linkClass("/upload")}>
            Ingest
          </Link>
          <Link to="/chatbot" className={linkClass("/chatbot")}>
            Advisor
          </Link>
          {!authDisabled ? (
            <button
              type="button"
              className="btnSecondary"
              style={{ padding: "8px 12px", fontSize: 13 }}
              onClick={() => logout()}
            >
              {user?.email ? `Sign out` : "Sign out"}
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
