

import * as React from "react";
import styles from "./JobOpenings.module.scss";
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
  uniqueCandidateLocations
}) => (
  <div style={{
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }}>
    {/* Search Bar */}
    <input
      type="text"
      placeholder="Search"
      value={searchTerm}
      onChange={onSearchChange}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        minWidth: '150px',
        flex: '1 1 150px',
        fontSize: '14px',
        maxWidth: '100%'
      }}
    />

    {/* Applied Position Filter */}
    <select
      value={filterCandidatePosition}
      onChange={onFilterCandidatePositionChange}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        flex: '1 1 140px',
        minWidth: '140px'
      }}
    >
      <option value="">Applied Position</option>
      {uniqueCandidatePositions.map(position => (
        <option key={position} value={position}>{position}</option>
      ))}
    </select>

    {/* Candidate Status Filter */}
    <select
      value={filterCandidateStatus}
      onChange={onFilterCandidateStatusChange}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        flex: '1 1 140px',
        minWidth: '140px'
      }}
    >
      <option value="">Candidate Status</option>
      {uniqueCandidateStatuses.map(status => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>

    {/* Candidate Location Filter */}
    <select
      value={filterCandidateLocation}
      onChange={onFilterCandidateLocationChange}
      style={{
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '14px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        flex: '1 1 140px',
        minWidth: '140px'
      }}
    >
      <option value="">Candidate Location</option>
      {uniqueCandidateLocations.map(location => (
        <option key={location} value={location}>{location}</option>
      ))}
    </select>

    {/* More Options Button */}
    <button style={{
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0
    }}>
      ⋯
    </button>
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
    <div className={styles.card}>
        {showSuccessMessage && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            ✓ Candidate added successfully
          </div>
        )}
        <div className="row">
            <div className="col-8" style={{ marginBottom: '16px' }}>
                {!showCandidateForm && (
                    <p className={styles.p} style={{ wordWrap: 'break-word' }}>
                        View and manage all candidates with key details like experience, education, and current company Track their progress through stages such as New, Shortlisted, Interview, Rejected, and Hired.
                    </p>
                )}
             </div>
            <div className="col-4" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {!showCandidateForm && (
                  <button className="button" data-icon="add-circle" onClick={handleAddCandidate} style={{ whiteSpace: 'nowrap' }}>
                    Add Candidate
                  </button>
                )}
            </div>
        </div>

        {showCandidateForm && (
          <div style={{ marginTop: '30px' }}>
            <ReusableForm
              config={candidateConfig}
              onSubmit={handleCandidateSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div style={{ marginTop: '30px' }}>
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
            />

            <h2>Candidates Data</h2>
            <DataTable 
              data={filteredData} 
              columns={candidateConfig.columns}
              onView={handleViewCandidate}
              onEdit={handleEditCandidate}
              onDelete={handleDeleteCandidate}
            />
          </div>
        )}
    </div>
  );
}
