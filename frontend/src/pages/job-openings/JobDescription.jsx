import * as React from "react";
import { FiArrowLeft, FiEye, FiPlus, FiSearch } from "react-icons/fi";
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
        matchingScore: 92,
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
        matchingScore: 90,
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
        matchingScore: 85,
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
  const uploadInputRef = React.useRef(null);

  const preparedRows = React.useMemo(
    () =>
      (job.candidates || []).map((row, index) => ({
        ...row,
        rowId: row.rowId || `${row.candidateId || "cand"}-${index}`,
        recruiterName: row.recruiterName || job.hiringManager || "Parthiban",
        source: row.source || "Resume Inbox",
        stage: row.stage || "Sourced",
        status: row.status || (row.stage === "Assessment" ? "Completed" : "In Progress"),
        matchingScore:
          typeof row.matchingScore === "number"
            ? row.matchingScore
            : Math.max(65, 92 - index * 5),
      })),
    [job.candidates, job.hiringManager]
  );

  const [activeStage, setActiveStage] = React.useState("Map Candidates");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [candidateRows, setCandidateRows] = React.useState(preparedRows);
  const [selectedRowIds, setSelectedRowIds] = React.useState(() =>
    preparedRows.map((row) => row.rowId)
  );
  const [approvedRowIds, setApprovedRowIds] = React.useState([]);
  const [uploadedCandidateFileName, setUploadedCandidateFileName] = React.useState("");

  const displayedRows = React.useMemo(() => {
    return candidateRows
      .map((row) =>
        activeStage === "Sourced"
          ? {
              ...row,
              stage: "Sourced",
            }
          : row
      )
      .filter((row) => {
        const matchesStage =
          activeStage === "Map Candidates"
            ? true
            : activeStage === "Sourced"
            ? approvedRowIds.includes(row.rowId)
            : row.stage === activeStage;
        const matchesSearch =
          !searchTerm ||
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        return matchesStage && matchesSearch;
      });
  }, [candidateRows, activeStage, searchTerm, approvedRowIds]);

  const isMapStage = activeStage === "Map Candidates";
  const isSourcedStage = activeStage === "Sourced";
  const hasApprovedCandidates = approvedRowIds.length > 0;

  const allMapRowsSelected =
    isMapStage &&
    displayedRows.length > 0 &&
    displayedRows.every((row) => selectedRowIds.includes(row.rowId));

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

  const handleCandidateEyeClick = React.useCallback((row) => {
    setActiveStage("Map Candidates");
    setSearchTerm(row.candidateName || row.candidateId || "");
  }, []);

  const handleRowCheckboxChange = React.useCallback((rowId) => {
    setSelectedRowIds((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  }, []);

  const handleSelectAllMapRows = React.useCallback(() => {
    const visibleRowIds = displayedRows.map((row) => row.rowId);
    if (visibleRowIds.length === 0) return;

    setSelectedRowIds((prev) => {
      const allVisibleSelected = visibleRowIds.every((rowId) => prev.includes(rowId));
      if (allVisibleSelected) {
        return prev.filter((rowId) => !visibleRowIds.includes(rowId));
      }
      return Array.from(new Set([...prev, ...visibleRowIds]));
    });
  }, [displayedRows]);

  const handleApproveMappedCandidates = React.useCallback(() => {
    if (selectedRowIds.length === 0) return;

    setApprovedRowIds((prev) => Array.from(new Set([...prev, ...selectedRowIds])));
    setCandidateRows((prev) =>
      prev.map((row) =>
        selectedRowIds.includes(row.rowId)
          ? { ...row, stage: "Sourced", status: "In Progress" }
          : row
      )
    );
    setActiveStage("Sourced");
    setSearchTerm("");
  }, [selectedRowIds]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadFileChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    setUploadedCandidateFileName(file.name);
  };

  const getScoreCircleStyle = (score) => {
    const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    return {
      background: `conic-gradient(#f97316 ${safeScore * 3.6}deg, #e2e8f0 0deg)`,
    };
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
                (() => {
                  const isSourcedLocked = tab === "Sourced" && !hasApprovedCandidates;
                  return (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.stageTab}${activeStage === tab ? ` ${styles.stageTabActive}` : ""}${isSourcedLocked ? ` ${styles.stageTabDisabled}` : ""}`}
                  onClick={() => {
                    if (!isSourcedLocked) setActiveStage(tab);
                  }}
                  disabled={isSourcedLocked}
                >
                  {tab}
                </button>
                  );
                })()
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
              <button type="button" className={styles.mapBtn} disabled={!isMapStage}>
                Map Job
              </button>
              <button type="button" className={styles.uploadBtn} onClick={handleUploadClick}>
                Upload Candidate
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                className={styles.hiddenFileInput}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={handleUploadFileChange}
              />
              {uploadedCandidateFileName ? (
                <span className={styles.uploadedFileName} title={uploadedCandidateFileName}>
                  {uploadedCandidateFileName}
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table
              className={`${styles.candidateTable}${isMapStage ? ` ${styles.candidateTableMapped}` : ""}`}
            >
              <thead>
                <tr>
                  {isMapStage ? (
                    <th className={styles.checkboxHead}>
                      <input
                        type="checkbox"
                        checked={allMapRowsSelected}
                        onChange={handleSelectAllMapRows}
                        className={styles.rowCheckbox}
                        aria-label="Select all candidates"
                      />
                    </th>
                  ) : null}
                  <th>Candidate Id</th>
                  <th>Candidate Name</th>
                  <th>Email Address</th>
                  <th>Recruiter Name</th>
                  <th>Source</th>
                  {isMapStage ? <th>Matching Score</th> : <th>Rating</th>}
                  {!isMapStage ? <th>Stage</th> : null}
                  {!isMapStage ? <th>Status</th> : null}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, index) => (
                  <tr key={row.rowId || `${row.candidateId}-${index}`}>
                    {isMapStage ? (
                      <td className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          checked={selectedRowIds.includes(row.rowId)}
                          onChange={() => handleRowCheckboxChange(row.rowId)}
                          className={styles.rowCheckbox}
                          aria-label={`Select ${row.candidateName}`}
                        />
                      </td>
                    ) : null}
                    <td>{row.candidateId}</td>
                    <td>{row.candidateName}</td>
                    <td>{row.candidateEmail}</td>
                    <td>{row.recruiterName}</td>
                    <td>{row.source}</td>
                    {isMapStage ? (
                      <td className={styles.matchScoreCell}>
                        <span className={styles.matchScoreWrap} style={getScoreCircleStyle(row.matchingScore)}>
                          <span className={styles.matchScoreInner}>{row.matchingScore}%</span>
                        </span>
                      </td>
                    ) : (
                      <td className={styles.ratingCell}>
                        {row.rating}
                        <span className={styles.ratingStar}>★</span>
                      </td>
                    )}
                    {!isMapStage ? (
                      <td className={styles.stageCell}>
                        <span className={`${styles.stagePill} ${getStageClass(row.stage)}`}>{row.stage}</span>
                      </td>
                    ) : null}
                    {!isMapStage ? (
                      <td>
                        <span
                          className={`${styles.statusDot} ${
                            row.status === "Completed" ? styles.statusGreen : styles.statusDark
                          }`}
                        />
                        {row.status}
                      </td>
                    ) : null}
                    <td className={isMapStage ? styles.actionsCell : styles.actionsCellWide}>
                      {isMapStage ? (
                        <button
                          type="button"
                          className={styles.eyeActionBtn}
                          onClick={() => handleCandidateEyeClick(row)}
                          aria-label="View mapped candidate"
                        >
                          <FiEye size={16} />
                        </button>
                      ) : (
                        <select
                          className={`${styles.moveSelect}${isSourcedStage ? ` ${styles.moveSelectWide}` : ""}`}
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
                      )}
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
          {isMapStage ? (
            <div className={styles.approvalFooter}>
              <button
                type="button"
                className={styles.approveBtn}
                onClick={handleApproveMappedCandidates}
                disabled={selectedRowIds.length === 0}
              >
                Approve
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
