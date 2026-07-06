import styles from "./Headcount.module.scss";
import { FiChevronLeft, FiEdit2, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  exitEmployee,
  fetchActiveEmployees,
  fetchEmployeeById,
  fetchExitedEmployees,
} from "../../api/headcountService";

const getEmployeeId = (employee) => employee?.employee_id || employee?.employeeId || employee?.id || employee?.serialNumber;

const getConsultantName = (employee) => employee?.consultant_name || employee?.consultantName || "";

const isExitedEmployee = (employee) =>
  Boolean(employee?.isExited || employee?.status === "exited" || employee?.exitDetails);

const extractEmployeeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.employees)) return data.employees;
  return [];
};

const extractTotal = (data, fallback = 0) => {
  const total = Number(data?.total ?? data?.totalElements ?? fallback);
  return Number.isFinite(total) ? total : fallback;
};

const findEmployeeByPaging = async (employeeId, fetcher) => {
  const pageSize = 200;
  let page = 1;
  let totalPages = 1;

  do {
    const payload = await fetcher({ page, limit: pageSize });
    const employees = extractEmployeeList(payload);
    const found = employees.find((item) => String(getEmployeeId(item)) === String(employeeId));
    if (found) {
      return found;
    }

    const total = extractTotal(payload, employees.length);
    totalPages = Math.max(1, Math.ceil(total / pageSize));
    page += 1;
  } while (page <= totalPages && page <= 25);

  return null;
};

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

export default function HeadcountDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(() => state?.employee || null);
  const [isLoading, setIsLoading] = useState(!state?.employee);
  const [loadError, setLoadError] = useState("");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitForm, setExitForm] = useState({ exitDate: "", exitReason: "" });
  const [exitErrors, setExitErrors] = useState({});
  const isExited = isExitedEmployee(employee);

  useEffect(() => {
    let isMounted = true;

    const loadEmployee = async () => {
      const stateEmployee = state?.employee || null;
      if (stateEmployee) setEmployee(stateEmployee);

      setIsLoading(true);
      setLoadError("");

      try {
        const details = await fetchEmployeeById(employeeId);
        if (!isMounted) return;
        if (details) {
          setEmployee(details);
          return;
        }

        const fromActive = await findEmployeeByPaging(employeeId, fetchActiveEmployees);
        if (!isMounted) return;
        if (fromActive) {
          setEmployee(fromActive);
          return;
        }

        const fromExited = await findEmployeeByPaging(employeeId, fetchExitedEmployees);
        if (!isMounted) return;
        setEmployee(fromExited || stateEmployee || null);
        if (!fromExited && !stateEmployee) {
          setLoadError("Employee details could not be loaded.");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load headcount employee details:", error);

        try {
          const fromActive = await findEmployeeByPaging(employeeId, fetchActiveEmployees);
          if (!isMounted) return;
          if (fromActive) {
            setEmployee(fromActive);
            return;
          }

          const fromExited = await findEmployeeByPaging(employeeId, fetchExitedEmployees);
          if (!isMounted) return;
          setEmployee(fromExited || stateEmployee || null);
          if (!fromExited && !stateEmployee) {
            setLoadError("Employee details could not be loaded.");
          }
        } catch (fallbackError) {
          if (!isMounted) return;
          console.error("Fallback employee lookup failed:", fallbackError);
          setLoadError("Employee details could not be loaded.");
          setEmployee(stateEmployee || null);
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
  }, [employeeId, state?.employee]);

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

    const exitDetails = {
      exitDate: exitForm.exitDate,
      exitReason: exitForm.exitReason.trim(),
      savedAt: new Date().toISOString(),
    };

    try {
      await exitEmployee(getEmployeeId(employee), exitDetails);
      
      const updatedEmployee = {
        ...employee,
        exitDetails,
        isExited: true,
        status: "exited",
      };
      
      setEmployee(updatedEmployee);
      setIsExitModalOpen(false);
      setExitErrors({});
      navigate("/headcount", { state: { headcountTab: "exited" } });
    } catch (error) {
      console.error("Failed to save employee exit details:", error);
      setExitErrors({ form: "Exit details could not be saved. Please try again." });
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

            <div className={styles.detailsBody}>
              {[
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
                .filter(([, value]) => value !== undefined && value !== "" && value !== null)
                .map(([label, value]) => (
                  <article key={label} className={styles.detailBlock}>
                    <span className={styles.detailLabel}>{label}</span>
                    <strong className={styles.detailValue}>{String(value)}</strong>
                  </article>
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
              <button type="button" className={styles.exitModalClose} onClick={closeExitModal} aria-label="Close">
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
              <button type="button" className={styles.secondaryButton} onClick={closeExitModal}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton}>
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
