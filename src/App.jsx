// src/App.jsx
import * as React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";

import TopBar from "./pages/layout/TopBar.jsx";
import Sidebar from "./pages/layout/Sidebar.jsx";
import Login from "./pages/login/Login.jsx";
import { isBusinessStakeholder } from "./pages/layout/routesConfig.js";
import { hasAuthSession } from "./utils/authSession.js";

// Lazy load page components for code splitting
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard.jsx"));
const Headcount = lazy(() => import("./pages/headcount/Headcount.jsx"));
const HeadcountDetails = lazy(() => import("./pages/headcount/HeadcountDetails.jsx"));
const JobOpenings = lazy(() => import("./pages/job-openings/JobOpenings.jsx"));
const Candidates = lazy(() =>
  import("./pages/job-openings/Candidates.jsx").catch(err => {
    console.error("Failed to load Candidates:", err);
    throw err;
  })
);
const Applications = lazy(() => import("./pages/application/Applications.jsx"));
const Clients = lazy(() => import("./pages/job-openings/Clients.jsx"));
const Interviews = lazy(() => import("./pages/interviews/Interviews.jsx"));
const JobDescription = lazy(() => import("./pages/job-openings/JobDescription.jsx"));
const Reports = lazy(() => import("./pages/reports/Reports.jsx"));
const Timesheet = lazy(() => import("./pages/timesheet/Timesheet.jsx"));
const TimesheetEntry = lazy(() => import("./pages/timesheet/TimesheetEntry.jsx"));
const UserRoles = lazy(() => import("./pages/user-roles/UserRoles.jsx"));
const Calendar = lazy(() => import("./pages/calendar/Calendar.jsx"));
const ApplicationForm = lazy(() => import("./pages/application/ApplicationForm.jsx"));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Loading...</div>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

const isAuthenticated = () => hasAuthSession();

function RequireAuth({ children }) {
  const location = useLocation();
  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

function RequireBusinessStakeholder({ children }) {
  return isAuthenticated() && isBusinessStakeholder() ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  // Debug logging for route changes
  useEffect(() => {
    console.log('Route changed to:', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.backgroundColor = "#ffffff";
  }, []);

  useEffect(() => {
    const shouldLockScroll = location.pathname !== "/login" && isSidebarOpen && window.innerWidth <= 768;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, location.pathname]);

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes key={location.pathname}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/sso-callback" element={<Login />} />
            <Route path="/sso/callback" element={<Login />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/headcount" element={<RequireBusinessStakeholder><Headcount /></RequireBusinessStakeholder>} />
            <Route path="/headcount/:employeeId" element={<RequireBusinessStakeholder><HeadcountDetails /></RequireBusinessStakeholder>} />
            <Route path="/job-openings" element={<RequireAuth><JobOpenings /></RequireAuth>} />
            <Route path="/candidates" element={<RequireAuth><Candidates /></RequireAuth>} />
            <Route path="/applications" element={<RequireAuth><Applications /></RequireAuth>} />
            <Route path="/interviews" element={<RequireAuth><Interviews /></RequireAuth>} />
            <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
            <Route path="/job-openings/edit" element={<RequireAuth><JobOpenings /></RequireAuth>} />
            <Route path="/job-openings/create" element={<RequireAuth><JobOpenings createMode={true} /></RequireAuth>} />
            <Route path="/job-openings/:jobId" element={<RequireAuth><JobDescription /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
            <Route path="/timesheet" element={<RequireAuth><Timesheet /></RequireAuth>} />
            <Route path="/timesheet/new" element={<RequireAuth><TimesheetEntry /></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
            <Route path="/users" element={<RequireAuth><UserRoles /></RequireAuth>} />
            <Route path="/application" element={<RequireAuth><ApplicationForm /></RequireAuth>} />

            {/* TODO: add /chat route */}
            <Route path="*" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}


