import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getDisplayName, getAvatarInitials, formatRoleLabel } from "../../utils/userDisplay";
import "../../components/ProfileModal.css";

const ACCOUNT_MENU_ITEMS = [
  "Profile",
  "Preferences",
  "Notifications",
  "Privacy & Security",
];

const DEFAULT_LANDING_PAGE_KEY = "settings-default-landing-page";
const COMPACT_NAVIGATION_KEY = "settings-compact-navigation";

const getStoredLandingPage = () => localStorage.getItem(DEFAULT_LANDING_PAGE_KEY) || "dashboard";
const getStoredCompactNavigation = () => localStorage.getItem(COMPACT_NAVIGATION_KEY) === "true";

export default function AccountSettingsLayout({ defaultSection = "Profile" }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const { notificationsEnabled, setNotificationsEnabled } = useTheme();
  const [savedLandingPage, setSavedLandingPage] = useState(getStoredLandingPage);
  const [savedCompactNavigation, setSavedCompactNavigation] = useState(getStoredCompactNavigation);
  const [draftLandingPage, setDraftLandingPage] = useState(savedLandingPage);
  const [draftCompactNavigation, setDraftCompactNavigation] = useState(savedCompactNavigation);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const storedName = String(localStorage.getItem("userName") || "").trim();
  const storedEmail = String(localStorage.getItem("userEmail") || "").trim();
  const storedRole = String(localStorage.getItem("userRole") || localStorage.getItem("userPersona") || "").trim();
  const storedDesignation = String(
    localStorage.getItem("userDesignation") ||
    localStorage.getItem("designation") ||
    localStorage.getItem("jobTitle") ||
    localStorage.getItem("userJobTitle") ||
    ""
  ).trim();
  const displayName = getDisplayName(storedName, storedEmail);
  const displayRole = formatRoleLabel(storedRole);

  const sectionDescription = useMemo(() => {
    const descriptions = {
      Profile: "Review your account profile details.",
      Preferences: "Adjust personal product preferences for this workspace.",
      Notifications: "Control push and email alerts.",
      "Privacy & Security": "Manage password, privacy, and account security options.",
    };

    return descriptions[activeSection] || "";
  }, [activeSection]);

  const resetDraftSettings = () => {
    setDraftLandingPage(savedLandingPage);
    setDraftCompactNavigation(savedCompactNavigation);
  };

  const saveSettings = () => {
    if (activeSection === "Preferences") {
      localStorage.setItem(DEFAULT_LANDING_PAGE_KEY, draftLandingPage);
      localStorage.setItem(COMPACT_NAVIGATION_KEY, String(draftCompactNavigation));
      setSavedLandingPage(draftLandingPage);
      setSavedCompactNavigation(draftCompactNavigation);
    }

    leaveSettingsPage();
  };

  const cancelSettings = () => {
    resetDraftSettings();
    leaveSettingsPage();
  };

  const leaveSettingsPage = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/dashboard");
  };

  const resetChangePassword = () => {
    setShowChangePassword((value) => !value);
    setPasswordError("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const renderProfile = () => (
    <div className="settingsProfileSummary">
      <div className="profileModalAvatar">{getAvatarInitials(storedName, storedEmail)}</div>

      <div className="profileModalInfo">
        <div className="profileModalRow">
          <label className="profileModalLabel">Full Name</label>
          <input className="profileModalInput" type="text" value={displayName} readOnly />
        </div>
        <div className="profileModalRow">
          <label className="profileModalLabel">Role</label>
          <input className="profileModalInput" type="text" value={displayRole} readOnly />
        </div>
        <div className="profileModalRow">
          <label className="profileModalLabel">Email</label>
          <input className="profileModalInput" type="email" value={storedEmail} readOnly />
        </div>
        <div className="profileModalRow">
          <label className="profileModalLabel">Designation</label>
          <input className="profileModalInput" type="text" value={storedDesignation} readOnly />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="settingsSection settingsPanelSection">
      <h3 className="settingsSectionTitle">Workspace Preferences</h3>
      <div className="settingsRow">
        <label className="settingsLabel" htmlFor="defaultLandingPage">Default landing page</label>
        <select
          id="defaultLandingPage"
          className="settingsSelect"
          value={draftLandingPage}
          onChange={(event) => setDraftLandingPage(event.target.value)}
        >
          <option value="dashboard">Dashboard</option>
          <option value="jobs">Job Openings</option>
          <option value="calendar">Calendar</option>
        </select>
      </div>
      <div className="settingsRow">
        <label className="settingsLabel">Compact navigation</label>
        <button
          type="button"
          role="switch"
          aria-checked={draftCompactNavigation}
          className={`settingsToggle ${draftCompactNavigation ? "settingsToggleOn" : ""}`}
          onClick={() => setDraftCompactNavigation((value) => !value)}
        >
          <span className="settingsToggleThumb" />
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="settingsSection settingsPanelSection">
      <h3 className="settingsSectionTitle">Notifications</h3>
      <div className="settingsRow">
        <label className="settingsLabel">Push Notifications</label>
        <button
          type="button"
          role="switch"
          aria-checked={notificationsEnabled}
          className={`settingsToggle ${notificationsEnabled ? "settingsToggleOn" : ""}`}
          onClick={() => setNotificationsEnabled((value) => !value)}
        >
          <span className="settingsToggleThumb" />
        </button>
      </div>
      <div className="settingsRow">
        <label className="settingsLabel">Email Alerts</label>
        <button
          type="button"
          role="switch"
          aria-checked={emailAlerts}
          className={`settingsToggle ${emailAlerts ? "settingsToggleOn" : ""}`}
          onClick={() => setEmailAlerts((value) => !value)}
        >
          <span className="settingsToggleThumb" />
        </button>
      </div>
    </div>
  );

  const renderPrivacySecurity = () => (
    <div className="settingsSection settingsPanelSection">
      <h3 className="settingsSectionTitle">Account</h3>
      <div className="settingsRow">
        <label className="settingsLabel">Change Password</label>
        <button type="button" className="settingsLinkBtn" onClick={resetChangePassword}>
          {showChangePassword ? "Cancel x" : "Update ->"}
        </button>
      </div>

      {showChangePassword && (
        <div className="changePasswordFields">
          <div className="changePasswordRow">
            <label className="profileModalLabel">New Password</label>
            <input
              className="profileModalInput"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setPasswordError("");
              }}
              autoFocus
            />
          </div>
          <div className="changePasswordRow">
            <label className="profileModalLabel">Confirm Password</label>
            <input
              className={`profileModalInput ${passwordError ? "inputError" : ""}`}
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setPasswordError("");
              }}
            />
            {passwordError && <span className="passwordErrorMsg">{passwordError}</span>}
          </div>
          <div className="changePasswordActions">
            <button
              type="button"
              className="modalBtnPrimary"
              style={{ fontSize: "0.82rem", padding: "7px 16px" }}
              onClick={() => {
                if (!newPassword) {
                  setPasswordError("Password cannot be empty.");
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setPasswordError("Passwords do not match.");
                  return;
                }
                setShowChangePassword(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Save Password
            </button>
          </div>
        </div>
      )}

      <div className="settingsRow">
        <label className="settingsLabel">Two-Factor Auth</label>
        <button type="button" className="settingsLinkBtn" onClick={() => setTwoFactorEnabled((value) => !value)}>
          {twoFactorEnabled ? "Disable ->" : "Enable ->"}
        </button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    if (activeSection === "Profile") {
      return renderProfile();
    }

    if (activeSection === "Preferences") {
      return renderPreferences();
    }

    if (activeSection === "Notifications") {
      return renderNotifications();
    }

    if (activeSection === "Privacy & Security") {
      return renderPrivacySecurity();
    }

    return (
      <div className="settingsPlaceholder">
        <p>{sectionDescription}</p>
        <button type="button" className="settingsLinkBtn">Add {activeSection}</button>
      </div>
    );
  };

  return (
    <div className="settingsPage">
      <div className="settingsPageShell">
        <aside className="settingsNav" aria-label="Account sections">
          {ACCOUNT_MENU_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`settingsNavItem ${activeSection === item ? "settingsNavItemActive" : ""}`}
              onClick={() => setActiveSection(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        <section className="settingsPanel" aria-labelledby="settings-panel-title">
          <div className="settingsPanelHeader">
            <div>
              <h2 id="settings-panel-title" className="modalTitle">{activeSection}</h2>
              <p className="settingsPanelDescription">{sectionDescription}</p>
            </div>
          </div>

          <div className="settingsPanelBody">
            {renderSectionContent()}
          </div>

          {activeSection !== "Profile" && (
            <div className="modalFooter profilePageFooter settingsPanelFooter">
              <button type="button" className="modalBtnSecondary" onClick={cancelSettings}>Cancel</button>
              <button type="button" className="modalBtnPrimary" onClick={saveSettings}>Save Settings</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
