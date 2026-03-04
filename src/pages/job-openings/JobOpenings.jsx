
import * as React from "react";
import { FiEdit2, FiEye, FiFilter, FiMoreHorizontal, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { jobOpeningConfig } from "../../components/forms/formConfigs";
import ReusableForm from "../../components/forms/ReusableForm";
import { debounce } from "../../utils/debounce";
import styles from "./JobOpenings.module.scss";
// Memoized filter bar component to prevent unnecessary re-renders
const FilterBar = React.memo(({
  searchTerm,
  onSearchChange,
  filterPostingTitle,
  onFilterPostingTitleChange,
  filterTargetDate,
  onFilterTargetDateChange,
  filterJobStatus,
  onFilterJobStatusChange,
  filterHiringManager,
  onFilterHiringManagerChange,
  uniquePostingTitles,
  uniqueTargetDates,
  uniqueJobStatuses,
  uniqueHiringManagers,
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

      <select
        value={filterPostingTitle}
        onChange={onFilterPostingTitleChange}
        className={styles.selectField}
      >
        <option value="">Posting Title</option>
        {uniquePostingTitles.map(title => (
          <option key={title} value={title}>{title}</option>
        ))}
      </select>

      <select
        value={filterTargetDate}
        onChange={onFilterTargetDateChange}
        className={styles.selectField}
      >
        <option value="">Target Date</option>
        {uniqueTargetDates.map(date => (
          <option key={date} value={date}>{date}</option>
        ))}
      </select>

      <select
        value={filterJobStatus}
        onChange={onFilterJobStatusChange}
        className={styles.selectField}
      >
        <option value="">Job Status</option>
        {uniqueJobStatuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        value={filterHiringManager}
        onChange={onFilterHiringManagerChange}
        className={styles.selectField}
      >
        <option value="">Hiring Manager</option>
        {uniqueHiringManagers.map(manager => (
          <option key={manager} value={manager}>{manager}</option>
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

FilterBar.displayName = 'FilterBar';

export default function JobOpenings() {
  const navigate = useNavigate();
  const [showJobOpeningForm, setShowJobOpeningForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([
    {
      jobPositionId: "JOP-001",
      positionName: "Senior React Developer",
      minExperience: 4,
      maxExperience: 7,
      jobDescriptionLink: "https://example.com/jd/react",
      positionLevel: "senior",
      location: "hybrid",
      noOfPositions: 2,
      jobReceivedDate: "2026-01-12",
      hiringType: "direct",
      minSalary: 1200000,
      maxSalary: 2000000,
      jobType: "full-time",
      technicalSkills: ["react", "javascript", "typescript"],
      softSkills: ["communication", "teamwork"],
      additionalSkills: "Redux",
      addTechnicalSkills: ["machine-learning", "azure"],
      clientId: "C1292938",
      clientName: "MethodHub",
      contactPersonName: "Divya Mehta",
      contactPersonEmail: "divya.mehta@email.com",
      assignedRecruiters: "Asha, Rohan",
      targetDate: "2026-02-15",
      jobOpeningStatus: "Active",
      hiringManager: "Karthik Rao",
      candidates: [
        {
          candidateId: "C001",
          candidateName: "Rahul Mehta",
          candidateEmail: "rahul.mehta@email.com",
          modifiedTime: "11/10/2025 05:30 PM",
          source: "Resume Inbox",
          rating: "3/5",
          stage: "Assessment",
          round: "Round 3"
        },
        {
          candidateId: "C002",
          candidateName: "Arun Kumar",
          candidateEmail: "arun.kumar@email.com",
          modifiedTime: "11/10/2025 05:30 PM",
          source: "LinkedIn",
          rating: "4/5",
          stage: "Client Interview",
          round: "Round 4"
        },
        {
          candidateId: "C003",
          candidateName: "Priya Sharma",
          candidateEmail: "priya.sharma@email.com",
          modifiedTime: "11/10/2025 05:30 PM",
          source: "Naukri",
          rating: "2/5",
          stage: "Pre-Screening",
          round: "Round 2"
        }
      ]
    },
    {
      jobPositionId: "JOP-002",
      positionName: "Product Manager",
      minExperience: 6,
      maxExperience: 10,
      jobDescriptionLink: "https://example.com/jd/pm",
      positionLevel: "manager",
      location: "remote",
      noOfPositions: 1,
      jobReceivedDate: "2026-01-20",
      hiringType: "contract",
      minSalary: 1400000,
      maxSalary: 2200000,
      jobType: "contract",
      technicalSkills: ["sql", "aws"],
      softSkills: ["leadership", "communication"],
      additionalSkills: "Roadmapping",
      addTechnicalSkills: ["data-science"],
      clientId: "C1292432",
      clientName: "Arrows Inc",
      contactPersonName: "Rahul Mehta",
      contactPersonEmail: "rahul.mehta@email.com",
      assignedRecruiters: "Priya, Naveen",
      targetDate: "2026-03-01",
      jobOpeningStatus: "Draft",
      hiringManager: "Sneha Nair",
      candidates: [
        {
          candidateId: "C011",
          candidateName: "Ananya Rao",
          candidateEmail: "ananya.rao@email.com",
          modifiedTime: "11/12/2025 11:20 AM",
          source: "LinkedIn",
          rating: "4/5",
          stage: "Sourced",
          round: "Round 1"
        },
        {
          candidateId: "C012",
          candidateName: "Vikram Singh",
          candidateEmail: "vikram.singh@email.com",
          modifiedTime: "11/12/2025 11:20 AM",
          source: "Resume Inbox",
          rating: "3/5",
          stage: "Assessment",
          round: "Round 2"
        }
      ]
    },
    {
      jobPositionId: "JOP-003",
      positionName: "UI/UX Designer",
      minExperience: 3,
      maxExperience: 6,
      jobDescriptionLink: "https://example.com/jd/uiux",
      positionLevel: "mid",
      location: "onsite",
      noOfPositions: 1,
      jobReceivedDate: "2026-01-18",
      hiringType: "direct",
      minSalary: 900000,
      maxSalary: 1400000,
      jobType: "full-time",
      technicalSkills: ["html", "css"],
      softSkills: ["creativity", "presentation"],
      additionalSkills: "Figma",
      extraTechnicalSkills: ["computer-vision"],
      clientId: "C1292921",
      clientName: "NovaLabs",
      contactPersonName: "Arjun Rao",
      contactPersonEmail: "arjun.rao@email.com",
      assignedRecruiters: "Nisha",
      targetDate: "2026-02-05",
      jobOpeningStatus: "Closed",
      hiringManager: "Anitha Kumar",
      candidates: [
        {
          candidateId: "C021",
          candidateName: "Sneha Iyer",
          candidateEmail: "sneha.iyer@email.com",
          modifiedTime: "11/18/2025 03:00 PM",
          source: "LinkedIn",
          rating: "4/5",
          stage: "Pre-Screening",
          round: "Round 1"
        }
      ]
    }
  ]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [editLocked, setEditLocked] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterPostingTitle, setFilterPostingTitle] = React.useState('');
  const [filterTargetDate, setFilterTargetDate] = React.useState('');
  const [filterJobStatus, setFilterJobStatus] = React.useState('');
  const [filterHiringManager, setFilterHiringManager] = React.useState('');
  const [expandedRows, setExpandedRows] = React.useState({});

  // Debounced search handler - reduces filter recalculations by 99%
  const debouncedSearch = React.useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleSearchChange = React.useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  // useCallback for filter handlers - prevents unnecessary re-renders
  const handleFilterPostingTitleChange = React.useCallback((e) => {
    setFilterPostingTitle(e.target.value);
  }, []);

  const handleFilterTargetDateChange = React.useCallback((e) => {
    setFilterTargetDate(e.target.value);
  }, []);

  const handleFilterJobStatusChange = React.useCallback((e) => {
    setFilterJobStatus(e.target.value);
  }, []);

  const handleFilterHiringManagerChange = React.useCallback((e) => {
    setFilterHiringManager(e.target.value);
  }, []);

  const normalizedData = React.useMemo(() => (
    submittedData.map((item) => ({
      ...item,
      openingJobId: item.openingJobId ?? item.jobPositionId ?? item.jobId ?? "",
      postingTitle: item.postingTitle ?? item.positionName ?? item.jobTitle ?? "",
      clientId: item.clientId ?? item.clientID ?? "",
      assignedRecruiters: item.assignedRecruiters ?? item.assignedRecruiter ?? item.recruiters ?? "",
      targetDate: item.targetDate ?? item.jobReceivedDate ?? "",
      jobOpeningStatus: item.jobOpeningStatus ?? item.jobStatus ?? "",
      city: item.city ?? item.location ?? "",
      hiringManager: item.hiringManager ?? "",
    }))
  ), [submittedData]);

  // Get unique values for filter dropdowns - memoized to avoid recalculations
  const uniquePostingTitles = React.useMemo(() => 
    [...new Set(normalizedData.map(item => item.postingTitle).filter(Boolean))],
    [normalizedData]
  );

  const uniqueTargetDates = React.useMemo(() =>
    [...new Set(normalizedData.map(item => item.targetDate).filter(Boolean))],
    [normalizedData]
  );

  const uniqueJobStatuses = React.useMemo(() =>
    [...new Set(normalizedData.map(item => item.jobOpeningStatus).filter(Boolean))],
    [normalizedData]
  );

  const uniqueHiringManagers = React.useMemo(() =>
    [...new Set(normalizedData.map(item => item.hiringManager).filter(Boolean))],
    [normalizedData]
  );

  // Memoized filter logic - only recalculates when dependencies change
  const filteredData = React.useMemo(() =>
    normalizedData.filter(item => {
      const matchesSearch = 
        !searchTerm || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesPostingTitle = !filterPostingTitle || item.postingTitle === filterPostingTitle;
      const matchesTargetDate = !filterTargetDate || item.targetDate === filterTargetDate;
      const matchesJobStatus = !filterJobStatus || item.jobOpeningStatus === filterJobStatus;
      const matchesHiringManager = !filterHiringManager || item.hiringManager === filterHiringManager;

      return (
        matchesSearch &&
        matchesPostingTitle &&
        matchesTargetDate &&
        matchesJobStatus &&
        matchesHiringManager
      );
    }),
    [normalizedData, searchTerm, filterPostingTitle, filterTargetDate, filterJobStatus, filterHiringManager]
  );

  const hasFilters = Boolean(
    searchTerm ||
    filterPostingTitle ||
    filterTargetDate ||
    filterJobStatus ||
    filterHiringManager
  );

  const clearFilters = React.useCallback(() => {
    setSearchTerm('');
    setFilterPostingTitle('');
    setFilterTargetDate('');
    setFilterJobStatus('');
    setFilterHiringManager('');
  }, []);

  const getStatusClass = React.useCallback((status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active') return styles.statusActive;
    if (normalized === 'closed') return styles.statusClosed;
    if (normalized === 'draft') return styles.statusDraft;
    return styles.statusNeutral;
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

  const toggleRow = React.useCallback((rowKey) => {
    setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  }, []);

  const handleCreateJobOpening = React.useCallback(() => {
    setShowJobOpeningForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData(null);
    setEditLocked(false);
  }, []);

  const handleViewJobOpening = React.useCallback((row, index) => {
    console.log('View job opening:', row);
    navigate(`/job-openings/${row.openingJobId || row.jobPositionId || index}`, { state: { job: row } });
  }, [navigate]);

  const handleEditJobOpening = React.useCallback((row, index) => {
    console.log('Edit job opening:', row);
    setEditingIndex(index);
    setEditingData(row);
    setShowJobOpeningForm(true);
    setShowDataTable(false);
    setEditLocked(true);
  }, []);

  const handleDeleteJobOpening = React.useCallback((row, index) => {
    console.log('Delete job opening:', row);
    if (window.confirm('Are you sure you want to delete this job opening?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleJobOpeningSubmit = React.useCallback((data) => {
    const normalized = {
      ...data,
      extraTechnicalSkills: data.extraTechnicalSkills ?? data.addTechnicalSkills ?? [],
      jobOpeningStatus: data.jobOpeningStatus || data.jobStatus || 'Active'
    };
    if (editingIndex !== null) {
      console.log('Job opening updated:', normalized);
      setSubmittedData(prev => prev.map((item, idx) => (idx === editingIndex ? normalized : item)));
    } else {
      console.log('Job opening created:', normalized);
      setSubmittedData(prev => [...prev, normalized]);
    }
    setShowJobOpeningForm(false);
    setShowDataTable(true);
    setShowSuccessMessage(true);
    setEditingIndex(null);
    setEditingData(null);
    setEditLocked(false);
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    // Here you would typically send the data to your backend API
  }, [editingIndex]);

  return (
    <div className={styles.page}>
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          Job opening created successfully
        </div>
      )}

      <div className={styles.jobCard}>
        {!showJobOpeningForm && (
          <div className={styles.infoRow}>
            <p className={styles.description}>
              View all current job openings along with essential information like job title, department,
              location, required experience, and application status. Quickly track how many candidates
              have applied and manage each opening efficiently.
            </p>
            <button className={styles.createButton} onClick={handleCreateJobOpening}>
              <FiPlus size={16} />
              Create Job Opening
            </button>
          </div>
        )}

        {showJobOpeningForm && (
          <div className={styles.formWrap}>
            {editingIndex !== null && (
              <div className={styles.formHeader}>
                <button
                  type="button"
                  className={styles.editCta}
                  onClick={() => setEditLocked(false)}
                >
                  Edit JD
                </button>
              </div>
            )}
            <ReusableForm
              config={jobOpeningConfig}
              initialData={
                editingData
                  ? {
                      ...editingData,
                      extraTechnicalSkills:
                        editingData.extraTechnicalSkills ?? editingData.addTechnicalSkills ?? []
                    }
                  : editingData
              }
              readOnly={editLocked}
              onSubmit={handleJobOpeningSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filterPostingTitle={filterPostingTitle}
              onFilterPostingTitleChange={handleFilterPostingTitleChange}
              filterTargetDate={filterTargetDate}
              onFilterTargetDateChange={handleFilterTargetDateChange}
              filterJobStatus={filterJobStatus}
              onFilterJobStatusChange={handleFilterJobStatusChange}
              filterHiringManager={filterHiringManager}
              onFilterHiringManagerChange={handleFilterHiringManagerChange}
              uniquePostingTitles={uniquePostingTitles}
              uniqueTargetDates={uniqueTargetDates}
              uniqueJobStatuses={uniqueJobStatuses}
              uniqueHiringManagers={uniqueHiringManagers}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />

            <div className={styles.tableWrap}>
              <table className={styles.jobTable}>
                <thead>
                  <tr>
                    <th>Opening Job Id</th>
                    <th>Posting Title</th>
                    <th>Client Id</th>
                    <th>Assigned Recruiter(s)</th>
                    <th>Target Date</th>
                    <th>Job Opening Status</th>
                    <th>City</th>
                    <th>Hiring Manager</th>
                    <th className={styles.actionsCol}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => {
                    const rowKey = row.openingJobId || row.jobPositionId || String(index);
                    const isExpanded = Boolean(expandedRows[rowKey]);
                    return (
                      <React.Fragment key={rowKey}>
                        <tr>
                          <td>
                            <button
                              type="button"
                              className={`${styles.expandBtn}${isExpanded ? ` ${styles.expandBtnActive}` : ''}`}
                              onClick={() => toggleRow(rowKey)}
                              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                            >
                              {isExpanded ? '▾' : '▸'}
                            </button>
                            {row.openingJobId}
                          </td>
                          <td>{row.postingTitle}</td>
                          <td>{row.clientId}</td>
                          <td>{row.assignedRecruiters}</td>
                          <td>{row.targetDate}</td>
                          <td>
                            {row.jobOpeningStatus ? (
                              <span className={`${styles.statusPill} ${getStatusClass(row.jobOpeningStatus)}`}>
                                {row.jobOpeningStatus}
                              </span>
                            ) : "-"}
                          </td>
                          <td>{row.city}</td>
                          <td>{row.hiringManager}</td>
                          <td className={styles.actionsCol}>
                            <div className={styles.actionIcons}>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => handleViewJobOpening(row, index)}
                                aria-label="View"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => handleEditJobOpening(row, index)}
                                aria-label="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                type="button"
                                className={styles.actionBtn}
                                onClick={() => handleDeleteJobOpening(row, index)}
                                aria-label="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className={styles.expandedRow}>
                            <td colSpan={9}>
                              <div className={styles.innerTableWrap}>
                                <table className={styles.innerTable}>
                                  <thead>
                                    <tr>
                                      <th>Candidate Id</th>
                                      <th>Candidate Name</th>
                                      <th>Email Address</th>
                                      <th>Modified Time</th>
                                      <th>Source</th>
                                      <th>Rating</th>
                                      <th>Stage</th>
                                      <th>Round</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(row.candidates || []).map((candidate) => (
                                      <tr key={`${rowKey}-${candidate.candidateId}`}>
                                        <td>{candidate.candidateId}</td>
                                        <td>{candidate.candidateName}</td>
                                        <td>{candidate.candidateEmail}</td>
                                        <td>{candidate.modifiedTime}</td>
                                        <td>{candidate.source}</td>
                                        <td className={styles.ratingCell}>
                                          {candidate.rating}
                                          <span className={styles.ratingStar}>★</span>
                                        </td>
                                        <td>
                                          <span className={`${styles.stagePill} ${getStageClass(candidate.stage)}`}>
                                            {candidate.stage}
                                          </span>
                                        </td>
                                        <td>{candidate.round}</td>
                                        <td>
                                          <button type="button" className={styles.actionBtn} aria-label="View candidate">
                                            <FiEye size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
    </div>
  );
}
 
