import * as React from "react";
import {
  FiChevronDown,
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
  FiStar,
  FiTrash2,
  FiX
} from "react-icons/fi";
import ReusableForm from "../../components/forms/ReusableForm";
import { candidateConfig } from "../../components/forms/formConfigs";
import { debounce } from "../../utils/debounce";
import styles from "./Candidates.module.scss";


// Memoized filter bar component to prevent unnecessary re-renders
const CandidateFilterBar = React.memo(({
  searchTerm,
  onSearchChange,
  filterSource,
  onFilterSourceChange,
  filterRating,
  onFilterRatingChange,
  filterStage,
  onFilterStageChange,
  filterStatus,
  onFilterStatusChange,
  uniqueSources,
  uniqueRatings,
  uniqueStages,
  uniqueStatuses,
  hasFilters,
  onClearFilters
}) => (
  <div className={styles.filtersBar}>
    <div className={styles.filtersLeft}>
      <FiFilter className={styles.filterIcon} aria-hidden="true" />
      <div className={styles.searchField}>
        <FiSearch className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search here..."
          value={searchTerm}
          onChange={onSearchChange}
          className={styles.searchInput}
        />
      </div>

      <select value={filterSource} onChange={onFilterSourceChange} className={styles.selectField}>
        <option value="">Select Source</option>
        {uniqueSources.map(source => (
          <option key={source} value={source}>{source}</option>
        ))}
      </select>

      <select value={filterRating} onChange={onFilterRatingChange} className={styles.selectField}>
        <option value="">Select Ratings</option>
        {uniqueRatings.map(rating => (
          <option key={rating} value={rating}>{rating}</option>
        ))}
      </select>

      <select value={filterStage} onChange={onFilterStageChange} className={styles.selectField}>
        <option value="">Select Stage</option>
        {uniqueStages.map(stage => (
          <option key={stage} value={stage}>{stage}</option>
        ))}
      </select>

      <select value={filterStatus} onChange={onFilterStatusChange} className={styles.selectField}>
        <option value="">Select Status</option>
        {uniqueStatuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <button className={styles.moreButton} type="button" aria-label="More filters">
        <FiMoreHorizontal size={16} />
      </button>
    </div>

    <div className={styles.filtersRight}>
      <button className={styles.applyButton} type="button" disabled={!hasFilters}>
        Apply
      </button>
      <button
        className={styles.clearButton}
        type="button"
        onClick={onClearFilters}
        disabled={!hasFilters}
      >
        Clear
      </button>
    </div>
  </div>
));

CandidateFilterBar.displayName = 'CandidateFilterBar';

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
  {
    id: "C4231649",
    company: "Verizon",
    openingJobId: "ZR_1_JOB",
    postingTitle: "Staff Engineer",
    clientId: "C1294956",
    assignedRecruiter: "Manigandan",
    appliedDate: "12/12/2025",
    jobOpeningStatus: "Assessment",
    hiringManager: "Saravanan",
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

export default function Candidates() {
  const [showCandidateForm, setShowCandidateForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([
    {
      candidateId: "C001",
      candidateName: "Raghul Mehta",
      candidateEmail: "raghul.mehta@email.com",
      modifiedTime: "11/10/2025 05:30 PM",
      source: "Resume Inbox",
      rating: "3/5",
      stage: "Sourced",
      status: "In Progress"
    },
    {
      candidateId: "C002",
      candidateName: "Priya Sharma",
      candidateEmail: "priya.sharma@email.com",
      modifiedTime: "11/10/2025 05:30 PM",
      source: "Added by User",
      rating: "4/5",
      stage: "Pre-Screening",
      status: "In Progress"
    },
    {
      candidateId: "C003",
      candidateName: "Arjun Rao",
      candidateEmail: "arjun.rao@email.com",
      modifiedTime: "11/10/2025 05:30 PM",
      source: "Seek",
      rating: "4/5",
      stage: "Assessment",
      status: "Completed"
    },
    {
      candidateId: "C004",
      candidateName: "Sneha Nair",
      candidateEmail: "sneha.nair@email.com",
      modifiedTime: "11/10/2025 05:30 PM",
      source: "Resume Inbox",
      rating: "2/5",
      stage: "Client Interview",
      status: "In Progress"
    }
  ]);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSource, setFilterSource] = React.useState('');
  const [filterRating, setFilterRating] = React.useState('');
  const [filterStage, setFilterStage] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [activeProfileTab, setActiveProfileTab] = React.useState("Basic Info");
  const [activePipelineStep, setActivePipelineStep] = React.useState("Engaged");
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);
  const [activeSkillType, setActiveSkillType] = React.useState("primary");
  const [isAddingSkill, setIsAddingSkill] = React.useState(false);
  const [skillDraft, setSkillDraft] = React.useState(createSkillDraft);
  const [mapJobValue, setMapJobValue] = React.useState("");
  const [mapQuery, setMapQuery] = React.useState("");
  const [isMapDropdownOpen, setIsMapDropdownOpen] = React.useState(false);
  const mapDropdownRef = React.useRef(null);

  // Debounced search handler - reduces filter recalculations by 99%
  const debouncedSearch = React.useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleSearchChange = React.useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  // useCallback for filter handlers - prevents unnecessary re-renders
  const handleFilterSourceChange = React.useCallback((e) => {
    setFilterSource(e.target.value);
  }, []);

  const handleFilterRatingChange = React.useCallback((e) => {
    setFilterRating(e.target.value);
  }, []);

  const handleFilterStageChange = React.useCallback((e) => {
    setFilterStage(e.target.value);
  }, []);

  const handleFilterStatusChange = React.useCallback((e) => {
    setFilterStatus(e.target.value);
  }, []);

  // Get unique values for filter dropdowns - memoized to avoid recalculations
  const uniqueSources = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.source).filter(Boolean))],
    [submittedData]
  );

  const uniqueRatings = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.rating).filter(Boolean))],
    [submittedData]
  );

  const uniqueStages = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.stage).filter(Boolean))],
    [submittedData]
  );

  const uniqueStatuses = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.status).filter(Boolean))],
    [submittedData]
  );

  // Memoized filter logic - only recalculates when dependencies change
  const filteredData = React.useMemo(() =>
    submittedData.filter(item => {
      const matchesSearch = 
        !searchTerm || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesSource = !filterSource || item.source === filterSource;
      const matchesRating = !filterRating || item.rating === filterRating;
      const matchesStage = !filterStage || item.stage === filterStage;
      const matchesStatus = !filterStatus || item.status === filterStatus;

      return matchesSearch && matchesSource && matchesRating && matchesStage && matchesStatus;
    }),
    [submittedData, searchTerm, filterSource, filterRating, filterStage, filterStatus]
  );

  const hasFilters = Boolean(
    searchTerm ||
    filterSource ||
    filterRating ||
    filterStage ||
    filterStatus
  );

  const clearFilters = React.useCallback(() => {
    setSearchTerm('');
    setFilterSource('');
    setFilterRating('');
    setFilterStage('');
    setFilterStatus('');
  }, []);

  const getStageClass = React.useCallback((stage) => {
    const normalized = String(stage || '').toLowerCase();
    if (normalized === 'added') return styles.stageAdded;
    if (normalized === 'sourced') return styles.stageSourced;
    if (normalized === 'pre-screening') return styles.stageScreening;
    if (normalized === 'assessment') return styles.stageAssessment;
    if (normalized === 'client interview') return styles.stageInterview;
    if (normalized === 'offer') return styles.stageOffer;
    if (normalized === 'rejected') return styles.stageRejected;
    return styles.stageNeutral;
  }, []);

  const getStatusClass = React.useCallback((status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'completed') return styles.statusCompleted;
    return styles.statusProgress;
  }, []);

  const formatTimestamp = React.useCallback((date = new Date()) => {
    const pad = (value) => String(value).padStart(2, "0");
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();
    const minutes = pad(date.getMinutes());
    let hours = date.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${month}/${day}/${year} ${pad(hours)}:${minutes} ${period}`;
  }, []);

  const buildCandidateProfile = React.useCallback((row) => {
    const [firstName = "", lastName = ""] = String(row.candidateName || "").split(" ");
    const normalizedFirstName = row.firstName || firstName || "Rahul";
    const normalizedLastName = row.lastName || lastName || "Mehta";
    const defaultPrimarySkills = [
      {
        id: "primary-1",
        name: "Core Java",
        experience: "2 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "The candidate has good understanding of Java coding and concepts",
      },
      {
        id: "primary-2",
        name: "Spring Boot",
        experience: "1 Year",
        rating: 4,
        lastUsed: "2025",
        comments: "He has sound experience of Spring Boot",
      },
      {
        id: "primary-3",
        name: "Microservices",
        experience: "3 Years",
        rating: 3,
        lastUsed: "2025",
        comments: "He has working experience of Microservices",
      },
      {
        id: "primary-4",
        name: "Rest API",
        experience: "2 Years",
        rating: 3,
        lastUsed: "2022",
        comments: "He has experience of Rest API",
      },
    ];

    const defaultSecondarySkills = [
      {
        id: "secondary-1",
        name: "Communication Skills",
        experience: "5 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Ability to clearly share ideas, listen actively, and align with teams and stakeholders.",
      },
      {
        id: "secondary-2",
        name: "Time Management",
        experience: "5 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Effectively prioritizing tasks and meeting deadlines without compromising quality.",
      },
      {
        id: "secondary-3",
        name: "Problem-Solving",
        experience: "5 Years",
        rating: 3,
        lastUsed: "2025",
        comments: "Identifying issues quickly and finding practical, effective solutions.",
      },
      {
        id: "secondary-4",
        name: "Team Collaboration",
        experience: "5 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Working smoothly with cross-functional teams to achieve shared goals.",
      },
      {
        id: "secondary-5",
        name: "Adaptability & Learning",
        experience: "5 Years",
        rating: 4,
        lastUsed: "2025",
        comments: "Quickly adjusting to change and continuously upgrading skills.",
      },
    ];

    const defaultResumeFiles = [
      {
        id: "resume-1",
        name: "Rahul Metan Resume",
        type: "zip",
        size: "9.19 MB",
        tone: "blue",
      },
      {
        id: "resume-2",
        name: "UG Degree Certificate",
        type: "zip",
        size: "13.43 MB",
        tone: "peach",
      },
    ];

    const defaultTimeline = [
      {
        id: "timeline-1",
        title: "System Design / Technical Deep Dive",
        by: "Parthiban",
        summary: "Architecture, scalability, best practices, and communication assessed.",
        date: "11/25/2025 09:33 PM",
        tone: "purple",
      },
      {
        id: "timeline-2",
        title: "Coding / Problem-Solving",
        by: "Parthiban",
        summary: "Coding challenge, logic, algorithms, and debugging evaluated.",
        date: "11/25/2025 09:33 PM",
        tone: "slate",
      },
      {
        id: "timeline-3",
        title: "Technical Screening",
        by: "Parthiban",
        summary: "Basic technical fundamentals and core skills evaluated.",
        date: "11/25/2025 09:33 PM",
        tone: "green",
      },
      {
        id: "timeline-4",
        title: "Candidate Created",
        by: "Parthiban",
        summary: "Candidate profile created and moved to sourcing stage.",
        date: "11/25/2025 09:33 PM",
        tone: "orange",
      },
    ];

    const defaultRatingRounds = [
      {
        id: "rating-1",
        avatar: "P",
        avatarTone: "purple",
        title: "Round 1: Technical Screening / Fundamentals (Strong Hire)",
        by: "Parthiban",
        rating: 4,
        date: "11/25/2025 09:33 PM",
        summary:
          "The candidate demonstrated strong technical fundamentals, solid understanding of core concepts, and the ability to reason through problems clearly.",
        tags: [
          { label: "General Interview", tone: "blue" },
          { label: "Product Analyst (Sample)", tone: "gray" },
        ],
      },
      {
        id: "rating-2",
        avatar: "S",
        avatarTone: "olive",
        title: "Round 2: Coding / Problem-Solving Round (Strong Hire)",
        by: "Saravanan",
        rating: 5,
        date: "11/25/2025 09:33 PM",
        summary:
          "Excellent problem-solving skills with clean, optimized code. Strong ability to code under pressure while maintaining quality.",
        tags: [
          { label: "General Interview", tone: "green" },
          { label: "Product Analyst (Sample)", tone: "gray" },
        ],
      },
      {
        id: "rating-3",
        avatar: "M",
        avatarTone: "rose",
        title: "Round 3: System Design / Architecture / Technical Deep Dive (Strong Hire)",
        by: "Manigandan",
        rating: 5,
        date: "11/25/2025 09:33 PM",
        summary:
          "Strong system design capability with practical and well-justified architecture decisions.",
        tags: [
          { label: "General Interview", tone: "orange" },
          { label: "Product Analyst (Sample)", tone: "gray" },
        ],
      },
    ];

    const defaultJobApplications = [
      {
        openingJobId: "ZR_4_JOB",
        postingTitle: "Senior Associate",
        clientId: "C1292938",
        assignedRecruiter: "Parthiban",
        appliedDate: "12/10/2025",
        jobOpeningStatus: "Pre-Screening",
        hiringManager: "Parthiban",
      },
      {
        openingJobId: "ZR_3_JOB",
        postingTitle: "Lead Engineer",
        clientId: "C1292432",
        assignedRecruiter: "Parthiban",
        appliedDate: "12/10/2025",
        jobOpeningStatus: "Rejected",
        hiringManager: "Parthiban",
      },
      {
        openingJobId: "ZR_2_JOB",
        postingTitle: "Senior Associate",
        clientId: "C1292938",
        assignedRecruiter: "Parthiban",
        appliedDate: "12/10/2025",
        jobOpeningStatus: "Client Interview",
        hiringManager: "Parthiban",
      },
    ];

    return {
      candidateId: row.candidateId || "C001",
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      fullName: `${normalizedFirstName} ${normalizedLastName}`.trim(),
      role: row.role || "Senior Product Manager",
      email: row.primaryEmail || row.candidateEmail || "rahul.mehta@email.com",
      secondaryEmail: row.secondaryEmail || row.candidateEmail || "rahul.mehta@email.com",
      phoneNumber: row.phoneNumber || "9876543210",
      location: row.location || "Chennai, India",
      dateOfBirth: row.dateOfBirth || "02/06/1999",
      gender: row.gender || "Male",
      currentCompany: row.currentCompanyName || "Method Hub",
      experience: row.experience || "8 Years",
      yearsExperience: row.yearsExperience || "8 Years",
      offersInHand: row.offersInHand || "No",
      currentCtc: row.currentCtc || "25,000,00 LPA",
      expectedCtc: row.expectedCtc || "30,000,00 LPA",
      primarySkills: row.primarySkills || defaultPrimarySkills,
      secondarySkills: row.secondarySkills || defaultSecondarySkills,
      resumeFiles: row.resumeFiles || defaultResumeFiles,
      attachments: row.attachments || defaultResumeFiles,
      timeline: row.timeline || defaultTimeline,
      rating: row.rating || "4/5",
      ratingRounds: row.ratingRounds || defaultRatingRounds,
      overallRating: row.overallRating || 4,
      source: row.source || "Resume Inbox",
      stage: row.stage || "Sourced",
      status: row.status || "In Progress",
      jobApplications: row.jobApplications || defaultJobApplications,
    };
  }, []);

  // Ensure body overflow is always reset when component unmounts
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

  const handleAddCandidate = React.useCallback(() => {
    setShowCandidateForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData(null);
  }, []);

  const getPipelineFromStage = React.useCallback((stage) => {
    const normalized = String(stage || "").toLowerCase();
    if (normalized === "added") return "New";
    if (normalized === "sourced") return "In Review";
    if (normalized === "pre-screening") return "Engaged";
    if (normalized === "assessment") return "Offered";
    if (normalized === "client interview") return "Hired";
    if (normalized === "rejected") return "Rejected";
    return "New";
  }, []);

  const handleViewCandidate = React.useCallback((row) => {
    console.log('View candidate:', row);
    const profile = buildCandidateProfile(row);
    setSelectedCandidate(profile);
    setActiveProfileTab("Basic Info");
    setActivePipelineStep(getPipelineFromStage(profile.stage));
    setActiveSkillType("primary");
    setIsAddingSkill(false);
    setSkillDraft(createSkillDraft());
    setMapJobValue("");
    setMapQuery("");
    setIsMapDropdownOpen(false);
    setIsViewDrawerOpen(true);
  }, [buildCandidateProfile, getPipelineFromStage]);

  const handleEditCandidate = React.useCallback((row, index) => {
    console.log('Edit candidate:', row);
    const [firstName = "", lastName = ""] = String(row.candidateName || "").split(" ");
    setEditingIndex(index);
    setEditingData({
      candidateId: row.candidateId || "",
      namePrefix: row.namePrefix || "none",
      firstName: row.firstName || firstName,
      lastName: row.lastName || lastName,
      primaryEmail: row.primaryEmail || row.candidateEmail || "",
      secondaryEmail: row.secondaryEmail || "",
      phoneNumber: row.phoneNumber || "",
      gender: row.gender || "",
      yearsExperience: row.yearsExperience || "",
      offersInHand: row.offersInHand || "",
      comments: row.comments || "",
      currentCompanyName: row.currentCompanyName || "",
      jobTitleRole: row.jobTitleRole || "",
      employmentType: row.employmentType || "",
      noticePeriod: row.noticePeriod || "",
      currentCtc: row.currentCtc || "",
      expectedCtc: row.expectedCtc || "",
      sourceId: row.sourceId || "",
      recruiterId: row.recruiterId || "",
      sourceName: row.sourceName || row.source || "",
      sourcedDate: row.sourcedDate || "",
    });
    setShowCandidateForm(true);
    setShowDataTable(false);
  }, []);

  const handleDeleteCandidate = React.useCallback((row, index) => {
    console.log('Delete candidate:', row);
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleCandidateSubmit = React.useCallback((data) => {
    const firstName = data.firstName || "";
    const lastName = data.lastName || "";
    const candidateName = data.candidateName || `${firstName} ${lastName}`.trim();
    const normalized = {
      ...data,
      candidateId: data.candidateId || data.candidateCode || "",
      candidateName,
      candidateEmail: data.primaryEmail || data.candidateEmail || "",
      modifiedTime: data.modifiedTime || formatTimestamp(new Date()),
      source: data.sourceName || data.sourceId || data.source || "",
      rating: data.rating || "3/5",
      stage: data.stage || "Added",
      status: data.status || "In Progress"
    };
    if (editingIndex !== null) {
      console.log('Candidate updated:', normalized);
      setSubmittedData(prev => prev.map((item, idx) => (idx === editingIndex ? normalized : item)));
    } else {
      console.log('Candidate added:', normalized);
      setSubmittedData(prev => [...prev, normalized]);
    }
    setShowCandidateForm(false);
    setShowDataTable(true);
    setShowSuccessMessage(true);
    setEditingIndex(null);
    setEditingData(null);
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    // Here you would typically send the data to your backend API
  }, [formatTimestamp, editingIndex]);

  const closeViewDrawer = React.useCallback(() => {
    setIsViewDrawerOpen(false);
    setIsMapDropdownOpen(false);
    setIsAddingSkill(false);
    setSkillDraft(createSkillDraft());
  }, []);

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

  const handleMapJob = React.useCallback(() => {
    if (!mapJobValue) return;
    const selectedOption = JOB_MAP_OPTIONS.find((option) => option.id === mapJobValue);
    if (!selectedOption) return;
    setSelectedCandidate((prev) => {
      if (!prev) return prev;
      const alreadyMapped = (prev.jobApplications || []).some(
        (job) => job.openingJobId === selectedOption.openingJobId
      );
      if (alreadyMapped) return prev;
      return {
        ...prev,
        jobApplications: [...(prev.jobApplications || []), selectedOption],
      };
    });
    setMapJobValue("");
    setMapQuery("");
    setIsMapDropdownOpen(false);
    setActiveProfileTab("Job Applications");
  }, [mapJobValue]);

  const activeSkillKey = activeSkillType === "primary" ? "primarySkills" : "secondarySkills";
  const skillOptions = activeSkillType === "primary" ? PRIMARY_SKILL_OPTIONS : SECONDARY_SKILL_OPTIONS;
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
            <span className={styles.profileValue}>{selectedCandidate.lastName}</span>
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
                        onChange={(event) => handleSkillDraftChange("experience", event.target.value)}
                      >
                        {EXPERIENCE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{renderRatingStars(skillDraft.rating, true, (value) => handleSkillDraftChange("rating", value))}</td>
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

    if (activeProfileTab === "Resume") {
      return (
        <div className={styles.resumeList}>
          {(selectedCandidate.resumeFiles || []).map((file) => (
            <div
              key={file.id}
              className={`${styles.resumeCard}${file.tone === "peach" ? ` ${styles.resumeCardPeach}` : ` ${styles.resumeCardBlue}`}`}
            >
              <div className={styles.resumeMain}>
                <span className={`${styles.resumeIcon}${file.tone === "peach" ? ` ${styles.resumeIconOrange}` : ""}`}>
                  <FiFileText size={14} />
                </span>
                <div className={styles.resumeText}>
                  <strong>{file.name}</strong>
                  <span>{file.type} | {file.size}</span>
                </div>
              </div>
              <div className={styles.resumeActions}>
                <button type="button" className={styles.iconBtn} onClick={() => handleDownloadFile(file.name)} aria-label="Download">
                  <FiDownload size={16} />
                </button>
                <button type="button" className={styles.iconBtn} onClick={() => setActiveProfileTab("Attachment")} aria-label="Preview">
                  <FiEye size={16} />
                </button>
                <button type="button" className={styles.iconBtn} onClick={() => handleResumeDelete(file.id)} aria-label="Delete">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeProfileTab === "Timeline") {
      return (
        <div className={styles.timelineList}>
          {selectedCandidate.timeline.map((item) => (
            <div key={item.id} className={styles.timelineItem}>
              <span className={`${styles.timelineMarker} ${styles[`timelineMarker${item.tone.charAt(0).toUpperCase()}${item.tone.slice(1)}`]}`} />
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
                <div className={`${styles.ratingAvatar} ${styles[`ratingAvatar${round.avatarTone.charAt(0).toUpperCase()}${round.avatarTone.slice(1)}`]}`}>
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
                      <span key={`${round.id}-${tag.label}`} className={`${styles.ratingTag} ${styles[`ratingTag${tag.tone.charAt(0).toUpperCase()}${tag.tone.slice(1)}`]}`}>
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

    if (activeProfileTab === "Attachment") {
      return (
        <div className={styles.resumeList}>
          {(selectedCandidate.attachments || []).map((file) => {
            const fileData =
              typeof file === "string"
                ? { id: file, name: file, type: "pdf", size: "2.2 MB", tone: "blue" }
                : file;
            return (
              <div
                key={fileData.id}
                className={`${styles.resumeCard}${fileData.tone === "peach" ? ` ${styles.resumeCardPeach}` : ` ${styles.resumeCardBlue}`}`}
              >
                <div className={styles.resumeMain}>
                  <span className={`${styles.resumeIcon}${fileData.tone === "peach" ? ` ${styles.resumeIconOrange}` : ""}`}>
                    <FiFileText size={14} />
                  </span>
                  <div className={styles.resumeText}>
                    <strong>{fileData.name}</strong>
                    <span>{fileData.type} | {fileData.size}</span>
                  </div>
                </div>
                <div className={styles.resumeActions}>
                  <button type="button" className={styles.iconBtn} onClick={() => handleDownloadFile(fileData.name)} aria-label="Download">
                    <FiDownload size={16} />
                  </button>
                  <button type="button" className={styles.iconBtn} aria-label="Preview">
                    <FiEye size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => handleAttachmentDelete(fileData.id)}
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

  return (
    <div className={styles.page}>
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          ✓ {editingIndex !== null ? 'Candidate updated successfully' : 'Candidate added successfully'}
        </div>
      )}

      <div className={styles.card}>
        {!showCandidateForm && (
          <div className={styles.infoRow}>
            <div className={styles.infoContent}>
              <p className={styles.description}>
                View and manage all applicants with key details like experience, education, and current company.
                Track their progress through stages such as Added, Sourced, Pre-screening, and Assessment.
              </p>
              <div className={styles.legendRow}>
                {[
                  { label: "Added", dotClass: styles.dotAdded, textClass: styles.legendTextAdded },
                  { label: "Sourced", dotClass: styles.dotSourced, textClass: styles.legendTextSourced },
                  { label: "Pre-Screening", dotClass: styles.dotScreening, textClass: styles.legendTextScreening },
                  { label: "Assessment", dotClass: styles.dotAssessment, textClass: styles.legendTextAssessment },
                  { label: "Client Interview", dotClass: styles.dotInterview, textClass: styles.legendTextInterview },
                  { label: "Offer", dotClass: styles.dotOffer, textClass: styles.legendTextOffer },
                  { label: "Rejected", dotClass: styles.dotRejected, textClass: styles.legendTextRejected },
                ].map((item) => (
                  <span key={item.label} className={`${styles.legendItem} ${item.textClass}`}>
                    <span className={`${styles.legendDot} ${item.dotClass}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <button className={styles.addButton} onClick={handleAddCandidate}>
              <span className={styles.addIcon}>
                <FiPlus size={14} />
              </span>
              Add Candidate
            </button>
          </div>
        )}

        {showCandidateForm && (
          <div className={styles.formWrap}>
            <ReusableForm
              config={candidateConfig}
              onSubmit={handleCandidateSubmit}
              initialData={editingData}
            />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <CandidateFilterBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filterSource={filterSource}
              onFilterSourceChange={handleFilterSourceChange}
              filterRating={filterRating}
              onFilterRatingChange={handleFilterRatingChange}
              filterStage={filterStage}
              onFilterStageChange={handleFilterStageChange}
              filterStatus={filterStatus}
              onFilterStatusChange={handleFilterStatusChange}
              uniqueSources={uniqueSources}
              uniqueRatings={uniqueRatings}
              uniqueStages={uniqueStages}
              uniqueStatuses={uniqueStatuses}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />

            <div className={styles.tableWrap}>
              <table className={styles.candidateTable}>
                <thead>
                  <tr>
                    <th>Candidate Id</th>
                    <th>Candidate Name</th>
                    <th>Email Address</th>
                    <th>Modified Time</th>
                    <th>Source</th>
                    <th>Rating</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th className={styles.actionsCol}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={`${row.candidateId}-${index}`}>
                      <td>{row.candidateId}</td>
                      <td>{row.candidateName}</td>
                      <td>{row.candidateEmail}</td>
                      <td>{row.modifiedTime}</td>
                      <td>{row.source}</td>
                      <td>
                        <span className={styles.rating}>
                          {row.rating}
                          <FiStar className={styles.ratingStar} />
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.stagePill} ${getStageClass(row.stage)}`}>
                          {row.stage}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusPill} ${getStatusClass(row.status)}`}>
                          <span className={styles.statusDot} />
                          {row.status}
                        </span>
                      </td>
                      <td className={styles.actionsCol}>
                        <div className={styles.actionIcons}>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleViewCandidate(row)}
                            aria-label="View"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleEditCandidate(row, index)}
                            aria-label="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleDeleteCandidate(row, index)}
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
          </div>
        )}
      </div>

      {isViewDrawerOpen && selectedCandidate && (
        <div className={styles.viewDrawerOverlay} onClick={closeViewDrawer}>
          <aside className={styles.viewDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerProfile}>
                <div className={styles.drawerAvatar}>{selectedCandidate.firstName?.charAt(0) || "R"}</div>
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
              <button type="button" className={styles.drawerClose} onClick={closeViewDrawer} aria-label="Close panel">
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.pipelineRow}>
              {PIPELINE_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={`${styles.pipelineStep}${activePipelineStep === step ? ` ${styles.pipelineStepActive}` : ""}`}
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
                    className={`${styles.profileTab}${activeProfileTab === tab ? ` ${styles.profileTabActive}` : ""}`}
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
                    <span>{selectedMapOption ? `${selectedMapOption.id} (${selectedMapOption.company})` : "Search JD to Map"}</span>
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
                <button type="button" className={styles.mapJobBtn} onClick={handleMapJob} disabled={!mapJobValue}>
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
