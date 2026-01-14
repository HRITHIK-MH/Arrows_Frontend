

import * as React from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { LINKS } from "./routesConfig"; // ← shared source of truth
import logoUrl from "../../assets/logo.png";


export default function Sidebar({ isOpen = false }) {
  return (
    <aside
      className={`sidebar ${isOpen ? "open" : ""} ${styles.sidebar}`}
      aria-label="Primary navigation"
    >
     
     
      {/* Logo block */}
      <div className={styles.logoWrap}>
        <Link to="/dashboard" className={styles.logoLink} aria-label="Go to Dashboard">
          <img src={logoUrl} alt="Company logo" className={styles.logoImg} />
        </Link>
      </div>




      <nav className={styles.nav}>
        {LINKS.map(({ to, label, icons }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ""}`}
            aria-label={label}
          >
            {({ isActive }) => {
              const IconComp = isActive ? icons.active : icons.normal;
              return (
                <>
                  <span className={styles.icon}><IconComp aria-hidden /></span>
                  <span className={styles.text}>{label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}





