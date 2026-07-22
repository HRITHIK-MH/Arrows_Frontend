import styles from "./Headcount.module.scss";
import { FiChevronLeft, FiEdit2, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  exitEmployee,
  fetchEmployeeById,
} from "../../api/headcountService";

const getEmployeeId = (employee) => employee?.employee_id || employee?.employeeId || employee?.id || employee?.serialNumber;

const getConsultantName = (employee) => employee?.consultant_name || employee?.consultantName || "";

const getEmployeeEmail = (employee) =>
  employee?.email || employee?.emailAddress || employee?.email_address || employee?.contactEmail || employee?.contact_email || "";

const isExitedEmployee = (employee) =>
  Boolean(employee?.isExited || employee?.status === "exited" || employee?.exitDetails);

const parseDateValue = (value) => {
  const dateText = String(value);
  const isoDateMatch = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsedDate = isoDateMatch
    ? new Date(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]))
    : new Date(dateText);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatDayMonthYear = (value) => {
  if (!value) return "";

  const parsedDate = parseDateValue(value);
  if (!parsedDate) return String(value);

  const day = parsedDate.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(parsedDate);
  const year = parsedDate.getFullYear();

  return `${day} ${month} ${year}`;
};

const getDisplayValue = (value) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const toIsoDateString = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return text;
  }

  const dayFirstMatch = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dayFirstMatch) {
    return `${dayFirstMatch[3]}-${dayFirstMatch[2]}-${dayFirstMatch[1]}`;
  }

  const parsed = parseDateValue(text);
  if (!parsed) return text;

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function HeadcountDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { employeeId } = useParams();
  const stateEmployee = state?.employee || null;
  const [employee, setEmployee] = useState(() => stateEmployee);
  const [isLoading, setIsLoading] = useState(!stateEmployee);
  const [loadError, setLoadError] = useState("");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitForm, setExitForm] = useState({ exitDate: "", exitReason: "" });
  const [exitErrors, setExitErrors] = useState({});
  const [isSavingExit, setIsSavingExit] = useState(false);
  const isExited = isExitedEmployee(employee);

  useEffect(() => {
    let isMounted = true;

    const loadEmployee = async () => {
      setIsLoading(!stateEmployee);
      setLoadError("");

      try {
        const details = await fetchEmployeeById(employeeId);
        if (!isMounted) return;
        if (details) {
          setEmployee((current) => {
            const existingEmployee = current || stateEmployee || {};
            return {
              ...existingEmployee,
              ...details,
              email: getEmployeeEmail(details) || getEmployeeEmail(existingEmployee),
            };
          });
          return;
        }

        setEmployee(stateEmployee || null);
        if (!stateEmployee) {
          setLoadError("Employee details could not be loaded.");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load headcount employee details:", error);
        setEmployee(stateEmployee || null);
        if (!stateEmployee) {
          setLoadError("Employee details could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [employeeId, stateEmployee]);

  const handleBack = () => {
    navigate("/headcount", { state: { headcountTab: isExited ? "exited" : "active" } });
  };

  const handleEdit = () => {
    if (!employee) return;
    navigate("/headcount", { state: { editEmployee: employee } });
  };

  const handleExit = () => {
    if (!employee) return;
    setExitForm({
      exitDate: employee.exitDetails?.exitDate || "",
      exitReason: employee.exitDetails?.exitReason || "",
    });
    setExitErrors({});
    setIsExitModalOpen(true);
  };

  const closeExitModal = () => {
    if (isSavingExit) {
      return;
    }
    setIsExitModalOpen(false);
    setExitErrors({});
  };

  const handleExitFieldChange = (field, value) => {
    setExitForm((current) => ({ ...current, [field]: value }));
    if (exitErrors[field]) {
      setExitErrors((current) => {
        const updated = { ...current };
        delete updated[field];
        return updated;
      });
    }
  };

  const saveExitDetails = async (event) => {
    event.preventDefault();

    if (isSavingExit) {
      return;
    }

    const nextErrors = {};
    if (!exitForm.exitDate) {
      nextErrors.exitDate = "Exit Date is required.";
    }
    if (!exitForm.exitReason.trim()) {
      nextErrors.exitReason = "Exit Reason is required.";
    }

    if (Object.keys(nextErrors).length) {
      setExitErrors(nextErrors);
      return;
    }

    const exitDate = toIsoDateString(exitForm.exitDate);
    const exitDetails = {
      exitDate,
      exitReason: exitForm.exitReason.trim(),
      savedAt: new Date().toISOString(),
    };

    setIsSavingExit(true);

    try {
      setExitErrors({});
      const exitResult = await exitEmployee(getEmployeeId(employee), exitDetails);
      
      const updatedEmployee = {
        ...employee,
        exitDetails,
        isExited: true,
        status: "exited",
      };
      
      setEmployee(updatedEmployee);
      setIsExitModalOpen(false);
      setExitErrors({});
      navigate("/headcount", {
        state: {
          headcountTab: "exited",
          successMessage:
            String(exitResult?.message || exitResult?.raw?.message || "").trim() ||
            "Employee exited successfully.",
        },
      });
    } catch (error) {
      console.error("Failed to save employee exit details:", error);
      setExitErrors({ form: String(error?.message || "Exit details could not be saved. Please try again.") });
    } finally {
      setIsSavingExit(false);
    }
  };

  return (
    <div className={styles.page} aria-label="Employee details">
      <section className={styles.detailTopBar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="Back to headcount"
          title="Back"
        >
          <FiChevronLeft aria-hidden="true" />
        </button>
        <div className={styles.detailTopBarText}>
          <span>Employee Details</span>
        </div>
      </section>

      <section className={styles.detailPage}>
        {isLoading ? (
          <div className={styles.detailMissing}>
            <h2>Loading employee details</h2>
          </div>
        ) : employee ? (
          <>
            <div className={styles.detailHero}>
              <div className={styles.detailIdentity}>
                <div className={styles.detailAvatar}>
                  {(getConsultantName(employee) || "E").charAt(0).toUpperCase()}
                </div>
                <div className={styles.detailNameRow}>
                  <h2 className={styles.detailEmployeeName}>{getConsultantName(employee) || "Employee"}</h2>
                  <span
                    className={`${styles.employeeStatusTag} ${
                      isExited ? styles.employeeStatusExited : styles.employeeStatusActive
                    }`}
                  >
                    {isExited ? "Exited" : "Active"}
                  </span>
                </div>
              </div>

              {!isExited ? (
                <div className={styles.displayActionBar}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleEdit}
                    disabled={!employee}
                  >
                    <FiEdit2 aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleExit}
                    disabled={!employee}
                  >
                    <FiX aria-hidden="true" />
                    Exit
                  </button>
                </div>
              ) : null}
            </div>

            <div className={styles.viewFormGrid}>
              {[
                ["Consultant Name", getConsultantName(employee)],
                ["Email", employee.email || employee.emailAddress || employee.email_address || "-"],
                ["Joining Date", formatDayMonthYear(employee.joiningDate)],
                ["Entity", employee.entity],
                ["Work Location", employee.workLocation],
                ["Mode", employee.mode],
                ["Cost", employee.cost],
                ["Customer", employee.customer],
                ["Billing Type", employee.billingType],
                ["Exit Date", formatDayMonthYear(employee.exitDetails?.exitDate)],
                ["Exit Reason", employee.exitDetails?.exitReason],
              ]
                .filter(([label]) => isExited || !["Exit Date", "Exit Reason"].includes(label))
                .map(([label, value]) => (
                  <label key={label} className={styles.viewField}>
                    <span>{label}</span>
                    <output>{getDisplayValue(value)}</output>
                  </label>
                ))}
            </div>
          </>
        ) : (
          <div className={styles.detailMissing}>
            <h2>Employee not found</h2>
            <p>{loadError || "This employee is not available in the current headcount list."}</p>
          </div>
        )}

      </section>

      {isExitModalOpen ? (
        <div className={styles.exitModalOverlay} role="presentation" onClick={closeExitModal}>
          <form
            className={styles.exitModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
            noValidate
            onSubmit={saveExitDetails}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.exitModalHeader}>
              <h2 id="exit-modal-title">Employee Exit</h2>
              <button
                type="button"
                className={styles.exitModalClose}
                onClick={closeExitModal}
                aria-label="Close"
                disabled={isSavingExit}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <div className={styles.exitModalBody}>
              {exitErrors.form ? <div className={styles.exitFormError}>{exitErrors.form}</div> : null}

              <label className={styles.exitField} htmlFor="exitDate">
                <span>Exit Date</span>
                <input
                  id="exitDate"
                  type="date"
                  value={exitForm.exitDate}
                  onChange={(event) => handleExitFieldChange("exitDate", event.target.value)}
                  aria-invalid={Boolean(exitErrors.exitDate)}
                  aria-describedby={exitErrors.exitDate ? "exitDate-error" : undefined}
                  required
                />
                {exitErrors.exitDate ? (
                  <small id="exitDate-error" className={styles.exitFieldError}>
                    {exitErrors.exitDate}
                  </small>
                ) : null}
              </label>

              <label className={styles.exitField} htmlFor="exitReason">
                <span>Exit Reason</span>
                <textarea
                  id="exitReason"
                  value={exitForm.exitReason}
                  onChange={(event) => handleExitFieldChange("exitReason", event.target.value)}
                  aria-invalid={Boolean(exitErrors.exitReason)}
                  aria-describedby={exitErrors.exitReason ? "exitReason-error" : undefined}
                  rows={4}
                  required
                />
                {exitErrors.exitReason ? (
                  <small id="exitReason-error" className={styles.exitFieldError}>
                    {exitErrors.exitReason}
                  </small>
                ) : null}
              </label>
            </div>

            <div className={styles.exitModalActions}>
              <button type="button" className={styles.secondaryButton} onClick={closeExitModal} disabled={isSavingExit}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton} disabled={isSavingExit}>
                {isSavingExit ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
