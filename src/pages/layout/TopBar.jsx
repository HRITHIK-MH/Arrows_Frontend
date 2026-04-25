

// src/pages/layout/TopBar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../notification/NotificationBell";
import { LINKS } from "./routesConfig";


/** Build segment -> label map from Sidebar LINKS */
function buildLabelMap() {
  const map = {};
  for (const { to, label } of LINKS) {
    const seg = to.replace(/^\/+/, ""); // "/users" -> "users"
    if (seg) map[seg] = label;
  }
  // Ensure dashboard label exists
  map["dashboard"] = map["dashboard"] || "Dashboard";
  return map;
}


/** Create crumbs from pathname and ALWAYS start with Dashboard */
function useDashboardFirstCrumbs() {
  const location = useLocation();
  const labelMap = useMemo(() => buildLabelMap(), []);


  return useMemo(() => {
    // "/users" -> ["users"]; "/dashboard/users" -> ["dashboard", "users"]
    const rawParts = location.pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean);

    // Root path fallback
    if (rawParts.length === 0) {
      return [
        {
          label: labelMap.dashboard || "Dashboard",
          path: "/dashboard",
          isLast: true,
        },
      ];
    }

    // Always show Dashboard first, but keep real URL paths for the rest
    const crumbs = [
      {
        label: labelMap.dashboard || "Dashboard",
        path: "/dashboard",
      },
    ];

    const hasDashboardPrefix = rawParts[0] === "dashboard";
    const parts = hasDashboardPrefix ? rawParts.slice(1) : rawParts;
    let accPath = hasDashboardPrefix ? "/dashboard" : "";

    parts.forEach((seg) => {
      accPath += `/${seg}`;
      const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
      crumbs.push({
        label,
        path: accPath,
      });
    });

    const finalCrumbs = crumbs.map((crumb, idx) => ({
      ...crumb,
      isLast: idx === crumbs.length - 1,
    }));

    return finalCrumbs;
  }, [location.pathname, labelMap]);
}


export default function TopBar({ isSidebarOpen, setSidebarOpen }) {
  const crumbs = useDashboardFirstCrumbs();
  const pageTitle = crumbs.length ? crumbs[crumbs.length - 1].label : "Dashboard";
  const isDashboardOnly = crumbs.length === 1 && crumbs[0]?.path === "/dashboard";
  const navigate = useNavigate();


  /** Profile menu state */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);


  // Close profile menu when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);


  return (
    <header className="header" role="banner" aria-label="Top bar">
      {/* Mobile-only arrow (visibility controlled by CSS: .toggleBtn hidden on desktop) */}
      <button
        className="toggleBtn"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            d={isSidebarOpen ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>


      {/* Title on top + Breadcrumb below */}
      <div className="topTitleBlock">
        <h1 className="topTitle" aria-live="polite">{pageTitle}</h1>


        {!isDashboardOnly && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumbList">
              {crumbs.map((c, i) => (
                <li key={c.path} className="breadcrumbItem">
                  {/* Separator only between items */}
                  {i > 0 && <span className="breadcrumbSep" aria-hidden="true">/</span>}


                  {c.isLast ? (
                    <span className="breadcrumbCurrent" aria-current="page">{c.label}</span>
                  ) : (
                    <Link to={c.path} className="breadcrumbLink">{c.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      {/* Right-side actions: Notification + Profile */}
      <div className="topActions">
        <NotificationBell/>




        {/* Profile */}
        <div className="profile" ref={menuRef}>
          <button
            type="button"
            className="profileBtn"
            aria-haspopup="menu"
            aria-expanded={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden className="profileAvatar" />
           
            <span className="profileText">
                    <span className="profileName">Saravanan</span>
                    <span className="role">Team Lead</span>
                  </span>


            <svg className="profileCaret" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
            </svg>
          </button>


          {menuOpen && (
            <ul className="profileMenu" role="menu" aria-label="Profile menu">
              <li role="menuitem" className="profileMenuItem">Profile</li>
              <li role="menuitem" className="profileMenuItem">Settings</li>
              <li role="menuitem" className="profileMenuItem profileMenuDanger" onClick={() => { setMenuOpen(false); navigate('/login'); }}>Logout</li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}





