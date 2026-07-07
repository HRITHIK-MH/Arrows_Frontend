import { useEffect, useMemo, useState } from "react";
import { fetchJobTeamMembers, fetchRecruiters, saveTeamMembers } from "../../api/teamService";

const TEAM_MEMBERS = [];

const ADD_NEW_MEMBER_OPTION = "__add_new_member__";
const normalizeName = (value) => String(value || "").trim().replace(/\s+/g, " ");
const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim(),
  );

const buildEmailFromName = (name) => {
  const normalized = normalizeName(name).toLowerCase();
  if (!normalized) return "";
  return "";
};

const getApiErrorMessage = (error) => {
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to save team members."
  ).trim();
  return message || "Failed to save team members.";
};

const generateMemberId = (members) => {
  const maxSequence = members.reduce((maxValue, member) => {
    const matchedDigits = String(member?.id || "").match(/(\d+)/);
    if (!matchedDigits) return maxValue;
    const parsedValue = Number(matchedDigits[1]);
    if (Number.isNaN(parsedValue)) return maxValue;
    return Math.max(maxValue, parsedValue);
  }, 0);

  return `A${String(maxSequence + 1).padStart(5, "0")}`;
};

const TeamMembersStep = ({
  formData,
  onChange,
  onSetStepFields,
  validationErrors = {},
}) => {
  const [apiMembers, setApiMembers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState("");
  const [recruiterRole, setRecruiterRole] = useState("");
  const [newTeamMemberName, setNewTeamMemberName] = useState("");
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const customTeamMembers = Array.isArray(formData.customTeamMembers)
    ? formData.customTeamMembers
    : [];
  const baseMembers = useMemo(
    () => (apiMembers.length > 0 ? apiMembers : TEAM_MEMBERS),
    [apiMembers]
  );
  const allTeamMembers = useMemo(() => {
    const merged = [...baseMembers, ...customTeamMembers];
    const seen = new Set();
    return merged.filter((member) => {
      const key = String(member?.id || '').trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [baseMembers, customTeamMembers]);
  const selectedMembers = Array.isArray(formData.teamMembers)
    ? formData.teamMembers
    : [];
  const memberRoles = useMemo(
    () => formData.teamMemberRoles || {},
    [formData.teamMemberRoles]
  );

  useEffect(() => {
    let cancelled = false;

    const loadTeamMembers = async () => {
      try {
        const openingJobId = String(formData.openingJobId || formData.jobPositionId || '').trim();
        const persistedJobOpeningId = String(formData.jobId || formData.id || '').trim();
        const hasPersistedJob = isUuid(persistedJobOpeningId);
        let teamMembers = [];

        if (hasPersistedJob && openingJobId) {
          teamMembers = await fetchJobTeamMembers(openingJobId);
        }

        if ((!Array.isArray(teamMembers) || teamMembers.length === 0) && hasPersistedJob && openingJobId) {
          teamMembers = await fetchRecruiters({ openingJobId });
        }

        if ((!Array.isArray(teamMembers) || teamMembers.length === 0)) {
          teamMembers = await fetchRecruiters();
        }

        if (!cancelled && Array.isArray(teamMembers) && teamMembers.length > 0) {
          setApiMembers(teamMembers);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to load team members:', error);
          setApiMembers([]);
        }
      }
    };

    loadTeamMembers();
    return () => {
      cancelled = true;
    };
  }, [formData.id, formData.jobId, formData.openingJobId, formData.jobPositionId]);

  useEffect(() => {
    if (formData.teamMembers === undefined) {
      onChange("teamMembers", allTeamMembers.map((member) => member.id));
    }
  }, [allTeamMembers, formData.teamMembers, onChange]);

  useEffect(() => {
    const currentSnapshot = JSON.stringify(Array.isArray(formData.teamDirectoryCache) ? formData.teamDirectoryCache : []);
    const nextSnapshot = JSON.stringify(allTeamMembers);
    if (currentSnapshot !== nextSnapshot) {
      onChange('teamDirectoryCache', allTeamMembers);
    }
  }, [allTeamMembers, formData.teamDirectoryCache, onChange]);

  useEffect(() => {
    if (onSetStepFields) {
      onSetStepFields([
        {
          name: "teamMembers",
          label: "Team Members",
          required: false,
        },
      ]);
    }
  }, [onSetStepFields]);

  const confirmDeleteMember = (memberId) => {
    setMemberToDelete(memberId);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (!memberToDelete) return;

    // Remove from selected members
    const nextSelection = selectedMembers.filter((id) => id !== memberToDelete);
    onChange("teamMembers", nextSelection);
    
    // Remove custom member if it's a custom member
    const isCustomMember = customTeamMembers.some((m) => m.id === memberToDelete);
    if (isCustomMember) {
      const updatedCustomMembers = customTeamMembers.filter((m) => m.id !== memberToDelete);
      onChange("customTeamMembers", updatedCustomMembers);
    }

    // Also remove from roles if exists
    const updatedRoles = { ...memberRoles };
    if (updatedRoles[memberToDelete]) {
      delete updatedRoles[memberToDelete];
      onChange("teamMemberRoles", updatedRoles);
    }

    // Close modal and reset state
    setDeleteConfirmOpen(false);
    setMemberToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setMemberToDelete(null);
  };

  const openAssignModal = () => {
    setSelectedRecruiterId("");
    setRecruiterRole("");
    setNewTeamMemberName("");
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
  };

  const handleAssignSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (isAssigning) {
      return;
    }

    const trimmedNewMemberName = normalizeName(newTeamMemberName);
    const isAddingNewMember = selectedRecruiterId === ADD_NEW_MEMBER_OPTION;
    let recruiterIdToAssign = selectedRecruiterId;
    let nextCustomMembers = customTeamMembers;

    if (isAddingNewMember) {
      if (!trimmedNewMemberName) {
        return;
      }

      const existingMember = allTeamMembers.find(
        (member) =>
          normalizeName(member.name).toLowerCase() === trimmedNewMemberName.toLowerCase()
      );

      if (existingMember) {
        recruiterIdToAssign = existingMember.id;
      } else {
        const newMember = {
          id: generateMemberId(allTeamMembers),
          name: trimmedNewMemberName,
          email: buildEmailFromName(trimmedNewMemberName),
          role: recruiterRole.trim() || "Recruiter",
        };
        nextCustomMembers = [...customTeamMembers, newMember];
        recruiterIdToAssign = newMember.id;
      }
    }

    if (!recruiterIdToAssign || recruiterIdToAssign === ADD_NEW_MEMBER_OPTION) {
      return;
    }

    const openingJobId = String(formData.openingJobId || formData.jobPositionId || "").trim();
    const jobOpeningId = String(formData.jobId || formData.id || "").trim();

    const nextSelectedMembers = selectedMembers.includes(recruiterIdToAssign)
      ? selectedMembers
      : [...selectedMembers, recruiterIdToAssign];
    const nextRoles = recruiterRole.trim()
      ? {
          ...memberRoles,
          [recruiterIdToAssign]: recruiterRole.trim(),
        }
      : memberRoles;

    const directoryById = new Map(
      [...baseMembers, ...nextCustomMembers].map((member) => [String(member?.id || "").trim(), member])
    );

    const teamMembersPayload = nextSelectedMembers
      .map((memberId) => {
        const key = String(memberId || "").trim();
        if (!key) return null;

        const member = directoryById.get(key) || {};
        return {
          userId: key,
          name: String(member?.name || key).trim(),
          role: String(nextRoles[key] || member?.role || "Recruiter").trim(),
        };
      })
      .filter(Boolean);

    if (teamMembersPayload.length === 0) {
      return;
    }

    setIsAssigning(true);
    try {
      if (jobOpeningId) {
        await saveTeamMembers({
          jobOpeningId,
          openingJobId,
          teamMembers: teamMembersPayload,
          permissions: {
            visibility: formData.permissionVisibility,
            access: formData.permissionAccess,
          },
        });
      }

      if (nextCustomMembers !== customTeamMembers) {
        onChange("customTeamMembers", nextCustomMembers);
      }
      if (!selectedMembers.includes(recruiterIdToAssign)) {
        onChange("teamMembers", nextSelectedMembers);
      }
      if (recruiterRole.trim()) {
        onChange("teamMemberRoles", nextRoles);
      }
      closeAssignModal();
    } catch (error) {
      console.error("Failed to assign team member:", error);
      alert(getApiErrorMessage(error));
    } finally {
      setIsAssigning(false);
    }
  };

  const resolveRecruiterRole = (recruiterId) => {
    if (!recruiterId) return "";
    if (memberRoles[recruiterId]) return memberRoles[recruiterId];
    const matchedRecruiter = allTeamMembers.find((member) => member.id === recruiterId);
    return matchedRecruiter?.role || "";
  };

  const resolveReportingManager = (member) => {
    if (!member) return "-";
    if (member.reportingManager) return member.reportingManager;
    return "-";
  };

  return (
    <div className="team-members-step">
      <div className="team-members-toolbar">
        <button className="assign-button" type="button" onClick={openAssignModal}>
          Assign Team Member
        </button>
      </div>

      <div className="team-members-table">
        <table>
          <thead>
            <tr>
              <th>Recruiter Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Reporting Manager</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {selectedMembers.map((memberId) => {
              const member = allTeamMembers.find((m) => m.id === memberId);
              if (!member) return null;
              return (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{memberRoles[member.id] || member.role}</td>
                  <td>{resolveReportingManager(member)}</td>
                  <td className="action-col">
                    <button
                      type="button"
                      className="delete-icon-btn"
                      onClick={() => confirmDeleteMember(member.id)}
                      aria-label={`Delete ${member.name}`}
                      title="Delete member"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {validationErrors.teamMembers && (
        <div className="team-members-error">{validationErrors.teamMembers}</div>
      )}

      {isModalOpen && (
        <div className="team-members-backdrop" onClick={closeAssignModal}>
          <div
            className="team-members-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Assign Team Member"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Assign Team Member</h3>
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={closeAssignModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label" htmlFor="recruiterName">
                  Recruiter Name
                </label>
                <select
                  id="recruiterName"
                  className="modal-input"
                  value={selectedRecruiterId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setSelectedRecruiterId(nextId);
                    if (nextId === ADD_NEW_MEMBER_OPTION) {
                      setNewTeamMemberName("");
                      setRecruiterRole("");
                      return;
                    }
                    setRecruiterRole(resolveRecruiterRole(nextId));
                  }}
                >
                  <option value="" disabled>
                    Select recruiter
                  </option>
                  <option value={ADD_NEW_MEMBER_OPTION}>Add new team member</option>
                  {allTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRecruiterId === ADD_NEW_MEMBER_OPTION && (
                <div className="modal-field">
                  <label className="modal-label" htmlFor="newTeamMemberName">
                    Name
                  </label>
                  <input
                    id="newTeamMemberName"
                    className="modal-input"
                    type="text"
                    placeholder="Add a new team member"
                    value={newTeamMemberName}
                    onChange={(event) => setNewTeamMemberName(event.target.value)}
                  />
                </div>
              )}

              <div className="modal-field">
                <label className="modal-label" htmlFor="recruiterRole">
                  Recruiter Role
                </label>
                <input
                  id="recruiterRole"
                  className="modal-input"
                  type="text"
                  placeholder="Input text"
                  value={recruiterRole}
                  onChange={(event) => setRecruiterRole(event.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn primary"
                  onClick={handleAssignSubmit}
                  disabled={
                    isAssigning ||
                    !selectedRecruiterId ||
                    (selectedRecruiterId === ADD_NEW_MEMBER_OPTION &&
                      !newTeamMemberName.trim())
                  }
                >
                  {isAssigning ? "Saving..." : "Submit"}
                </button>
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={closeAssignModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="delete-confirm-backdrop" onClick={cancelDelete}>
          <div
            className="delete-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm deletion"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="confirm-modal-header">
              <h3 className="confirm-modal-title">Confirm Delete</h3>
            </div>
            <div className="confirm-modal-body">
              <p>Are you sure you want to delete this assigned team member?</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-btn yes"
                onClick={executeDelete}
              >
                Yes
              </button>
              <button
                type="button"
                className="confirm-btn no"
                onClick={cancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersStep;
