import * as React from "react";
import { FiArrowLeft, FiCheck, FiEye, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { buildMeetingFromPreScreening, upsertMeeting } from "../../utils/meetingStore";
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

const pipelineStages = stageTabs.filter((tab) => tab !== "Map Candidates");
const TEAM_OPTIONS = ["Java Team", "JD 1", "Python Team"];
const DURATION_OPTIONS = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];
const PANEL_OPTIONS = ["Panel Name 1", "Panel Name 2", "Panel Name 3"];
const PLATFORM_OPTIONS = ["Microsoft Teams", "Google Meet", "Zoom"];
const DUMMY_SOURCED_CANDIDATE = {
  rowId: "dummy-sourced-candidate-1",
  candidateId: "C009901",
  candidateName: "Demo Sourced Candidate",
  candidateEmail: "demo.sourced@example.com",
  recruiterName: "Parthiban",
  source: "Added by User",
  rating: "3/5",
  matchingScore: 88,
  stage: "Sourced",
  status: "In Progress",
};

const normalizeStage = (stage) => {
  const safeStage = String(stage || "").trim();
  if (!safeStage) return "Sourced";

  const matchedStage = pipelineStages.find(
    (tab) => tab.toLowerCase() === safeStage.toLowerCase()
  );

  return matchedStage || safeStage;
};

const getPreScreeningInitialState = (rowId) => ({
  open: true,
  rowId,
  step: 1,
  scheduleMode: "panel",
  assignTeam: "",
  duration: "",
  scheduleDateTime: "",
  panelName: "",
  comments: "",
  confirmTime: false,
  platform: "",
  meetingLink: "",
  password: "",
  sendInvite: true,
});

const JobDescription = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { jobId } = useParams();
  const job = state?.job || fallbackJob;
  const uploadInputRef = React.useRef(null);

  const preparedRows = React.useMemo(() => {
    const normalizedRows = (job.candidates || []).map((row, index) => ({
      ...row,
      rowId: row.rowId || `${row.candidateId || "cand"}-${index}`,
      recruiterName: row.recruiterName || job.hiringManager || "Parthiban",
      source: row.source || "Resume Inbox",
      stage: normalizeStage(row.stage),
      status:
        row.status ||
        (normalizeStage(row.stage) === "Assessment" ? "Completed" : "In Progress"),
      matchingScore:
        typeof row.matchingScore === "number"
          ? row.matchingScore
          : Math.max(65, 92 - index * 5),
    }));

    const hasSourcedCandidate = normalizedRows.some(
      (row) => normalizeStage(row.stage) === "Sourced"
    );

    return hasSourcedCandidate
      ? normalizedRows
      : [...normalizedRows, { ...DUMMY_SOURCED_CANDIDATE }];
  }, [job.candidates, job.hiringManager]);

  const [activeStage, setActiveStage] = React.useState("Map Candidates");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [candidateRows, setCandidateRows] = React.useState(preparedRows);
  const [selectedRowIds, setSelectedRowIds] = React.useState([]);
  const [uploadedCandidateFileName, setUploadedCandidateFileName] = React.useState("");
  const [preScreeningModal, setPreScreeningModal] = React.useState(null);
  const [stageMoveToast, setStageMoveToast] = React.useState("");

  const displayedRows = React.useMemo(() => {
    return candidateRows.filter((row) => {
        const rowStage = normalizeStage(row.stage);
        const matchesStage =
          activeStage === "Map Candidates"
            ? rowStage !== "Sourced"
            : activeStage === "Sourced"
            ? rowStage === "Sourced"
            : rowStage.toLowerCase() === activeStage.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        return matchesStage && matchesSearch;
      });
  }, [candidateRows, activeStage, searchTerm]);

  const isMapStage = activeStage === "Map Candidates";
  const isSourcedStage = activeStage === "Sourced";
  const isPreScreeningStage = activeStage === "Pre-Screening";

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

  const handleMoveTo = (rowId, nextStage) => {
    const normalizedNextStage = normalizeStage(nextStage);
    if (!normalizedNextStage) return;

    if (isSourcedStage && normalizedNextStage === "Pre-Screening") {
      setPreScreeningModal(getPreScreeningInitialState(rowId));
      return;
    }

    setCandidateRows((prev) =>
      prev.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              stage: normalizedNextStage,
              status: normalizedNextStage === "Assessment" ? "Completed" : row.status,
            }
          : row
      )
    );
  };

  const closePreScreeningModal = React.useCallback(() => {
    setPreScreeningModal(null);
  }, []);

  const updatePreScreeningModal = React.useCallback((key, value) => {
    setPreScreeningModal((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const commitPreScreeningMove = React.useCallback(() => {
    if (!preScreeningModal?.rowId) return;

    const selectedCandidate = candidateRows.find((row) => row.rowId === preScreeningModal.rowId);

    setCandidateRows((prev) =>
      prev.map((row) =>
        row.rowId === preScreeningModal.rowId
          ? {
              ...row,
              stage: "Pre-Screening",
              status: "In Progress",
            }
          : row
      )
    );

    const nextMeeting = buildMeetingFromPreScreening({
      candidate: selectedCandidate,
      job,
      formData: preScreeningModal,
    });
    if (nextMeeting) {
      upsertMeeting(nextMeeting);
    }

    setActiveStage("Pre-Screening");
    setSearchTerm("");
    setPreScreeningModal(null);
    setStageMoveToast("Candidate Moved Pre-Screening");
  }, [candidateRows, job, preScreeningModal]);

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

    setCandidateRows((prev) =>
      prev.map((row) =>
        selectedRowIds.includes(row.rowId)
          ? { ...row, stage: normalizeStage("Sourced"), status: "In Progress" }
          : row
      )
    );
    setActiveStage("Sourced");
    setSearchTerm("");
    setSelectedRowIds([]);
  }, [selectedRowIds]);

  React.useEffect(() => {
    if (!stageMoveToast) return undefined;
    const timer = window.setTimeout(() => setStageMoveToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [stageMoveToast]);

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

  const isPanelMode = preScreeningModal?.scheduleMode === "panel";
  const isStepOneValid = Boolean(
    preScreeningModal &&
      (isPanelMode
        ? preScreeningModal.assignTeam && preScreeningModal.duration
        : preScreeningModal.scheduleDateTime &&
          preScreeningModal.panelName &&
          preScreeningModal.confirmTime)
  );
  const isStepTwoValid = Boolean(
    preScreeningModal &&
      preScreeningModal.platform &&
      preScreeningModal.meetingLink &&
      preScreeningModal.sendInvite
  );

  return (
    <div className={styles.page}>
      {stageMoveToast ? (
        <div className={styles.stageMoveToast}>
          <span className={styles.toastIcon}>
            <FiCheck size={14} />
          </span>
          <span className={styles.toastText}>{stageMoveToast}</span>
        </div>
      ) : null}
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
                          onChange={(event) => handleMoveTo(row.rowId, event.target.value)}
                          disabled={isPreScreeningStage}
                        >
                          <option value="">Move to</option>
                          {pipelineStages.map((tab) => (
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

      {preScreeningModal?.open ? (
        <div className={styles.preScreenOverlay} onClick={closePreScreeningModal}>
          <div className={styles.preScreenModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.preScreenHeader}>
              <h3 className={styles.preScreenTitle}>Pre-Screening</h3>
              <button
                type="button"
                className={styles.preScreenClose}
                onClick={closePreScreeningModal}
                aria-label="Close pre-screening modal"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.preScreenStepper}>
              <div className={styles.preStep}>
                <span
                  className={`${styles.preStepCircle} ${
                    preScreeningModal.step === 1 ? styles.preStepCircleActive : styles.preStepCircleComplete
                  }`}
                >
                  {preScreeningModal.step === 1 ? <span className={styles.preStepDot} /> : <FiCheck size={12} />}
                </span>
                <span className={styles.preStepLabel}>Checking Availability</span>
              </div>
              <div
                className={`${styles.preStepLine} ${
                  preScreeningModal.step === 2 ? styles.preStepLineActive : ""
                }`}
              />
              <div className={styles.preStep}>
                <span
                  className={`${styles.preStepCircle} ${
                    preScreeningModal.step === 2 ? styles.preStepCircleActive : ""
                  }`}
                >
                  {preScreeningModal.step === 2 ? <span className={styles.preStepDot} /> : null}
                </span>
                <span
                  className={`${styles.preStepLabel} ${
                    preScreeningModal.step === 2 ? styles.preStepLabelActive : ""
                  }`}
                >
                  Schedule Interview
                </span>
              </div>
            </div>

            {preScreeningModal.step === 1 ? (
              <div className={styles.preScreenBody}>
                <div className={styles.preFieldLabel}>
                  Schedule the interview <span className={styles.requiredStar}>*</span>
                </div>
                <div className={styles.preRadioRow}>
                  <label className={styles.preRadioLabel}>
                    <input
                      type="radio"
                      name="scheduleMode"
                      checked={preScreeningModal.scheduleMode === "panel"}
                      onChange={() => updatePreScreeningModal("scheduleMode", "panel")}
                    />
                    Checking panel availability
                  </label>
                  <label className={styles.preRadioLabel}>
                    <input
                      type="radio"
                      name="scheduleMode"
                      checked={preScreeningModal.scheduleMode === "manual"}
                      onChange={() => updatePreScreeningModal("scheduleMode", "manual")}
                    />
                    Selecting date & time manually
                  </label>
                </div>

                {isPanelMode ? (
                  <div className={styles.preFieldGrid}>
                    <div className={styles.preFieldGroup}>
                      <label className={styles.preFieldLabel}>
                        Assign Team <span className={styles.requiredStar}>*</span>
                      </label>
                      <select
                        value={preScreeningModal.assignTeam}
                        onChange={(event) => updatePreScreeningModal("assignTeam", event.target.value)}
                      >
                        <option value="">Select Team</option>
                        {TEAM_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.preFieldGroup}>
                      <label className={styles.preFieldLabel}>
                        Duration <span className={styles.requiredStar}>*</span>
                      </label>
                      <select
                        value={preScreeningModal.duration}
                        onChange={(event) => updatePreScreeningModal("duration", event.target.value)}
                      >
                        <option value="">Select Duration</option>
                        {DURATION_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.preFieldGrid}>
                      <div className={styles.preFieldGroup}>
                        <label className={styles.preFieldLabel}>
                          Select Date & Time <span className={styles.requiredStar}>*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={preScreeningModal.scheduleDateTime}
                          onChange={(event) =>
                            updatePreScreeningModal("scheduleDateTime", event.target.value)
                          }
                        />
                      </div>
                      <div className={styles.preFieldGroup}>
                        <label className={styles.preFieldLabel}>
                          Panel Name <span className={styles.requiredStar}>*</span>
                        </label>
                        <select
                          value={preScreeningModal.panelName}
                          onChange={(event) => updatePreScreeningModal("panelName", event.target.value)}
                        >
                          <option value="">Panel Name</option>
                          {PANEL_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label className={styles.preCheckLabel}>
                      <input
                        type="checkbox"
                        checked={preScreeningModal.confirmTime}
                        onChange={(event) =>
                          updatePreScreeningModal("confirmTime", event.target.checked)
                        }
                      />
                      I confirm that all panel members have agreed to the interview time
                    </label>
                  </>
                )}

                <div className={styles.preFieldGroup}>
                  <label className={styles.preFieldLabel}>Comments / Remarks</label>
                  <textarea
                    rows={3}
                    value={preScreeningModal.comments}
                    onChange={(event) => updatePreScreeningModal("comments", event.target.value)}
                  />
                </div>

                <div className={styles.preActionRow}>
                  <button
                    type="button"
                    className={`${styles.preBtn} ${styles.preBtnPrimary}`}
                    onClick={commitPreScreeningMove}
                    disabled={!isPanelMode || !isStepOneValid}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className={`${styles.preBtn} ${styles.preBtnSecondary}`}
                    onClick={() => updatePreScreeningModal("step", 2)}
                    disabled={isPanelMode || !isStepOneValid}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    className={`${styles.preBtn} ${styles.preBtnGhost}`}
                    onClick={closePreScreeningModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.preScreenBody}>
                <div className={styles.preFieldGrid}>
                  <div className={styles.preFieldGroup}>
                    <label className={styles.preFieldLabel}>
                      Platform <span className={styles.requiredStar}>*</span>
                    </label>
                    <select
                      value={preScreeningModal.platform}
                      onChange={(event) => updatePreScreeningModal("platform", event.target.value)}
                    >
                      <option value="">Select Platform</option>
                      {PLATFORM_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.preFieldGroup}>
                    <label className={styles.preFieldLabel}>
                      Meeting Link <span className={styles.requiredStar}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter meeting link"
                      value={preScreeningModal.meetingLink}
                      onChange={(event) => updatePreScreeningModal("meetingLink", event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.preFieldGroup}>
                  <label className={styles.preFieldLabel}>Password</label>
                  <input
                    type="text"
                    placeholder="Meeting Password"
                    value={preScreeningModal.password}
                    onChange={(event) => updatePreScreeningModal("password", event.target.value)}
                  />
                </div>

                <label className={styles.preCheckLabel}>
                  <input
                    type="checkbox"
                    checked={preScreeningModal.sendInvite}
                    onChange={(event) => updatePreScreeningModal("sendInvite", event.target.checked)}
                  />
                  All selected members will receive the invitation.
                </label>

                <div className={styles.preActionRow}>
                  <button
                    type="button"
                    className={`${styles.preBtn} ${styles.preBtnPrimary}`}
                    onClick={commitPreScreeningMove}
                    disabled={!isStepTwoValid}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className={`${styles.preBtn} ${styles.preBtnSecondary}`}
                    onClick={() => updatePreScreeningModal("step", 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className={`${styles.preBtn} ${styles.preBtnGhost}`}
                    onClick={closePreScreeningModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default JobDescription;
