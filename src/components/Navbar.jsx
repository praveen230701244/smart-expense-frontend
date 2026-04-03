import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const activePath = location.pathname;

  const linkClass = (path) =>
    activePath === path ? "navLink navLinkActive" : "navLink";

  return (
    <header className="navbar">
      <div className="navbarInner">
        <div className="brand">
          Smart Expense Analyzer
          <div className="brandSub">with AI Financial Advisor</div>
        </div>

        <nav className="navbarNav">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/upload" className={linkClass("/upload")}>
            Upload
          </Link>
          <Link to="/chatbot" className={linkClass("/chatbot")}>
            Chatbot
          </Link>
        </nav>
      </div>
    </header>
  );
}

