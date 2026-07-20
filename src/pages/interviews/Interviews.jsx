import * as React from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiFilter,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  fetchAvailableInterviewers,
  fetchInterviewFiltersMeta,
  fetchInterviews,
  fetchInterviewGroups,
  createInterviewGroup,
  addInterviewGroupTeamMember,
  updateInterviewGroup,
  deleteInterviewGroup,
  deleteInterviewGroupTeamMember,
} from "../../api/interviewService";
import styles from "./Interviews.module.scss";

const PROFILE_TABS = [
  "Basic Info",
  "Skills",
  "Resume",
  "Attachment",
  "Timeline",
  "Rating",
];

const PIPELINE_STEPS = ["New", "In Review", "Engaged", "Offered", "Hired", "Rejected"];

const JOB_OPENING_OPTIONS = [];

const PRIMARY_SKILL_OPTIONS = [
  "Core Java",
  "Spring Boot",
  "Microservices",
  "REST API",
  "SQL",
  "Kubernetes",
];

const SECONDARY_SKILL_OPTIONS = [
  "Communication Skills",
  "Time Management",
  "Problem-Solving",
  "Team Collaboration",
  "Adaptability & Learning",
];

const EXPERIENCE_OPTIONS = ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years"];
const LAST_USED_OPTIONS = ["2025", "2024", "2023", "2022", "2021"];

const INTERVIEWER_DIRECTORY = {
  "Interviewer 1": { email: "interviewer1@email.com", mobile: "+910000000001", designation: "Panel", availability: "Yes" },
  "Interviewer 2": { email: "interviewer2@email.com", mobile: "+910000000002", designation: "Panel", availability: "Yes" },
  "Interviewer 3": { email: "interviewer3@email.com", mobile: "+910000000003", designation: "Panel", availability: "Yes" },
};

const INTERVIEWER_OPTIONS = Object.keys(INTERVIEWER_DIRECTORY);

const toInterviewerDisplay = (item) => {
  if (item === null || item === undefined) return null;

  if (typeof item === "string") {
    const name = String(item).trim();
    if (!name) return null;
    return {
      name,
      email: "",
      mobile: "",
      designation: "Panel",
      availability: "Yes",
    };
  }

  if (typeof item !== "object") return null;

  const name = String(item.name || item.displayName || item.fullName || item.label || item.userName || "").trim();
  if (!name) return null;

  const role = String(item.designation || item.assignmentRole || item.role || "Panel").replace(/_/g, " ").trim();

  const availability =
    item.availability === undefined
      ? "Yes"
      : String(item.availability).trim() || "Yes";

  return {
    name,
    email: String(item.email || item.mail || "").trim(),
    mobile: String(item.mobile || item.phone || item.phoneNumber || "").trim(),
    designation: role || "Panel",
    availability,
  };
};

const toText = (value) => String(value || "").trim();

const firstText = (...values) => values.map(toText).find(Boolean) || "";

const normalizeRoundName = (round) => {
  if (round === null || round === undefined) return "";
  if (typeof round === "string" || typeof round === "number") return toText(round);
  if (typeof round !== "object") return "";
  return toText(round.name || round.roundName || round.interviewRoundName || round.label || round.title);
};

const normalizeGroupMember = (member) => {
  if (!member || typeof member !== "object") return null;

  const name = toText(member.name || member.displayName || member.fullName || member.userName || member.label);
  if (!name) return null;

  return {
    ...member,
    name,
    email: toText(member.email || member.mail || member.userEmail),
    mobile: toText(member.mobile || member.phone || member.phoneNumber),
    round: toText(member.round || member.roundName || member.interviewRoundName),
    designation: toText(member.designation || member.assignmentRole || member.role) || "Panel",
    availability:
      member.availability === undefined
        ? "Yes"
        : toText(member.availability) || "Yes",
  };
};

const normalizeInterviewGroup = (group, fallback = {}) => {
  if (!group || typeof group !== "object") return null;

  const backendGroupId = firstText(
    group.groupId,
    group.interviewGroupId,
    group._id,
    group.uuid,
    group.id,
    fallback.backendGroupId
  );
  const displayGroupCode = firstText(
    group.interviewGroupCode,
    group.groupCode,
    group.code,
    fallback.displayGroupCode,
    fallback.interviewGroupCode,
    fallback.groupCode
  );
  const id = firstText(
    backendGroupId,
    displayGroupCode,
    fallback.id
  );
  const name = toText(
    group.name ||
      group.groupName ||
      group.interviewGroupName ||
      group.skillName ||
      fallback.name
  );

  if (!id || !name) return null;

  const rawRounds = Array.isArray(group.rounds)
    ? group.rounds
    : Array.isArray(group.interviewRounds)
      ? group.interviewRounds
      : Array.isArray(group.roundNames)
        ? group.roundNames
        : Array.isArray(fallback.rounds)
          ? fallback.rounds
          : [];
  const scalarRound = normalizeRoundName(group.round || group.roundName || group.interviewRoundName);
  const rounds = [...rawRounds.map(normalizeRoundName), scalarRound]
    .filter(Boolean)
    .filter((round, index, allRounds) => allRounds.findIndex((item) => item.toLowerCase() === round.toLowerCase()) === index);

  const rawTeamMembers = Array.isArray(group.teamMembers)
    ? group.teamMembers
    : Array.isArray(group.members)
      ? group.members
      : Array.isArray(group.interviewers)
        ? group.interviewers
        : Array.isArray(fallback.teamMembers)
          ? fallback.teamMembers
          : [];
  const teamMembers = rawTeamMembers.map(normalizeGroupMember).filter(Boolean);
  const memberCount = Number.isFinite(Number(group.members))
    ? Number(group.members)
    : Number.isFinite(Number(group.memberCount))
      ? Number(group.memberCount)
      : Number.isFinite(Number(group.teamMemberCount))
        ? Number(group.teamMemberCount)
        : teamMembers.length;

  return {
    ...group,
    id,
    backendGroupId,
    displayGroupCode,
    name,
    rounds,
    teamMembers,
    members: memberCount,
  };
};

const createSkillDraft = () => ({
  name: "",
  experience: EXPERIENCE_OPTIONS[0],
  rating: 0,
  lastUsed: LAST_USED_OPTIONS[0],
  comments: "",
});

export default function Interviews() {
  const [activeTab, setActiveTab] = React.useState("list"); // "list" or "group"
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("");
  const [filterInterviewType, setFilterInterviewType] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterDateRange, setFilterDateRange] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState({ key: null, direction: "asc" });
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [interviews, setInterviews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [interviewMetaOptions, setInterviewMetaOptions] = React.useState({ types: [], statuses: [] });
  const [interviewerDirectory, setInterviewerDirectory] = React.useState(INTERVIEWER_DIRECTORY);
  const [interviewerOptions, setInterviewerOptions] = React.useState(INTERVIEWER_OPTIONS);
  const [expandedGroups, setExpandedGroups] = React.useState([]);
  const [selectedGroup, setSelectedGroup] = React.useState("");
  const [showAddMemberModal, setShowAddMemberModal] = React.useState(false);
  const [newMemberRound, setNewMemberRound] = React.useState("");
  const [newMemberInterviewer, setNewMemberInterviewer] = React.useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [newGroupRound, setNewGroupRound] = React.useState("");
  const [newGroupInterviewer, setNewGroupInterviewer] = React.useState("");
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [activeProfileTab, setActiveProfileTab] = React.useState("Basic Info");
  const [activePipelineStep, setActivePipelineStep] = React.useState("Engaged");
  const [activeSkillType, setActiveSkillType] = React.useState("primary");
  const [isAddingSkill, setIsAddingSkill] = React.useState(false);
  const [skillDraft, setSkillDraft] = React.useState(createSkillDraft);
  const [mapJobValue, setMapJobValue] = React.useState("");
  const [mapQuery, setMapQuery] = React.useState("");
  const [isMapDropdownOpen, setIsMapDropdownOpen] = React.useState(false);
  const [popupState, setPopupState] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    mode: "info",
    confirmLabel: "OK",
    cancelLabel: "Cancel",
    onConfirm: null,
    promptValue: "",
    promptPlaceholder: "",
  });
  const mapDropdownRef = React.useRef(null);

  const currentUserRole = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return String(window.localStorage.getItem("userRole") || "").trim().toLowerCase();
  }, []);

  const interviewsPageDescription = React.useMemo(() => {
    if (activeTab === "group") {
      return <><strong>Organize interview panels</strong> by <strong>skill group, assign interviewers,</strong> and <strong>manage round-wise evaluations</strong> efficiently.</>;
    }

    if (currentUserRole === "recruiter") {
      return <><strong>Schedule, Track, and manage Interviews</strong> with quick access to <strong>Candidates, Panels, Stages and Actions</strong>.</>;
    }

    if (currentUserRole === "accountmanager" || currentUserRole === "manager" || currentUserRole === "management") {
      return <>Manage <strong>Interview Schedules, Panel Coordination,</strong> and <strong>Candidate Progress</strong> from a single workspace.</>;
    }

    return "Manage interview schedules, panel coordination, and candidate progress from a single workspace.";
  }, [activeTab, currentUserRole]);

  const getInterviewerMeta = React.useCallback(
    (interviewerName) => interviewerDirectory[interviewerName] || INTERVIEWER_DIRECTORY[interviewerName] || null,
    [interviewerDirectory]
  );

  const [groups, setGroups] = React.useState([]);
  const [interviewsLoaded, setInterviewsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!interviewsLoaded) return;

    let cancelled = false;
    const loadInterviewGroups = async () => {
      try {
        const response = await fetchInterviewGroups({ page: 1, limit: 100 });
        const normalizedGroups = Array.isArray(response?.items)
          ? response.items.map((group) => normalizeInterviewGroup(group)).filter(Boolean)
          : [];
        if (cancelled) return;
        if (normalizedGroups.length > 0) {
          setGroups(normalizedGroups);
          setSelectedGroup((currentSelected) =>
            normalizedGroups.some((group) => group.id === currentSelected)
              ? currentSelected
              : normalizedGroups[0]?.id || ""
          );
        }
      } catch (error) {
        console.warn("Failed to load interview groups:", error);
      }
    };

    loadInterviewGroups();

    return () => {
      cancelled = true;
    };
  }, [interviewsLoaded]);

  // Fetch interviews data
  React.useEffect(() => {
    const loadInterviews = async () => {
      setLoading(true);
      try {
        const response = await fetchInterviews({
          page: 1,
          limit: 100,
          search: searchTerm || undefined,
          interviewType: filterInterviewType || undefined,
          interviewStatus: filterStatus || undefined,
          sortBy: sortConfig.key || 'interviewDateTime',
          sortOrder: sortConfig.direction || 'asc',
        });

        const mappedInterviews = Array.isArray(response.items)
          ? response.items.map((item) => ({
              candidateId: item.candidateId,
              candidateName: item.candidateName,
              roleJobTitle: item.postingTitle || '-',
              dateTime: item.interviewDateTime ? new Date(item.interviewDateTime).toLocaleString() : '-',
              company: item.jobOpeningId || '-',
              interviewType: item.interviewType || item.interviewStatus || '-',
              mode: item.mode || 'Online',
              status: item.interviewStatus || '-',
              interviewer: item.interviewer || '-',
              interviewId: item.interviewId,
            }))
          : [];

        setInterviews(mappedInterviews);
        setInterviewsLoaded(true);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, [searchTerm, filterInterviewType, filterStatus, sortConfig]);

  React.useEffect(() => {
    let isMounted = true;

    const loadInterviewDropdownMetadata = async () => {
      try {
        const [meta, availableUsers] = await Promise.all([
          fetchInterviewFiltersMeta(),
          fetchAvailableInterviewers(selectedGroup),
        ]);

        if (!isMounted) return;

        const types = Array.isArray(meta?.types) ? meta.types.map((entry) => String(entry).trim()).filter(Boolean) : [];
        const statuses = Array.isArray(meta?.statuses) ? meta.statuses.map((entry) => String(entry).trim()).filter(Boolean) : [];
        if (types.length > 0 || statuses.length > 0) {
          setInterviewMetaOptions({
            types,
            statuses,
          });
        }

        const seedInterviewers = Array.isArray(meta?.interviewers) ? meta.interviewers : [];
        const dynamicInterviewerRows = [...seedInterviewers, ...(Array.isArray(availableUsers) ? availableUsers : [])]
          .map((item) => toInterviewerDisplay(item))
          .filter(Boolean);

        if (dynamicInterviewerRows.length > 0) {
          const mergedDirectory = { ...INTERVIEWER_DIRECTORY };
          const mergedNames = new Set(INTERVIEWER_OPTIONS);

          dynamicInterviewerRows.forEach((interviewer) => {
            mergedDirectory[interviewer.name] = {
              userId: interviewer.userId || mergedDirectory[interviewer.name]?.userId || "",
              email: interviewer.email || mergedDirectory[interviewer.name]?.email || "",
              mobile: interviewer.mobile || mergedDirectory[interviewer.name]?.mobile || "",
              designation: interviewer.designation || mergedDirectory[interviewer.name]?.designation || "Panel",
              availability: interviewer.availability || mergedDirectory[interviewer.name]?.availability || "Yes",
            };
            mergedNames.add(interviewer.name);
          });

          setInterviewerDirectory(mergedDirectory);
          setInterviewerOptions(Array.from(mergedNames));
        }
      } catch (error) {
        console.warn("Interview dropdown metadata sync failed, using fallback options:", error);
      }
    };

    loadInterviewDropdownMetadata();

    return () => {
      isMounted = false;
    };
  }, [selectedGroup]);

  React.useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  React.useEffect(() => {
    if (!isViewDrawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewDrawerOpen]);

  React.useEffect(() => {
    if (!isViewDrawerOpen) return undefined;
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsViewDrawerOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isViewDrawerOpen]);

  React.useEffect(() => {
    if (!isMapDropdownOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (mapDropdownRef.current && !mapDropdownRef.current.contains(event.target)) {
        setIsMapDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMapDropdownOpen]);

  const getPipelineFromStatus = React.useCallback((status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "upcoming") return "Engaged";
    if (normalized === "rescheduled") return "In Review";
    if (normalized === "completed") return "Hired";
    return "New";
  }, []);

  const getStageClass = React.useCallback((stage) => {
    const normalized = String(stage || "").toLowerCase();
    if (normalized === "pre-screening") return styles.stageScreening;
    if (normalized === "client interview") return styles.stageInterview;
    if (normalized === "rejected") return styles.stageRejected;
    return styles.stageNeutral;
  }, []);

  const buildCandidateProfile = React.useCallback((row) => {
    const [firstName = "", lastName = ""] = String(row.candidateName || "").split(" ");
    const defaultPrimarySkills = [];
    const defaultSecondarySkills = [];
    const defaultFiles = [];
    const defaultTimeline = [];
    const defaultRatingRounds = [];

    return {
      candidateId: row.candidateId,
      firstName: firstName || row.candidateName,
      lastName,
      fullName: row.candidateName,
      role: row.roleJobTitle,
      email: row.email || "",
      secondaryEmail: row.secondaryEmail || "",
      phoneNumber: row.phoneNumber || "",
      location: row.location || "",
      dateOfBirth: row.dateOfBirth || "",
      gender: row.gender || "",
      currentCompany: row.currentCompany || row.company,
      experience: row.experience || "",
      yearsExperience: row.yearsExperience || "",
      offersInHand: row.offersInHand || "",
      currentCtc: row.currentCtc || "",
      expectedCtc: row.expectedCtc || "",
      primarySkills: row.primarySkills || defaultPrimarySkills,
      secondarySkills: row.secondarySkills || defaultSecondarySkills,
      resumeFiles: row.resumeFiles || defaultFiles,
      attachments: row.attachments || defaultFiles,
      timeline: row.timeline || defaultTimeline,
      ratingRounds: row.ratingRounds || defaultRatingRounds,
      overallRating: row.overallRating || 0,
      stage: row.stage || "",
      status: row.status,
      source: row.source || "",
      jobApplications: row.jobApplications || [],
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleView = React.useCallback((row) => {
    const profile = buildCandidateProfile(row);
    setSelectedCandidate(profile);
    setActiveProfileTab("Basic Info");
    setActivePipelineStep(getPipelineFromStatus(profile.status));
    setActiveSkillType("primary");
    setIsAddingSkill(false);
    setSkillDraft(createSkillDraft());
    setMapJobValue("");
    setMapQuery("");
    setIsMapDropdownOpen(false);
    setIsViewDrawerOpen(true);
  }, [buildCandidateProfile, getPipelineFromStatus]);

  const getInterviewRowKey = React.useCallback(
    (row) => `${row.candidateId}::${row.dateTime}::${row.roleJobTitle}::${row.company}`,
    []
  );

  const handleDelete = (row) => {
    const rowKey = getInterviewRowKey(row);

    showConfirmPopup(
      "Delete Interview",
      `Delete interview for ${row.candidateName}?`,
      () => {
        setInterviews((prev) => prev.filter((item) => getInterviewRowKey(item) !== rowKey));
      },
      "Delete"
    );
  };

  const activePipelineStepIndex = React.useMemo(
    () => PIPELINE_STEPS.indexOf(activePipelineStep),
    [activePipelineStep]
  );

  const closeViewDrawer = React.useCallback(() => {
    setIsViewDrawerOpen(false);
    setIsMapDropdownOpen(false);
    setIsAddingSkill(false);
    setSkillDraft(createSkillDraft());
  }, []);

  const closePopup = React.useCallback(() => {
    setPopupState((prev) => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
      promptValue: "",
      promptPlaceholder: "",
    }));
  }, []);

  const showInfoPopup = React.useCallback((message, title = "Notice") => {
    setPopupState({
      isOpen: true,
      title,
      message,
      mode: "info",
      confirmLabel: "OK",
      cancelLabel: "Cancel",
      onConfirm: null,
      promptValue: "",
      promptPlaceholder: "",
    });
  }, []);

  const showConfirmPopup = React.useCallback((title, message, onConfirm, confirmLabel = "Confirm") => {
    setPopupState({
      isOpen: true,
      title,
      message,
      mode: "confirm",
      confirmLabel,
      cancelLabel: "Cancel",
      onConfirm,
      promptValue: "",
      promptPlaceholder: "",
    });
  }, []);

  const showPromptPopup = React.useCallback(
    (title, message, defaultValue, onConfirm, confirmLabel = "Save") => {
      setPopupState({
        isOpen: true,
        title,
        message,
        mode: "prompt",
        confirmLabel,
        cancelLabel: "Cancel",
        onConfirm,
        promptValue: defaultValue,
        promptPlaceholder: "Enter value",
      });
    },
    []
  );

  const handlePopupConfirm = React.useCallback(() => {
    if (typeof popupState.onConfirm === "function") {
      if (popupState.mode === "prompt") {
        popupState.onConfirm(popupState.promptValue);
      } else {
        popupState.onConfirm();
      }
    }
    closePopup();
  }, [closePopup, popupState]);

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

  const initialNextUsrIndex = (() => {
    try {
      const stored = Number(localStorage.getItem('nextUsrIndex') || 101);
      return Number.isFinite(stored) && stored >= 100 ? stored : 101;
    } catch (e) {
      return 101;
    }
  })();

  const nextUsrIndexRef = React.useRef(initialNextUsrIndex);

  const generateNextUserCode = () => {
    const idx = nextUsrIndexRef.current;
    nextUsrIndexRef.current = idx + 1;
    localStorage.setItem('nextUsrIndex', String(nextUsrIndexRef.current));
    return `USR-${String(idx).padStart(3, '0')}`;
  };

  const handleCloseCreateGroupModal = () => {
    setShowCreateGroupModal(false);
    setNewGroupName("");
    setNewGroupRound("");
    setNewGroupInterviewer("");
  };

  const handleSubmitCreateGroup = async () => {
    const groupName = newGroupName.trim();
    const roundName = newGroupRound.trim();

    if (!groupName || !roundName) {
      return;
    }

    const duplicateGroup = groups.some(
      (group) => group.name.toLowerCase() === groupName.toLowerCase()
    );
    if (duplicateGroup) {
      showInfoPopup("Group name already exists.", "Duplicate Group");
      return;
    }

    const interviewerMeta = getInterviewerMeta(newGroupInterviewer);
    const members = interviewerMeta
      ? [
          {
            userId: interviewerMeta.userId || newGroupInterviewer,
            role: interviewerMeta.designation || "Panel Member",
          },
        ]
      : [];

    const payload = {
      groupName: groupName,
      interviewType: "Technical",
      groupStatus: "Active",
      members,
    };

    try {
      const createdGroup = await createInterviewGroup(payload);
      if (!createdGroup) {
        throw new Error("Create interview group returned no data");
      }
      const group = normalizeInterviewGroup(createdGroup);
      if (!group) {
        throw new Error("Create interview group returned invalid data");
      }
      setGroups((prev) => [...prev, group]);
      setSelectedGroup(group.id);
      setExpandedGroups((prev) => (prev.includes(group.id) ? prev : [...prev, group.id]));
    } catch (error) {
      console.error("Create interview group failed:", error);
      showInfoPopup("Unable to create group at this time.", "Error");
    } finally {
      handleCloseCreateGroupModal();
    }
  };

  const handleAddMember = (groupId) => {
    if (groupId) {
      setSelectedGroup(groupId);
    }
    setShowAddMemberModal(true);
  };

  const handleEditGroup = (groupId) => {
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    showPromptPopup(
      "Edit Group",
      "Update group name",
      targetGroup.name,
      async (nextName) => {
        const normalizedName = String(nextName || "").trim();
        if (!normalizedName || normalizedName === targetGroup.name) return;

        const duplicateGroup = groups.some(
          (group) => group.id !== groupId && group.name.toLowerCase() === normalizedName.toLowerCase()
        );
        if (duplicateGroup) {
          showInfoPopup("Group name already exists.", "Duplicate Group");
          return;
        }

        try {
          await updateInterviewGroup(groupId, {
            ...targetGroup,
            name: normalizedName,
          });
          setGroups((prev) =>
            prev.map((group) => (group.id === groupId ? { ...group, name: normalizedName } : group))
          );
        } catch (error) {
          console.error("Edit interview group failed:", error);
          showInfoPopup("Unable to update group name at this time.", "Error");
        }
      }
    );
  };

  const handleDeleteGroup = (groupId) => {
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    showConfirmPopup(
      "Delete Group",
      `Delete group "${targetGroup.name}"?`,
      async () => {
        try {
          await deleteInterviewGroup(groupId);
          setGroups((prev) => {
            const nextGroups = prev.filter((group) => group.id !== groupId);
            setExpandedGroups((currentExpanded) => currentExpanded.filter((id) => id !== groupId));
            setSelectedGroup((prevSelected) => {
              if (prevSelected !== groupId) return prevSelected;
              return nextGroups[0]?.id || "";
            });
            return nextGroups;
          });
        } catch (error) {
          console.error("Delete interview group failed:", error);
          showInfoPopup("Unable to delete group at this time.", "Error");
        }
      },
      "Delete"
    );
  };

  const handleEditRound = (groupId, roundName) => {
    showPromptPopup(
      "Edit Round",
      "Update round name",
      roundName,
      (nextRound) => {
        const normalizedRound = String(nextRound || "").trim();
        if (!normalizedRound || normalizedRound === roundName) return;

        setGroups((prev) =>
          prev.map((group) => {
            if (group.id !== groupId) return group;

            const duplicateRound = group.rounds.some(
              (round) => round.toLowerCase() === normalizedRound.toLowerCase() && round !== roundName
            );
            if (duplicateRound) {
              showInfoPopup("Round name already exists in this group.", "Duplicate Round");
              return group;
            }

            return {
              ...group,
              rounds: group.rounds.map((round) => (round === roundName ? normalizedRound : round)),
              teamMembers: group.teamMembers.map((member) =>
                member.round === roundName ? { ...member, round: normalizedRound } : member
              ),
            };
          })
        );
      }
    );
  };

  const handleDeleteRound = (groupId, roundName) => {
    showConfirmPopup(
      "Delete Round",
      `Delete round "${roundName}"?`,
      () => {
        setGroups((prev) =>
          prev.map((group) => {
            if (group.id !== groupId) return group;
            const updatedRounds = group.rounds.filter((round) => round !== roundName);
            const updatedTeamMembers = group.teamMembers.filter((member) => member.round !== roundName);
            return {
              ...group,
              rounds: updatedRounds,
              teamMembers: updatedTeamMembers,
              members: updatedTeamMembers.length,
            };
          })
        );
      },
      "Delete"
    );
  };

  const handleCreateMember = async () => {
    if (!selectedGroup || !newMemberRound || !newMemberInterviewer) {
      return;
    }

    const interviewerMeta = getInterviewerMeta(newMemberInterviewer);
    if (!interviewerMeta) {
      return;
    }

    const memberToAppend = normalizeGroupMember({
      userId: interviewerMeta.userId,
      name: newMemberInterviewer,
      email: interviewerMeta.email,
      mobile: interviewerMeta.mobile,
      round: newMemberRound,
      designation: interviewerMeta.designation,
      availability: interviewerMeta.availability,
    });
    const memberPayload = {
      members: [
        {
          userId: interviewerMeta.userId,
          role: "Panel Member",
        },
      ],
    };

    const currentGroup = groups.find((group) => group.id === selectedGroup);
    if (!currentGroup) {
      return;
    }

    const duplicateMember = currentGroup.teamMembers.some(
      (member) =>
        member.name.toLowerCase() === newMemberInterviewer.toLowerCase() &&
        member.round.toLowerCase() === newMemberRound.toLowerCase()
    );
    if (duplicateMember) {
      showInfoPopup("This interviewer already exists for the selected round.", "Duplicate Member");
      return;
    }

    try {
      if (!currentGroup.backendGroupId) {
        throw new Error("Missing backend group ID for selected interview group.");
      }
      if (!interviewerMeta.userId) {
        throw new Error("Missing backend user ID for selected interviewer.");
      }

      await addInterviewGroupTeamMember(currentGroup.backendGroupId, memberPayload);

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== selectedGroup) return group;

          const updatedTeamMembers = [...group.teamMembers, memberToAppend];

          return {
            ...group,
            teamMembers: updatedTeamMembers,
            members: updatedTeamMembers.length,
          };
        })
      );
    } catch (error) {
      console.error("Add interview group member failed:", error);
      showInfoPopup("Unable to add member at this time.", "Error");
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteMember = (groupId, memberIndex) => {
    const targetGroup = groups.find((group) => group.id === groupId);
    if (!targetGroup) return;

    const memberToRemove = targetGroup.teamMembers[memberIndex];
    if (!memberToRemove) return;

    const userId =
      String(memberToRemove.userId || memberToRemove.id || memberToRemove.memberId || memberToRemove.uuid || "").trim();
    if (!userId) {
      console.warn("Unable to remove interview group member: missing userId", memberToRemove);
    }

    showConfirmPopup(
      "Remove Member",
      `Remove ${memberToRemove.name} from ${targetGroup.name}?`,
      async () => {
        try {
          if (userId) {
            await deleteInterviewGroupTeamMember(groupId, userId);
          }
        } catch (error) {
          console.error("Delete interview group member failed:", error);
        }
        setGroups((prev) =>
          prev.map((group) => {
            if (group.id !== groupId) return group;
            const updatedTeamMembers = group.teamMembers.filter((_, idx) => idx !== memberIndex);
            return {
              ...group,
              teamMembers: updatedTeamMembers,
              members: updatedTeamMembers.length,
            };
          })
        );
      },
      "Remove"

    );
  };

  const handleCloseModal = () => {
    setShowAddMemberModal(false);
    setNewMemberRound("");
    setNewMemberInterviewer("");
  };

  const selectedMapOption = React.useMemo(
    () => JOB_OPENING_OPTIONS.find((option) => option.openingJobId === mapJobValue),
    [mapJobValue]
  );

  const filteredMapOptions = React.useMemo(() => {
    const query = mapQuery.trim().toLowerCase();
    if (!query) return JOB_OPENING_OPTIONS;
    return JOB_OPENING_OPTIONS.filter(
      (option) =>
        option.openingJobId.toLowerCase().includes(query) ||
        option.company.toLowerCase().includes(query) ||
        option.postingTitle.toLowerCase().includes(query)
    );
  }, [mapQuery]);

  const activeSkillKey = activeSkillType === "primary" ? "primarySkills" : "secondarySkills";
  const skillOptions =
    activeSkillType === "primary" ? PRIMARY_SKILL_OPTIONS : SECONDARY_SKILL_OPTIONS;
  const currentSkills = selectedCandidate?.[activeSkillKey] || [];

  const handleSkillDraftChange = React.useCallback((key, value) => {
    setSkillDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResumeDelete = React.useCallback((fileId) => {
    setSelectedCandidate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        resumeFiles: (prev.resumeFiles || []).filter((file) => file.id !== fileId),
      };
    });
  }, []);

  const handleAttachmentDelete = React.useCallback((fileId) => {
    setSelectedCandidate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: (prev.attachments || []).filter((file) => {
          if (typeof file === "string") return file !== fileId;
          return file.id !== fileId;
        }),
      };
    });
  }, []);

  const handleDownloadFile = React.useCallback((fileName) => {
    const blob = new Blob([""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, []);

  const handleMapJob = React.useCallback(() => {
    if (!mapJobValue) return;
    const option = JOB_OPENING_OPTIONS.find((item) => item.openingJobId === mapJobValue);
    if (!option) return;

    setSelectedCandidate((prev) => {
      if (!prev) return prev;
      const alreadyMapped = (prev.jobApplications || []).some(
        (job) => job.openingJobId === option.openingJobId
      );
      if (alreadyMapped) return prev;
      return {
        ...prev,
        jobApplications: [...(prev.jobApplications || []), option],
      };
    });
    setMapJobValue("");
    setMapQuery("");
    setIsMapDropdownOpen(false);
    setActiveProfileTab("Job Applications");
  }, [mapJobValue]);

  const renderRatingStars = (ratingValue, interactive = false, onChange = null) => (
    <span className={`${styles.starGroup}${interactive ? ` ${styles.starGroupInteractive}` : ""}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= ratingValue;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              className={`${styles.starBtn}${isFilled ? ` ${styles.starFilled}` : ""}`}
              onClick={() => onChange?.(starValue)}
              aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              ★
            </button>
          );
        }

        return (
          <span key={starValue} className={`${styles.starText}${isFilled ? ` ${styles.starFilled}` : ""}`}>
            ★
          </span>
        );
      })}
    </span>
  );

  const renderProfileContent = () => {
    if (!selectedCandidate) return null;

    if (activeProfileTab === "Basic Info") {
      return (
        <div className={styles.profileGrid}>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Candidate ID</span>
            <span className={styles.profileValue}>{selectedCandidate.candidateId}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>First Name</span>
            <span className={styles.profileValue}>{selectedCandidate.firstName}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Last Name</span>
            <span className={styles.profileValue}>{selectedCandidate.lastName || "-"}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Primary Email Address</span>
            <span className={styles.profileLink}>{selectedCandidate.email}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Secondary Email Address</span>
            <span className={styles.profileLink}>{selectedCandidate.secondaryEmail}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Phone Number</span>
            <span className={styles.profileValue}>{selectedCandidate.phoneNumber}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Date Of Birth</span>
            <span className={styles.profileValue}>{selectedCandidate.dateOfBirth}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Gender</span>
            <span className={styles.profileValue}>{selectedCandidate.gender}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Current Company</span>
            <span className={styles.profileValue}>{selectedCandidate.currentCompany}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Experience</span>
            <span className={styles.profileValue}>{selectedCandidate.experience}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Years of Experience</span>
            <span className={styles.profileValue}>{selectedCandidate.yearsExperience}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Offers in Hand</span>
            <span className={styles.profileValue}>{selectedCandidate.offersInHand}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Current CTC (LPA)</span>
            <span className={styles.profileValue}>{selectedCandidate.currentCtc} LPA</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Expected CTC (LPA)</span>
            <span className={styles.profileValue}>{selectedCandidate.expectedCtc} LPA</span>
          </div>
        </div>
      );
    }

    if (activeProfileTab === "Skills") {
      return (
        <div className={styles.skillsTab}>
          <div className={styles.skillsTopRow}>
            <div className={styles.skillRadioGroup}>
              <label className={styles.skillRadio}>
                <input
                  type="radio"
                  checked={activeSkillType === "primary"}
                  onChange={() => {
                    setActiveSkillType("primary");
                    setIsAddingSkill(false);
                    setSkillDraft(createSkillDraft());
                  }}
                />
                <span>Primary Skill</span>
              </label>
              <label className={styles.skillRadio}>
                <input
                  type="radio"
                  checked={activeSkillType === "secondary"}
                  onChange={() => {
                    setActiveSkillType("secondary");
                    setIsAddingSkill(false);
                    setSkillDraft(createSkillDraft());
                  }}
                />
                <span>Secondary Skill</span>
              </label>
            </div>
          </div>

          <div className={styles.skillTableWrap}>
            <table className={styles.skillTable}>
              <thead>
                <tr>
                  <th>{activeSkillType === "primary" ? "Primary Skill" : "Secondary Skill"}</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Last Used</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {isAddingSkill && (
                  <tr className={styles.skillDraftRow}>
                    <td>
                      <select
                        className={styles.skillInput}
                        value={skillDraft.name}
                        onChange={(event) => handleSkillDraftChange("name", event.target.value)}
                      >
                        <option value="">Skill</option>
                        {skillOptions.map((skill) => (
                          <option key={skill} value={skill}>
                            {skill}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className={styles.skillInput}
                        value={skillDraft.experience}
                        onChange={(event) =>
                          handleSkillDraftChange("experience", event.target.value)
                        }
                      >
                        {EXPERIENCE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {renderRatingStars(skillDraft.rating, true, (value) =>
                        handleSkillDraftChange("rating", value)
                      )}
                    </td>
                    <td>
                      <select
                        className={styles.skillInput}
                        value={skillDraft.lastUsed}
                        onChange={(event) => handleSkillDraftChange("lastUsed", event.target.value)}
                      >
                        {LAST_USED_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.skillInput}
                        value={skillDraft.comments}
                        placeholder="Add comments"
                        onChange={(event) => handleSkillDraftChange("comments", event.target.value)}
                      />
                    </td>
                  </tr>
                )}
                {currentSkills.length === 0 && !isAddingSkill && (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      No skills added.
                    </td>
                  </tr>
                )}
                {currentSkills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.name}</td>
                    <td>{skill.experience}</td>
                    <td>{renderRatingStars(skill.rating)}</td>
                    <td>{skill.lastUsed}</td>
                    <td>{skill.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeProfileTab === "Resume" || activeProfileTab === "Attachment") {
      const files =
        activeProfileTab === "Resume" ? selectedCandidate.resumeFiles : selectedCandidate.attachments;

      return (
        <div className={styles.resumeList}>
          {(files || []).map((file) => {
            const fileData =
              typeof file === "string"
                ? { id: file, name: file, type: "pdf", size: "2.2 MB", tone: "blue" }
                : file;

            return (
              <div
                key={fileData.id}
                className={`${styles.resumeCard}${
                  fileData.tone === "peach" ? ` ${styles.resumeCardPeach}` : ` ${styles.resumeCardBlue}`
                }`}
              >
                <div className={styles.resumeMain}>
                  <span
                    className={`${styles.resumeIcon}${
                      fileData.tone === "peach" ? ` ${styles.resumeIconOrange}` : ""
                    }`}
                  >
                    <FiFileText size={14} />
                  </span>
                  <div className={styles.resumeText}>
                    <strong>{fileData.name}</strong>
                    <span>
                      {fileData.type} | {fileData.size}
                    </span>
                  </div>
                </div>
                <div className={styles.resumeActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => handleDownloadFile(fileData.name)}
                    aria-label="Download"
                  >
                    <FiDownload size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() =>
                      setActiveProfileTab(
                        activeProfileTab === "Resume" ? "Attachment" : "Resume"
                      )
                    }
                    aria-label="Preview"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() =>
                      activeProfileTab === "Resume"
                        ? handleResumeDelete(fileData.id)
                        : handleAttachmentDelete(fileData.id)
                    }
                    aria-label="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeProfileTab === "Timeline") {
      return (
        <div className={styles.timelineList}>
          {selectedCandidate.timeline.map((item) => (
            <div key={item.id} className={styles.timelineItem}>
              <span
                className={`${styles.timelineMarker} ${
                  styles[`timelineMarker${item.tone.charAt(0).toUpperCase()}${item.tone.slice(1)}`]
                }`}
              />
              <div className={styles.timelineItemBody}>
                <div className={styles.timelineHead}>
                  <h4>{item.title}</h4>
                  <span>{item.date}</span>
                </div>
                <p className={styles.timelineBy}>by {item.by}</p>
                <p className={styles.timelineSummary}>
                  <strong>Summary:</strong> {item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeProfileTab === "Rating") {
      return (
        <div className={styles.ratingPanel}>
          <div className={styles.ratingOverall}>
            <h4>Over all rating</h4>
            {renderRatingStars(selectedCandidate.overallRating)}
          </div>
          <div className={styles.ratingTimeline}>
            {selectedCandidate.ratingRounds.map((round) => (
              <div key={round.id} className={styles.ratingItem}>
                <div
                  className={`${styles.ratingAvatar} ${
                    styles[`ratingAvatar${round.avatarTone.charAt(0).toUpperCase()}${round.avatarTone.slice(1)}`]
                  }`}
                >
                  {round.avatar}
                </div>
                <div className={styles.ratingBody}>
                  <div className={styles.ratingHead}>
                    <h5>{round.title}</h5>
                    <span>{round.date}</span>
                  </div>
                  <div className={styles.ratingSubHead}>
                    {renderRatingStars(round.rating)}
                    <span>by {round.by}</span>
                  </div>
                  <p>{round.summary}</p>
                  <div className={styles.ratingTags}>
                    {round.tags.map((tag) => (
                      <span
                        key={`${round.id}-${tag.label}`}
                        className={`${styles.ratingTag} ${
                          styles[`ratingTag${tag.tone.charAt(0).toUpperCase()}${tag.tone.slice(1)}`]
                        }`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.jobApplicationTableWrap}>
        <table className={styles.jobApplicationTable}>
          <thead>
            <tr>
              <th>Opening Job Id</th>
              <th>Posting Title</th>
              <th>Client Id</th>
              <th>Assigned Recruiter(s)</th>
              <th>Applied Date</th>
              <th>Job Opening Status</th>
              <th>Hiring Manager</th>
            </tr>
          </thead>
          <tbody>
            {(selectedCandidate.jobApplications || []).map((job, index) => (
              <tr key={`${job.openingJobId}-${index}`}>
                <td>{job.openingJobId}</td>
                <td>{job.postingTitle}</td>
                <td>{job.clientId}</td>
                <td>{job.assignedRecruiter}</td>
                <td>{job.appliedDate}</td>
                <td>
                  <span className={`${styles.stagePill} ${getStageClass(job.jobOpeningStatus)}`}>
                    {job.jobOpeningStatus}
                  </span>
                </td>
                <td>{job.hiringManager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Define table columns
  const columns = [
    { key: "candidateId", label: "Candidate Id" },
    { key: "candidateName", label: "Candidate Name" },
    { key: "roleJobTitle", label: "Role / Job Title" },
    { key: "dateTime", label: "Date & Time" },
    { key: "company", label: "Client" },
    { key: "interviewType", label: "Interview Type" },
    { key: "mode", label: "Mode" },
    { key: "status", label: "Stage" }
  ];

  // Get unique values for filters
  const uniqueRoles = [...new Set(interviews.map(i => i.roleJobTitle))];
  const uniqueInterviewTypes = [...new Set(interviews.map(i => i.interviewType))];
  const uniqueStatuses = [...new Set(interviews.map(i => i.status))];
  const interviewTypeOptions = interviewMetaOptions.types.length > 0 ? interviewMetaOptions.types : uniqueInterviewTypes;
  const interviewStatusOptions = interviewMetaOptions.statuses.length > 0 ? interviewMetaOptions.statuses : uniqueStatuses;

  const filteredInterviews = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return interviews.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(normalizedSearch)
        );
      const matchesRole = !filterRole || item.roleJobTitle === filterRole;
      const matchesInterviewType =
        !filterInterviewType || item.interviewType === filterInterviewType;
      const matchesStatus = !filterStatus || item.status === filterStatus;
      const matchesDateRange = !filterDateRange;
      return (
        matchesSearch &&
        matchesRole &&
        matchesInterviewType &&
        matchesStatus &&
        matchesDateRange
      );
    }).sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [
    interviews,
    searchTerm,
    filterRole,
    filterInterviewType,
    filterStatus,
    filterDateRange,
    sortConfig,
  ]);

  const totalRecords = filteredInterviews.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / entriesPerPage));

  const effectivePage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedInterviews = React.useMemo(() => {
    const startIndex = (effectivePage - 1) * entriesPerPage;
    return filteredInterviews.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredInterviews, effectivePage, entriesPerPage]);

  const startEntry = totalRecords === 0 ? 0 : (effectivePage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(effectivePage * entriesPerPage, totalRecords);

  const hasFilters =
    Boolean(searchTerm) ||
    Boolean(filterRole) ||
    Boolean(filterInterviewType) ||
    Boolean(filterStatus) ||
    Boolean(filterDateRange);

  const clearFilters = React.useCallback(() => {
    setSearchTerm("");
    setFilterRole("");
    setFilterInterviewType("");
    setFilterStatus("");
    setFilterDateRange("");
  }, []);

  const handleEntriesPerPageChange = React.useCallback((event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  }, []);

  const handlePreviousPage = React.useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }, []);

  const handleNextPage = React.useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  }, [totalPages]);

  const requestSort = React.useCallback((key) => {
    setSortConfig((prev) => {
      let direction = "asc";
      if (prev.key === key && prev.direction === "asc") {
        direction = "desc";
      }
      return { key, direction };
    });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.infoBox}>
          <p className={styles.pageDescription}>
            {interviewsPageDescription}
          </p>

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
              Interview Members Panel
            </button>
          </div>
        </div>

        {/* Filter Bar - Only show in Interview List tab */}
        {activeTab === "list" && (
          <div className={styles.filtersBar}>
            <div className={styles.filtersLeft}>
              <FiFilter className={styles.filterIcon} aria-hidden="true" />

              <div className={styles.searchField}>
                <FiSearch className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search here..."
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
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={filterInterviewType}
                onChange={(e) => setFilterInterviewType(e.target.value)}
                className={styles.selectField}
              >
                <option value="">Interview Type</option>
                {interviewTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.selectField}
              >
                <option value="">Stage</option>
                {interviewStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
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
            </div>

            <div className={styles.filtersRight}>
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearFilters}
                disabled={!hasFilters}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div
          className={`${styles.contentAreaLayout} ${
            activeTab === "list" ? styles.contentAreaLayoutList : ""
          }`}
        >
        {activeTab === "list" ? (
          loading ? (
            <div className={styles.loadingState}>
              <p>Loading interviews...</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.interviewsTable}>
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          onClick={() => requestSort(column.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              requestSort(column.key);
                            }
                          }}
                          aria-label={`Sort by ${column.label}`}
                        >
                          <span className={styles.headerLabel}>{column.label}</span>
                          <span className={styles.sortArrows} aria-hidden="true">
                            <span
                              className={
                                sortConfig.key === column.key && sortConfig.direction === "asc"
                                  ? styles.sortArrowActive
                                  : ""
                              }
                            >
                              ▲
                            </span>
                            <span
                              className={
                                sortConfig.key === column.key && sortConfig.direction === "desc"
                                  ? styles.sortArrowActive
                                  : ""
                              }
                            >
                              ▼
                            </span>
                          </span>
                        </th>
                      ))}
                      <th className={styles.actionsCol}>
                        <span className={styles.headerLabel}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInterviews.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <div className={styles.emptyState}>
                            <h2>No Interviews Found</h2>
                            <p>Try changing the selected filters.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedInterviews.map((row, index) => (
                        <tr key={`${row.candidateId}-${index}`}>
                          <td data-label="Candidate ID">{row.candidateId}</td>
                          <td data-label="Candidate Name">{row.candidateName}</td>
                          <td data-label="Role / Job Title">{row.roleJobTitle}</td>
                          <td data-label="Date & Time">{row.dateTime}</td>
                          <td data-label="Client">{row.company}</td>
                          <td data-label="Interview Type">{row.interviewType}</td>
                          <td data-label="Mode">{row.mode}</td>
                          <td data-label="Stage">
                            <span
                              className={`${styles.statusPill} ${
                                row.status === "Rescheduled"
                                  ? styles.statusRescheduled
                                  : styles.statusUpcoming
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td data-label="Actions" className={styles.actionsCol}>
                            <div className={styles.actionIcons}>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => handleView(row)}
                                aria-label="View"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => handleDelete(row)}
                                aria-label="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableFooter}>
                <div className={styles.footerSummary}>
                  <span>Showing</span>
                  <strong>{startEntry}-{endEntry}</strong>
                  <span>of</span>
                  <strong>{totalRecords}</strong>
                  <span>entries</span>
                </div>

                <div className={styles.footerControls}>
                  <label className={styles.rowsControl}>
                    <span>Rows per page</span>
                  <select
                      className={styles.rowsSelect}
                    value={entriesPerPage}
                    onChange={handleEntriesPerPageChange}
                      aria-label="Rows per page"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  </label>

                  <div className={styles.pageIndicator} aria-live="polite">
                    Page {effectivePage} of {totalPages}
                  </div>

                  <div className={styles.paginationControls}>
                  <button
                    type="button"
                      className={styles.pageButton}
                    aria-label="Previous page"
                    onClick={handlePreviousPage}
                    disabled={effectivePage === 1}
                  >
                      <FiChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                      className={styles.pageButton}
                    aria-label="Next page"
                    onClick={handleNextPage}
                    disabled={effectivePage === totalPages}
                  >
                      <FiChevronRight aria-hidden="true" />
                  </button>
                  </div>
                </div>
              </div>
            </>
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
              {selectedGroup && (() => {
                const currentGroup = groups.find((g) => g.id === selectedGroup) || { teamMembers: [], rounds: [], name: "", members: 0 };
                return (
                  <>
                    <div className={styles.groupContentHeader}>
                      <h2 className={styles.groupTitle}>
                        {currentGroup.name}{" "}
                        <span className={styles.memberCount}>
                          (Member {currentGroup.members})
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
                          {currentGroup.teamMembers.map((member, idx) => (
                            <tr key={idx}>
                              <td data-label="Name">{member.name}</td>
                              <td data-label="Email">{member.email}</td>
                              <td data-label="Mobile">{member.mobile}</td>
                              <td data-label="Round">
                                <span className={styles.roundBadge}>{member.round}</span>
                              </td>
                              <td data-label="Designation">{member.designation}</td>
                              <td data-label="Availability">{member.availability}</td>
                              <td data-label="Action">
                                <button 
                                  className={styles.deleteBtn}
                                  onClick={() => handleDeleteMember(selectedGroup, idx)}
                                  aria-label="Delete member"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {currentGroup.teamMembers.length === 0 && (
                            <tr>
                              <td colSpan="7" className={styles.noData}>No members in this group</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
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
                  {(groups.find((g) => g.id === selectedGroup)?.rounds || []).map((round) => (
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
                  {interviewerOptions.map((interviewer) => (
                    <option key={interviewer} value={interviewer}>{interviewer}</option>
                  ))}
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
                  <option value="">Interviewer Name</option>
                  {interviewerOptions.map((interviewer) => (
                    <option key={interviewer} value={interviewer}>{interviewer}</option>
                  ))}
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

      {popupState.isOpen && (
        <div className={styles.modalOverlay} onClick={closePopup}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{popupState.title || "Notice"}</h2>
              <button className={styles.closeBtn} onClick={closePopup} aria-label="Close">
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.pageDescription}>{popupState.message}</p>
              {popupState.mode === "prompt" && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Value</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={popupState.promptValue}
                    placeholder={popupState.promptPlaceholder}
                    onChange={(event) =>
                      setPopupState((prev) => ({ ...prev, promptValue: event.target.value }))
                    }
                  />
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {(popupState.mode === "confirm" || popupState.mode === "prompt") && (
                <button className={styles.cancelBtn} onClick={closePopup}>
                  {popupState.cancelLabel || "Cancel"}
                </button>
              )}
              <button className={styles.createBtn} onClick={handlePopupConfirm}>
                {popupState.confirmLabel || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isViewDrawerOpen && selectedCandidate && (
        <div className={styles.viewDrawerOverlay} onClick={closeViewDrawer}>
          <aside className={styles.viewDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerTopMain}>
                <div className={styles.drawerProfile}>
                  <div className={styles.drawerAvatar}>
                    {selectedCandidate.firstName?.charAt(0) || selectedCandidate.fullName?.charAt(0)}
                  </div>
                  <div className={styles.drawerIdentity}>
                    <h3>{selectedCandidate.fullName}</h3>
                    <p>{selectedCandidate.role}</p>
                    <div className={styles.drawerMeta}>
                      <span><FiMail size={12} /> {selectedCandidate.email}</span>
                      <span><FiMapPin size={12} /> {selectedCandidate.location}</span>
                      <span><FiPhone size={12} /> {selectedCandidate.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.pipelineHeaderCol}>
                  <div className={styles.pipelineRow}>
                    {PIPELINE_STEPS.map((step, index) => (
                      <button
                        key={step}
                        type="button"
                        className={`${styles.pipelineStep}${activePipelineStep === step ? ` ${styles.pipelineStepActive}` : ""}${index <= activePipelineStepIndex && activePipelineStepIndex >= 0 ? ` ${styles.pipelineStepDone}` : ""}`}
                        aria-current={activePipelineStep === step ? "step" : undefined}
                        tabIndex={-1}
                      >
                        <span className={styles.pipelineStepLabel}>{step}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.drawerClose}
                onClick={closeViewDrawer}
                aria-label="Close panel"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.profileTabsRow}>
              <div className={styles.profileTabs}>
                {PROFILE_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${styles.profileTab}${
                      activeProfileTab === tab ? ` ${styles.profileTabActive}` : ""
                    }`}
                    onClick={() => setActiveProfileTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={styles.mapActionBar}>
                <div className={styles.mapSelectWrap} ref={mapDropdownRef}>
                  <button
                    type="button"
                    className={styles.mapSelectTrigger}
                    onClick={() => {
                      setMapQuery("");
                      setIsMapDropdownOpen((prev) => !prev);
                    }}
                  >
                    <span>
                      {selectedMapOption
                        ? `${selectedMapOption.openingJobId} (${selectedMapOption.company})`
                        : "Search JD to Map"}
                    </span>
                    <FiChevronDown size={16} />
                  </button>
                  {isMapDropdownOpen && (
                    <div className={styles.mapDropdown}>
                      <div className={styles.mapDropdownSearch}>
                        <FiSearch size={14} />
                        <input
                          type="text"
                          placeholder="Search Job ID / Company Name"
                          value={mapQuery}
                          onChange={(event) => setMapQuery(event.target.value)}
                        />
                      </div>
                      <div className={styles.mapDropdownList}>
                        {filteredMapOptions.length === 0 && (
                          <div className={styles.mapDropdownEmpty}>No records found</div>
                        )}
                        {filteredMapOptions.map((option) => (
                          <button
                            key={option.openingJobId}
                            type="button"
                            className={styles.mapDropdownItem}
                            onClick={() => {
                              setMapJobValue(option.openingJobId);
                              setIsMapDropdownOpen(false);
                            }}
                          >
                            {option.openingJobId} ({option.company})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.mapJobBtn}
                  onClick={handleMapJob}
                  disabled={!mapJobValue}
                >
                  Map Job
                </button>
              </div>
            </div>

            <div className={styles.profileContent}>{renderProfileContent()}</div>
          </aside>
        </div>
      )}
    </div>
  );
}

