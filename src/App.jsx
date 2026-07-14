// src/App.jsx
import * as React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";

import TopBar from "./pages/layout/TopBar.jsx";
import Sidebar from "./pages/layout/Sidebar.jsx";
import Login from "./pages/login/Login.jsx";
import AuthCallback from "./pages/login/AuthCallback.jsx";
import { isBusinessStakeholder } from "./pages/layout/routesConfig.js";
import { hasAuthSession } from "./utils/authSession.js";
import ChunkErrorBoundary from "./components/ChunkErrorBoundary.jsx";

// Helper function to handle chunk loading errors with retry logic
function lazyWithRetry(importFunc, componentName = 'Component') {
  return lazy(() =>
    importFunc().catch(err => {
      console.error(`Failed to load ${componentName}:`, err);
      // Mark this as a chunk error so ChunkErrorBoundary can handle it
      const error = new Error(`Failed to fetch dynamically imported module: ${componentName}`);
      error.statusCode = 404;
      throw error;
    })
  );
}

// Lazy load page components for code splitting with retry logic
const Dashboard = lazyWithRetry(() => import("./pages/dashboard/Dashboard.jsx"), 'Dashboard');
const Headcount = lazyWithRetry(() => import("./pages/headcount/Headcount.jsx"), 'Headcount');
const HeadcountDetails = lazyWithRetry(() => import("./pages/headcount/HeadcountDetails.jsx"), 'HeadcountDetails');
const JobOpenings = lazyWithRetry(() => import("./pages/job-openings/JobOpenings.jsx"), 'JobOpenings');
const Candidates = lazyWithRetry(() => import("./pages/job-openings/Candidates.jsx"), 'Candidates');
const Applications = lazyWithRetry(() => import("./pages/application/Applications.jsx"), 'Applications');
const Clients = lazyWithRetry(() => import("./pages/job-openings/Clients.jsx"), 'Clients');
const Interviews = lazyWithRetry(() => import("./pages/interviews/Interviews.jsx"), 'Interviews');
const JobDescription = lazyWithRetry(() => import("./pages/job-openings/JobDescription.jsx"), 'JobDescription');
const Reports = lazyWithRetry(() => import("./pages/reports/Reports.jsx"), 'Reports');
const Timesheet = lazyWithRetry(() => import("./pages/timesheet/Timesheet.jsx"), 'Timesheet');
const TimesheetEntry = lazyWithRetry(() => import("./pages/timesheet/TimesheetEntry.jsx"), 'TimesheetEntry');
const UserRoles = lazyWithRetry(() => import("./pages/user-roles/UserRoles.jsx"), 'UserRoles');
const Calendar = lazyWithRetry(() => import("./pages/calendar/Calendar.jsx"), 'Calendar');
const ApplicationForm = lazyWithRetry(() => import("./pages/application/ApplicationForm.jsx"), 'ApplicationForm');
const ProfilePage = lazyWithRetry(() => import("./pages/profile/ProfilePage.jsx"), 'ProfilePage');
const SettingsPage = lazyWithRetry(() => import("./pages/profile/SettingsPage.jsx"), 'SettingsPage');

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
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAuthenticated(isAuthenticated());
      setCheckingAuth(false);
    }, 10);

    return () => window.clearTimeout(timeout);
  }, []);

  if (checkingAuth) {
    return <LoadingFallback />;
  }

  return authenticated ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

function RequireBusinessStakeholder({ children }) {
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setAuthenticated(isAuthenticated() && isBusinessStakeholder());
      setCheckingAuth(false);
    }, 10);

    return () => window.clearTimeout(timeout);
  }, []);

  if (checkingAuth) {
    return <LoadingFallback />;
  }

  return authenticated ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

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
      window.requestAnimationFrame(() => {
        setSidebarOpen(false);
      });
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
      {location.pathname !== '/login' && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}

      {/* TopBar: includes arrow to toggle the sidebar */}
      {location.pathname !== '/login' && <TopBar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />}

      <main className="main">
        <ChunkErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes key={location.pathname}>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sso/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
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
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

              {/* TODO: add /chat route */}
              <Route path="*" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ChunkErrorBoundary>
      </main>
    </div>
  );
}
