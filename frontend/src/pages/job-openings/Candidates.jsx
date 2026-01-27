

import * as React from "react";
import { FiFilter, FiMoreHorizontal, FiPlus, FiSearch } from "react-icons/fi";
import styles from "./Candidates.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { candidateConfig } from "../../components/forms/formConfigs";
import { debounce } from "../../utils/debounce";


// Memoized filter bar component to prevent unnecessary re-renders
const CandidateFilterBar = React.memo(({
  searchTerm,
  onSearchChange,
  filterCandidatePosition,
  onFilterCandidatePositionChange,
  filterCandidateStatus,
  onFilterCandidateStatusChange,
  filterCandidateLocation,
  onFilterCandidateLocationChange,
  uniqueCandidatePositions,
  uniqueCandidateStatuses,
  uniqueCandidateLocations,
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
        value={filterCandidatePosition}
        onChange={onFilterCandidatePositionChange}
        className={styles.selectField}
      >
        <option value="">Applied Position</option>
        {uniqueCandidatePositions.map(position => (
          <option key={position} value={position}>{position}</option>
        ))}
      </select>

      <select
        value={filterCandidateStatus}
        onChange={onFilterCandidateStatusChange}
        className={styles.selectField}
      >
        <option value="">Candidate Status</option>
        {uniqueCandidateStatuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        value={filterCandidateLocation}
        onChange={onFilterCandidateLocationChange}
        className={styles.selectField}
      >
        <option value="">Candidate Location</option>
        {uniqueCandidateLocations.map(location => (
          <option key={location} value={location}>{location}</option>
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
  const [submittedData, setSubmittedData] = React.useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCandidatePosition, setFilterCandidatePosition] = React.useState('');
  const [filterCandidateStatus, setFilterCandidateStatus] = React.useState('');
  const [filterCandidateLocation, setFilterCandidateLocation] = React.useState('');

  // Debounced search handler - reduces filter recalculations by 99%
  const debouncedSearch = React.useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleSearchChange = React.useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  // useCallback for filter handlers - prevents unnecessary re-renders
  const handleFilterCandidatePositionChange = React.useCallback((e) => {
    setFilterCandidatePosition(e.target.value);
  }, []);

  const handleFilterCandidateStatusChange = React.useCallback((e) => {
    setFilterCandidateStatus(e.target.value);
  }, []);

  const handleFilterCandidateLocationChange = React.useCallback((e) => {
    setFilterCandidateLocation(e.target.value);
  }, []);

  // Get unique values for filter dropdowns - memoized to avoid recalculations
  const uniqueCandidatePositions = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.candidatePosition).filter(Boolean))],
    [submittedData]
  );

  const uniqueCandidateStatuses = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.candidateStatus).filter(Boolean))],
    [submittedData]
  );

  const uniqueCandidateLocations = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.candidateLocation).filter(Boolean))],
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
      
      const matchesCandidatePosition = !filterCandidatePosition || item.candidatePosition === filterCandidatePosition;
      const matchesCandidateStatus = !filterCandidateStatus || item.candidateStatus === filterCandidateStatus;
      const matchesCandidateLocation = !filterCandidateLocation || item.candidateLocation === filterCandidateLocation;

      return matchesSearch && matchesCandidatePosition && matchesCandidateStatus && matchesCandidateLocation;
    }),
    [submittedData, searchTerm, filterCandidatePosition, filterCandidateStatus, filterCandidateLocation]
  );

  const hasFilters = Boolean(
    searchTerm ||
    filterCandidatePosition ||
    filterCandidateStatus ||
    filterCandidateLocation
  );

  const clearFilters = React.useCallback(() => {
    setSearchTerm('');
    setFilterCandidatePosition('');
    setFilterCandidateStatus('');
    setFilterCandidateLocation('');
  }, []);

  const getStatusClass = React.useCallback((status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'new') return styles.statusNew;
    if (normalized === 'shortlisted') return styles.statusShortlisted;
    if (normalized === 'interview') return styles.statusInterview;
    if (normalized === 'rejected') return styles.statusRejected;
    if (normalized === 'hired') return styles.statusHired;
    return styles.statusNeutral;
  }, []);

  const tableColumns = React.useMemo(() => [
    { key: 'candidateId', label: 'Candidate ID' },
    { key: 'candidateName', label: 'Full Name' },
    { key: 'candidateEmail', label: 'Email' },
    { key: 'candidatePhone', label: 'Phone' },
    { key: 'candidatePosition', label: 'Applied Position' },
    { key: 'candidateExperience', label: 'Experience (Years)' },
    {
      key: 'candidateStatus',
      label: 'Status',
      render: (value) => (
        value ? <span className={`${styles.statusPill} ${getStatusClass(value)}`}>{value}</span> : "-"
      )
    },
    { key: 'candidateLocation', label: 'Location' }
  ], [getStatusClass]);

  const handleAddCandidate = React.useCallback(() => {
    setShowCandidateForm(true);
    setShowDataTable(false);
  }, []);

  const handleViewCandidate = React.useCallback((row, index) => {
    console.log('View candidate:', row);
    alert('View candidate: ' + JSON.stringify(row, null, 2));
  }, []);

  const handleEditCandidate = React.useCallback((row, index) => {
    console.log('Edit candidate:', row);
    alert('Edit functionality coming soon!');
  }, []);

  const handleDeleteCandidate = React.useCallback((row, index) => {
    console.log('Delete candidate:', row);
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleCandidateSubmit = React.useCallback((data) => {
    console.log('Candidate added:', data);
    setSubmittedData(prev => [...prev, data]);
    setShowCandidateForm(false);
    setShowDataTable(true);
    setShowSuccessMessage(true);
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    // Here you would typically send the data to your backend API
  }, []);

  return (
    <div className={styles.page}>
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          ✓ Candidate added successfully
        </div>
      )}

      <div className={styles.card}>
        {!showCandidateForm && (
          <div className={styles.infoRow}>
            <p className={styles.description}>
              View and manage all candidates with key details like experience, education, and current company. 
              Track their progress through stages such as New, Shortlisted, Interview, Rejected, and Hired.
            </p>
            <button className={styles.addButton} onClick={handleAddCandidate}>
              <FiPlus size={16} />
              Add Candidate
            </button>
          </div>
        )}

        {showCandidateForm && (
          <div className={styles.formWrap}>
            <ReusableForm
              config={candidateConfig}
              onSubmit={handleCandidateSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <CandidateFilterBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filterCandidatePosition={filterCandidatePosition}
              onFilterCandidatePositionChange={handleFilterCandidatePositionChange}
              filterCandidateStatus={filterCandidateStatus}
              onFilterCandidateStatusChange={handleFilterCandidateStatusChange}
              filterCandidateLocation={filterCandidateLocation}
              onFilterCandidateLocationChange={handleFilterCandidateLocationChange}
              uniqueCandidatePositions={uniqueCandidatePositions}
              uniqueCandidateStatuses={uniqueCandidateStatuses}
              uniqueCandidateLocations={uniqueCandidateLocations}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />

            <div className={styles.tableWrap}>
              <DataTable 
                data={filteredData} 
                columns={tableColumns}
                onView={handleViewCandidate}
                onEdit={handleEditCandidate}
                onDelete={handleDeleteCandidate}
              />
            </div>

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
        )}
      </div>
    </div>
  );
}
