// src/App.jsx
import * as React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import TopBar from "./pages/layout/TopBar.jsx";
import Sidebar from "./pages/layout/Sidebar.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import JobOpenings from "./pages/job-openings/JobOpenings.jsx";
import Candidates from "./pages/job-openings/Candidates.jsx";
import Clients from "./pages/job-openings/Clients.jsx";
import Login from "./pages/login/Login.jsx";
import ApplicationForm from "./pages/application/ApplicationForm.jsx";
import ExampleFormsPage from "./pages/example-forms/ExampleFormsPage.jsx";

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.backgroundColor = "#ffffff";
  }, []);

  // Close the sidebar on route changes for small screens
  React.useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Swipe gestures: right to open, left to close (only on small screens)
  React.useEffect(() => {
    let startX = null;
    let currentX = null;

    const isSmall = () => window.innerWidth <= 768;

    const onTouchStart = (e) => {
      if (!isSmall()) return;
      const t = e.touches[0];
      startX = t.clientX;
      currentX = t.clientX;
    };

    const onTouchMove = (e) => {
      if (!isSmall() || startX === null) return;
      currentX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      if (!isSmall() || startX === null || currentX === null) return;
      const deltaX = currentX - startX;

      if (deltaX > 60) {
        // swipe right → open
        setSidebarOpen(true);
      } else if (deltaX < -60) {
        // swipe left → close
        setSidebarOpen(false);
      }

      startX = null;
      currentX = null;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className={`app ${location.pathname === '/login' ? 'login' : ''}`}>
      {/* Overlay (visible only when sidebar is open on small screens) */}
      <div
        className={`overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Sidebar: off‑canvas on small screens (controlled by isSidebarOpen) */}
      {location.pathname !== '/login' && <Sidebar isOpen={isSidebarOpen} />}

      {/* TopBar: includes arrow to toggle the sidebar */}
      {location.pathname !== '/login' && <TopBar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />}

      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/job-openings" element={<JobOpenings/>} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/application" element={<ApplicationForm />} />
          <Route path="/example-forms" element={<ExampleFormsPage />} />

          {/* Example page (Users) — add the rest similarly */}
          <Route
            path="/users"
            element={
              <div className="container">
                <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
                  <h2 style={{ margin: 0 }}>User Roles</h2>
                  <p style={{ marginTop: 8 }}>Replace with your user roles page.</p>
                </div>
              </div>
            }
          />

          {/* TODO: add /candidates, /interviews, /clients, /reports, /chat, /calendar routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}


