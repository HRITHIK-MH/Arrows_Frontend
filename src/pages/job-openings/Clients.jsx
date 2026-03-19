import * as React from "react";
import { FiMail, FiMapPin, FiPhone, FiUser, FiX } from "react-icons/fi";
import DataTable from "../../components/forms/DataTable";
import { clientConfig } from "../../components/forms/formConfigs";
import ReusableForm from "../../components/forms/ReusableForm";
import styles from "./Clients.module.scss";

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
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingData, setEditingData] = React.useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [successMessageText, setSuccessMessageText] = React.useState("Client added successfully");
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState(null);

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

  const handleAddClient = React.useCallback(() => {
    setShowClientForm(true);
    setShowDataTable(false);
    setEditingIndex(null);
    setEditingData(null);
  }, []);

  const handleViewClient = React.useCallback(
    (row) => {
      setSelectedClient(normalizeClientRecord(row));
      setIsViewDrawerOpen(true);
    },
    [normalizeClientRecord]
  );

  const handleEditClient = React.useCallback(
    (row, index) => {
      setEditingIndex(index);
      setEditingData(mapClientToFormData(row));
      setShowClientForm(true);
      setShowDataTable(false);
    },
    [mapClientToFormData]
  );

  const handleDeleteClient = React.useCallback((_, index) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      setSubmittedData((prev) => prev.filter((item, itemIndex) => itemIndex !== index));
    }
  }, []);

  const handleClientSubmit = React.useCallback(
    (data) => {
      const normalized = normalizeClientRecord(data);
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
      setSuccessMessageText(isEditMode ? "Client updated successfully" : "Client added successfully");
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    },
    [editingIndex, normalizeClientRecord]
  );

  const closeViewDrawer = React.useCallback(() => {
    setIsViewDrawerOpen(false);
  }, []);

  return (
    <div className={styles.page}>
      {showSuccessMessage && <div className={styles.successMessage}>{successMessageText}</div>}

      <div className={styles.card}>
        {!showClientForm && (
          <div className={styles.infoRow}>
            <p className={styles.description}>
              View and manage all client accounts in one place. Track contact details, assigned recruiters,
              activation status, and engagement timelines to ensure smooth coordination and efficient client
              management.
            </p>
            <button className={styles.addButton} onClick={handleAddClient} type="button">
              <span className={styles.addIcon}>+</span>
              Add Client
            </button>
          </div>
        )}

        {showClientForm && (
          <div className={styles.formWrap}>
            <ReusableForm config={clientConfig} onSubmit={handleClientSubmit} initialData={editingData} />
          </div>
        )}

        {showDataTable && (
          <div className={styles.tableSection}>
            <div className={styles.tableWrap}>
              <DataTable
                data={submittedData}
                columns={tableColumns}
                onView={handleViewClient}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
              />
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