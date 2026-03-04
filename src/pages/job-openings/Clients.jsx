

import * as React from "react";
import {
  FiFilter,
  FiMail,
  FiMapPin,
  FiMoreHorizontal,
  FiPhone,
  FiPlus,
  FiSearch,
  FiUser,
  FiX
} from "react-icons/fi";
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
      clientStatus: "Active",
      contactEmail: "divya.mehta@email.com",
      contactNumber: "9876543210",
      primaryContactPerson: "Divya Mehta",
      secondaryContactPerson: "Rahul Mehta",
      accountManager: "Saravanan",
      activeFrom: "2026-01-15",
      comments: "Strategic client for engineering hiring"
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
      clientStatus: "Prospect",
      contactEmail: "rahul.mehta@email.com",
      contactNumber: "9781234567",
      primaryContactPerson: "Rahul Mehta",
      secondaryContactPerson: "Anita S",
      accountManager: "Parthiban",
      activeFrom: "2026-02-01",
      comments: "Awaiting final contract confirmation"
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
      clientStatus: "Inactive",
      contactEmail: "anitha.kumar@email.com",
      contactNumber: "9887766554",
      primaryContactPerson: "Anitha Kumar",
      secondaryContactPerson: "Srinidhi P",
      accountManager: "Sneha Nair",
      activeFrom: "2025-11-20",
      comments: "Paused requirements this quarter"
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
      clientStatus: "Active",
      contactEmail: "sneha.nair@email.com",
      contactNumber: "9977711223",
      primaryContactPerson: "Sneha Nair",
      secondaryContactPerson: "Vikram S",
      accountManager: "Arjun Rao",
      activeFrom: "2026-01-08",
      comments: "Rapid hiring plan in progress"
    }
  ]);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [successMessageText, setSuccessMessageText] = React.useState("Client added successfully");
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterClientIndustry, setFilterClientIndustry] = React.useState('');
  const [filterClientStatus, setFilterClientStatus] = React.useState('');
  const [filterClientLocation, setFilterClientLocation] = React.useState('');
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState(null);

  const formatPhoneNumber = React.useCallback((value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("+")) return raw;
    return `+91 ${raw}`;
  }, []);

  const normalizeClientRecord = React.useCallback((data) => {
    const contactEmail = data.contactEmail || data.clientEmail || "";
    const contactNumber = String(data.contactNumber || "").trim();
    const clientPhoneSource = data.clientPhone || contactNumber;

    return {
      ...data,
      clientId: data.clientId || "",
      clientName: data.clientName || "",
      clientCompany: data.clientCompany || data.clientName || "Client",
      clientEmail: data.clientEmail || contactEmail,
      clientPhone: formatPhoneNumber(clientPhoneSource),
      clientIndustry: data.clientIndustry || "IT Services",
      clientLocation: data.clientLocation || "Bangalore",
      clientBudget: data.clientBudget || "₹0",
      clientStatus: data.clientStatus || "Active",
      contactEmail,
      contactNumber,
      primaryContactPerson: data.primaryContactPerson || "",
      secondaryContactPerson: data.secondaryContactPerson || "",
      accountManager: data.accountManager || "",
      activeFrom: data.activeFrom || "",
      comments: data.comments || "",
    };
  }, [formatPhoneNumber]);

  const mapClientToFormData = React.useCallback((row) => ({
    clientId: row.clientId || "",
    clientName: row.clientName || "",
    contactEmail: row.contactEmail || row.clientEmail || "",
    contactNumber: String(row.contactNumber || row.clientPhone || "").replace(/^\+91\s?/, "").trim(),
    primaryContactPerson: row.primaryContactPerson || "",
    secondaryContactPerson: row.secondaryContactPerson || "",
    accountManager: row.accountManager || "",
    activeFrom: row.activeFrom || "",
    comments: row.comments || "",
  }), []);

  React.useEffect(() => {
    if (!isViewDrawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewDrawerOpen]);

  React.useEffect(() => {
    if (!isViewDrawerOpen) return undefined;
    const onEsc = (event) => {
      if (event.key === "Escape") setIsViewDrawerOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isViewDrawerOpen]);

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
    setEditingIndex(null);
    setEditingData(null);
  }, []);

  const handleViewClient = React.useCallback((row) => {
    console.log('View client:', row);
    setSelectedClient(normalizeClientRecord(row));
    setIsViewDrawerOpen(true);
  }, [normalizeClientRecord]);

  const handleEditClient = React.useCallback((row, index) => {
    console.log('Edit client:', row);
    setEditingIndex(index);
    setEditingData(mapClientToFormData(row));
    setShowClientForm(true);
    setShowDataTable(false);
  }, [mapClientToFormData]);

  const handleDeleteClient = React.useCallback((row, index) => {
    console.log('Delete client:', row);
    if (window.confirm('Are you sure you want to delete this client?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleClientSubmit = React.useCallback((data) => {
    const normalized = normalizeClientRecord(data);
    const isEditMode = editingIndex !== null;
    console.log(isEditMode ? 'Client updated:' : 'Client added:', normalized);

    setSubmittedData(prev => (
      isEditMode
        ? prev.map((item, idx) => (idx === editingIndex ? { ...item, ...normalized } : item))
        : [...prev, normalized]
    ));

    setShowClientForm(false);
    setShowDataTable(true);
    setEditingIndex(null);
    setEditingData(null);
    setSuccessMessageText(isEditMode ? "Client updated successfully" : "Client added successfully");
    setShowSuccessMessage(true);
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    // Here you would typically send the data to your backend API
  }, [editingIndex, normalizeClientRecord]);

  const closeViewDrawer = React.useCallback(() => {
    setIsViewDrawerOpen(false);
  }, []);

  return (
    <div className={styles.page}>
      {showSuccessMessage && (
        <div className={styles.successMessage}>
          ✓ {successMessageText}
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
              initialData={editingData}
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

      {isViewDrawerOpen && selectedClient && (
        <div className={styles.viewDrawerOverlay} onClick={closeViewDrawer}>
          <aside className={styles.viewDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerIdentity}>
                <div className={styles.drawerAvatar}>
                  {selectedClient.clientName?.charAt(0) || "C"}
                </div>
                <div>
                  <h3>{selectedClient.clientName}</h3>
                  <p>{selectedClient.clientCompany}</p>
                </div>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={closeViewDrawer}
                aria-label="Close panel"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.drawerMeta}>
              <span><FiMail size={12} /> {selectedClient.contactEmail || "-"}</span>
              <span><FiPhone size={12} /> {selectedClient.clientPhone || "-"}</span>
              <span><FiMapPin size={12} /> {selectedClient.clientLocation || "-"}</span>
            </div>

            <div className={styles.drawerGrid}>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Client ID</span>
                <span className={styles.drawerValue}>{selectedClient.clientId || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Industry</span>
                <span className={styles.drawerValue}>{selectedClient.clientIndustry || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Status</span>
                <span className={`${styles.statusPill} ${getStatusClass(selectedClient.clientStatus)}`}>
                  {selectedClient.clientStatus || "-"}
                </span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Budget</span>
                <span className={styles.drawerValue}>{selectedClient.clientBudget || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Primary Contact</span>
                <span className={styles.drawerValue}>{selectedClient.primaryContactPerson || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Secondary Contact</span>
                <span className={styles.drawerValue}>{selectedClient.secondaryContactPerson || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Account Manager</span>
                <span className={styles.drawerValue}>{selectedClient.accountManager || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Active From</span>
                <span className={styles.drawerValue}>{selectedClient.activeFrom || "-"}</span>
              </div>
            </div>

            <div className={styles.drawerNote}>
              <span className={styles.drawerLabel}>
                <FiUser size={12} /> Comments / Remarks
              </span>
              <p>{selectedClient.comments || "No remarks available."}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
