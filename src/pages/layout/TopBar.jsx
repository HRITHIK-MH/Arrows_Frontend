

// src/pages/layout/TopBar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../notification/NotificationBell";
import ProfileModal from "../../components/ProfileModal";
import SettingsModal from "../../components/SettingsModal";
import { LINKS } from "./routesConfig";
import { clearAuthSession } from "../../utils/authSession";


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

const pageTitleMap = {
  "/candidates": "Candidates List",
  "/clients": "Clients List",
};

const routeLabelMap = {
  "/job-openings/create": "Create Job Opening",
  "/jobs/create": "Create Job Opening",
};


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

    parts.forEach((seg, index) => {
      accPath += `/${seg}`;
      const isHeadcountDetails = parts[0] === "headcount" && index === 1;
      const label = isHeadcountDetails
        ? "Employee Details"
        : routeLabelMap[accPath] || labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
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
  const location = useLocation();
  const crumbs = useDashboardFirstCrumbs();
  const [pageLabelOverride, setPageLabelOverride] = useState(null);
  const displayCrumbs = useMemo(() => {
    if (!pageLabelOverride?.breadcrumbLabel || crumbs.length === 0) return crumbs;
    const nextCrumbs = crumbs.map((crumb, idx) => (
      idx === crumbs.length - 1 ? { ...crumb, isHighlighted: true, isLast: false } : crumb
    ));

    nextCrumbs.push({
      label: pageLabelOverride.breadcrumbLabel,
      path: `${location.pathname}#${pageLabelOverride.breadcrumbLabel}`,
      isLast: true,
      isPlain: true,
    });

    return nextCrumbs;
  }, [crumbs, location.pathname, pageLabelOverride]);
  const pageTitle = pageLabelOverride?.title || pageTitleMap[location.pathname] || (crumbs.length ? crumbs[crumbs.length - 1].label : "Dashboard");
  const isDashboardOnly = crumbs.length === 1 && crumbs[0]?.path === "/dashboard";
  const navigate = useNavigate();
  const currentUserRole = useMemo(() => {
    if (typeof window === "undefined") return "";
    return String(window.localStorage.getItem("userRole") || "").toLowerCase();
  }, []);
  const currentUserPersona = useMemo(() => {
    if (typeof window === "undefined") return "";
    return String(window.localStorage.getItem("userPersona") || "").toLowerCase();
  }, []);
  const profileDisplay = useMemo(() => {
    if (currentUserPersona === "businessstakeholder") {
      return {
        name: "Demo Admin",
        // role: "Business Stakeholder",
      };
    }

    if (currentUserRole === "accountmanager") {
      return {
        name: "Surya",
        role: "Account Manager",
      };
    }

    return {
      name: "Saravanan",
      role: "Recruiter",
    };
  }, [currentUserPersona, currentUserRole]);
  const profileInitial = (profileDisplay.name || "S").charAt(0).toUpperCase();


  /** Profile menu state */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setPageLabelOverride(null);
  }, [location.pathname]);

  useEffect(() => {
    const handlePageLabelChange = (event) => {
      setPageLabelOverride(event.detail || null);
    };

    window.addEventListener("topbar-page-label-change", handlePageLabelChange);
    return () => window.removeEventListener("topbar-page-label-change", handlePageLabelChange);
  }, []);


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
              {displayCrumbs.map((c, i) => (
                <li key={c.path} className="breadcrumbItem">
                  {/* Separator only between items */}
                  {i > 0 && <span className="breadcrumbSep" aria-hidden="true">/</span>}


                  {c.isHighlighted ? (
                    <span className="breadcrumbCurrent">{c.label}</span>
                  ) : c.isLast ? (
                    <span className="breadcrumbCurrent" aria-current="page">{c.label}</span>
                  ) : c.isPlain ? (
                    <span>{c.label}</span>
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
        <NotificationBell />

        {/* Profile */}
        <div className="profile" ref={menuRef}>
          <button
            type="button"
            className="profileBtn"
            aria-haspopup="menu"
            aria-expanded={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden className="profileAvatar">{profileInitial}</span>

            <span className="profileText">
              <span className="profileName">{profileDisplay.name}</span>
              <span className="role">{profileDisplay.role}</span>
            </span>


            <svg className="profileCaret" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
            </svg>
          </button>


          {menuOpen && (
            <ul className="profileMenu" role="menu" aria-label="Profile menu">
              <li className="profileMenuHeader" role="none">
                <span className="profileMenuTitle">Menu</span>
                <button
                  type="button"
                  className="profileMenuClose"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close profile menu"
                >
                  ×
                </button>
              </li>
              <li role="menuitem" className="profileMenuItem" onClick={() => { setMenuOpen(false); setProfileOpen(true); }}>Profile</li>
              <li role="menuitem" className="profileMenuItem" onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}>Settings</li>
              <li
                role="menuitem"
                className="profileMenuItem profileMenuDanger"
                onClick={() => {
                  setMenuOpen(false);
                  clearAuthSession();
                  navigate('/login');
                }}
              >
                Logout
              </li>
            </ul>
          )}

          {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
          {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
