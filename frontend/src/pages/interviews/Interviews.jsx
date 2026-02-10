import * as React from "react";
import { FiChevronDown, FiChevronRight, FiEdit2, FiFilter, FiMoreHorizontal, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import DataTable from "../../components/forms/DataTable";
import styles from "./Interviews.module.scss";

export default function Interviews() {
  const [activeTab, setActiveTab] = React.useState("list"); // "list" or "group"
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterInterviewType, setFilterInterviewType] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterDateRange, setFilterDateRange] = React.useState("");
  const [interviews, setInterviews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState(["JD1"]);
  const [selectedGroup, setSelectedGroup] = React.useState("JD1");
  const [showAddMemberModal, setShowAddMemberModal] = React.useState(false);
  const [newMemberRound, setNewMemberRound] = React.useState("");
  const [newMemberInterviewer, setNewMemberInterviewer] = React.useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [newGroupRound, setNewGroupRound] = React.useState("");
  const [newGroupInterviewer, setNewGroupInterviewer] = React.useState("");

  // Sample groups data
  const [groups] = React.useState([
    {
      id: "JD1",
      name: "JD1",
      members: 6,
      rounds: ["Round 1", "Round 2", "Round 3"],
      teamMembers: [
        { name: "Priya Sharma", email: "priya.sharma@email.com", mobile: "+91770887243", round: "Round 1", designation: "Panel", availability: "Yes" },
        { name: "Rahul Mehta", email: "rahul.mehta@email.com", mobile: "+91770887243", round: "Round 3", designation: "Panel", availability: "Yes" },
        { name: "Vikram Singh", email: "vikram.singh@email.com", mobile: "+91770887243", round: "Round 2", designation: "Panel", availability: "Yes" },
        { name: "Neha Verma", email: "neha.verma@email.com", mobile: "+91770887243", round: "Round 3", designation: "Panel", availability: "Yes" },
        { name: "Suresh Nair", email: "Suresh.nair@email.com", mobile: "+91770887243", round: "Round 1", designation: "Panel", availability: "Yes" }
      ]
    },
    {
      id: "Python Team",
      name: "Python Team",
      members: 4,
      rounds: ["Round 1", "Round 2"],
      teamMembers: []
    }
  ]);

  // Fetch interviews data
  React.useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/interviews');
        // const data = await response.json();
        // setInterviews(data);
        
        // Sample data for demonstration
        setInterviews([
          {
            candidateId: "C001",
            candidateName: "John Doe",
            roleJobTitle: "Software Engineer",
            dateTime: "2026-02-15 10:00 AM",
            company: "Tech Corp",
            interviewType: "Technical",
            mode: "Online",
            status: "Scheduled"
          },
          {
            candidateId: "C002",
            candidateName: "Jane Smith",
            roleJobTitle: "Product Manager",
            dateTime: "2026-02-16 2:00 PM",
            company: "Innovation Ltd",
            interviewType: "HR Round",
            mode: "In-person",
            status: "Completed"
          }
        ]);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleView = (row) => {
    console.log("View:", row);
  };

  const handleEdit = (row) => {
    console.log("Edit:", row);
  };

  const handleDelete = (row) => {
    console.log("Delete:", row);
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    if (!expandedGroups.includes(groupId)) {
      setExpandedGroups(prev => [...prev, groupId]);
    }
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
  };

  const handleCloseCreateGroupModal = () => {
    setShowCreateGroupModal(false);
    setNewGroupName("");
    setNewGroupRound("");
    setNewGroupInterviewer("");
  };

  const handleSubmitCreateGroup = () => {
    // TODO: Add group creation logic
    console.log("Create group:", { name: newGroupName, round: newGroupRound, interviewer: newGroupInterviewer });
    handleCloseCreateGroupModal();
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  const handleEditGroup = (groupId) => {
    console.log("Edit group", groupId);
  };

  const handleDeleteGroup = (groupId) => {
    console.log("Delete group", groupId);
  };

  const handleEditRound = (groupId, roundName) => {
    console.log("Edit round:", { groupId, roundName });
  };

  const handleDeleteRound = (groupId, roundName) => {
    console.log("Delete round:", { groupId, roundName });
  };

  const handleCreateMember = () => {
    // TODO: Add member creation logic
    console.log("Create member:", { round: newMemberRound, interviewer: newMemberInterviewer });
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowAddMemberModal(false);
    setNewMemberRound("");
    setNewMemberInterviewer("");
  };

  // Define table columns
  const columns = [
    { key: "candidateId", label: "Candidate Id" },
    { key: "candidateName", label: "Candidate Name" },
    { key: "roleJobTitle", label: "Role / Job Title" },
    { key: "dateTime", label: "Date & Time" },
    { key: "company", label: "Company" },
    { key: "interviewType", label: "Interview Type" },
    { key: "mode", label: "Mode" },
    { key: "status", label: "Status" }
  ];

  // Get unique values for filters
  const uniqueRoles = [...new Set(interviews.map(i => i.roleJobTitle))];
  const uniqueInterviewTypes = [...new Set(interviews.map(i => i.interviewType))];
  const uniqueStatuses = [...new Set(interviews.map(i => i.status))];

  return (
    <div className={styles.interviewsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Interviews</h1>
        <p className={styles.pageDescription}>
          View and manage all scheduled upcoming interviews in one place. Track interview dates, 
          candidates, roles, and interview modes, and take quick actions like rescheduling, 
          joining meetings, or adding notes.
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "list" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Interview List
        </button>
        <button
          className={`${styles.tab} ${activeTab === "group" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("group")}
        >
          Interview Group
        </button>
      </div>

      {/* Filter Bar - Only show in Interview List tab */}
      {activeTab === "list" && (
        <div className={styles.filtersBar}>
          <FiFilter className={styles.filterIcon} aria-hidden="true" />
          
          <div className={styles.searchField}>
            <FiSearch className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={styles.selectField}
          >
            <option value="">Role / Job Title</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={filterInterviewType}
            onChange={(e) => setFilterInterviewType(e.target.value)}
            className={styles.selectField}
          >
            <option value="">Interview Type</option>
            {uniqueInterviewTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.selectField}
          >
            <option value="">Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className={styles.selectField}
          >
            <option value="">Date Range</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <button className={styles.moreButton} aria-label="More options">
            <FiMoreHorizontal />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className={styles.contentArea}>
        {activeTab === "list" ? (
          loading ? (
            <div className={styles.loadingState}>
              <p>Loading interviews...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No Interviews Found</h2>
              <p>No interview data available at the moment.</p>
            </div>
          ) : (
            <DataTable
              data={interviews}
              columns={columns}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        ) : (
          <div className={styles.groupView}>
            {/* Left Sidebar - Groups List */}
            <div className={styles.groupsSidebar}>
              <div className={styles.sidebarHeader}>
                <span className={styles.sidebarTitle}>Group / Skill Name</span>
                <button className={styles.createGroupBtn} onClick={handleCreateGroup}>
                  Create Group
                </button>
              </div>

              <div className={styles.groupsList}>
                {groups.map((group) => (
                  <div key={group.id} className={styles.groupItem}>
                    <div 
                      className={`${styles.groupHeader} ${selectedGroup === group.id ? styles.selected : ""}`}
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <button
                        className={styles.expandBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroup(group.id);
                        }}
                        aria-label={expandedGroups.includes(group.id) ? "Collapse" : "Expand"}
                      >
                        {expandedGroups.includes(group.id) ? (
                          <FiChevronDown size={16} />
                        ) : (
                          <FiChevronRight size={16} />
                        )}
                      </button>
                      <span className={styles.groupName}>{group.name}</span>
                      <div className={styles.groupActions}>
                        <button 
                          className={styles.iconBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMember(group.id);
                          }}
                          aria-label="Add member"
                        >
                          <FiPlus size={14} />
                        </button>
                        <button 
                          className={styles.iconBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group.id);
                          }}
                          aria-label="Edit group"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          className={styles.iconBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          aria-label="Delete group"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {expandedGroups.includes(group.id) && (
                      <div className={styles.roundsList}>
                        {group.rounds.map((round) => (
                          <div key={round} className={styles.roundItem}>
                            <span className={styles.roundName}>{round}</span>
                            <div className={styles.roundActions}>
                              <button
                                className={styles.roundActionBtn}
                                onClick={() => handleEditRound(group.id, round)}
                                aria-label="Edit round"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                className={styles.roundActionBtn}
                                onClick={() => handleDeleteRound(group.id, round)}
                                aria-label="Delete round"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Group Members Table */}
            <div className={styles.groupContent}>
              {selectedGroup && (
                <>
                  <div className={styles.groupContentHeader}>
                    <h2 className={styles.groupTitle}>
                      {groups.find(g => g.id === selectedGroup)?.name}{" "}
                      <span className={styles.memberCount}>
                        (Member {groups.find(g => g.id === selectedGroup)?.members})
                      </span>
                    </h2>
                    <button 
                      className={styles.addTeamMemberBtn}
                      onClick={() => handleAddMember(selectedGroup)}
                    >
                      <FiPlus size={16} />
                      Add Team Member
                    </button>
                  </div>

                  <div className={styles.membersTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Round</th>
                          <th>Designation</th>
                          <th>Availability</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.find(g => g.id === selectedGroup)?.teamMembers.map((member, idx) => (
                          <tr key={idx}>
                            <td>{member.name}</td>
                            <td>{member.email}</td>
                            <td>{member.mobile}</td>
                            <td>
                              <span className={styles.roundBadge}>{member.round}</span>
                            </td>
                            <td>{member.designation}</td>
                            <td>{member.availability}</td>
                            <td>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteGroup(member.name)}
                                aria-label="Delete member"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!groups.find(g => g.id === selectedGroup)?.teamMembers.length) && (
                          <tr>
                            <td colSpan="7" className={styles.noData}>No members in this group</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Team Member</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal} aria-label="Close">
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Round Name</label>
                <select
                  className={styles.formSelect}
                  value={newMemberRound}
                  onChange={(e) => setNewMemberRound(e.target.value)}
                >
                  <option value="">Select Round</option>
                  {groups.find(g => g.id === selectedGroup)?.rounds.map((round) => (
                    <option key={round} value={round}>{round}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Interviewer Name</label>
                <select
                  className={styles.formSelect}
                  value={newMemberInterviewer}
                  onChange={(e) => setNewMemberInterviewer(e.target.value)}
                >
                  <option value="">Select Round</option>
                  <option value="Interviewer 1">Interviewer 1</option>
                  <option value="Interviewer 2">Interviewer 2</option>
                  <option value="Interviewer 3">Interviewer 3</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.createBtn} onClick={handleCreateMember}>
                Create
              </button>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className={styles.modalOverlay} onClick={handleCloseCreateGroupModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Group / Skill Name</h2>
              <button className={styles.closeBtn} onClick={handleCloseCreateGroupModal} aria-label="Close">
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Group Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Round Name</label>
                <select
                  className={styles.formSelect}
                  value={newGroupRound}
                  onChange={(e) => setNewGroupRound(e.target.value)}
                >
                  <option value="">Select Round</option>
                  <option value="Round 1">Round 1</option>
                  <option value="Round 2">Round 2</option>
                  <option value="Round 3">Round 3</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Interviewer Name</label>
                <select
                  className={styles.formSelect}
                  value={newGroupInterviewer}
                  onChange={(e) => setNewGroupInterviewer(e.target.value)}
                >
                  <option value="">Select Round</option>
                  <option value="Interviewer 1">Interviewer 1</option>
                  <option value="Interviewer 2">Interviewer 2</option>
                  <option value="Interviewer 3">Interviewer 3</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.createBtn} onClick={handleSubmitCreateGroup}>
                Create
              </button>
              <button className={styles.cancelBtn} onClick={handleCloseCreateGroupModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
