import { useEffect, useMemo, useState } from "react";

const TEAM_MEMBERS = [
  {
    id: "A83261",
    name: "Raghul Mehta",
    email: "raghul.mehta@email.com",
    role: "Team Lead",
  },
  {
    id: "A83233",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    role: "Team Lead",
  },
];

const TeamMembersStep = ({
  formData,
  onChange,
  onSetStepFields,
  validationErrors = {},
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(
    TEAM_MEMBERS[0]?.id || ""
  );
  const [recruiterRole, setRecruiterRole] = useState("");
  const selectedMembers = Array.isArray(formData.teamMembers)
    ? formData.teamMembers
    : [];
  const memberRoles = useMemo(
    () => formData.teamMemberRoles || {},
    [formData.teamMemberRoles]
  );

  useEffect(() => {
    if (formData.teamMembers === undefined) {
      onChange("teamMembers", TEAM_MEMBERS.map((member) => member.id));
    }
  }, [formData.teamMembers, onChange]);

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


  const allSelected =
    TEAM_MEMBERS.length > 0 && selectedMembers.length === TEAM_MEMBERS.length;

  const toggleMember = (memberId) => {
    const nextSelection = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    onChange("teamMembers", nextSelection);
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange("teamMembers", []);
      return;
    }
    onChange(
      "teamMembers",
      TEAM_MEMBERS.map((member) => member.id)
    );
  };

  const openAssignModal = () => {
    const fallbackId = TEAM_MEMBERS[0]?.id || "";
    const nextId = selectedRecruiterId || fallbackId;
    setSelectedRecruiterId(nextId);
    setRecruiterRole(memberRoles[nextId] || "");
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
  };

  const handleAssignSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (!selectedRecruiterId) {
      closeAssignModal();
      return;
    }
    if (!selectedMembers.includes(selectedRecruiterId)) {
      onChange("teamMembers", [...selectedMembers, selectedRecruiterId]);
    }
    if (recruiterRole.trim()) {
      onChange("teamMemberRoles", {
        ...memberRoles,
        [selectedRecruiterId]: recruiterRole.trim(),
      });
    }
    closeAssignModal();
  };

  return (
    <div className="team-members-step">
      <div className="team-members-toolbar">
        <button className="assign-button" type="button" onClick={openAssignModal}>
          Assign Team Members
        </button>
      </div>

      <div className="team-members-table">
        <table>
          <thead>
            <tr>
              <th className="select-col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all team members"
                />
              </th>
              <th>Recruiter Id</th>
              <th>Recruiter Name</th>
              <th>Email Address</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_MEMBERS.map((member) => (
              <tr key={member.id}>
                <td className="select-col">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    aria-label={`Select ${member.name}`}
                  />
                </td>
                <td>{member.id}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{memberRoles[member.id] || member.role}</td>
              </tr>
            ))}
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
                    setRecruiterRole(memberRoles[nextId] || "");
                  }}
                >
                  {TEAM_MEMBERS.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

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
                >
                  Submit
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
    </div>
  );
};

export default TeamMembersStep;
