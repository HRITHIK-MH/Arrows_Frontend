import * as React from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiFilter,
  FiMail,
  FiMapPin,
  FiMoreHorizontal,
  FiPhone,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import styles from "./Interviews.module.scss";

const PROFILE_TABS = [
  "Basic Info",
  "Skills",
  "Resume",
  "Timeline",
  "Rating",
  "Attachment",
  "Job Applications",
];

const PIPELINE_STEPS = ["New", "In Review", "Engaged", "Offered", "Hired", "Rejected"];

const JOB_MAP_OPTIONS = [
  {
    id: "C128736",
    company: "HCL",
    openingJobId: "ZR_4_JOB",
    postingTitle: "Senior Associate",
    clientId: "C1292938",
    assignedRecruiter: "Parthiban",
    appliedDate: "12/10/2025",
    jobOpeningStatus: "Pre-Screening",
    hiringManager: "Parthiban",
  },
  {
    id: "C723722",
    company: "TCS",
    openingJobId: "ZR_3_JOB",
    postingTitle: "Lead Engineer",
    clientId: "C1292432",
    assignedRecruiter: "Parthiban",
    appliedDate: "12/10/2025",
    jobOpeningStatus: "Rejected",
    hiringManager: "Parthiban",
  },
  {
    id: "C958463",
    company: "Wipro",
    openingJobId: "ZR_2_JOB",
    postingTitle: "Senior Associate",
    clientId: "C1292938",
    assignedRecruiter: "Parthiban",
    appliedDate: "12/10/2025",
    jobOpeningStatus: "Client Interview",
    hiringManager: "Parthiban",
  },
];

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
  const mapDropdownRef = React.useRef(null);

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
        
        // Sample data aligned with design reference
        setInterviews([
          {
            candidateId: "C001",
            candidateName: "Arun Kumar",
            roleJobTitle: "UX Designer",
            dateTime: "29/12/2025 11:00 AM",
            company: "ABC Tech",
            interviewType: "Technical",
            mode: "Online",
            status: "Upcoming",
            finalReview: "Selected",
          },
          {
            candidateId: "C002",
            candidateName: "Priya Sharma",
            roleJobTitle: "Frontend Developer",
            dateTime: "29/12/2025 04:00 PM",
            company: "XYZ Ltd",
            interviewType: "HR",
            mode: "In-Person",
            status: "Upcoming",
            finalReview: "Not Selected",
          },
          {
            candidateId: "C003",
            candidateName: "Ravi Patel",
            roleJobTitle: "Product Manager",
            dateTime: "29/12/2025 05:30 PM",
            company: "Nova Corp",
            interviewType: "Managerial",
            mode: "Online",
            status: "Rescheduled",
            finalReview: "Pending",
          },
          {
            candidateId: "C004",
            candidateName: "Shend Iyer",
            roleJobTitle: "UI Designer",
            dateTime: "02/01/2026 11:30 AM",
            company: "PixelWorks",
            interviewType: "Technical",
            mode: "Online",
            status: "Upcoming",
            finalReview: "Selected",
          },
          {
            candidateId: "C005",
            candidateName: "Vikram Singh",
            roleJobTitle: "Backend Developer",
            dateTime: "02/01/2026 02:15 PM",
            company: "CodeBase",
            interviewType: "Technical",
            mode: "In-Person",
            status: "Upcoming",
            finalReview: "Pending",
          },
          {
            candidateId: "C006",
            candidateName: "Ananya Rao",
            roleJobTitle: "Data Analyst",
            dateTime: "02/01/2026 04:30 PM",
            company: "Insight Labs",
            interviewType: "HR",
            mode: "Online",
            status: "Upcoming",
            finalReview: "Not Selected",
          },
          {
            candidateId: "C007",
            candidateName: "Karthik M",
            roleJobTitle: "QA Engineer",
            dateTime: "03/01/2026 10:00 AM",
            company: "TestPro",
            interviewType: "Technical",
            mode: "Online",
            status: "Rescheduled",
            finalReview: "Pending",
          },
          {
            candidateId: "C008",
            candidateName: "Neha Verma",
            roleJobTitle: "Digital Marketer",
            dateTime: "03/01/2026 11:30 AM",
            company: "BrandHive",
            interviewType: "HR",
            mode: "Online",
            status: "Rescheduled",
            finalReview: "Selected",
          },
          {
            candidateId: "C009",
            candidateName: "Suresh Nair",
            roleJobTitle: "DevOps Engineer",
            dateTime: "03/01/2026 02:00 PM",
            company: "CloudNet",
            interviewType: "Technical",
            mode: "Online",
            status: "Upcoming",
            finalReview: "Pending",
          },
          {
            candidateId: "C0010",
            candidateName: "Pooja Mehta",
            roleJobTitle: "Business Analyst",
            dateTime: "03/01/2026 04:00 PM",
            company: "FinEdge",
            interviewType: "Managerial",
            mode: "In-Person",
            status: "Upcoming",
            finalReview: "Selected",
          },
        ]);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

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
    const defaultPrimarySkills = [
      {
        id: "primary-1",
        name: "Communication",
        experience: "3 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Confident in stakeholder discussions and interview rounds.",
      },
      {
        id: "primary-2",
        name: "Technical Screening",
        experience: "2 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Strong core understanding for the mapped role.",
      },
    ];

    const defaultSecondarySkills = [
      {
        id: "secondary-1",
        name: "Problem-Solving",
        experience: "4 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Approaches case-based questions with clarity.",
      },
      {
        id: "secondary-2",
        name: "Team Collaboration",
        experience: "4 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Works well across cross-functional interview loops.",
      },
    ];

    const defaultFiles = [
      {
        id: "resume-1",
        name: `${row.candidateName} Resume`,
        type: "pdf",
        size: "2.2 MB",
        tone: "blue",
      },
      {
        id: "resume-2",
        name: "Interview Notes",
        type: "doc",
        size: "1.1 MB",
        tone: "peach",
      },
    ];

    const defaultTimeline = [
      {
        id: "timeline-1",
        title: "Interview Scheduled",
        by: "Parthiban",
        summary: `${row.interviewType} interview scheduled for ${row.dateTime}.`,
        date: row.dateTime,
        tone: "purple",
      },
      {
        id: "timeline-2",
        title: "Profile Shared",
        by: "Parthiban",
        summary: `Candidate profile shared with ${row.company}.`,
        date: "12/25/2025 09:33 PM",
        tone: "slate",
      },
      {
        id: "timeline-3",
        title: "Shortlisted",
        by: "Parthiban",
        summary: `${row.candidateName} shortlisted for ${row.roleJobTitle}.`,
        date: "12/24/2025 07:15 PM",
        tone: "green",
      },
    ];

    const defaultRatingRounds = [
      {
        id: "rating-1",
        avatar: "P",
        avatarTone: "purple",
        title: "Round 1: Screening Discussion (Strong Hire)",
        by: "Parthiban",
        rating: 4,
        date: "12/25/2025 09:33 PM",
        summary: "Strong fundamentals, clear communication, and good intent for the opportunity.",
        tags: [
          { label: row.interviewType, tone: "blue" },
          { label: row.roleJobTitle, tone: "gray" },
        ],
      },
      {
        id: "rating-2",
        avatar: "S",
        avatarTone: "olive",
        title: "Round 2: Role Fit Assessment (Hire)",
        by: "Saravanan",
        rating: 5,
        date: "12/26/2025 10:10 AM",
        summary: "Candidate experience aligns well with the role and client expectation.",
        tags: [
          { label: row.mode, tone: "green" },
          { label: row.company, tone: "orange" },
        ],
      },
    ];

    return {
      candidateId: row.candidateId,
      firstName: firstName || row.candidateName,
      lastName,
      fullName: row.candidateName,
      role: row.roleJobTitle,
      email: row.email || "rahul.mehta@email.com",
      secondaryEmail: row.secondaryEmail || "rahul.personal@email.com",
      phoneNumber: row.phoneNumber || "9876543210",
      location: row.location || "Chennai, India",
      dateOfBirth: row.dateOfBirth || "02/06/1999",
      gender: row.gender || "Male",
      currentCompany: row.currentCompany || row.company,
      experience: row.experience || "5 Years",
      yearsExperience: row.yearsExperience || "5 Years",
      offersInHand: row.offersInHand || "No",
      currentCtc: row.currentCtc || "18,00,000 LPA",
      expectedCtc: row.expectedCtc || "24,00,000 LPA",
      primarySkills: row.primarySkills || defaultPrimarySkills,
      secondarySkills: row.secondarySkills || defaultSecondarySkills,
      resumeFiles: row.resumeFiles || defaultFiles,
      attachments: row.attachments || defaultFiles,
      timeline: row.timeline || defaultTimeline,
      ratingRounds: row.ratingRounds || defaultRatingRounds,
      overallRating: row.overallRating || 4,
      stage: row.stage || "Pre-Screening",
      status: row.status,
      source: row.source || "Interview Schedule",
      jobApplications: row.jobApplications || JOB_MAP_OPTIONS.slice(0, 2),
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

  const handleEdit = (row) => {
    console.log("Edit:", row);
  };

  const handleDelete = (row) => {
    console.log("Delete:", row);
  };

  const closeViewDrawer = React.useCallback(() => {
    setIsViewDrawerOpen(false);
    setIsMapDropdownOpen(false);
    setIsAddingSkill(false);
    setSkillDraft(createSkillDraft());
  }, []);

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

  const selectedMapOption = React.useMemo(
    () => JOB_MAP_OPTIONS.find((option) => option.id === mapJobValue),
    [mapJobValue]
  );

  const filteredMapOptions = React.useMemo(() => {
    const query = mapQuery.trim().toLowerCase();
    if (!query) return JOB_MAP_OPTIONS;
    return JOB_MAP_OPTIONS.filter(
      (option) =>
        option.id.toLowerCase().includes(query) ||
        option.company.toLowerCase().includes(query) ||
        option.openingJobId.toLowerCase().includes(query) ||
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

  const handleAddSkill = React.useCallback(() => {
    setIsAddingSkill(true);
    setSkillDraft(createSkillDraft());
  }, []);

  const handleSaveSkill = React.useCallback(() => {
    if (!selectedCandidate || !skillDraft.name || skillDraft.rating === 0) {
      return;
    }

    const newSkill = {
      id: `${activeSkillKey}-${Date.now()}`,
      name: skillDraft.name,
      experience: skillDraft.experience,
      rating: skillDraft.rating,
      lastUsed: skillDraft.lastUsed,
      comments: skillDraft.comments,
    };

    setSelectedCandidate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [activeSkillKey]: [newSkill, ...(prev[activeSkillKey] || [])],
      };
    });
    setIsAddingSkill(false);
    setSkillDraft(createSkillDraft());
  }, [activeSkillKey, selectedCandidate, skillDraft]);

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
    const blob = new Blob([`Mock file generated for ${fileName}`], { type: "text/plain" });
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
    const option = JOB_MAP_OPTIONS.find((item) => item.id === mapJobValue);
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
            <span className={styles.profileLabel}>Current CTC</span>
            <span className={styles.profileValue}>{selectedCandidate.currentCtc}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>Expected CTC</span>
            <span className={styles.profileValue}>{selectedCandidate.expectedCtc}</span>
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
            <div className={styles.skillButtons}>
              <button
                type="button"
                className={styles.skillSaveBtn}
                onClick={handleSaveSkill}
                disabled={!isAddingSkill || !skillDraft.name || skillDraft.rating === 0}
              >
                Save
              </button>
              <button
                type="button"
                className={styles.skillAddBtn}
                onClick={handleAddSkill}
                disabled={isAddingSkill}
              >
                Add Skill
              </button>
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
    { key: "company", label: "Company" },
    { key: "interviewType", label: "Interview Type" },
    { key: "mode", label: "Mode" },
    { key: "status", label: "Status" },
    { key: "finalReview", label: "Final Review" }
  ];

  // Get unique values for filters
  const uniqueRoles = [...new Set(interviews.map(i => i.roleJobTitle))];
  const uniqueInterviewTypes = [...new Set(interviews.map(i => i.interviewType))];
  const uniqueStatuses = [...new Set(interviews.map(i => i.status))];

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
    });
  }, [
    interviews,
    searchTerm,
    filterRole,
    filterInterviewType,
    filterStatus,
    filterDateRange,
  ]);

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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.infoBox}>
          <p className={styles.pageDescription}>
            View and manage all scheduled upcoming interviews in one place. Track interview dates,
            candidates, roles, and interview modes, and take quick actions like rescheduling,
            joining meetings, or adding notes.
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
              Interview Group
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
                {uniqueInterviewTypes.map((type) => (
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
                <option value="">Status</option>
                {uniqueStatuses.map((status) => (
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

              <button className={styles.moreButton} aria-label="More options">
                <FiMoreHorizontal />
              </button>
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
          ) : filteredInterviews.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No Interviews Found</h2>
              <p>Try changing the selected filters.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.interviewsTable}>
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column.key}>
                          <span className={styles.headerLabel}>{column.label}</span>
                          <span className={styles.sortArrows} aria-hidden="true">
                            <span>▲</span>
                            <span>▼</span>
                          </span>
                        </th>
                      ))}
                      <th className={styles.actionsCol}>
                        <span className={styles.headerLabel}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInterviews.map((row, index) => (
                      <tr key={`${row.candidateId}-${index}`}>
                        <td data-label="Candidate ID">{row.candidateId}</td>
                        <td data-label="Candidate Name">{row.candidateName}</td>
                        <td data-label="Role / Job Title">{row.roleJobTitle}</td>
                        <td data-label="Date & Time">{row.dateTime}</td>
                        <td data-label="Company">{row.company}</td>
                        <td data-label="Interview Type">{row.interviewType}</td>
                        <td data-label="Mode">{row.mode}</td>
                        <td data-label="Status">
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
                        <td data-label="Final Review">
                          <span
                            className={`${styles.statusPill} ${
                              row.finalReview === "Selected"
                                ? styles.finalSelected
                                : row.finalReview === "Not Selected"
                                ? styles.finalNotSelected
                                : styles.finalPending
                            }`}
                          >
                            {row.finalReview || "Pending"}
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
                              onClick={() => handleEdit(row)}
                              aria-label="Edit"
                            >
                              <FiEdit2 size={16} />
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
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableFooter}>
                <div className={styles.footerLeft}>
                  <span>Show</span>
                  <select className={styles.entriesSelect} defaultValue="10">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className={styles.pagination}>
                  <button type="button" className={styles.pageBtn} aria-label="Previous page">
                    ‹
                  </button>
                  <button type="button" className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
                    1
                  </button>
                  <button type="button" className={styles.pageBtn}>
                    2
                  </button>
                  <button type="button" className={styles.pageBtn}>
                    3
                  </button>
                  <button type="button" className={styles.pageBtn} aria-label="Next page">
                    ›
                  </button>
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
                  <option value="">Interviewer Name</option>
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
      {isViewDrawerOpen && selectedCandidate && (
        <div className={styles.viewDrawerOverlay} onClick={closeViewDrawer}>
          <aside className={styles.viewDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerTop}>
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

              <button
                type="button"
                className={styles.drawerClose}
                onClick={closeViewDrawer}
                aria-label="Close panel"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.pipelineRow}>
              {PIPELINE_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={`${styles.pipelineStep}${
                    activePipelineStep === step ? ` ${styles.pipelineStepActive}` : ""
                  }`}
                  onClick={() => setActivePipelineStep(step)}
                >
                  {step}
                </button>
              ))}
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
                        ? `${selectedMapOption.id} (${selectedMapOption.company})`
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
                            key={option.id}
                            type="button"
                            className={styles.mapDropdownItem}
                            onClick={() => {
                              setMapJobValue(option.id);
                              setIsMapDropdownOpen(false);
                            }}
                          >
                            {option.id} ({option.company})
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
      {false && isViewDrawerOpen && selectedCandidate && (
        <div className={styles.viewDrawerOverlay} onClick={closeViewDrawer}>
        <aside className={styles.viewDrawer} onClick={(e)=>e.stopPropagation()}>

        {/* HEADER */}

        <div className={styles.drawerTop}>

        <div className={styles.drawerProfile}>

        <div className={styles.drawerAvatar}>
        {selectedCandidate?.fullName?.charAt(0)}
        </div>

        <div className={styles.drawerIdentity}>

        <h3>{selectedCandidate?.fullName}</h3>

        <p>{selectedCandidate?.role}</p>

        <div className={styles.drawerMeta}>
        <span><FiMail size={12}/> {selectedCandidate?.email}</span>
        <span><FiMapPin size={12}/> {selectedCandidate?.location}</span>
        <span><FiPhone size={12}/> {selectedCandidate?.phoneNumber}</span>
        </div>

        </div>
        </div>

        <button
        className={styles.drawerClose}
        onClick={closeViewDrawer}
        >
        <FiX size={18}/>
        </button>

        </div>

        {/* PIPELINE */}

        <div className={styles.pipelineRow}>
        {PIPELINE_STEPS.map((step)=>(
        <button
        key={step}
        className={`${styles.pipelineStep} ${
        activePipelineStep===step ? styles.pipelineStepActive : ""
        }`}
        onClick={()=>setActivePipelineStep(step)}
        >
        {step}
        </button>
        ))}
        </div>

        {/* TABS */}

        <div className={styles.profileTabs}>
        {PROFILE_TABS.map((tab)=>(
        <button
        key={tab}
        className={`${styles.profileTab} ${
        activeProfileTab===tab ? styles.profileTabActive : ""
        }`}
        onClick={()=>setActiveProfileTab(tab)}
        >
        {tab}
        </button>
        ))}
        </div>

        {/* TAB CONTENT */}

        <div className={styles.profileContent}>

        {activeProfileTab==="Basic Info" && (

        <div className={styles.profileGrid}>

        <div className={styles.profileItem}>
        <span className={styles.profileLabel}>Name</span>
        <span className={styles.profileValue}>{selectedCandidate.fullName}</span>
        </div>

        <div className={styles.profileItem}>
        <span className={styles.profileLabel}>Email</span>
        <span className={styles.profileValue}>{selectedCandidate.email}</span>
        </div>

        <div className={styles.profileItem}>
        <span className={styles.profileLabel}>Phone</span>
        <span className={styles.profileValue}>{selectedCandidate.phoneNumber}</span>
        </div>

        <div className={styles.profileItem}>
        <span className={styles.profileLabel}>Location</span>
        <span className={styles.profileValue}>{selectedCandidate.location}</span>
        </div>

        </div>

        )}

        {activeProfileTab==="Resume" && (
        <div className={styles.resumeList}>

        <div className={styles.resumeCard}>

        <div className={styles.resumeMain}>
        <span className={styles.resumeIcon}>
        <FiFileText size={14}/>
        </span>

        <div className={styles.resumeText}>
        <strong>Candidate Resume</strong>
        <span>pdf | 2.2MB</span>
        </div>
        </div>

        <div className={styles.resumeActions}>
        <button className={styles.iconBtn}>
        <FiDownload size={16}/>
        </button>

        <button className={styles.iconBtn}>
        <FiEye size={16}/>
        </button>

        <button className={styles.iconBtn}>
        <FiTrash2 size={16}/>
        </button>
        </div>

        </div>

        </div>
        )}

        {activeProfileTab==="Timeline" && (
        <div className={styles.timelineList}>

        <div className={styles.timelineItem}>
        <span className={`${styles.timelineMarker} ${styles.timelineMarkerPurple}`}/>
        <div className={styles.timelineItemBody}>
        <div className={styles.timelineHead}>
        <h4>Interview Scheduled</h4>
        <span>11/25/2025</span>
        </div>
        <p className={styles.timelineSummary}>
        Interview created and scheduled for candidate
        </p>
        </div>
        </div>

        </div>
        )}

        {activeProfileTab==="Rating" && (

        <div className={styles.ratingPanel}>

        <h4>Overall Rating</h4>

        <div className={styles.starGroup}>
        ★ ★ ★ ★ ☆
        </div>

        </div>

        )}

        {activeProfileTab==="Job Applications" && (

        <div className={styles.jobApplicationTableWrap}>

        <table className={styles.jobApplicationTable}>

        <thead>
        <tr>
        <th>Opening Job Id</th>
        <th>Posting Title</th>
        <th>Client</th>
        <th>Status</th>
        </tr>
        </thead>

        <tbody>

        <tr>
        <td>ZR_4_JOB</td>
        <td>Senior Associate</td>
        <td>HCL</td>
        <td>Pre-Screening</td>
        </tr>

        </tbody>

        </table>

        </div>

        )}

        </div>

        </aside>
        </div>
        )}
    </div>
  );
}
