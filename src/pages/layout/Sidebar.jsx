import * as React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FiX } from "react-icons/fi";
import styles from "./Sidebar.module.scss";
import { getVisibleLinks } from "./routesConfig";
import logoUrl from "../../assets/logo.png";

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();
  // SSO stores the persona immediately before navigating to the dashboard.
  // Re-evaluate the links after that navigation so stakeholder-only links appear.
  const links = React.useMemo(() => getVisibleLinks(), [location.pathname]);
  const handleMobileClose = React.useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      onClose();
    }
  }, [onClose]);

  return (
    <aside
      className={`sidebar ${isOpen ? "open" : ""} ${styles.sidebar}`}
      aria-label="Primary navigation"
    >
      <button
        type="button"
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <FiX size={18} aria-hidden="true" />
      </button>

      <div className={styles.logoWrap}>
        <Link to="/dashboard" className={styles.logoLink} aria-label="Go to Dashboard">
          <img src={logoUrl} alt="Company logo" className={styles.logoImg} />
        </Link>
      </div>

      <nav className={styles.nav}>
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}
            aria-label={label}
            onClick={handleMobileClose}
          >
            <span className={styles.icon}>{React.createElement(icon, { "aria-hidden": true })}</span>
            <span className={styles.text}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
