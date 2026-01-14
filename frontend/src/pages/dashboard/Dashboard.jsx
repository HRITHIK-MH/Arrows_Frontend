import * as React from "react";
import styles from "./Dashboard.module.scss";


export default function Dashboard() {
  return (
    <div className={styles.card}>
      <h2 className={styles.h2}>Dashboard</h2>
      <p className={styles.p}>
        Your cards and charts go here. This block demonstrates the content area
        sitting to the right of the sidebar and below the top bar.
      </p>
    </div>
  );
}



