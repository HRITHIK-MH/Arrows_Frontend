import styles from "./Headcount.module.scss";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiPlus,
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
    setActiveFilters((current) => ({ ...current, [fieldName]: value }));
  };

  const updateExitedFilter = (fieldName, value) => {
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
    setActiveFilters({
      search: "",
      billingType: "",
      entity: "",
      customer: "",
    });
  };

  const clearExitedFilters = () => {
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
        <section className={styles.header}>
          <div>
            <span className={styles.kicker}>New Employee</span>
            <h1>{editingEmployeeId !== null ? "Edit Employee" : "Add Employee"}</h1>
          </div>
        </section>

        <section className={styles.formPage}>
          <ReusableForm
            config={employeeFormConfig}
            onSubmit={handleSubmit}
            initialData={formData}
          />
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page} aria-label="Headcount">
      <section className={styles.content}>
        <div className={styles.tableHeader}>
          <div>
            <h1>Headcount</h1>
            <p>
              {activeEmployees.length} active, {exitedEmployees.length} exited
            </p>
          </div>
          <button className={styles.addButton} type="button" onClick={openForm}>
            <FiPlus aria-hidden="true" />
            Add Employee
          </button>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Headcount employee status">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active"}
            className={`${styles.tabButton} ${activeTab === "active" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Employees
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "exited"}
            className={`${styles.tabButton} ${activeTab === "exited" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("exited")}
          >
            Exited Employees
          </button>
        </div>

        <div className={styles.filterBar} aria-label={`${activeTab === "active" ? "Active" : "Exited"} employee filters`}>
            <label className={styles.filterField} htmlFor={`${activeTab}EmployeeSearch`}>
              <span>Consultant</span>
              <input
                id={`${activeTab}EmployeeSearch`}
                type="search"
                value={currentFilters.search}
                onChange={(event) => updateCurrentFilter("search", event.target.value)}
                placeholder="Search consultant"
              />
            </label>

            <label className={styles.filterField} htmlFor={`${activeTab}BillingTypeFilter`}>
              <span>Bill Type</span>
              <select
                id={`${activeTab}BillingTypeFilter`}
                value={currentFilters.billingType}
                onChange={(event) => updateCurrentFilter("billingType", event.target.value)}
              >
                <option value="">All</option>
                {currentFilterOptions.billingType.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className={styles.filterField} htmlFor={`${activeTab}EntityFilter`}>
              <span>Entity</span>
              <select
                id={`${activeTab}EntityFilter`}
                value={currentFilters.entity}
                onChange={(event) => updateCurrentFilter("entity", event.target.value)}
              >
                <option value="">All</option>
                {currentFilterOptions.entity.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className={styles.filterField} htmlFor={`${activeTab}CustomerFilter`}>
              <span>Customer</span>
              <select
                id={`${activeTab}CustomerFilter`}
                value={currentFilters.customer}
                onChange={(event) => updateCurrentFilter("customer", event.target.value)}
              >
                <option value="">All</option>
                {currentFilterOptions.customer.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={styles.clearFiltersButton}
              onClick={clearCurrentFilters}
              disabled={!hasCurrentFilters}
            >
              Clear
            </button>
          </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Consultant Name</th>
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
              {displayedEmployees.length ? (
                displayedEmployees.map((employee, index) => (
                  <tr key={getEmployeeId(employee)}>
                    <td>{index + 1}</td>
                    <td>{employee.consultantName}</td>
                    <td>{employee.billingType}</td>
                    <td>{employee.entity}</td>
                    <td>{employee.customer}</td>
                    {activeTab === "exited" ? (
                      <>
                        <td>{employee.exitDetails?.exitDate || "-"}</td>
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
                  <td className={styles.emptyState} colSpan={activeTab === "exited" ? 8 : 6}>
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
      </section>

    </div>
  );
}
