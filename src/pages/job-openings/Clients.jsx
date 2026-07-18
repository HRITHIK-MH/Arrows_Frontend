import * as React from "react";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiFilter, FiMail, FiMapPin, FiPhone, FiSearch, FiTrash2, FiUser, FiX } from "react-icons/fi";
import DataTable from "../../components/forms/DataTable";
import { clientConfig } from "../../components/forms/formConfigs";
import ReusableForm from "../../components/forms/ReusableForm";
import {
  createClient as createClientApi,
  deleteClient as deleteClientApi,
  fetchClientById,
  fetchClients,
  normalizeClientRecord as normalizeApiClient,
  updateClient as updateClientApi,
} from "../../api/jobClientService";
import { loadClientRows, saveClientRows } from "../../utils/clientStore";
import styles from "./Clients.module.scss";

const CLIENT_DRAFT_STORAGE_KEY = "clients:add-draft:v1";
const createClientDraftId = () => `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const readClientDrafts = () => {
  try {
    if (typeof window === "undefined") return [];
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
};

const getBackendClientId = (row = {}) => String(row?.clientId || row?.clientID || row?.backendClientId || row?.clientDbId || row?.clientDatabaseId || row?.clientUuid || row?.clientUUID || row?.uuid || row?.id || row?._id || "").trim();

const getReturnedClientDisplayId = (row = {}) => String(
  row?.clientCode ||
  row?.clientNumber ||
  row?.externalClientId ||
  row?.externalClientID ||
  row?.clientID ||
  row?.displayClientID ||
  row?.displayClientId ||
  row?.clientId ||
  ""
).trim();

export default function Clients() {
  const currentUserRole = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    return String(window.localStorage.getItem("userRole") || "").trim().toLowerCase();
  }, []);

  const clientsPageDescription = React.useMemo(() => {
    if (currentUserRole === "recruiter") {
      return <>Manage <strong>Client Accounts, Monitor Account Ownership, Engagement Status,</strong> and <strong>Co-ordination Activity</strong> in one place.</>;
    }

    if (currentUserRole === "accountmanager" || currentUserRole === "manager" || currentUserRole === "management") {
      return <>Track<strong> Client Relationships, Account Ownership, and Account Activity </strong>with centralized visibility.</>;
    }

    return <><strong>Track client relationships, account ownership,</strong> and <strong>account activity</strong> with centralized visibility.</>;
  }, [currentUserRole]);

  const [showClientForm, setShowClientForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState(() => loadClientRows());
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [clientsPagination, setClientsPagination] = React.useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
  });
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [isSavingClient, setIsSavingClient] = React.useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [successMessageText, setSuccessMessageText] = React.useState("Client added successfully");
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [clientDrafts, setClientDrafts] = React.useState(() => readClientDrafts());
  const [activeDraftId, setActiveDraftId] = React.useState(null);
  const [isAddClientMenuOpen, setIsAddClientMenuOpen] = React.useState(false);
  const [clientFormKey, setClientFormKey] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterIndustry, setFilterIndustry] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const deferredSearchTerm = React.useDeferredValue(searchTerm);
  const saveInFlightRef = React.useRef(false);
  const addClientMenuRef = React.useRef(null);

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent("topbar-page-label-change", {
      detail: showClientForm ? {
        title: "Add client",
        breadcrumbLabel: "Add client",
      } : null,
    }));

    return () => {
      window.dispatchEvent(new CustomEvent("topbar-page-label-change", {
        detail: null,
      }));
    };
  }, [showClientForm]);

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
      backendClientId: getBackendClientId(data),
      clientId: data.clientId || "",
      displayClientId: data.displayClientId || data.clientId || "",
      clientName: data.clientName || "",
      contactEmail,
      contactNumber,
      primaryContactPerson: data.primaryContactPerson || "",
      clientType: data.clientType || data.secondaryContactPerson || "",
      industry: data.industry || data.accountManager || "",
      address: data.address || data.comments || "",
      comments: data.comments || "",
      clientStatus: data.clientStatus || "Active",
      clientLocation: data.clientLocation || "-",
    };
  }, []);

  const mapClientToFormData = React.useCallback((row) => ({
    backendClientId: getBackendClientId(row),
    clientId: row.clientId || "",
    clientName: row.clientName || "",
    contactEmail: row.contactEmail || "",
    contactNumber: String(row.contactNumber || "").replace(/^\+91\s?/, "").trim(),
    primaryContactPerson: row.primaryContactPerson || "",
    clientType: row.clientType || row.secondaryContactPerson || "",
    industry: row.industry || row.accountManager || "",
    address: row.address || row.comments || "",
    comments: row.comments || "",
  }), []);

  const normalizeSavedClient = React.useCallback((payload, fallback) => {
    const returnedClientId = getReturnedClientDisplayId(payload);

    return normalizeApiClient({
      ...fallback,
      ...payload,
      ...(returnedClientId
        ? {
            clientId: returnedClientId,
            displayClientId: returnedClientId,
          }
        : {}),
    });
  }, []);

  const refreshClientListFromApi = React.useCallback(async (page = currentPage, limit = entriesPerPage) => {
    const clients = await fetchClients({ page, limit });
    const normalized = Array.isArray(clients)
      ? clients.map((row, index) => normalizeApiClient(row, index))
      : [];
    const responsePagination = clients?.pagination || {};
    const totalRecords = Number(responsePagination.totalRecords ?? normalized.length);
    const totalPages = Number(responsePagination.totalPages ?? Math.ceil(totalRecords / limit)) || 1;
    setSubmittedData(normalized);
    setClientsPagination({
      page: Number(responsePagination.page ?? page),
      limit: Number(responsePagination.limit ?? limit),
      totalRecords: Number.isFinite(totalRecords) ? totalRecords : normalized.length,
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    });
    saveClientRows(normalized);
    return normalized;
  }, [currentPage, entriesPerPage]);

  React.useEffect(() => {
    saveClientRows(submittedData);
  }, [submittedData]);

  React.useEffect(() => {
    let isMounted = true;

    const loadClientsFromApi = async () => {
      try {
        const clients = await fetchClients({ page: currentPage, limit: entriesPerPage });
        if (!isMounted || !Array.isArray(clients)) return;
        const normalized = clients.map((row, index) => normalizeApiClient(row, index));
        const responsePagination = clients?.pagination || {};
        const totalRecords = Number(responsePagination.totalRecords ?? normalized.length);
        const totalPages = Number(responsePagination.totalPages ?? Math.ceil(totalRecords / entriesPerPage)) || 1;
        setSubmittedData(normalized);
        setClientsPagination({
          page: Number(responsePagination.page ?? currentPage),
          limit: Number(responsePagination.limit ?? entriesPerPage),
          totalRecords: Number.isFinite(totalRecords) ? totalRecords : normalized.length,
          totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
        });
        saveClientRows(normalized);
      } catch (error) {
        console.warn("Client API sync failed, using local client rows:", error);
      }
    };

    loadClientsFromApi();

    return () => {
      isMounted = false;
    };
  }, [currentPage, entriesPerPage]);

  React.useEffect(() => {
    if (!isViewDrawerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isViewDrawerOpen]);

  const sanitizeDraftValue = React.useCallback((value) => {
    const sanitize = (input) => {
      if (input === null || input === undefined) return input;
      if (Array.isArray(input)) return input.map((item) => sanitize(item));
      if (typeof input !== "object") return input;
      if (input instanceof Date) return input.toISOString();
      if (typeof File !== "undefined" && input instanceof File) return input.name;
      if (typeof Blob !== "undefined" && input instanceof Blob) return "blob";

      return Object.entries(input).reduce((acc, [key, nestedValue]) => {
        acc[key] = sanitize(nestedValue);
        return acc;
      }, {});
    };

    return sanitize(value);
  }, []);

  const persistClientDrafts = React.useCallback((drafts) => {
    localStorage.setItem(CLIENT_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  }, []);

  const getClientDrafts = React.useCallback(() => readClientDrafts(), []);

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
      { key: "industry", label: "Industry" },
      {
        key: "clientStatus",
        label: "Status",
        render: (value) => (
          <span className={`${styles.statusPill} ${getStatusClass(value)}`}>{value || "-"}</span>
        ),
      },
    ],
    [formatPhoneNumber, getStatusClass]
  );

  const uniqueIndustries = React.useMemo(() => {
    return [...new Set(submittedData.map((item) => item.industry || item.accountManager).filter(Boolean))];
  }, [submittedData]);

  const uniqueStatuses = React.useMemo(() => {
    return [...new Set(submittedData.map((item) => item.clientStatus).filter(Boolean))];
  }, [submittedData]);

  const filteredData = React.useMemo(() => {
    return submittedData.filter((item) => {
      const matchesSearch =
        !deferredSearchTerm.trim() ||
        Object.values(item).some((val) =>
          String(val || "").toLowerCase().includes(deferredSearchTerm.toLowerCase())
        );

      const matchesIndustry = !filterIndustry || item.industry === filterIndustry || item.accountManager === filterIndustry;
      const matchesStatus = !filterStatus || item.clientStatus === filterStatus;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [submittedData, deferredSearchTerm, filterIndustry, filterStatus]);

  const totalRecords = clientsPagination.totalRecords;
  const totalPages = Math.max(1, clientsPagination.totalPages);
  const safeCurrentPage = Math.min(currentPage, totalPages);

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

  const paginatedData = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * entriesPerPage;
    return filteredData.map((item, offset) => ({
      ...item,
      _sourceIndex: startIndex + offset,
    }));
  }, [entriesPerPage, filteredData, safeCurrentPage]);

  const startEntry = totalRecords === 0 || paginatedData.length === 0 ? 0 : (safeCurrentPage - 1) * entriesPerPage + 1;
  const endEntry = startEntry === 0 ? 0 : Math.min(startEntry + paginatedData.length - 1, totalRecords);

  const handleEntriesPerPageChange = React.useCallback((event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  }, []);

  const handlePreviousPage = React.useCallback(() => {
    setCurrentPage(Math.max(safeCurrentPage - 1, 1));
  }, [safeCurrentPage]);

  const handleNextPage = React.useCallback(() => {
    setCurrentPage(Math.min(safeCurrentPage + 1, totalPages));
  }, [safeCurrentPage, totalPages]);

  const handleSearchChange = React.useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const clearFilters = React.useCallback(() => {
    setSearchTerm("");
    setFilterIndustry("");
    setFilterStatus("");
    setCurrentPage(1);
  }, []);

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
      backendClientId: getBackendClientId(draftData),
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
    async (row) => {
      const fallbackClient = normalizeClientRecord(row);
      setSelectedClient(fallbackClient);
      setIsViewDrawerOpen(true);

      const candidateId = getBackendClientId(row);
      if (!candidateId) {
        return;
      }

      try {
        const fetchedClient = await fetchClientById(candidateId);
        if (!fetchedClient || typeof fetchedClient !== "object") {
          return;
        }

        const normalizedFetchedClient = normalizeClientRecord(normalizeApiClient(fetchedClient));
        setSelectedClient((current) => {
          const currentId = getBackendClientId(current);
          if (currentId && currentId !== candidateId) {
            return current;
          }
          return { ...fallbackClient, ...normalizedFetchedClient };
        });
      } catch (error) {
        console.warn("Failed to load full client details for view:", error);
      }
    },
    [normalizeClientRecord]
  );

  const handleEditClient = React.useCallback(
    async (row, index) => {
      const resolvedIndex = Number.isInteger(row?._sourceIndex) ? row._sourceIndex : index;
      const fallbackClient = normalizeClientRecord(row);
      setEditingIndex(resolvedIndex);
      setEditingData(mapClientToFormData(fallbackClient));
      setShowClientForm(true);
      setShowDataTable(false);

      const candidateId = getBackendClientId(row);
      if (!candidateId) {
        return;
      }

      try {
        const fetchedClient = await fetchClientById(candidateId);
        if (!fetchedClient || typeof fetchedClient !== "object") {
          return;
        }

        const normalizedFetchedClient = normalizeClientRecord(normalizeApiClient(fetchedClient));
        setEditingData((current) => {
          const currentId = getBackendClientId(current);
          if (currentId && currentId !== candidateId) {
            return current;
          }
          return mapClientToFormData({ ...fallbackClient, ...normalizedFetchedClient });
        });
      } catch (error) {
        console.warn("Failed to load full client details for edit:", error);
      }
    },
    [mapClientToFormData, normalizeClientRecord]
  );

  const handleDeleteClient = React.useCallback(async (row, index) => {
    const resolvedIndex = Number.isInteger(row?._sourceIndex) ? row._sourceIndex : index;
    if (window.confirm("Are you sure you want to delete this client?")) {
      const candidateId = getBackendClientId(row);
      if (candidateId) {
        try {
          await deleteClientApi(candidateId);
          await refreshClientListFromApi();
          return;
        } catch (error) {
          console.warn("Client delete API failed, applying local delete:", error);
        }
      }
      setSubmittedData((prev) => prev.filter((item, itemIndex) => {
        const itemClientId = getBackendClientId(item);
        return candidateId ? itemClientId !== candidateId : itemIndex !== resolvedIndex;
      }));
    }
  }, [refreshClientListFromApi]);

  const handleClientSubmit = React.useCallback(
    async (data) => {
      if (saveInFlightRef.current) {
        return;
      }

      saveInFlightRef.current = true;
      setIsSavingClient(true);

      try {
        const normalized = normalizeClientRecord({
          ...data,
          backendClientId: getBackendClientId(data) || getBackendClientId(editingData),
          clientId: String(data?.clientId || "").trim() || generateNextClientId(),
        });
        const isEditMode = editingIndex !== null;
        const localUpdate = (savedRow) => {
          setSubmittedData((prev) => {
            const savedClientId = getBackendClientId(savedRow) || getBackendClientId(normalized);
            if (isEditMode) {
              return prev.map((item, idx) => {
                const itemClientId = getBackendClientId(item);
                const isSameClient = savedClientId && itemClientId === savedClientId;
                return isSameClient || idx === editingIndex ? { ...item, ...savedRow } : item;
              });
            }

            return [...prev, savedRow];
          });
        };

        if (isEditMode) {
          const updateClientId = getBackendClientId(normalized);
          if (!updateClientId) {
            throw new Error("Backend client ID is required to update this client.");
          }
          const response = await updateClientApi(updateClientId, normalized);
          const payload = response?.data?.data || response?.data || normalized;
          const savedRow = normalizeSavedClient(payload, normalized);
          try {
            await refreshClientListFromApi(currentPage, entriesPerPage);
          } catch (syncError) {
            console.warn("Client list refresh failed after update, using update response:", syncError);
            localUpdate(savedRow);
          }
        } else {
          const response = await createClientApi(normalized);
          const payload = response?.data?.data || response?.data || normalized;
          const savedRow = normalizeSavedClient(payload, normalized);
          try {
            await refreshClientListFromApi(currentPage, entriesPerPage);
          } catch (syncError) {
            console.warn("Client list refresh failed after create, using create response:", syncError);
            localUpdate(savedRow);
          }
        }

        setShowClientForm(false);
        setShowDataTable(true);
        setEditingIndex(null);
        setEditingData(null);
        setActiveDraftId(null);
        setIsAddClientMenuOpen(false);
        showTransientMessage(isEditMode ? "Client updated successfully" : "Client added successfully");
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;

        console.warn("Client save API failed:", error);
        throw new Error(
          String(
            backendMessage ||
              (editingIndex !== null
                ? "Failed to update client in DB. Please try again."
                : "Failed to create client in DB. Please try again.")
          ).trim()
        );
      } finally {
        saveInFlightRef.current = false;
        setIsSavingClient(false);
      }
    },
    [currentPage, editingData, editingIndex, entriesPerPage, generateNextClientId, normalizeClientRecord, normalizeSavedClient, refreshClientListFromApi, showTransientMessage]
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
              {clientsPageDescription}
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
                              {draft.updatedAt || draft.createdAt
                                ? new Date(draft.updatedAt || draft.createdAt).toLocaleString()
                                : "-"}
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
              isSubmitting={isSavingClient}
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
                    onChange={handleSearchChange}
                    className={styles.searchInput}
                  />
                </div>

                <select
                  value={filterIndustry}
                  onChange={(e) => {
                    setFilterIndustry(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={styles.selectField}
                >
                  <option value="">Industry</option>
                  {uniqueIndustries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={styles.selectField}
                >
                  <option value="">Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filtersRight}>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={clearFilters}
                  disabled={
                    !searchTerm &&
                    !filterIndustry &&
                    !filterStatus
                  }
                >
                  Clear
                </button>
              </div>
            </div>

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
              <div className={styles.footerSummary}>
                <span>Showing</span>
                <strong>{startEntry}-{endEntry}</strong>
                <span>of</span>
                <strong>{totalRecords}</strong>
                <span>entries</span>
              </div>

              <div className={styles.footerControls}>
                <label className={styles.rowsControl}>
                  <span>Rows per page</span>
                <select
                    className={styles.rowsSelect}
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                    aria-label="Rows per page"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                </label>

                <div className={styles.pageIndicator} aria-live="polite">
                  Page {safeCurrentPage} of {totalPages}
                </div>

                <div className={styles.paginationControls}>
                <button
                  type="button"
                    className={styles.pageButton}
                  aria-label="Previous page"
                  onClick={handlePreviousPage}
                  disabled={safeCurrentPage === 1}
                >
                    <FiChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                    className={styles.pageButton}
                  aria-label="Next page"
                  onClick={handleNextPage}
                  disabled={safeCurrentPage === totalPages}
                >
                    <FiChevronRight aria-hidden="true" />
                </button>
                </div>
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
                <span className={styles.drawerLabel}>Client Type</span>
                <span className={styles.drawerValue}>{selectedClient.clientType || "-"}</span>
              </div>
              <div className={styles.drawerItem}>
                <span className={styles.drawerLabel}>Industry</span>
                <span className={styles.drawerValue}>{selectedClient.industry || "-"}</span>
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
                <FiUser size={12} /> Address
              </span>
              <p>{selectedClient.address || selectedClient.comments || "No remarks available."}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
