import * as React from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import styles from "./Dashboard.module.scss";
import { fetchDashboardGuestToken } from "../../api/guestToken";
import { resolveEmbedSupersetDomain } from "../../utils/embedSupersetDomain";
import { DASHBOARD_UUID_MAP } from "../../utils/constants";

const FALLBACK_SUPERSET_URL =
  import.meta.env.VITE_SUPERSET_URL || "http://172.174.201.208:8088";

const FALLBACK_EMBED_UUID =
  import.meta.env.VITE_SUPERSET_EMBED_ID || DASHBOARD_UUID_MAP.default;

const STAKEHOLDER_EMAILS = new Set([
  "stakeholder@method-hub.com",
  "businessstakeholder@method-hub.com",
]);

const STAKEHOLDER_DASHBOARD_TABS = [
  {
    key: "headcount",
    label: "Head count",
    dashboardUuid:
      DASHBOARD_UUID_MAP.business_stakeholder ||
      DASHBOARD_UUID_MAP.businessstakeholder,
  },
  {
    key: "accountManager",
    label: "Account Manager",
    dashboardUuid:
      DASHBOARD_UUID_MAP.account_manager ||
      DASHBOARD_UUID_MAP.accountmanager,
  },
];

const normalizeStoredValue = (value) =>
  String(value || "").trim().toLowerCase();

const compactRole = (value) => normalizeStoredValue(value).replace(/[_\s-]+/g, "");

const isStakeholderDashboardUser = () => {
  const email = normalizeStoredValue(localStorage.getItem("userEmail"));
  const persona = compactRole(localStorage.getItem("userPersona"));
  const role = compactRole(localStorage.getItem("userRole"));

  return (
    STAKEHOLDER_EMAILS.has(email) ||
    persona === "businessstakeholder" ||
    role === "businessstakeholder" ||
    role === "stakeholder"
  );
};

export default function Dashboard() {
  const mountRef = React.useRef(null);
  const [embedError, setEmbedError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(STAKEHOLDER_DASHBOARD_TABS[0].key);

  const showStakeholderTabs = React.useMemo(() => isStakeholderDashboardUser(), []);
  const activeStakeholderTab =
    STAKEHOLDER_DASHBOARD_TABS.find((tab) => tab.key === activeTab) ||
    STAKEHOLDER_DASHBOARD_TABS[0];

  React.useEffect(() => {
    let isDisposed = false;
    const mountPoint = mountRef.current;

    if (!mountPoint) {
      return;
    }

    const initializeEmbedding = async () => {
      try {
        setEmbedError("");
        mountPoint.innerHTML = "";

        const rawRole = normalizeStoredValue(localStorage.getItem("userRole"));
        const normalizedRole = compactRole(rawRole);
        const roleDashboardUuid =
          (showStakeholderTabs
            ? activeStakeholderTab.dashboardUuid
            : DASHBOARD_UUID_MAP[rawRole] ||
              DASHBOARD_UUID_MAP[normalizedRole]) ||
          "";

        console.debug("Superset embed debug:", {
          rawRole,
          normalizedRole,
          activeDashboardTab: showStakeholderTabs ? activeStakeholderTab.key : "",
          roleDashboardUuid,
          fallbackEmbedUuid: FALLBACK_EMBED_UUID,
        });

        const bootstrap = await fetchDashboardGuestToken(roleDashboardUuid);
        const dashboardId =
          roleDashboardUuid ||
          bootstrap.dashboardUuid ||
          FALLBACK_EMBED_UUID;
        const supersetDomain = resolveEmbedSupersetDomain(
          bootstrap.supersetDomain || FALLBACK_SUPERSET_URL,
        );

        if (!dashboardId) {
          throw new Error(
            "Backend did not return dashboardUuid. Set SUPERSET_DASHBOARD_UUID in Arrows_back/.env.",
          );
        }

        const getGuestToken = async () => {
          const { token } = await fetchDashboardGuestToken(dashboardId);

          if (!token) {
            throw new Error("Unable to generate Superset guest token.");
          }

          return token;
        };

        await embedDashboard({
          id: dashboardId,
          supersetDomain,
          mountPoint,
          fetchGuestToken: getGuestToken,
          referrerPolicy: "strict-origin-when-cross-origin",
          debug:
            import.meta.env.DEV ||
            import.meta.env.VITE_SUPERSET_EMBED_DEBUG === "true",
          dashboardUiConfig: {
            hideTitle: true,
            filters: { expanded: true },
          },
        });
      } catch (error) {
        if (!isDisposed) {
          setEmbedError(error?.message || "Failed to load Superset dashboard.");
          console.error("Failed to load embedded Superset dashboard", error);
        }
      }
    };

    initializeEmbedding();

    return () => {
      isDisposed = true;
      if (mountPoint) {
        mountPoint.innerHTML = "";
      }
    };
  }, [activeStakeholderTab.dashboardUuid, activeStakeholderTab.key, showStakeholderTabs]);

  return (
    <div className={styles.fullViewWrap}>
      {showStakeholderTabs ? (
        <div className={styles.dashboardTabs} role="tablist" aria-label="Stakeholder dashboards">
          {STAKEHOLDER_DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.dashboardTab} ${activeTab === tab.key ? styles.dashboardTabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.embedFull}>
        {embedError ? (
          <div style={{ padding: 16, color: "#b91c1c" }}>
            {embedError}
          </div>
        ) : null}
        <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
