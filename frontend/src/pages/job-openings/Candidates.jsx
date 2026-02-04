

import * as React from "react";
import {
  FiFilter,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiStar,
  FiEye,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";
import styles from "./Candidates.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import { candidateConfig } from "../../components/forms/formConfigs";
import { debounce } from "../../utils/debounce";


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

  const handleAddCandidate = React.useCallback(() => {
    setShowCandidateForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData(null);
  }, []);

  const handleViewCandidate = React.useCallback((row, index) => {
    console.log('View candidate:', row);
    alert('View candidate: ' + JSON.stringify(row, null, 2));
  }, []);

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
                            onClick={() => handleViewCandidate(row, index)}
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
    </div>
  );
}
