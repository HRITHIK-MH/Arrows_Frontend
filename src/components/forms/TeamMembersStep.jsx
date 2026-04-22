import { useEffect, useMemo, useState } from "react";

const TEAM_MEMBERS = [
  {
    id: "A83261",
    name: "Rahul Mehta",
    email: "rahul.mehta@email.com",
    role: "Team Lead",
  },
  {
    id: "A83233",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    role: "Team Lead",
  },
];

const normalizeName = (value) => String(value || "").trim().replace(/\s+/g, " ");

const buildEmailFromName = (name) => {
  const normalized = normalizeName(name).toLowerCase();
  if (!normalized) return "";
  return `${normalized.replace(/\s+/g, ".")}@email.com`;
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
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState("");
  const [recruiterRole, setRecruiterRole] = useState("");
  const [newTeamMemberName, setNewTeamMemberName] = useState("");
  const customTeamMembers = Array.isArray(formData.customTeamMembers)
    ? formData.customTeamMembers
    : [];
  const allTeamMembers = useMemo(
    () => [...TEAM_MEMBERS, ...customTeamMembers],
    [customTeamMembers]
  );
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

  const toggleMember = (memberId) => {
    const nextSelection = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    onChange("teamMembers", nextSelection);
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

  const handleAssignSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    const trimmedNewMemberName = normalizeName(newTeamMemberName);
    let recruiterIdToAssign = selectedRecruiterId;

    if (trimmedNewMemberName) {
      const existingMember = allTeamMembers.find(
        (member) => normalizeName(member.name).toLowerCase() === trimmedNewMemberName.toLowerCase()
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
        onChange("customTeamMembers", [...customTeamMembers, newMember]);
        recruiterIdToAssign = newMember.id;
      }
    }

    if (!recruiterIdToAssign) {
      return;
    }

    if (!selectedMembers.includes(recruiterIdToAssign)) {
      onChange("teamMembers", [...selectedMembers, recruiterIdToAssign]);
    }
    if (recruiterRole.trim()) {
      onChange("teamMemberRoles", {
        ...memberRoles,
        [recruiterIdToAssign]: recruiterRole.trim(),
      });
    }
    closeAssignModal();
  };

  const resolveRecruiterRole = (recruiterId) => {
    if (!recruiterId) return "";
    if (memberRoles[recruiterId]) return memberRoles[recruiterId];
    const matchedRecruiter = allTeamMembers.find((member) => member.id === recruiterId);
    return matchedRecruiter?.role || "";
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
              <th className="select-col" />
              <th>Recruiter Id</th>
              <th>Recruiter Name</th>
              <th>Email Address</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {allTeamMembers.map((member) => (
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
                    setRecruiterRole(resolveRecruiterRole(nextId));
                  }}
                >
                  <option value="" disabled>
                    Select recruiter
                  </option>
                  {allTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label" htmlFor="newTeamMemberName">
                  New Team Member Name
                </label>
                <input
                  id="newTeamMemberName"
                  className="modal-input"
                  type="text"
                  placeholder="Add a new team member"
                  value={newTeamMemberName}
                  onChange={(event) => {
                    setNewTeamMemberName(event.target.value);
                    if (event.target.value.trim()) {
                      setSelectedRecruiterId("");
                    }
                  }}
                />
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
                  disabled={!selectedRecruiterId && !newTeamMemberName.trim()}
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
