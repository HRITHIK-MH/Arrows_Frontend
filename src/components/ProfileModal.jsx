import { useEffect, useRef } from "react";
import "./ProfileModal.css";
import { getDisplayName, getAvatarInitials, formatRoleLabel } from "../utils/userDisplay";

export default function ProfileModal({ onClose }) {
  const modalRef = useRef(null);
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

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus
  useEffect(() => {
    modalRef.current?.querySelector("button")?.focus();
  }, []);

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modalCard" ref={modalRef}>
        <div className="modalHeader">
          <h2 id="profile-modal-title" className="modalTitle">Profile</h2>
          <button className="modalClose" aria-label="Close" onClick={onClose}>✕</button>
        </div>

        <div className="profileModalBody">
          {/* Avatar */}
          <div className="profileModalAvatar">{getAvatarInitials(storedName, storedEmail)}</div>

          {/* Info */}
          <div className="profileModalInfo">
            <div className="profileModalRow">
              <label className="profileModalLabel">Full Name</label>
              <input className="profileModalInput" type="text" value={displayName} readOnly/>
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

        <div className="modalFooter">
          <button className="modalBtnSecondary" onClick={onClose}>Cancel</button>
          <button className="modalBtnPrimary" onClick={onClose}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
