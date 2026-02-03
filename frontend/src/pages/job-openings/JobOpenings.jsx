

import * as React from "react";
import { FiFilter, FiMoreHorizontal, FiPlus, FiSearch } from "react-icons/fi";
import styles from "./JobOpenings.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import StepProgressBar from "../../components/StepProgressBar";
import { jobOpeningConfig } from "../../components/forms/formConfigs";
import { debounce } from "../../utils/debounce";


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
      clientId: "C1292938",
      clientName: "MethodHub",
      contactPersonName: "Divya Mehta",
      contactPersonEmail: "divya.mehta@email.com",
      assignedRecruiters: "Asha, Rohan",
      targetDate: "2026-02-15",
      jobOpeningStatus: "Active",
      hiringManager: "Karthik Rao"
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
      clientId: "C1292432",
      clientName: "Arrows Inc",
      contactPersonName: "Rahul Mehta",
      contactPersonEmail: "rahul.mehta@email.com",
      assignedRecruiters: "Priya, Naveen",
      targetDate: "2026-03-01",
      jobOpeningStatus: "Draft",
      hiringManager: "Sneha Nair"
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
      clientId: "C1292921",
      clientName: "NovaLabs",
      contactPersonName: "Arjun Rao",
      contactPersonEmail: "arjun.rao@email.com",
      assignedRecruiters: "Nisha",
      targetDate: "2026-02-05",
      jobOpeningStatus: "Closed",
      hiringManager: "Anitha Kumar"
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
  const [showRecruitmentPipeline, setShowRecruitmentPipeline] = React.useState(true);

  // Recruitment pipeline steps
  const recruitmentSteps = React.useMemo(() => [
    { label: 'Job Posted' },
    { label: 'Screening' },
    { label: 'Interviews' },
    { label: 'Final Review' },
    { label: 'Offer Stage' }
  ], []);

  // Mock data for pipeline stages (in real app, this would come from API)
  const pipelineData = React.useMemo(() => ({
    'Senior React Developer': 2,
    'Product Manager': 1,
    'UI/UX Designer': 3,
    'Backend Engineer': 2,
    'DevOps Engineer': 1
  }), []);

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

  const tableColumns = React.useMemo(() => [
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
  ], [getStatusClass]);

  const handleCreateJobOpening = React.useCallback(() => {
    setShowJobOpeningForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData(null);
    setEditLocked(false);
  }, []);

  const handleViewJobOpening = React.useCallback((row, index) => {
    console.log('View job opening:', row);
    alert('View job opening: ' + JSON.stringify(row, null, 2));
  }, []);

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
              initialData={editingData}
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
 
