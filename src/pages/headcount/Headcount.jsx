import styles from "./Headcount.module.scss";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
import { addEmployee, fetchActiveEmployees, fetchExitedEmployees, updateEmployee } from "../../api/headcountService";
import { fetchHeadcountDropdownOptions } from "../../api/masterDataService";

const HEADCOUNT_STORAGE_KEY = "headcount:employees:v1";

const getInitialForm = () => {
  const initial = {};
  employeeConfig.steps[0].fields.forEach((field) => {
    initial[field.name] = "";
  });
  return initial;
};

const applyDropdownOptions = (config, dropdownOptions) => ({
  ...config,
  steps: config.steps.map((step) => ({
    ...step,
    fields: (step.fields || []).map((field) => {
      const options = dropdownOptions?.[field.name];
      return Array.isArray(options) && options.length > 0
        ? { ...field, options }
        : field;
    }),
  })),
});

const loadStoredEmployees = () => {
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

const getEmployeeId = (employee) => employee?.employee_id || employee?.employeeId || employee?.id || employee?.serialNumber;

const getConsultantName = (employee) => employee?.consultant_name || employee?.consultantName || "";

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

const extractEmployeeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.employees)) return data.employees;
  return [];
};

const formatApiErrorMessage = (message, fallbackMessage) => {
  const text = String(message || "").trim();
  if (!text) return fallbackMessage;

  if (/^unknown entity:/i.test(text)) {
    const entity = text.split(":").slice(1).join(":").trim();
    return entity
      ? `Something went wrong. The selected entity "${entity}" is not available.`
      : "Something went wrong. The selected entity is not available.";
  }

  return text;
};

const getApiErrorMessage = (error, fallbackMessage) =>
  formatApiErrorMessage(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message,
    fallbackMessage
  );

const mergeEmployees = (apiEmployees, exitedApiEmployees, storedEmployees) => {
  const apiEmployeeIds = new Set(
    [...apiEmployees, ...exitedApiEmployees].map((employee) => String(getEmployeeId(employee)))
  );
  const storedExitedEmployees = storedEmployees.filter(
    (employee) => isExitedEmployee(employee) && !apiEmployeeIds.has(String(getEmployeeId(employee)))
  );

  return [...apiEmployees, ...exitedApiEmployees, ...storedExitedEmployees];
};

export default function Headcount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const formAction = searchParams.get("action");
  const [employees, setEmployees] = useState(() => loadStoredEmployees());
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [formData, setFormData] = useState(() => getInitialForm());
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({});
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
        String(getConsultantName(employee)).toLowerCase().includes(searchTerm);
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
        String(getConsultantName(employee)).toLowerCase().includes(searchTerm);
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
    setSearchParams({ action: "edit" }, { replace: true, state: null });
  }, [location.state, setSearchParams]);

  useEffect(() => {
    const requestedTab = location.state?.headcountTab;
    if (requestedTab !== "active" && requestedTab !== "exited") return;

    setActiveTab(requestedTab);
    navigate("/headcount", { replace: true, state: null });
  }, [location.state, navigate]);

  useEffect(() => {
    if (location.state?.editEmployee) return;

    if (formAction === "add" && !isAddingEmployee) {
      setFormData(getInitialForm());
      setEditingEmployeeId(null);
      setActiveTab("active");
      setIsAddingEmployee(true);
      return;
    }

    if (!formAction && isAddingEmployee && editingEmployeeId === null) {
      setIsAddingEmployee(false);
    }
  }, [editingEmployeeId, formAction, isAddingEmployee, location.state]);

  const openForm = () => {
    setFormData(getInitialForm());
    setEditingEmployeeId(null);
    setActiveTab("active");
    setIsAddingEmployee(true);
    setSearchParams({ action: "add" });
  };

  const closeForm = () => {
    setIsAddingEmployee(false);
    setEditingEmployeeId(null);
    setSearchParams({});
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

  // Load employees from API on component mount
  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [activeData, exitedData] = await Promise.all([
          fetchActiveEmployees({ page: 1, limit: 1000 }),
          fetchExitedEmployees({ page: 1, limit: 1000 }),
        ]);
        setEmployees(mergeEmployees(
          extractEmployeeList(activeData),
          extractEmployeeList(exitedData),
          loadStoredEmployees()
        ));
      } catch (err) {
        setEmployees((current) => {
          if (current.length > 0) {
            setError(null);
            return current;
          }

          const savedEmployees = loadStoredEmployees();
          if (savedEmployees.length > 0) {
            setError(null);
            return savedEmployees;
          }

          setError("Failed to load employees");
          return current;
        });
        console.error("Error loading employees:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        setDropdownOptions(await fetchHeadcountDropdownOptions());
      } catch (err) {
        console.error("Error loading headcount dropdown options:", err);
      }
    };

    loadDropdownOptions();
  }, []);

  useEffect(() => {
    if (!error) return undefined;

    const timer = window.setTimeout(() => {
      setError(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [error]);

  const handleSubmit = async (data) => {
    try {
      setError(null);
      const employeeData = { ...data };
      delete employeeData.serialNumber;

      const normalizedEmployee = {
        ...employeeData,
        employee_id: editingEmployeeId || employeeData.employee_id || employeeData.employeeId || createEmployeeId(),
        consultant_name: String(employeeData.consultant_name || employeeData.consultantName || "").trim(),
      };

      if (editingEmployeeId !== null) {
        await updateEmployee(editingEmployeeId, normalizedEmployee);
        setEmployees((current) =>
          current.map((employee) =>
            String(getEmployeeId(employee)) === String(editingEmployeeId)
              ? { ...employee, ...normalizedEmployee }
              : employee
          )
        );
      } else {
        const newEmployeeResponse = await addEmployee(normalizedEmployee);
        const newEmployee = {
          ...normalizedEmployee,
          ...newEmployeeResponse,
          employeeId: getEmployeeId(newEmployeeResponse) || getEmployeeId(normalizedEmployee),
          isExited: false,
          status: "active",
        };
        setEmployees((current) => [...current, newEmployee]);
      }

      setIsAddingEmployee(false);
      setEditingEmployeeId(null);
      setSearchParams({});
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save employee. Please try again."));
      console.error("Error saving employee:", err);
    }
  };

  const employeeFormConfig = useMemo(
    () => ({
      ...applyDropdownOptions(employeeConfig, dropdownOptions),
      showCancelAction: true,
      cancelLabel: "Cancel",
      onCancel: closeForm,
    }),
    [dropdownOptions]
  );

  if (isLoading) {
    return (
      <div className={styles.page} aria-label="Headcount">
        <section className={styles.card}>
          <div className={styles.infoRow}>
            <div className={styles.infoContent}>
              <p className={styles.description}><strong>Loading Headcount Data...</strong></p>
            </div>
          </div>
        </section>
      </div>
    );
  }

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

          {error ? (
            <div className={styles.errorBanner}>
              {error}
            </div>
          ) : null}

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
        {error ? (
          <div className={styles.errorBanner}>
            {error}
          </div>
        ) : null}
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
                      <td>{getConsultantName(employee)}</td>
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
                          aria-label={`View details for ${getConsultantName(employee) || "employee"}`}
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
