import React from 'react';
import { FiChevronDown, FiFilter, FiSearch } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import './ApplicationForm.css';

const JOB_OPENING_TABLE_STORAGE_KEY = 'job-openings:table:v1';

const FALLBACK_JOB_OPENINGS = [
  {
    jobPositionId: 'JOP-001',
    positionName: 'Senior React Developer',
    candidates: [
      {
        candidateId: 'C001',
        candidateName: 'Raghul Mehta',
        candidateEmail: 'raghul.mehta@email.com',
        modifiedTime: '11/10/2025 05:30 PM',
        stage: 'Sourced',
        status: 'In Progress',
      },
      {
        candidateId: 'C002',
        candidateName: 'Priya Sharma',
        candidateEmail: 'priya.sharma@email.com',
        modifiedTime: '11/10/2025 05:30 PM',
        stage: 'Pre-Screening',
        status: 'In Progress',
      },
    ],
  },
  {
    jobPositionId: 'JOP-002',
    positionName: 'Product Manager',
    candidates: [
      {
        candidateId: 'C003',
        candidateName: 'Arjun Rao',
        candidateEmail: 'arjun.rao@email.com',
        modifiedTime: '11/10/2025 05:30 PM',
        stage: 'Assessment',
        status: 'Completed',
      },
      {
        candidateId: 'C004',
        candidateName: 'Sneha Nair',
        candidateEmail: 'sneha.nair@email.com',
        modifiedTime: '11/10/2025 05:30 PM',
        stage: 'Client Interview',
        status: 'In Progress',
      },
    ],
  },
];

const resolveJobId = (job) => job?.jobPositionId || job?.openingJobId || job?.jobId || '-';
const resolveJobTitle = (job) => job?.positionName || job?.postingTitle || '-';

const resolveCandidateStatus = (candidate) => {
  const explicitStatus = String(candidate?.status || candidate?.candidateStatus || '').trim();
  if (explicitStatus) return explicitStatus;

  const normalizedStage = String(candidate?.stage || '').trim().toLowerCase();
  if (!normalizedStage) return 'In Progress';
  if (normalizedStage.includes('reject')) return 'Rejected';
  if (normalizedStage.includes('offer') || normalizedStage.includes('hired')) return 'Completed';
  if (normalizedStage.includes('assessment')) return 'Completed';
  return 'In Progress';
};

const buildApplicationRows = (jobOpenings) => {
  const rows = [];

  jobOpenings.forEach((job) => {
    const jobId = resolveJobId(job);
    const jobTitle = resolveJobTitle(job);
    const candidates = Array.isArray(job?.candidates) ? job.candidates : [];

    candidates.forEach((candidate, index) => {
      rows.push({
        id: `${jobId}-${candidate?.candidateId || index + 1}-${index}`,
        candidateId: candidate?.candidateId || '-',
        candidateName: candidate?.candidateName || '-',
        candidateEmail: candidate?.candidateEmail || '-',
        appliedJobId: jobId,
        appliedJobTitle: jobTitle,
        appliedOn: candidate?.modifiedTime || '-',
        stage: candidate?.stage || '-',
        status: resolveCandidateStatus(candidate),
      });
    });
  });

  return rows;
};

const loadJobOpenings = () => {
  if (typeof window === 'undefined') return FALLBACK_JOB_OPENINGS;

  try {
    const savedData = window.localStorage.getItem(JOB_OPENING_TABLE_STORAGE_KEY);
    const parsedData = savedData ? JSON.parse(savedData) : null;
    if (Array.isArray(parsedData) && parsedData.length > 0) {
      return parsedData;
    }
  } catch (error) {
    console.error('Failed to load job openings for applications page:', error);
  }

  return FALLBACK_JOB_OPENINGS;
};

const ApplicationForm = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterJob, setFilterJob] = React.useState('');
  const [filterStage, setFilterStage] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [applicationRows, setApplicationRows] = React.useState(() =>
    buildApplicationRows(loadJobOpenings())
  );

  React.useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await API.get('applications');
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (!rows.length) return;

        const normalized = rows.map((row, index) => ({
          id: String(row?.id || row?.applicationId || `application-${index + 1}`),
          candidateId: row?.candidateId || row?.candidate?.candidateId || '-',
          candidateName:
            row?.candidateName ||
            row?.candidate?.candidateName ||
            row?.candidate?.name ||
            '-',
          candidateEmail:
            row?.candidateEmail ||
            row?.candidate?.candidateEmail ||
            row?.candidate?.email ||
            '-',
          appliedJobId: row?.jobId || row?.openingJobId || row?.jobPositionId || '-',
          appliedJobTitle: row?.jobTitle || row?.postingTitle || row?.positionName || '-',
          appliedOn: row?.appliedOn || row?.createdAt || '-',
          stage: row?.stage || '-',
          status: resolveCandidateStatus(row),
        }));

        setApplicationRows(normalized);
      } catch (error) {
        // Keep existing local fallback rows.
      }
    };

    loadApplications();
  }, []);

  React.useEffect(() => {
    const handleStorageUpdate = () => {
      setApplicationRows(buildApplicationRows(loadJobOpenings()));
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const uniqueJobs = React.useMemo(() => {
    return [...new Set(applicationRows.map((row) => row.appliedJobTitle).filter(Boolean))];
  }, [applicationRows]);

  const uniqueStages = React.useMemo(() => {
    return [...new Set(applicationRows.map((row) => row.stage).filter(Boolean))];
  }, [applicationRows]);

  const uniqueStatuses = React.useMemo(() => {
    return [...new Set(applicationRows.map((row) => row.status).filter(Boolean))];
  }, [applicationRows]);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    return applicationRows.filter((row) => {
      const matchesSearch = !normalizedQuery
        ? true
        : [row.candidateId, row.candidateName, row.candidateEmail, row.appliedJobId, row.appliedJobTitle]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery);

      const matchesJob = filterJob ? row.appliedJobTitle === filterJob : true;
      const matchesStage = filterStage ? row.stage === filterStage : true;
      const matchesStatus = filterStatus ? row.status === filterStatus : true;

      return matchesSearch && matchesJob && matchesStage && matchesStatus;
    });
  }, [applicationRows, searchTerm, filterJob, filterStage, filterStatus]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterJob, filterStage, filterStatus, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / entriesPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * entriesPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + entriesPerPage);

  const hasFilters = Boolean(searchTerm || filterJob || filterStage || filterStatus);
  const clearFilters = () => {
    setSearchTerm('');
    setFilterJob('');
    setFilterStage('');
    setFilterStatus('');
  };

  const getStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized.includes('completed')) return 'status-completed';
    if (normalized.includes('progress')) return 'status-progress';
    return 'status-default';
  };

  const getStageClass = (stage) => {
    const normalized = String(stage || '').toLowerCase();
    if (normalized.includes('sourced')) return 'stage-sourced';
    if (normalized.includes('screen')) return 'stage-screening';
    if (normalized.includes('assessment')) return 'stage-assessment';
    if (normalized.includes('interview')) return 'stage-interview';
    return 'stage-default';
  };

  const endRow = Math.min(startIndex + entriesPerPage, filteredRows.length);
  const startRowDisplay = filteredRows.length === 0 ? 0 : startIndex + 1;

  return (
    <div className="applications-page">
      <div className="applications-summary-card">
        <p className="applications-summary-title">
          Manage applications and track which candidates are mapped to each job opening.
        </p>
        <div className="applications-legend">
          {uniqueStages.slice(0, 5).map((stage) => (
            <span key={stage} className={`legend-item ${getStageClass(stage)}`}>
              <span className="legend-dot" />
              {stage}
            </span>
          ))}
        </div>
      </div>

      <div className="applications-filter-bar">
        <div className="applications-filter-left">
          <FiFilter className="filter-icon" aria-hidden="true" />
          <div className="applications-search-wrap">
            <FiSearch className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="applications-search"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="applications-filter-right">
          <div className="select-wrap">
            <select value={filterJob} onChange={(event) => setFilterJob(event.target.value)}>
              <option value="">Select Job</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-icon" aria-hidden="true" />
          </div>

          <div className="select-wrap">
            <select value={filterStage} onChange={(event) => setFilterStage(event.target.value)}>
              <option value="">Select Stage</option>
              {uniqueStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-icon" aria-hidden="true" />
          </div>

          <div className="select-wrap">
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="">Select Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-icon" aria-hidden="true" />
          </div>

          <button type="button" className="clear-btn" onClick={clearFilters} disabled={!hasFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className="applications-table-wrap">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Candidate Id</th>
              <th>Candidate Name</th>
              <th>Email Address</th>
              <th>Applied Job Id</th>
              <th>Applied Job Title</th>
              <th>Applied On</th>
              <th>Stage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.candidateId}</td>
                  <td>{row.candidateName}</td>
                  <td>{row.candidateEmail}</td>
                  <td>{row.appliedJobId}</td>
                  <td>{row.appliedJobTitle}</td>
                  <td>{row.appliedOn}</td>
                  <td>
                    <span className={`stage-pill ${getStageClass(row.stage)}`}>{row.stage}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(row.status)}`}>{row.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="applications-empty">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="applications-footer">
        <div className="entries-wrap">
          <span>Show</span>
          <div className="entries-select-wrap">
            <select
              value={entriesPerPage}
              onChange={(event) => setEntriesPerPage(Number(event.target.value))}
            >
              {[10, 25, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <FiChevronDown className="select-icon" aria-hidden="true" />
          </div>
          <span>entries ({startRowDisplay}-{endRow} of {filteredRows.length})</span>
        </div>

        <div className="pagination-wrap">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
          >
            {'<'}
          </button>
          <span className="pagination-current">{safeCurrentPage}</span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage === totalPages}
          >
            {'>'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;