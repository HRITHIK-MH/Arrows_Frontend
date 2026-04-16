import * as React from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import styles from "./Dashboard.module.scss";
import { fetchDashboardGuestToken } from "../../api/guestToken";

const DASHBOARD_KEY = "default";
const DASHBOARD_NATIVE_FILTERS_KEY = "g44o7wjzMlc";

/**
 * DEVELOPMENT MODE: Paste a Superset guest token here
 * 
 * To get a token:
 * 1. Start Superset: docker compose up (from Arrows_Backend directory)
 * 2. Visit http://localhost:8088, login with admin/admin
 * 3. Open any dashboard, check Network tab, find guest_token response
 * 4. Paste the "token" value below between the quotes
 * 
 * For production, set this via environment variable or remove for API-based generation
 */
const HARDCODED_GUEST_TOKEN = "PASTE_SUPERSET_GUEST_TOKEN_HERE";
const HAS_HARDCODED_GUEST_TOKEN =
  HARDCODED_GUEST_TOKEN && HARDCODED_GUEST_TOKEN !== "PASTE_SUPERSET_GUEST_TOKEN_HERE";

/**
 * Dashboard IDs in Superset
 * Update these UUIDs to match your actual Superset dashboards
 */
const DASHBOARD_UUIDS = {
  default: "db1d3034-49e5-42ef-b9d3-839bcd814dda",
  "recruitment-overview": "db1d3034-49e5-42ef-b9d3-839bcd814dda",
};

export default function Dashboard() {
  const [guestToken, setGuestToken] = React.useState("");
  const [isLoadingToken, setIsLoadingToken] = React.useState(false);
  const [isEmbedding, setIsEmbedding] = React.useState(false);
  const [tokenError, setTokenError] = React.useState("");
  const embedContainerRef = React.useRef(null);
  const isEmbeddedRef = React.useRef(false);

  const selectedDashboardUuid = DASHBOARD_UUIDS[DASHBOARD_KEY];

  const loadGuestToken = React.useCallback(async () => {
    setIsLoadingToken(true);
    setTokenError("");

    // Use hardcoded token if available (development mode)
    if (HAS_HARDCODED_GUEST_TOKEN) {
      setGuestToken(HARDCODED_GUEST_TOKEN);
      isEmbeddedRef.current = false;
      setIsLoadingToken(false);
      return;
    }

    // Fetch token from backend API (production mode)
    try {
      const payload = {
        dashboardKey: DASHBOARD_KEY,
        resources: selectedDashboardUuid ? [{ type: "dashboard", id: String(selectedDashboardUuid) }] : [],
        rls: [],
      };

      const result = await fetchDashboardGuestToken(payload);

      if (!result.token) {
        throw new Error("Guest token missing in response");
      }

      setGuestToken(result.token);
      isEmbeddedRef.current = false;
    } catch (error) {
      setTokenError(error?.response?.data?.message || error?.message || "Failed to fetch guest token");
      setGuestToken("");
      isEmbeddedRef.current = false;
    } finally {
      setIsLoadingToken(false);
    }
  }, [selectedDashboardUuid]);

  // Embed dashboard when token is available
  React.useEffect(() => {
    const mountPoint = embedContainerRef.current;
    if (!mountPoint || !guestToken || tokenError || isEmbeddedRef.current) {
      return;
    }

    let cancelled = false;
    const supersetDomain = import.meta.env.VITE_SUPERSET_URL || "http://localhost:8088";

    const mountDashboard = async () => {
      setIsEmbedding(true);
      mountPoint.innerHTML = "";

      try {
        await embedDashboard({
          id: selectedDashboardUuid,
          supersetDomain,
          mountPoint,
          fetchGuestToken: async () => guestToken,
          urlParams: {
            native_filters_key: DASHBOARD_NATIVE_FILTERS_KEY,
          },
          dashboardUiConfig: {
            hideTitle: false,
            hideChartControls: true,
            hideTab: false,
            filters: {
              visible: true,
              expanded: false,
            },
          },
        });

        if (!cancelled) {
          isEmbeddedRef.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          setTokenError(error?.message || "Failed to embed dashboard");
        }
      } finally {
        if (!cancelled) {
          setIsEmbedding(false);
        }
      }
    };

    mountDashboard();

    return () => {
      cancelled = true;
    };
  }, [guestToken, tokenError, selectedDashboardUuid]);

  // Load token on mount
  React.useEffect(() => {
    loadGuestToken();
  }, [loadGuestToken]);

  const renderTokenStatus = () => {
    if (isLoadingToken) {
      return <span className={styles.loading}>Loading token...</span>;
    }
    if (tokenError) {
      return <span className={styles.error}>Error: {tokenError}</span>;
    }
    if (!guestToken) {
      return <span className={styles.info}>No token available</span>;
    }
    return <span className={styles.success}>Token loaded ✓</span>;
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.h2}>Dashboard</h2>
      <p className={styles.p}>
        {HAS_HARDCODED_GUEST_TOKEN
          ? "Using hardcoded guest token (development mode)"
          : "Fetching guest token from backend API"}
      </p>

      <div className={styles.tokenStatusBox}>
        {renderTokenStatus()}
      </div>

      {isEmbedding && <div className={styles.loading}>Embedding dashboard...</div>}

      <div ref={embedContainerRef} className={styles.embedContainer} />
    </div>
  );
}
