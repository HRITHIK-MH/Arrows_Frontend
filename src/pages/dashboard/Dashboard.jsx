import * as React from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import styles from "./Dashboard.module.scss";
import { fetchDashboardGuestToken } from "../../api/guestToken";

/* ─────────────── Dashboard Stats Bar ─────────────── */
function DashboardStatsBar() {
  return (
    <div className={styles.statsBar}>

      {/* ── Col 1a: Total Open Positions ── */}
      <div className={`${styles.statCard} ${styles.statBlue}`}>
        <div className={styles.statCardHeader}>
          <span className={styles.statCardLabel}>Total Open Positions</span>
          <span className={styles.statCardIcon}>🕐</span>
        </div>
        <div className={styles.statBigNum}>186</div>
        <div className={styles.statSubRow}>
          <span>In Progress</span>
          <span>Yet to confirm</span>
          <span>Idle</span>
        </div>
        <div className={styles.multiBar}>
          <div className={styles.mbBlue}   style={{ flex: 40 }} />
          <div className={styles.mbGreen}  style={{ flex: 35 }} />
          <div className={styles.mbGray}   style={{ flex: 25 }} />
        </div>
        <div className={styles.circleRow}>
          <span className={styles.circle} style={{ background: "#3b82f6" }}>TC</span>
          <span className={styles.circle} style={{ background: "#10b981" }}>IP</span>
          <span className={styles.circle} style={{ background: "#d1d5db", color: "#6b7280" }}>IL</span>
        </div>
      </div>

      {/* ── Col 1b: Requirements ── */}
      <div className={`${styles.statCard} ${styles.statPeach}`}>
        <span className={styles.badge} style={{ background: "#ff7043", color: "#fff" }}>New</span>
        <div className={styles.statCardLabel} style={{ marginTop: 6 }}>Requirements</div>
        <div className={styles.statBigNum}>
          1200 <span className={styles.statNumSub}>This Week</span>
        </div>
        <div className={styles.circleRow}>
          <span className={styles.circle} style={{ background: "#fb923c" }}>TC</span>
          <span className={styles.circle} style={{ background: "#fbbf24" }}>IP</span>
          <span className={styles.circle} style={{ background: "#d1d5db", color: "#6b7280" }}>IL</span>
        </div>
      </div>

      {/* ── Col 2a: Core Clients ── */}
      <div className={`${styles.statCard} ${styles.statPurple}`}>
        <span className={styles.badge} style={{ background: "#a78bfa", color: "#fff" }}>Client List</span>
        <div className={styles.statCardLabel} style={{ marginTop: 6 }}>Core Clients</div>
        <div className={styles.statBigNum}>
          <span style={{ color: "#6d28d9" }}>94</span>{" "}
          <span className={styles.statNumSub}>Total Clients</span>
        </div>
        <div className={styles.circleRow}>
          <span className={styles.circle} style={{ background: "#8b5cf6" }}>TC</span>
          <span className={styles.circle} style={{ background: "#a78bfa" }}>VN</span>
          <span className={styles.circle} style={{ background: "#d1d5db", color: "#6b7280" }}>+</span>
        </div>
      </div>

      {/* ── Col 2b: New Hire ── */}
      <div className={`${styles.statCard} ${styles.statLavender}`}>
        <div className={styles.statCardHeader}>
          <span className={styles.statCardLabel}>New Hire</span>
          <span className={styles.statCardIcon}>👥</span>
        </div>
        <div className={styles.statBigNum}>
          210 <span className={styles.statNumSub}>This Week</span>
        </div>
        <div className={styles.avatarRow}>
          <span className={styles.avatar} style={{ background: "#818cf8" }}>A</span>
          <span className={styles.avatar} style={{ background: "#34d399" }}>B</span>
          <span className={styles.avatar} style={{ background: "#f87171" }}>C</span>
        </div>
      </div>

      {/* ── Col 3: Recruitment Status ── */}
      <div className={`${styles.statCard} ${styles.statWide}`}>
        <div className={styles.recruitHeader}>
          <span className={styles.recruitTitle}>Recruitment Status</span>
          <span className={styles.badge} style={{ background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}>
            📅 This week
          </span>
        </div>
        <div className={styles.recruitTotalRow}>
          <span className={styles.recruitTotalLabel}>Total recruitment</span>
          <span className={styles.recruitTotalNum}>140</span>
        </div>
        <div className={styles.colorBar}>
          <div style={{ background: "#a855f7", flex: 94 }} />
          <div style={{ background: "#22c55e", flex: 50 }} />
          <div style={{ background: "#f59e0b", flex: 45 }} />
          <div style={{ background: "#ef4444", flex: 55 }} />
        </div>
        <div className={styles.recruitGrid}>
          <div className={styles.recruitItem}>
            <span className={styles.dot} style={{ background: "#a855f7" }} />
            <span className={styles.recruitItemLabel}>Critical Roles</span>
            <span className={styles.recruitItemNum}>94</span>
          </div>
          <div className={styles.recruitItem}>
            <span className={styles.dot} style={{ background: "#22c55e" }} />
            <span className={styles.recruitItemLabel}>Skilled Positions</span>
            <span className={styles.recruitItemNum}>50</span>
          </div>
          <div className={styles.recruitItem}>
            <span className={styles.dot} style={{ background: "#f59e0b" }} />
            <span className={styles.recruitItemLabel}>Support Roles</span>
            <span className={styles.recruitItemNum}>45</span>
          </div>
          <div className={styles.recruitItem}>
            <span className={styles.dot} style={{ background: "#ef4444" }} />
            <span className={styles.recruitItemLabel}>Entry-Level</span>
            <span className={styles.recruitItemNum}>55</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.performerRow}>
          <span className={styles.performerLabel}>To Performer</span>
          <div className={styles.performerInfo}>
            <span className={styles.performerAvatar}>DE</span>
            <div>
              <div className={styles.performerName}>Daniel Esbella</div>
              <div className={styles.performerRole}>IOS Developer</div>
            </div>
            <div className={styles.performerScore}>
              <span className={styles.performerScoreLabel}>Performance</span>
              <span className={styles.performerScoreNum}>99%</span>
            </div>
          </div>
          <a className={styles.viewAll} href="#">View all</a>
        </div>
      </div>

      {/* ── Col 4: Today Tasks ── */}
      <div className={`${styles.statCard} ${styles.statTasks}`}>
        <div className={styles.tasksTitle}>Today Tasks</div>
        <div className={`${styles.taskItem} ${styles.taskGreen}`}>
          <div className={styles.taskName}>Review High Priority Role Applications</div>
          <div className={styles.taskBar}><div className={styles.taskBarFill} style={{ width: "35%", background: "#10b981" }} /></div>
          <span className={styles.taskBadge}>+35%</span>
        </div>
        <div className={`${styles.taskItem} ${styles.taskBlue}`}>
          <div className={styles.taskName}>Schedule Candidate Interviews</div>
          <span className={styles.taskIcon}>👤</span>
        </div>
        <div className={`${styles.taskItem} ${styles.taskYellow}`}>
          <div className={styles.taskName}>Update Recruitment Tracker</div>
          <div className={styles.taskBar}><div className={styles.taskBarFill} style={{ width: "35%", background: "#f59e0b" }} /></div>
          <span className={styles.taskBadge}>+35%</span>
        </div>
      </div>

    </div>
  );
}

const DASHBOARD_KEY = "default";
const DASHBOARD_NATIVE_FILTERS_KEY = import.meta.env.VITE_SUPERSET_NATIVE_FILTERS_KEY || "";
const DASHBOARD_PERMALINK_KEY = import.meta.env.VITE_SUPERSET_PERMALINK_KEY || "";
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
  default: "4fe4d1ff-293f-4ac3-acce-e8887b9f014e",
  "recruitment-overview": "4fe4d1ff-293f-4ac3-acce-e8887b9f014e",
};

export default function Dashboard() {
  const [guestToken, setGuestToken] = React.useState("");
  const [isLoadingToken, setIsLoadingToken] = React.useState(false);
  const [isEmbedding, setIsEmbedding] = React.useState(false);
  const [tokenError, setTokenError] = React.useState("");
  const embedContainerRef = React.useRef(null);
  const isEmbeddedRef = React.useRef(false);

  const selectedDashboardUuid = DASHBOARD_UUIDS[DASHBOARD_KEY];
  const effectiveDashboardId = DASHBOARD_EMBED_ID || selectedDashboardUuid;
  const supersetDomain = import.meta.env.VITE_SUPERSET_URL || "http://localhost:8088";

  const dashboardUrlParams = React.useMemo(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const nativeFiltersKey = (urlSearchParams.get("native_filters_key") || DASHBOARD_NATIVE_FILTERS_KEY || "").trim();
    const permalinkKey = (urlSearchParams.get("permalink_key") || DASHBOARD_PERMALINK_KEY || "").trim();

    const params = {};

    if (nativeFiltersKey) {
      params.native_filters_key = nativeFiltersKey;
    }

    if (permalinkKey) {
      params.permalink_key = permalinkKey;
    }

    return params;
  }, []);

  const hasDashboardUrlParams = Object.keys(dashboardUrlParams).length > 0;

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
        resources: effectiveDashboardId ? [{ type: "dashboard", id: String(effectiveDashboardId) }] : [],
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
  }, [effectiveDashboardId]);

  // Embed dashboard when token is available
  React.useEffect(() => {
    const mountPoint = embedContainerRef.current;
    if (!mountPoint || !guestToken || !effectiveDashboardId || tokenError || isEmbeddedRef.current) {
      return;
    }

    let cancelled = false;
    const mountDashboard = async () => {
      setIsEmbedding(true);
      mountPoint.innerHTML = "";

      const embedOptions = {
        // Per SDK docs, this must match the dashboard identifier allowed for embedding.
        id: effectiveDashboardId,
        supersetDomain,
        mountPoint,
        fetchGuestToken: async () => guestToken,
        ...(hasDashboardUrlParams ? { urlParams: dashboardUrlParams } : {}),
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: true,
          hideTab: false,
          filters: {
            visible: true,
            expanded: false,
          },
          ...(hasDashboardUrlParams
            ? {
              urlParams: {
                ...dashboardUrlParams,
              },
            }
            : {}),
        },
      };

      try {
        try {
          await embedDashboard(embedOptions);
        } catch (error) {
          const isNotFound = String(error?.message || "").toLowerCase().includes("not found");
          if (!isNotFound || !hasDashboardUrlParams) {
            throw error;
          }

          // A stale permalink/native filter key can produce Not found; retry once without URL params.
          await embedDashboard({
            ...embedOptions,
            urlParams: undefined,
            dashboardUiConfig: {
              ...embedOptions.dashboardUiConfig,
              urlParams: undefined,
            },
          });
        }

        if (!cancelled) {
          isEmbeddedRef.current = true;

          // Inject CSS into the embedded Superset iframe to style the 3 columns
          const injectColumnStyles = (retries = 0) => {
            try {
              const iframe = mountPoint.querySelector("iframe");
              if (!iframe) {
                if (retries < 15) setTimeout(() => injectColumnStyles(retries + 1), 600);
                return;
              }
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (!iframeDoc || iframeDoc.readyState === "loading") {
                if (retries < 15) setTimeout(() => injectColumnStyles(retries + 1), 600);
                return;
              }
              const cols = iframeDoc.querySelectorAll(".dragdroppable-column");
              if (!cols.length) {
                if (retries < 20) setTimeout(() => injectColumnStyles(retries + 1), 700);
                return;
              }
              if (iframeDoc.getElementById("arrows-column-styles")) return;
              const style = iframeDoc.createElement("style");
              style.id = "arrows-column-styles";
              style.textContent = `
                body, html {
                  overflow: hidden !important;
                }
                ::-webkit-scrollbar {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
                * {
                  scrollbar-width: none !important;
                  -ms-overflow-style: none !important;
                }
                .dragdroppable-column {
                  background: #ffffff !important;
                  border-radius: 12px !important;
                  box-shadow: 0 2px 10px rgba(11, 91, 167, 0.08) !important;
                  border: 1px solid #e2eaf4 !important;
                  padding: 16px 14px !important;
                  margin: 0 8px !important;
                }
                .dragdroppable-column:first-child { margin-left: 0 !important; }
                .dragdroppable-column:last-child  { margin-right: 0 !important; }
                .dragdroppable-row .dragdroppable-column {
                  flex: 1;
                }
              `;
              iframeDoc.head.appendChild(style);
            } catch (_) {
              // Cross-origin access denied — silently skip
            }
          };
          setTimeout(() => injectColumnStyles(), 1000);
        }
      } catch (error) {
        if (!cancelled) {
          const embedError = error?.message || "Failed to embed dashboard";
          if (String(embedError).toLowerCase().includes("not found")) {
            setTokenError(
              "Superset dashboard not found or not enabled for embedding. Verify VITE_SUPERSET_EMBED_ID matches the dashboard allowed in Superset embedding settings."
            );
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
  }, [effectiveDashboardId, guestToken, tokenError, hasDashboardUrlParams, dashboardUrlParams, supersetDomain]);

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
      <DashboardStatsBar />
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
