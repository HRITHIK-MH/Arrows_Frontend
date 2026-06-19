import styles from "./Headcount.module.scss";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiFilter,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import ReusableForm from "../../components/forms/ReusableForm";
import { employeeConfig } from "../../components/forms/formConfigs";

const HEADCOUNT_STORAGE_KEY = "headcount:employees:v1";

const getInitialForm = () => {
  const initial = {};
  employeeConfig.steps[0].fields.forEach((field) => {
    initial[field.name] = "";
  });
  return initial;
};

const loadEmployees = () => {
  try {
    const rawEmployees = localStorage.getItem(HEADCOUNT_STORAGE_KEY);
    const parsedEmployees = rawEmployees ? JSON.parse(rawEmployees) : [];
    return Array.isArray(parsedEmployees) ? parsedEmployees : [];
  } catch (error) {
    console.error("Failed to load headcount employees:", error);
    return [];
  }
};

const isExitedEmployee = (employee) =>
  Boolean(employee?.isExited || employee?.status === "exited" || employee?.exitDetails);

const getEmployeeId = (employee) => employee?.employeeId || employee?.id || employee?.serialNumber;

const createEmployeeId = () => `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const formatMonthYear = (value) => {
  if (!value) return "-";

  const dateText = String(value);
  const isoDateMatch = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsedDate = isoDateMatch
    ? new Date(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]))
    : new Date(dateText);

  if (Number.isNaN(parsedDate.getTime())) return dateText;

  return monthYearFormatter.format(parsedDate);
};

const getUniqueOptions = (employees, fieldName) =>
  [...new Set(employees.map((employee) => String(employee[fieldName] || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

export default function Headcount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState(() => loadEmployees());
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [formData, setFormData] = useState(() => getInitialForm());
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [activeTab, setActiveTab] = useState(() =>
    location.state?.headcountTab === "exited" ? "exited" : "active"
  );
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    billingType: "",
    entity: "",
    customer: "",
  });
  const [exitedFilters, setExitedFilters] = useState({
    search: "",
    billingType: "",
    entity: "",
    customer: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => !isExitedEmployee(employee)),
    [employees]
  );
  const exitedEmployees = useMemo(
    () => employees.filter((employee) => isExitedEmployee(employee)),
    [employees]
  );
  const filteredActiveEmployees = useMemo(() => {
    const searchTerm = activeFilters.search.trim().toLowerCase();

    return activeEmployees.filter((employee) => {
      const matchesSearch =
        !searchTerm ||
        String(employee.consultantName || "").toLowerCase().includes(searchTerm);
      const matchesBillingType =
        !activeFilters.billingType || employee.billingType === activeFilters.billingType;
      const matchesEntity = !activeFilters.entity || employee.entity === activeFilters.entity;
      const matchesCustomer = !activeFilters.customer || employee.customer === activeFilters.customer;

      return matchesSearch && matchesBillingType && matchesEntity && matchesCustomer;
    });
  }, [activeEmployees, activeFilters]);
  const filteredExitedEmployees = useMemo(() => {
    const searchTerm = exitedFilters.search.trim().toLowerCase();

    return exitedEmployees.filter((employee) => {
      const matchesSearch =
        !searchTerm ||
        String(employee.consultantName || "").toLowerCase().includes(searchTerm);
      const matchesBillingType =
        !exitedFilters.billingType || employee.billingType === exitedFilters.billingType;
      const matchesEntity = !exitedFilters.entity || employee.entity === exitedFilters.entity;
      const matchesCustomer = !exitedFilters.customer || employee.customer === exitedFilters.customer;

      return matchesSearch && matchesBillingType && matchesEntity && matchesCustomer;
    });
  }, [exitedEmployees, exitedFilters]);
  const activeFilterOptions = useMemo(
    () => ({
      billingType: getUniqueOptions(activeEmployees, "billingType"),
      entity: getUniqueOptions(activeEmployees, "entity"),
      customer: getUniqueOptions(activeEmployees, "customer"),
    }),
    [activeEmployees]
  );
  const exitedFilterOptions = useMemo(
    () => ({
      billingType: getUniqueOptions(exitedEmployees, "billingType"),
      entity: getUniqueOptions(exitedEmployees, "entity"),
      customer: getUniqueOptions(exitedEmployees, "customer"),
    }),
    [exitedEmployees]
  );
  const currentFilters = activeTab === "active" ? activeFilters : exitedFilters;
  const currentFilterOptions = activeTab === "active" ? activeFilterOptions : exitedFilterOptions;
  const displayedEmployees = activeTab === "active" ? filteredActiveEmployees : filteredExitedEmployees;
  const hasActiveFilters = Object.values(activeFilters).some((value) => String(value || "").trim());
  const hasExitedFilters = Object.values(exitedFilters).some((value) => String(value || "").trim());
  const hasCurrentFilters = activeTab === "active" ? hasActiveFilters : hasExitedFilters;
  const totalRecords = displayedEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const startEntry = totalRecords === 0 ? 0 : (visiblePage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(visiblePage * rowsPerPage, totalRecords);
  const paginatedEmployees = displayedEmployees.slice(startEntry === 0 ? 0 : startEntry - 1, endEntry);

  useEffect(() => {
    try {
      localStorage.setItem(HEADCOUNT_STORAGE_KEY, JSON.stringify(employees));
    } catch (error) {
      console.error("Failed to save headcount employees:", error);
    }
  }, [employees]);

  useEffect(() => {
    const editEmployee = location.state?.editEmployee;
    if (!editEmployee) return;

    setFormData(editEmployee);
    setEditingEmployeeId(getEmployeeId(editEmployee) ?? null);
    setIsAddingEmployee(true);
    navigate("/headcount", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    const requestedTab = location.state?.headcountTab;
    if (requestedTab !== "active" && requestedTab !== "exited") return;

    setActiveTab(requestedTab);
    navigate("/headcount", { replace: true, state: null });
  }, [location.state, navigate]);

  const openForm = () => {
    setFormData(getInitialForm());
    setEditingEmployeeId(null);
    setActiveTab("active");
    setIsAddingEmployee(true);
  };

  const closeForm = () => {
    setIsAddingEmployee(false);
    setEditingEmployeeId(null);
  };

  const updateActiveFilter = (fieldName, value) => {
    setCurrentPage(1);
    setActiveFilters((current) => ({ ...current, [fieldName]: value }));
  };

  const updateExitedFilter = (fieldName, value) => {
    setCurrentPage(1);
    setExitedFilters((current) => ({ ...current, [fieldName]: value }));
  };

  const updateCurrentFilter = (fieldName, value) => {
    if (activeTab === "active") {
      updateActiveFilter(fieldName, value);
      return;
    }

    updateExitedFilter(fieldName, value);
  };

  const clearActiveFilters = () => {
    setCurrentPage(1);
    setActiveFilters({
      search: "",
      billingType: "",
      entity: "",
      customer: "",
    });
  };

  const clearExitedFilters = () => {
    setCurrentPage(1);
    setExitedFilters({
      search: "",
      billingType: "",
      entity: "",
      customer: "",
    });
  };

  const clearCurrentFilters = () => {
    if (activeTab === "active") {
      clearActiveFilters();
      return;
    }

    clearExitedFilters();
  };

  const handleRowsPerPageChange = (event) => {
    setCurrentPage(1);
    setRowsPerPage(Number(event.target.value));
  };

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(1, visiblePage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages, visiblePage + 1));
  };

  const handleSubmit = (data) => {
    const employeeData = { ...data };
    delete employeeData.serialNumber;

    const normalizedEmployee = {
      ...employeeData,
      employeeId: editingEmployeeId || data.employeeId || createEmployeeId(),
      consultantName: String(employeeData.consultantName || "").trim(),
    };

    setEmployees((current) => {
      if (editingEmployeeId !== null) {
        return current.map((employee) =>
          String(getEmployeeId(employee)) === String(editingEmployeeId)
            ? (() => {
                const updatedEmployee = { ...employee, ...normalizedEmployee };
                delete updatedEmployee.serialNumber;
                return updatedEmployee;
              })()
            : employee
        );
      }

      return [...current, { ...normalizedEmployee, isExited: false, status: "active" }];
    });
    setIsAddingEmployee(false);
    setEditingEmployeeId(null);
  };

  const employeeFormConfig = useMemo(
    () => ({
      ...employeeConfig,
      showCancelAction: true,
      cancelLabel: "Cancel",
      onCancel: closeForm,
    }),
    []
  );

  if (isAddingEmployee) {
    return (
      <div className={styles.page} aria-label="Add employee">
        <section className={styles.card}>
          <div className={styles.infoRow}>
            <div className={styles.infoContent}>
              <p className={styles.description}>
                <strong>{editingEmployeeId !== null ? "Edit Employee" : "Add Employee"}</strong>
              </p>
              <p className={styles.summaryText}>
                Maintain employee headcount records and keep billing details aligned.
              </p>
            </div>
          </div>

          <div className={styles.formPage}>
            <ReusableForm
              config={employeeFormConfig}
              onSubmit={handleSubmit}
              initialData={formData}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page} aria-label="Headcount">
      <section className={styles.card}>
        <div className={styles.tableSection}>
          <div className={styles.tabsHeader}>
            <div className={styles.tabs} role="tablist" aria-label="Headcount employee status">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "active"}
                className={`${styles.tabButton} ${activeTab === "active" ? styles.tabButtonActive : ""}`}
                onClick={() => {
                  setActiveTab("active");
                  setCurrentPage(1);
                }}
              >
                Active Employees
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "exited"}
                className={`${styles.tabButton} ${activeTab === "exited" ? styles.tabButtonActive : ""}`}
                onClick={() => {
                  setActiveTab("exited");
                  setCurrentPage(1);
                }}
              >
                Exited Employees
              </button>
            </div>

            <button className={styles.addButton} type="button" onClick={openForm}>
              <FiPlus aria-hidden="true" />
              Add Employee
            </button>
          </div>

          <div className={styles.filtersBar} aria-label={`${activeTab === "active" ? "Active" : "Exited"} employee filters`}>
            <div className={styles.filtersLeft}>
              <FiFilter className={styles.filterIcon} aria-hidden="true" />
              <div className={styles.searchField}>
                <FiSearch className={styles.searchIcon} aria-hidden="true" />
                <input
                  id={`${activeTab}EmployeeSearch`}
                  type="search"
                  value={currentFilters.search}
                  onChange={(event) => updateCurrentFilter("search", event.target.value)}
                  placeholder="Search here..."
                  className={styles.searchInput}
                />
              </div>

              <select
                id={`${activeTab}BillingTypeFilter`}
                value={currentFilters.billingType}
                onChange={(event) => updateCurrentFilter("billingType", event.target.value)}
                className={styles.selectField}
              >
                <option value="">Select Bill Type</option>
                {currentFilterOptions.billingType.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                id={`${activeTab}EntityFilter`}
                value={currentFilters.entity}
                onChange={(event) => updateCurrentFilter("entity", event.target.value)}
                className={styles.selectField}
              >
                <option value="">Select Entity</option>
                {currentFilterOptions.entity.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                id={`${activeTab}CustomerFilter`}
                value={currentFilters.customer}
                onChange={(event) => updateCurrentFilter("customer", event.target.value)}
                className={styles.selectField}
              >
                <option value="">Select Customer</option>
                {currentFilterOptions.customer.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className={styles.filtersRight}>
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearCurrentFilters}
                disabled={!hasCurrentFilters}
              >
                Clear
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.headcountTable}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Consultant Name</th>
                  <th>Joining Date</th>
                  <th>Bill Type</th>
                  <th>Entity</th>
                  <th>Customer</th>
                  {activeTab === "exited" ? (
                    <>
                      <th>Exit Date</th>
                      <th>Exit Reason</th>
                    </>
                  ) : null}
                  <th className={styles.actionsHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length ? (
                  paginatedEmployees.map((employee, index) => (
                    <tr key={getEmployeeId(employee)}>
                      <td>{startEntry + index}</td>
                      <td>{employee.consultantName}</td>
                      <td>{formatMonthYear(employee.joiningDate)}</td>
                      <td>{employee.billingType}</td>
                      <td>{employee.entity}</td>
                      <td>{employee.customer}</td>
                      {activeTab === "exited" ? (
                        <>
                          <td>{formatMonthYear(employee.exitDetails?.exitDate)}</td>
                          <td>{employee.exitDetails?.exitReason || "-"}</td>
                        </>
                      ) : null}
                      <td>
                        <button
                          type="button"
                          className={styles.viewButton}
                          onClick={() =>
                            navigate(`/headcount/${getEmployeeId(employee)}`, { state: { employee } })
                          }
                          aria-label={`View details for ${employee.consultantName || "employee"}`}
                          title="View details"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className={styles.emptyState} colSpan={activeTab === "exited" ? 9 : 7}>
                      {activeTab === "active" && hasActiveFilters
                        ? "No active employees match the selected filters."
                        : activeTab === "exited" && hasExitedFilters
                          ? "No exited employees match the selected filters."
                        : activeTab === "active"
                          ? "No active employees added yet."
                          : "No exited employees yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  aria-label="Rows per page"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.pageIndicator} aria-live="polite">
                Page {visiblePage} of {totalPages}
              </div>

              <div className={styles.paginationControls}>
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={handlePreviousPage}
                  disabled={visiblePage === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.pageButton}
                  onClick={handleNextPage}
                  disabled={visiblePage === totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
