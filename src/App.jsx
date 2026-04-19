import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className={isLogin ? "appShell appShellLogin" : "appShell"}>
      {!isLogin ? <Navbar /> : null}
      <div className={isLogin ? "loginContentShell" : "contentShell"}>
        {!isLogin ? <Sidebar /> : null}
        <main className={isLogin ? "mainContent mainContentLogin" : "mainContent"}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/setup-profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
