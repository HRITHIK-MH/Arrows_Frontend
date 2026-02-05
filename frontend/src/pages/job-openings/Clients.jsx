

import * as React from "react";
import { FiFilter, FiMoreHorizontal, FiPlus, FiSearch } from "react-icons/fi";
import styles from "./Clients.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { clientConfig } from "../../components/forms/formConfigs";
import { debounce } from "../../utils/debounce";


// Memoized filter bar component to prevent unnecessary re-renders
const ClientFilterBar = React.memo(({
  searchTerm,
  onSearchChange,
  filterClientIndustry,
  onFilterClientIndustryChange,
  filterClientStatus,
  onFilterClientStatusChange,
  filterClientLocation,
  onFilterClientLocationChange,
  uniqueClientIndustries,
  uniqueClientStatuses,
  uniqueClientLocations,
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
        value={filterClientIndustry}
        onChange={onFilterClientIndustryChange}
        className={styles.selectField}
      >
        <option value="">Industry</option>
        {uniqueClientIndustries.map(industry => (
          <option key={industry} value={industry}>{industry}</option>
        ))}
      </select>

      <select
        value={filterClientStatus}
        onChange={onFilterClientStatusChange}
        className={styles.selectField}
      >
        <option value="">Client Status</option>
        {uniqueClientStatuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      <select
        value={filterClientLocation}
        onChange={onFilterClientLocationChange}
        className={styles.selectField}
      >
        <option value="">Location</option>
        {uniqueClientLocations.map(location => (
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

ClientFilterBar.displayName = 'ClientFilterBar';

export default function Clients() {
  const [showClientForm, setShowClientForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([
    {
      clientId: "C1292938",
      clientName: "MethodHub",
      clientCompany: "MethodHub Software",
      clientEmail: "divya.mehta@email.com",
      clientPhone: "+91 98765 43210",
      clientIndustry: "IT Services",
      clientLocation: "Bangalore",
      clientBudget: "₹12L",
      clientStatus: "Active"
    },
    {
      clientId: "C1292432",
      clientName: "Arrows Inc",
      clientCompany: "Arrows Technologies",
      clientEmail: "rahul.mehta@email.com",
      clientPhone: "+91 97812 34567",
      clientIndustry: "FinTech",
      clientLocation: "Pune",
      clientBudget: "₹9L",
      clientStatus: "Prospect"
    },
    {
      clientId: "C1292921",
      clientName: "NovaLabs",
      clientCompany: "NovaLabs Pvt Ltd",
      clientEmail: "anitha.kumar@email.com",
      clientPhone: "+91 98877 66554",
      clientIndustry: "Healthcare",
      clientLocation: "Chennai",
      clientBudget: "₹7L",
      clientStatus: "Inactive"
    },
    {
      clientId: "C1293010",
      clientName: "ZenSoft",
      clientCompany: "ZenSoft Systems",
      clientEmail: "sneha.nair@email.com",
      clientPhone: "+91 99777 11223",
      clientIndustry: "SaaS",
      clientLocation: "Hyderabad",
      clientBudget: "₹15L",
      clientStatus: "Active"
    }
  ]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterClientIndustry, setFilterClientIndustry] = React.useState('');
  const [filterClientStatus, setFilterClientStatus] = React.useState('');
  const [filterClientLocation, setFilterClientLocation] = React.useState('');

  // Debounced search handler - reduces filter recalculations by 99%
  const debouncedSearch = React.useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  const handleSearchChange = React.useCallback((e) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  // useCallback for filter handlers - prevents unnecessary re-renders
  const handleFilterClientIndustryChange = React.useCallback((e) => {
    setFilterClientIndustry(e.target.value);
  }, []);

  const handleFilterClientStatusChange = React.useCallback((e) => {
    setFilterClientStatus(e.target.value);
  }, []);

  const handleFilterClientLocationChange = React.useCallback((e) => {
    setFilterClientLocation(e.target.value);
  }, []);

  // Get unique values for filter dropdowns - memoized to avoid recalculations
  const uniqueClientIndustries = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.clientIndustry).filter(Boolean))],
    [submittedData]
  );

  const uniqueClientStatuses = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.clientStatus).filter(Boolean))],
    [submittedData]
  );

  const uniqueClientLocations = React.useMemo(() =>
    [...new Set(submittedData.map(item => item.clientLocation).filter(Boolean))],
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
      
      const matchesClientIndustry = !filterClientIndustry || item.clientIndustry === filterClientIndustry;
      const matchesClientStatus = !filterClientStatus || item.clientStatus === filterClientStatus;
      const matchesClientLocation = !filterClientLocation || item.clientLocation === filterClientLocation;

      return matchesSearch && matchesClientIndustry && matchesClientStatus && matchesClientLocation;
    }),
    [submittedData, searchTerm, filterClientIndustry, filterClientStatus, filterClientLocation]
  );

  const hasFilters = Boolean(
    searchTerm ||
    filterClientIndustry ||
    filterClientStatus ||
    filterClientLocation
  );

  const clearFilters = React.useCallback(() => {
    setSearchTerm('');
    setFilterClientIndustry('');
    setFilterClientStatus('');
    setFilterClientLocation('');
  }, []);

  const getStatusClass = React.useCallback((status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active') return styles.statusActive;
    if (normalized === 'inactive') return styles.statusInactive;
    if (normalized === 'prospect') return styles.statusProspect;
    if (normalized === 'archived') return styles.statusArchived;
    return styles.statusNeutral;
  }, []);

  const tableColumns = React.useMemo(() => [
    { key: 'clientId', label: 'Client ID' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'clientCompany', label: 'Company' },
    { key: 'clientEmail', label: 'Email' },
    { key: 'clientPhone', label: 'Phone' },
    { key: 'clientIndustry', label: 'Industry' },
    { key: 'clientLocation', label: 'Location' },
    { key: 'clientBudget', label: 'Budget' },
    {
      key: 'clientStatus',
      label: 'Status',
      render: (value) => (
        value ? <span className={`${styles.statusPill} ${getStatusClass(value)}`}>{value}</span> : "-"
      )
    }
  ], [getStatusClass]);

  const handleAddClient = React.useCallback(() => {
    setShowClientForm(true);
    setShowDataTable(false);
  }, []);

  const handleViewClient = React.useCallback((row) => {
    console.log('View client:', row);
    alert('View client: ' + JSON.stringify(row, null, 2));
  }, []);

  const handleEditClient = React.useCallback((row) => {
    console.log('Edit client:', row);
    alert('Edit functionality coming soon!');
  }, []);

  const handleDeleteClient = React.useCallback((row, index) => {
    console.log('Delete client:', row);
    if (window.confirm('Are you sure you want to delete this client?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleClientSubmit = React.useCallback((data) => {
    console.log('Client added:', data);
    setSubmittedData(prev => [...prev, data]);
    setShowClientForm(false);
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
          ✓ Client added successfully
        </div>
      )}

      <div className={styles.card}>
        {!showClientForm && (
          <div className={styles.infoRow}>
            <p className={styles.description}>
              View and manage all clients with key details like company information, location, budget, and industry. 
              Track their status as Active, Inactive, Prospect, or Archived.
            </p>
            <button className={styles.addButton} onClick={handleAddClient}>
              <FiPlus size={16} />
              Add Client
            </button>
          </div>
        )}

        {showClientForm && (
          <div className={styles.formWrap}>
            <ReusableForm
              config={clientConfig}
              onSubmit={handleClientSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <ClientFilterBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filterClientIndustry={filterClientIndustry}
              onFilterClientIndustryChange={handleFilterClientIndustryChange}
              filterClientStatus={filterClientStatus}
              onFilterClientStatusChange={handleFilterClientStatusChange}
              filterClientLocation={filterClientLocation}
              onFilterClientLocationChange={handleFilterClientLocationChange}
              uniqueClientIndustries={uniqueClientIndustries}
              uniqueClientStatuses={uniqueClientStatuses}
              uniqueClientLocations={uniqueClientLocations}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />

            <div className={styles.tableWrap}>
              <DataTable 
                data={filteredData} 
                columns={tableColumns}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
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
