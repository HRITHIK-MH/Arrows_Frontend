import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { getVisibleLinks } from "./routesConfig";
import logoUrl from "../../assets/logo.png";

export default function Sidebar({ isOpen = false }) {
  const links = React.useMemo(() => getVisibleLinks(), []);

  return (
    <aside
      className={`sidebar ${isOpen ? "open" : ""} ${styles.sidebar}`}
      aria-label="Primary navigation"
    >
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
          >
            <span className={styles.icon}>{React.createElement(icon, { "aria-hidden": true })}</span>
            <span className={styles.text}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
