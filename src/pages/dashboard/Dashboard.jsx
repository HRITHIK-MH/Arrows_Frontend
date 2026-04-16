import * as React from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import styles from "./Dashboard.module.scss";
import { fetchDashboardGuestToken } from "../../api/guestToken";

const DASHBOARD_KEY = "default";
const DASHBOARD_NATIVE_FILTERS_KEY = import.meta.env.VITE_SUPERSET_NATIVE_FILTERS_KEY || "";
const DASHBOARD_EMBED_ID = import.meta.env.VITE_SUPERSET_EMBED_ID || "";

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
  default: "9460305a-a764-4b91-b0b0-f4728a633e76",
  "recruitment-overview": "9460305a-a764-4b91-b0b0-f4728a633e76",
};

export default function Dashboard() {
  const [guestToken, setGuestToken] = React.useState("");
  const [isLoadingToken, setIsLoadingToken] = React.useState(false);
  const [isEmbedding, setIsEmbedding] = React.useState(false);
  const [tokenError, setTokenError] = React.useState("");
  const [dashboardId, setDashboardId] = React.useState(DASHBOARD_UUIDS[DASHBOARD_KEY]);
  const embedContainerRef = React.useRef(null);
  const isEmbeddedRef = React.useRef(false);

  const selectedDashboardUuid = DASHBOARD_UUIDS[DASHBOARD_KEY];
  const embedDashboardId = DASHBOARD_EMBED_ID || dashboardId;
  const supersetDomain = import.meta.env.VITE_SUPERSET_URL || "http://localhost:8088";

  const loadGuestToken = React.useCallback(async () => {
    setIsLoadingToken(true);
    setTokenError("");

    // Use hardcoded token if available (development mode)
    if (HAS_HARDCODED_GUEST_TOKEN) {
      setGuestToken(HARDCODED_GUEST_TOKEN);
      setDashboardId(selectedDashboardUuid);
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
      setDashboardId(result.raw?.dashboardUuid || selectedDashboardUuid);
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
    if (!mountPoint || !guestToken || !embedDashboardId || tokenError || isEmbeddedRef.current) {
      return;
    }

    let cancelled = false;
    const mountDashboard = async () => {
      setIsEmbedding(true);
      mountPoint.innerHTML = "";

      try {
        await embedDashboard({
          // Per SDK docs, this must match the dashboard identifier allowed for embedding.
          id: embedDashboardId,
          supersetDomain,
          mountPoint,
          fetchGuestToken: async () => guestToken,
          dashboardUiConfig: {
            hideTitle: false,
            hideChartControls: true,
            hideTab: false,
            filters: {
              visible: true,
              expanded: false,
            },
            ...(DASHBOARD_NATIVE_FILTERS_KEY
              ? {
                urlParams: {
                  native_filters_key: DASHBOARD_NATIVE_FILTERS_KEY,
                },
              }
              : {}),
          },
        });

        if (!cancelled) {
          isEmbeddedRef.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          const embedError = error?.message || "Failed to embed dashboard";
          if (String(embedError).toLowerCase().includes("not found")) {
            setTokenError("Superset dashboard not found or not enabled for embedding. Verify dashboard UUID and Superset embed settings.");
          } else {
            setTokenError(embedError);
          }
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
  }, [embedDashboardId, guestToken, tokenError]);

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
    <div className={styles.fullViewWrap}>
      {isLoadingToken && <div className={styles.loadingOverlay}>Loading dashboard...</div>}
      {tokenError && (
        <div className={styles.errorBanner}>
          <strong>Error:</strong> {tokenError}
        </div>
      )}
      <div ref={embedContainerRef} className={styles.embedFull} />
    </div>
  );
}
