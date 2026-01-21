

import * as React from "react";
import { FiFilter, FiMoreHorizontal, FiPlus, FiSearch } from "react-icons/fi";
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
  const [filterTargetDate, setFilterTargetDate] = React.useState('');
  const [filterJobStatus, setFilterJobStatus] = React.useState('');
  const [filterHiringManager, setFilterHiringManager] = React.useState('');

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

  // Get unique values for filter dropdowns
  const uniquePostingTitles = [...new Set(normalizedData.map(item => item.postingTitle).filter(Boolean))];
  const uniqueTargetDates = [...new Set(normalizedData.map(item => item.targetDate).filter(Boolean))];
  const uniqueJobStatuses = [...new Set(normalizedData.map(item => item.jobOpeningStatus).filter(Boolean))];
  const uniqueHiringManagers = [...new Set(normalizedData.map(item => item.hiringManager).filter(Boolean))];

  const filteredData = normalizedData.filter(item => {
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
  });

  const hasFilters = Boolean(
    searchTerm ||
    filterPostingTitle ||
    filterTargetDate ||
    filterJobStatus ||
    filterHiringManager
  );

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPostingTitle('');
    setFilterTargetDate('');
    setFilterJobStatus('');
    setFilterHiringManager('');
  };

  const getStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active') return styles.statusActive;
    if (normalized === 'closed') return styles.statusClosed;
    if (normalized === 'draft') return styles.statusDraft;
    return styles.statusNeutral;
  };

  const tableColumns = [
    { key: 'openingJobId', label: 'Opening Job Id' },
    { key: 'postingTitle', label: 'Posting Title' },
    { key: 'clientId', label: 'Client Id' },
    { key: 'assignedRecruiters', label: 'Assigned Recruiter(s)' },
    { key: 'targetDate', label: 'Target Date' },
    {
      key: 'jobOpeningStatus',
      label: 'Job Opening Status',
      render: (value) => (
        value ? <span className={`${styles.statusPill} ${getStatusClass(value)}`}>{value}</span> : "-"
      )
    },
    { key: 'city', label: 'City' },
    { key: 'hiringManager', label: 'Hiring Manager' }
  ];

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
    const normalized = {
      ...data,
      jobOpeningStatus: data.jobOpeningStatus || data.jobStatus || 'Active'
    };
    console.log('Job opening created:', normalized);
    setSubmittedData(prev => [...prev, normalized]);
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
            <ReusableForm
              config={jobOpeningConfig}
              onSubmit={handleJobOpeningSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <div className={styles.filtersBar}>
              <div className={styles.filtersLeft}>
                <FiFilter className={styles.filterIcon} aria-hidden="true" />
                <div className={styles.searchField}>
                  <FiSearch className={styles.searchIcon} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <select
                  value={filterPostingTitle}
                  onChange={(e) => setFilterPostingTitle(e.target.value)}
                  className={styles.selectField}
                >
                  <option value="">Posting Title</option>
                  {uniquePostingTitles.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>

                <select
                  value={filterTargetDate}
                  onChange={(e) => setFilterTargetDate(e.target.value)}
                  className={styles.selectField}
                >
                  <option value="">Target Date</option>
                  {uniqueTargetDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>

                <select
                  value={filterJobStatus}
                  onChange={(e) => setFilterJobStatus(e.target.value)}
                  className={styles.selectField}
                >
                  <option value="">Job Status</option>
                  {uniqueJobStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  value={filterHiringManager}
                  onChange={(e) => setFilterHiringManager(e.target.value)}
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
                  onClick={clearFilters}
                  disabled={!hasFilters}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <DataTable 
                data={filteredData} 
                columns={tableColumns}
                onView={handleViewJobOpening}
                onEdit={handleEditJobOpening}
                onDelete={handleDeleteJobOpening}
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
 
