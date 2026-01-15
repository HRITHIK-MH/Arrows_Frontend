

import * as React from "react";
import styles from "./JobOpenings.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { jobOpeningConfig } from "../../components/forms/formConfigs";


export default function JobOpenings() {
  const [showJobOpeningForm, setShowJobOpeningForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterPostingTitle, setFilterPostingTitle] = React.useState('');
  const [filterJobStatus, setFilterJobStatus] = React.useState('');
  const [filterHiringManager, setFilterHiringManager] = React.useState('');

  // Get unique values for filter dropdowns
  const uniquePostingTitles = [...new Set(submittedData.map(item => item.postingTitle).filter(Boolean))];
  const uniqueJobStatuses = [...new Set(submittedData.map(item => item.jobStatus).filter(Boolean))];
  const uniqueHiringManagers = [...new Set(submittedData.map(item => item.hiringManager).filter(Boolean))];

  // Filter data based on search and filter criteria
  const filteredData = submittedData.filter(item => {
    const matchesSearch = 
      !searchTerm || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesPostingTitle = !filterPostingTitle || item.postingTitle === filterPostingTitle;
    const matchesJobStatus = !filterJobStatus || item.jobStatus === filterJobStatus;
    const matchesHiringManager = !filterHiringManager || item.hiringManager === filterHiringManager;

    return matchesSearch && matchesPostingTitle && matchesJobStatus && matchesHiringManager;
  });

  const handleCreateJobOpening = () => {
    setShowJobOpeningForm(true);
    setShowDataTable(false);
  };

  const handleViewJobOpening = (row, index) => {
    console.log('View job opening:', row);
    alert('View job opening: ' + JSON.stringify(row, null, 2));
  };

  const handleEditJobOpening = (row, index) => {
    console.log('Edit job opening:', row);
    alert('Edit functionality coming soon!');
  };

  const handleDeleteJobOpening = (row, index) => {
    console.log('Delete job opening:', row);
    if (window.confirm('Are you sure you want to delete this job opening?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleJobOpeningSubmit = (data) => {
    console.log('Job opening created:', data);
    setSubmittedData(prev => [...prev, data]);
    setShowJobOpeningForm(false);
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
            ✓ Job opening created successfully
          </div>
        )}
        <div className="row">
            <div className="col-8" style={{ marginBottom: '16px' }}>
                {!showJobOpeningForm && (
                    <p className={styles.p} style={{ wordWrap: 'break-word' }}>
                        View and manage all applicants with key details like experience, education, and current company Track their progress through stages such as Added, Sourced, Pre-screening, and Assessment.
                    </p>
                )}
             </div>
            <div className="col-4" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {!showJobOpeningForm && (
                  <button className="button" data-icon="add-circle" onClick={handleCreateJobOpening} style={{ whiteSpace: 'nowrap' }}>
                    Create Job Opening
                  </button>
                )}
            </div>
        </div>

        {showJobOpeningForm && (
          <div style={{ marginTop: '30px' }}>
            <ReusableForm
              config={jobOpeningConfig}
              onSubmit={handleJobOpeningSubmit}
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
              flexWrap: 'wrap',
              justifyContent: 'space-between'
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
                  minWidth: '150px',
                  flex: '1 1 150px',
                  fontSize: '14px',
                  maxWidth: '100%'
                }}
              />

              {/* Posting Title Filter */}
              <select
                value={filterPostingTitle}
                onChange={(e) => setFilterPostingTitle(e.target.value)}
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
                <option value="">Posting Title</option>
                {uniquePostingTitles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>

              {/* Job Status Filter */}
              <select
                value={filterJobStatus}
                onChange={(e) => setFilterJobStatus(e.target.value)}
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
                <option value="">Job Status</option>
                {uniqueJobStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              {/* Hiring Manager Filter */}
              <select
                value={filterHiringManager}
                onChange={(e) => setFilterHiringManager(e.target.value)}
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
                <option value="">Hiring Manager</option>
                {uniqueHiringManagers.map(manager => (
                  <option key={manager} value={manager}>{manager}</option>
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

            <h2>Job Openings Data</h2>
            <DataTable 
              data={filteredData} 
              columns={jobOpeningConfig.columns}
              onView={handleViewJobOpening}
              onEdit={handleEditJobOpening}
              onDelete={handleDeleteJobOpening}
            />
          </div>
        )}
    </div>
  );
}
 

