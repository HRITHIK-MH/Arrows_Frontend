import * as React from "react";
import { FiArrowLeft, FiPlus, FiSearch } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "./JobDescription.module.scss";

  const fallbackJob = {
    openingJobId: "ZR_431212_JOB",
    postingTitle: "Senior Developer",
    minExperience: 5,
    maxExperience: 10,
  jobReceivedDate: "2025-09-15",
  clientId: "1298338",
    importance: "High Importance",
    candidates: [
      {
        candidateId: "C00123342",
        candidateName: "Ravi Patel",
        candidateEmail: "ravi.patel@example.com",
        recruiterName: "Parthiban",
        source: "Naukri",
        rating: "2/5",
        stage: "Pre-Screening",
        status: "In Progress",
      },
      {
        candidateId: "C00123342",
        candidateName: "Vikram Singh",
        candidateEmail: "vikram.singh@example.com",
        recruiterName: "Parthiban",
        source: "Resume Inbox",
        rating: "2/5",
        stage: "Pre-Screening",
        status: "In Progress",
      },
      {
        candidateId: "C00123342",
        candidateName: "Ananya Rao",
        candidateEmail: "ananya.rao@example.com",
        recruiterName: "Parthiban",
        source: "LinkedIn",
        rating: "3/5",
        stage: "Assessment",
        status: "Completed",
      },
    ],
  };

const stageTabs = [
  "Map Candidates",
  "Sourced",
  "Pre-Screening",
  "Assessment",
  "Client interview",
  "Offer",
];

const JobDescription = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { jobId } = useParams();
  const job = state?.job || fallbackJob;

  const [activeStage, setActiveStage] = React.useState("Sourced");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [candidateRows, setCandidateRows] = React.useState(job.candidates || []);

  const displayedRows = React.useMemo(() => {
    return candidateRows.filter((row) => {
      const matchesStage = activeStage === "Map Candidates" ? true : row.stage === activeStage;
      const matchesSearch =
        !searchTerm ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesStage && matchesSearch;
    });
  }, [candidateRows, activeStage, searchTerm]);

  const getStageClass = React.useCallback((stage) => {
    const normalized = String(stage || "").toLowerCase();
    if (normalized === "sourced") return styles.stageSourced;
    if (normalized === "pre-screening") return styles.stageScreening;
    if (normalized === "assessment") return styles.stageAssessment;
    if (normalized === "client interview") return styles.stageInterview;
    if (normalized === "offer") return styles.stageOffer;
    if (normalized === "rejected") return styles.stageRejected;
    return styles.stageNeutral;
  }, []);

  const handleMoveTo = (index, nextStage) => {
    setCandidateRows((prev) =>
      prev.map((row, idx) =>
        idx === index
          ? {
              ...row,
              stage: nextStage,
              status: nextStage === "Assessment" ? "Completed" : row.status,
            }
          : row
      )
    );
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
              <FiArrowLeft />
            </button>
            <div>
              <h2 className={styles.title}>Job Description</h2>
              <div className={styles.breadcrumb}>
                <span>Dashboard</span>
                <span className={styles.separator}>/</span>
                <span>Job List</span>
                <span className={styles.separator}>/</span>
                <span className={styles.current}>Job Description</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div className={styles.avatar}>Z</div>
            <div className={styles.jobMeta}>
              <div className={styles.jobId}>{job.openingJobId || jobId}</div>
              <div className={styles.jobSub}>
                <span>{job.postingTitle}</span>
                <span>•</span>
                <span>Exp: {job.minExperience || 0}-{job.maxExperience || 0}y</span>
                <span>•</span>
                <span>Created Date: {formatDate(job.jobReceivedDate)}</span>
              </div>
            </div>
            <div className={styles.tags}>
              <span className={styles.tagPrimary}>Client Id: {job.clientId || "1298338"}</span>
              <span className={styles.tagWarning}>{job.importance || "High Importance"}</span>
            </div>
          </div>

          <div className={styles.stageRow}>
            <div className={styles.stageTabs}>
              {stageTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.stageTab}${activeStage === tab ? ` ${styles.stageTabActive}` : ""}`}
                  onClick={() => setActiveStage(tab)}
                >
                  {tab}
                </button>
              ))}
              <button type="button" className={styles.addStageBtn} aria-label="Add stage">
                <FiPlus size={12} />
              </button>
            </div>
            <div className={styles.stageActions}>
              <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search Candidate to Map"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <button type="button" className={styles.mapBtn}>Map Job</button>
              <button type="button" className={styles.uploadBtn}>Upload Candidate</button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.candidateTable}>
              <thead>
                <tr>
                  <th>Candidate Id</th>
                  <th>Candidate Name</th>
                  <th>Email Address</th>
                  <th>Recruiter Name</th>
                  <th>Source</th>
                  <th>Rating</th>
                  <th>Stage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, index) => (
                  <tr key={`${row.candidateId}-${index}`}>
                    <td>{row.candidateId}</td>
                    <td>{row.candidateName}</td>
                    <td>{row.candidateEmail}</td>
                    <td>{row.recruiterName}</td>
                    <td>{row.source}</td>
                    <td className={styles.ratingCell}>
                      {row.rating}
                      <span className={styles.ratingStar}>★</span>
                    </td>
                    <td>
                      <span className={`${styles.stagePill} ${getStageClass(row.stage)}`}>{row.stage}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusDot} ${
                          row.status === "Completed" ? styles.statusGreen : styles.statusDark
                        }`}
                      />
                      {row.status}
                    </td>
                    <td>
                      <select
                        className={styles.moveSelect}
                        value=""
                        onChange={(event) => handleMoveTo(index, event.target.value)}
                      >
                        <option value="">Move to</option>
                        {stageTabs.filter((tab) => tab !== "Map Candidates").map((tab) => (
                          <option key={tab} value={tab}>
                            {tab}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.tableFooter}>
              <span>Show</span>
              <select className={styles.entriesSelect} defaultValue="10">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
