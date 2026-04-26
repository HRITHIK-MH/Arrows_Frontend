import * as React from "react";
import { FiChevronDown, FiMail, FiMapPin, FiPhone, FiTrash2, FiUser, FiX } from "react-icons/fi";
import DataTable from "../../components/forms/DataTable";
import { clientConfig } from "../../components/forms/formConfigs";
import ReusableForm from "../../components/forms/ReusableForm";
import styles from "./Clients.module.scss";

const CLIENT_DRAFT_STORAGE_KEY = "clients:add-draft:v1";
const createClientDraftId = () => `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const initialClients = [
  {
    clientId: "CL001",
    clientName: "ABC Technologies",
    contactNumber: "9876543210",
    contactEmail: "contact@abctech.com",
    primaryContactPerson: "Rajesh Kumar",
    secondaryContactPerson: "Neha Kapoor",
    accountManager: "Neha Verma",
    activeFrom: "2024-01-01",
    clientStatus: "Active",
    comments: "Enterprise account focused on Java and cloud hiring.",
    clientLocation: "Bangalore",
  },
  {
    clientId: "CL002",
    clientName: "Nova Solutions",
    contactNumber: "9876543211",
    contactEmail: "hr@novasolutions.com",
    primaryContactPerson: "Priya Sharma",
    secondaryContactPerson: "Amit Shah",
    accountManager: "Arun Kumar",
    activeFrom: "2024-02-15",
    clientStatus: "Active",
    comments: "Scaling product and QA hiring this quarter.",
    clientLocation: "Pune",
  },
  {
    clientId: "CL003",
    clientName: "PixelSoft Pvt Ltd",
    contactNumber: "9876543212",
    contactEmail: "careers@pixelsoft.com",
    primaryContactPerson: "Anil Mehta",
    secondaryContactPerson: "Ritika Jain",
    accountManager: "Sneha Iyer",
    activeFrom: "2024-03-10",
    clientStatus: "Active",
    comments: "Hiring for UI and backend roles.",
    clientLocation: "Chennai",
  },
  {
    clientId: "CL004",
    clientName: "FinEdge Systems",
    contactNumber: "9876543213",
    contactEmail: "hr@finedge.com",
    primaryContactPerson: "Kavita Rao",
    secondaryContactPerson: "Rohan Das",
    accountManager: "Vikram Singh",
    activeFrom: "2024-04-25",
    clientStatus: "On Hold",
    comments: "Paused due to budget approval cycle.",
    clientLocation: "Mumbai",
  },
  {
    clientId: "CL005",
    clientName: "CloudNet Corp",
    contactNumber: "9876543214",
    contactEmail: "contact@cloudnet.com",
    primaryContactPerson: "Suresh Nair",
    secondaryContactPerson: "Ira Menon",
    accountManager: "Karthik M",
    activeFrom: "2024-05-05",
    clientStatus: "Active",
    comments: "Critical roles in DevOps and SRE.",
    clientLocation: "Hyderabad",
  },
  {
    clientId: "CL006",
    clientName: "Insight Labs",
    contactNumber: "9876543215",
    contactEmail: "hr@insightlabs.com",
    primaryContactPerson: "Ananya Rao",
    secondaryContactPerson: "Pooja Mehta",
    accountManager: "Pooja Mehta",
    activeFrom: "2024-06-18",
    clientStatus: "Inactive",
    comments: "No active requirement at the moment.",
    clientLocation: "Coimbatore",
  },
  {
    clientId: "CL007",
    clientName: "CodeBase Solutions",
    contactNumber: "9876543216",
    contactEmail: "jobs@codebase.com",
    primaryContactPerson: "Rohit Verma",
    secondaryContactPerson: "Neha Gupta",
    accountManager: "Ravi Patel",
    activeFrom: "2024-07-01",
    clientStatus: "Active",
    comments: "Long-term hiring partnership.",
    clientLocation: "Delhi",
  },
  {
    clientId: "CL008",
    clientName: "BrandHive Digital",
    contactNumber: "9876543217",
    contactEmail: "hello@brandhive.com",
    primaryContactPerson: "Neha Gupta",
    secondaryContactPerson: "Aarav Sharma",
    accountManager: "Sneha Iyer",
    activeFrom: "2024-08-12",
    clientStatus: "On Hold",
    comments: "Campaign hiring delayed until next release.",
    clientLocation: "Noida",
  },
];

export default function Clients() {
  const [showClientForm, setShowClientForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState(initialClients);
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [successMessageText, setSuccessMessageText] = React.useState("Client added successfully");
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [clientDrafts, setClientDrafts] = React.useState([]);
  const [activeDraftId, setActiveDraftId] = React.useState(null);
  const [isAddClientMenuOpen, setIsAddClientMenuOpen] = React.useState(false);
  const [clientFormKey, setClientFormKey] = React.useState(0);
  const addClientMenuRef = React.useRef(null);

  const showTransientMessage = React.useCallback((message) => {
    setSuccessMessageText(message);
    setShowSuccessMessage(true);
    window.setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  }, []);

  const formatPhoneNumber = React.useCallback((value) => {
    const raw = String(value || "").replace(/\D/g, "");
    if (!raw) return "-";
    if (raw.length <= 10) return `+91 ${raw}`;
    return `+${raw}`;
  }, []);

  const formatDate = React.useCallback((value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const normalizeClientRecord = React.useCallback((data) => {
    const contactEmail = data.contactEmail || "";
    const contactNumber = String(data.contactNumber || "").trim();

    return {
      ...data,
      clientId: data.clientId || "",
      clientName: data.clientName || "",
      contactEmail,
      contactNumber,
      primaryContactPerson: data.primaryContactPerson || "",
      secondaryContactPerson: data.secondaryContactPerson || "",
      accountManager: data.accountManager || "",
      activeFrom: data.activeFrom || "",
      comments: data.comments || "",
      clientStatus: data.clientStatus || "Active",
      clientLocation: data.clientLocation || "-",
    };
  }, []);

  const mapClientToFormData = React.useCallback((row) => ({
    clientId: row.clientId || "",
    clientName: row.clientName || "",
    contactEmail: row.contactEmail || "",
    contactNumber: String(row.contactNumber || "").replace(/^\+91\s?/, "").trim(),
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

  const sanitizeDraftValue = React.useCallback((value) => {
    if (value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map((item) => sanitizeDraftValue(item));
    if (typeof value !== "object") return value;
    if (value instanceof Date) return value.toISOString();
    if (typeof File !== "undefined" && value instanceof File) return value.name;
    if (typeof Blob !== "undefined" && value instanceof Blob) return "blob";

    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      acc[key] = sanitizeDraftValue(nestedValue);
      return acc;
    }, {});
  }, []);

  const persistClientDrafts = React.useCallback((drafts) => {
    localStorage.setItem(CLIENT_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  }, []);

  const getClientDrafts = React.useCallback(() => {
    try {
      const rawDrafts = localStorage.getItem(CLIENT_DRAFT_STORAGE_KEY);
      if (!rawDrafts) return [];
      const parsedDrafts = JSON.parse(rawDrafts);
      if (!Array.isArray(parsedDrafts)) return [];
      return parsedDrafts
        .filter((draft) => draft && typeof draft === "object" && draft.id)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    } catch (error) {
      console.error("Failed to read client drafts:", error);
      return [];
    }
  }, []);

  React.useEffect(() => {
    setClientDrafts(getClientDrafts());
  }, [getClientDrafts]);

  React.useEffect(() => {
    if (!isAddClientMenuOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (addClientMenuRef.current && !addClientMenuRef.current.contains(event.target)) {
        setIsAddClientMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isAddClientMenuOpen]);

  React.useEffect(() => {
    if (!isViewDrawerOpen) return undefined;
    const onEsc = (event) => {
      if (event.key === "Escape") setIsViewDrawerOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isViewDrawerOpen]);

  const getStatusClass = React.useCallback((status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "active") return styles.statusActive;
    if (normalized === "inactive") return styles.statusInactive;
    if (normalized === "on hold") return styles.statusOnHold;
    return styles.statusNeutral;
  }, []);

  const tableColumns = React.useMemo(
    () => [
      { key: "clientId", label: "Client Id" },
      { key: "clientName", label: "Client Name" },
      {
        key: "contactNumber",
        label: "Contact Number",
        render: (value) => formatPhoneNumber(value),
      },
      { key: "contactEmail", label: "Contact Email Address" },
      { key: "primaryContactPerson", label: "Contact Person" },
      {
        key: "activeFrom",
        label: "Active From",
        render: (value) => formatDate(value),
      },
      { key: "accountManager", label: "Assigned Person" },
      {
        key: "clientStatus",
        label: "Status",
        render: (value) => (
          <span className={`${styles.statusPill} ${getStatusClass(value)}`}>{value || "-"}</span>
        ),
      },
    ],
    [formatDate, formatPhoneNumber, getStatusClass]
  );

  const totalRecords = submittedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / entriesPerPage));

  const generateNextClientId = React.useCallback(() => {
    const maxNumericId = submittedData.reduce((maxValue, item) => {
      const matched = String(item?.clientId || "").match(/(\d+)/);
      const parsed = matched ? Number.parseInt(matched[1], 10) : Number.NaN;
      if (!Number.isFinite(parsed)) return maxValue;
      return parsed > maxValue ? parsed : maxValue;
    }, 0);

    const nextNumericId = maxNumericId + 1;
    return `CL${String(nextNumericId).padStart(3, "0")}`;
  }, [submittedData]);

  React.useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return submittedData.slice(startIndex, startIndex + entriesPerPage).map((item, offset) => ({
      ...item,
      _sourceIndex: startIndex + offset,
    }));
  }, [currentPage, entriesPerPage, submittedData]);

  const pageNumbers = React.useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const startEntry = totalRecords === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalRecords);

  const handleEntriesPerPageChange = React.useCallback((event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  }, []);

  const handlePageChange = React.useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePreviousPage = React.useCallback(() => {
    setCurrentPage((previousPage) => Math.max(previousPage - 1, 1));
  }, []);

  const handleNextPage = React.useCallback(() => {
    setCurrentPage((previousPage) => Math.min(previousPage + 1, totalPages));
  }, [totalPages]);

  const handleAddClient = React.useCallback(() => {
    setShowClientForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData({ clientId: generateNextClientId() });
    setActiveDraftId(null);
    setClientFormKey((prev) => prev + 1);
    setIsAddClientMenuOpen(false);
  }, [generateNextClientId]);

  const openClientForm = React.useCallback((draftData = null, draftId = null) => {
    setShowClientForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData({
      ...(draftData ? { ...draftData } : {}),
      clientId: String(draftData?.clientId || "").trim() || generateNextClientId(),
    });
    setActiveDraftId(draftId);
    setClientFormKey((prev) => prev + 1);
    setIsAddClientMenuOpen(false);
  }, [generateNextClientId]);

  const handleAddClientMenuToggle = React.useCallback(() => {
    setClientDrafts(getClientDrafts());
    setIsAddClientMenuOpen((prev) => !prev);
  }, [getClientDrafts]);

  const getClientDraftTitle = React.useCallback((formData, fallbackCount) => {
    if (formData?.clientName) return String(formData.clientName);
    if (formData?.clientId) return `Client ${formData.clientId}`;
    if (formData?.contactEmail) return String(formData.contactEmail);
    return `Untitled Draft ${fallbackCount}`;
  }, []);

  const saveClientDraft = React.useCallback((formData) => {
    try {
      const sanitizedData = sanitizeDraftValue(formData);
      const now = new Date().toISOString();
      let didUpdateExistingDraft = false;
      let savedDraftId = activeDraftId;

      setClientDrafts((prevDrafts) => {
        const hasActiveDraft = Boolean(savedDraftId) && prevDrafts.some((draft) => draft.id === savedDraftId);
        let nextDrafts;

        if (hasActiveDraft) {
          didUpdateExistingDraft = true;
          nextDrafts = prevDrafts.map((draft) =>
            draft.id === savedDraftId
              ? {
                  ...draft,
                  title: getClientDraftTitle(sanitizedData, prevDrafts.length),
                  updatedAt: now,
                  data: sanitizedData,
                }
              : draft
          );
        } else {
          savedDraftId = createClientDraftId();
          nextDrafts = [
            {
              id: savedDraftId,
              title: getClientDraftTitle(sanitizedData, prevDrafts.length + 1),
              createdAt: now,
              updatedAt: now,
              data: sanitizedData,
            },
            ...prevDrafts,
          ];
        }

        persistClientDrafts(nextDrafts);
        return nextDrafts;
      });

      setActiveDraftId(savedDraftId);
      showTransientMessage(didUpdateExistingDraft ? "Draft updated successfully" : "Draft saved successfully");
    } catch (error) {
      console.error("Failed to save client draft:", error);
      alert("Unable to save draft right now. Please try again.");
    }
  }, [activeDraftId, getClientDraftTitle, persistClientDrafts, sanitizeDraftValue, showTransientMessage]);

  const handleCancelClientForm = React.useCallback(() => {
    setShowClientForm(false);
    setShowDataTable(true);
    setEditingIndex(null);
    setEditingData(null);
    setActiveDraftId(null);
    setIsAddClientMenuOpen(false);
  }, []);

  const handleUseClientDraft = React.useCallback((draftId) => {
    const selectedDraft = clientDrafts.find((draft) => draft.id === draftId);
    if (!selectedDraft) return;
    openClientForm(selectedDraft.data || {}, selectedDraft.id);
    showTransientMessage(`Loaded draft: ${selectedDraft.title}`);
  }, [clientDrafts, openClientForm, showTransientMessage]);

  const handleDeleteClientDraft = React.useCallback((draftId) => {
    setClientDrafts((prevDrafts) => {
      const nextDrafts = prevDrafts.filter((draft) => draft.id !== draftId);
      persistClientDrafts(nextDrafts);
      return nextDrafts;
    });

    if (activeDraftId === draftId) {
      setActiveDraftId(null);
      setEditingData(null);
      setClientFormKey((prev) => prev + 1);
    }

    showTransientMessage("Draft deleted successfully");
  }, [activeDraftId, persistClientDrafts, showTransientMessage]);

  const handleViewClient = React.useCallback(
    (row) => {
      setSelectedClient(normalizeClientRecord(row));
      setIsViewDrawerOpen(true);
    },
    [normalizeClientRecord]
  );

  const handleEditClient = React.useCallback(
    (row, index) => {
      const resolvedIndex = Number.isInteger(row?._sourceIndex) ? row._sourceIndex : index;
      setEditingIndex(resolvedIndex);
      setEditingData(mapClientToFormData(row));
      setShowClientForm(true);
      setShowDataTable(false);
    },
    [mapClientToFormData]
  );

  const handleDeleteClient = React.useCallback((row, index) => {
    const resolvedIndex = Number.isInteger(row?._sourceIndex) ? row._sourceIndex : index;
    if (window.confirm("Are you sure you want to delete this client?")) {
      setSubmittedData((prev) => prev.filter((item, itemIndex) => itemIndex !== resolvedIndex));
    }
  }, []);

  const handleClientSubmit = React.useCallback(
    (data) => {
      const normalized = normalizeClientRecord({
        ...data,
        clientId: String(data?.clientId || "").trim() || generateNextClientId(),
      });
      const isEditMode = editingIndex !== null;

      setSubmittedData((prev) =>
        isEditMode
          ? prev.map((item, idx) => (idx === editingIndex ? { ...item, ...normalized } : item))
          : [...prev, normalized]
      );

      setShowClientForm(false);
      setShowDataTable(true);
      setEditingIndex(null);
      setEditingData(null);
      setActiveDraftId(null);
      setIsAddClientMenuOpen(false);
      showTransientMessage(isEditMode ? "Client updated successfully" : "Client added successfully");
    },
    [editingIndex, generateNextClientId, normalizeClientRecord, showTransientMessage]
  );

  const closeViewDrawer = React.useCallback(() => {
    setIsViewDrawerOpen(false);
  }, []);

  const clientFormConfig = React.useMemo(
    () => ({
      ...clientConfig,
      showDraftAction: editingIndex === null,
      showCancelAction: true,
      cancelLabel: "Cancel",
      onCancel: handleCancelClientForm,
      onSaveDraft: saveClientDraft,
    }),
    [editingIndex, handleCancelClientForm, saveClientDraft]
  );

  return (
    <div className={styles.page}>
      {showSuccessMessage && <div className={styles.successMessage}>{successMessageText}</div>}

      <div className={`${styles.card}${showDataTable ? ` ${styles.cardAutoHeight}` : ""}`}>
        {!showClientForm && (
          <div className={styles.infoRow}>
            <p className={styles.description}>
              View and manage all client accounts in one place. Track contact details, assigned recruiters,
              activation status, and engagement timelines to ensure smooth coordination and efficient client
              management.
            </p>
            <div ref={addClientMenuRef} className={styles.addClientMenuAnchor}>
              <div className={styles.addClientSplit}>
                <button className={styles.addButton} onClick={handleAddClient} type="button">
                  <span className={styles.addIcon}>+</span>
                  Add Client
                </button>
                <button
                  type="button"
                  className={`${styles.addButtonDropdownTrigger}${isAddClientMenuOpen ? ` ${styles.addButtonDropdownTriggerOpen}` : ""}`}
                  onClick={handleAddClientMenuToggle}
                  aria-label="Open add client options"
                  aria-haspopup="menu"
                  aria-expanded={isAddClientMenuOpen}
                >
                  <FiChevronDown size={14} />
                </button>
              </div>

              {isAddClientMenuOpen && (
                <div className={styles.addClientMenu} role="menu" aria-label="Add client options">
                  <div className={styles.addClientMenuTitle}>Saved Drafts</div>

                  {clientDrafts.length === 0 ? (
                    <div className={styles.addClientMenuEmpty}>No saved drafts available.</div>
                  ) : (
                    <div className={styles.addClientDraftList} role="none">
                      {clientDrafts.map((draft) => (
                        <div key={draft.id} className={styles.addClientDraftRow}>
                          <button
                            type="button"
                            className={styles.addClientMenuOption}
                            onClick={() => handleUseClientDraft(draft.id)}
                            title={draft.title || "Untitled Draft"}
                          >
                            <span className={styles.addClientDraftTitle}>{draft.title || "Untitled Draft"}</span>
                            <span className={styles.addClientDraftMeta}>
                              {new Date(draft.updatedAt || draft.createdAt || Date.now()).toLocaleString()}
                            </span>
                          </button>
                          <button
                            type="button"
                            className={styles.addClientDraftDelete}
                            onClick={() => handleDeleteClientDraft(draft.id)}
                            aria-label="Delete draft"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {showClientForm && (
          <div className={styles.formWrap}>
            <ReusableForm
              key={`client-form-${clientFormKey}`}
              config={clientFormConfig}
              onSubmit={handleClientSubmit}
              initialData={editingData}
            />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <div className={styles.tableWrap}>
              <DataTable
                data={paginatedData}
                columns={tableColumns}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
            </div>
            <div className={styles.tableFooter}>
              <div className={styles.footerLeft}>
                <span>Show</span>
                <select
                  className={styles.entriesSelect}
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>entries</span>
                <span>
                  ({startEntry}-{endEntry} of {totalRecords})
                </span>
              </div>
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  aria-label="Previous page"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`${styles.pageBtn}${currentPage === pageNumber ? ` ${styles.pageBtnActive}` : ""}`}
                    onClick={() => handlePageChange(pageNumber)}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.pageBtn}
                  aria-label="Next page"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isViewDrawerOpen && selectedClient && (
        <div className={styles.viewDrawerOverlay} onClick={closeViewDrawer}>
          <aside className={styles.viewDrawer} onClick={(event) => event.stopPropagation()}>
            <div className={styles.drawerTop}>
              <div className={styles.drawerIdentity}>
                <div className={styles.drawerAvatar}>{selectedClient.clientName?.charAt(0) || "C"}</div>
                <div>
                  <h3>{selectedClient.clientName}</h3>
                  <p>{selectedClient.clientId}</p>
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
              <span>
                <FiMail size={12} /> {selectedClient.contactEmail || "-"}
              </span>
              <span>
                <FiPhone size={12} /> {formatPhoneNumber(selectedClient.contactNumber)}
              </span>
              <span>
                <FiMapPin size={12} /> {selectedClient.clientLocation || "-"}
              </span>
            </div>

            <div className={styles.drawerGrid}>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Primary Contact</span>
                <span className={styles.drawerValue}>{selectedClient.primaryContactPerson || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Secondary Contact</span>
                <span className={styles.drawerValue}>{selectedClient.secondaryContactPerson || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Assigned Person</span>
                <span className={styles.drawerValue}>{selectedClient.accountManager || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Active From</span>
                <span className={styles.drawerValue}>{formatDate(selectedClient.activeFrom)}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Status</span>
                <span className={`${styles.statusPill} ${getStatusClass(selectedClient.clientStatus)}`}>
                  {selectedClient.clientStatus || "-"}
                </span>
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
