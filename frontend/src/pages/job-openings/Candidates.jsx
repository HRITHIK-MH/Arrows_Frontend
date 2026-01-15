

import * as React from "react";
import styles from "./JobOpenings.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { candidateConfig } from "../../components/forms/formConfigs";


export default function Candidates() {
  const [showCandidateForm, setShowCandidateForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCandidatePosition, setFilterCandidatePosition] = React.useState('');
  const [filterCandidateStatus, setFilterCandidateStatus] = React.useState('');
  const [filterCandidateLocation, setFilterCandidateLocation] = React.useState('');

  // Get unique values for filter dropdowns
  const uniqueCandidatePositions = [...new Set(submittedData.map(item => item.candidatePosition).filter(Boolean))];
  const uniqueCandidateStatuses = [...new Set(submittedData.map(item => item.candidateStatus).filter(Boolean))];
  const uniqueCandidateLocations = [...new Set(submittedData.map(item => item.candidateLocation).filter(Boolean))];

  // Filter data based on search and filter criteria
  const filteredData = submittedData.filter(item => {
    const matchesSearch = 
      !searchTerm || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesCandidatePosition = !filterCandidatePosition || item.candidatePosition === filterCandidatePosition;
    const matchesCandidateStatus = !filterCandidateStatus || item.candidateStatus === filterCandidateStatus;
    const matchesCandidateLocation = !filterCandidateLocation || item.candidateLocation === filterCandidateLocation;

    return matchesSearch && matchesCandidatePosition && matchesCandidateStatus && matchesCandidateLocation;
  });

  const handleAddCandidate = () => {
    setShowCandidateForm(true);
    setShowDataTable(false);
  };

  const handleCandidateSubmit = (data) => {
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
  };

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
            <div className="col-8">
                {!showCandidateForm && (
                    <p className={styles.p}>
                        View and manage all candidates with key details like experience, education, and current company Track their progress through stages such as New, Shortlisted, Interview, Rejected, and Hired.
                    </p>
                )}
             </div>
            <div className="col-4" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {!showCandidateForm && (
                  <button className="button" data-icon="add-circle" onClick={handleAddCandidate}>
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
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minWidth: '200px',
                  fontSize: '14px'
                }}
              />

              {/* Applied Position Filter */}
              <select
                value={filterCandidatePosition}
                onChange={(e) => setFilterCandidatePosition(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
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
                onChange={(e) => setFilterCandidateStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
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
                onChange={(e) => setFilterCandidateLocation(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
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
                alignItems: 'center'
              }}>
                ⋯
              </button>
            </div>

            <h2>Candidates Data</h2>
            <DataTable data={filteredData} columns={candidateConfig.columns} />
          </div>
        )}
    </div>
  );
}
