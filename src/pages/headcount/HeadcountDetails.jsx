import styles from "./Headcount.module.scss";
import { FiEdit2, FiX } from "react-icons/fi";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const HEADCOUNT_STORAGE_KEY = "headcount:employees:v1";

const getEmployeeId = (employee) => employee?.employeeId || employee?.id || employee?.serialNumber;

const loadEmployeeById = (employeeId) => {
  try {
    const rawEmployees = localStorage.getItem(HEADCOUNT_STORAGE_KEY);
    const employees = rawEmployees ? JSON.parse(rawEmployees) : [];
    if (!Array.isArray(employees)) return null;
    return employees.find((employee) => String(getEmployeeId(employee)) === String(employeeId)) || null;
  } catch (error) {
    console.error("Failed to load headcount employee details:", error);
    return null;
  }
};

const isExitedEmployee = (employee) =>
  Boolean(employee?.isExited || employee?.status === "exited" || employee?.exitDetails);

export default function HeadcountDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(() => state?.employee || loadEmployeeById(employeeId));
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitForm, setExitForm] = useState({ exitDate: "", exitReason: "" });
  const [exitErrors, setExitErrors] = useState({});
  const isExited = isExitedEmployee(employee);

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

  const saveExitDetails = (event) => {
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

    const employeeData = { ...employee };
    delete employeeData.serialNumber;

    const updatedEmployee = {
      ...employeeData,
      employeeId: getEmployeeId(employee),
      exitDetails,
      isExited: true,
      status: "exited",
    };

    try {
      const rawEmployees = localStorage.getItem(HEADCOUNT_STORAGE_KEY);
      const employees = rawEmployees ? JSON.parse(rawEmployees) : [];
      const currentEmployees = Array.isArray(employees) ? employees : [];
      const hasExistingEmployee = currentEmployees.some(
        (item) => String(getEmployeeId(item)) === String(getEmployeeId(employee))
      );
      const updatedEmployees = hasExistingEmployee
        ? currentEmployees.map((item) =>
            String(getEmployeeId(item)) === String(getEmployeeId(employee)) ? updatedEmployee : item
          )
        : [...currentEmployees, updatedEmployee];

      localStorage.setItem(HEADCOUNT_STORAGE_KEY, JSON.stringify(updatedEmployees));
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
      <section className={styles.header}>
        <div>
          <span className={styles.kicker}><b>Employee Details</b></span>
        </div>
      </section>

      <section className={styles.detailPage}>
        {employee ? (
          <>
            <div className={styles.detailHero}>
              <div className={styles.detailAvatar}>
                {(employee.consultantName || "E").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className={styles.detailEmployeeName}>{employee.consultantName || "Employee"}</h2>
              </div>
            </div>

            <div className={styles.detailsBody}>
              {[
                ["Joining Date", employee.joiningDate],
                ["Entity", employee.entity],
                ["Work Location", employee.workLocation],
                ["Mode", employee.mode],
                ["Cost", employee.cost],
                ["Customer", employee.customer],
                ["Billing Type", employee.billingType],
                ["Exit Date", employee.exitDetails?.exitDate],
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
            <p>This employee is not available in the current headcount list.</p>
          </div>
        )}

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
