import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const activePath = location.pathname;

  const linkClass = (path) =>
    activePath === path ? "sideLink sideLinkActive" : "sideLink";

  return (
    <aside className="sidebar">
      <div className="sidebarSection">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
        <Link to="/upload" className={linkClass("/upload")}>
          Upload
        </Link>
        <Link to="/chatbot" className={linkClass("/chatbot")}>
          Advisor
        </Link>
        <Link to="/profile" className={linkClass("/profile")}>
          Profile
        </Link>
      </div>
    </aside>
  );
}

