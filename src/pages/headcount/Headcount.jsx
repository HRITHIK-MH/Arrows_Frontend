import styles from "./Headcount.module.scss";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { addEmployee, fetchActiveEmployees, fetchEmployeeById, fetchExitedEmployees, updateEmployee } from "../../api/headcountService";
import { fetchHeadcountDropdownOptions } from "../../api/masterDataService";

const getInitialForm = () => {
  const initial = {};
  employeeConfig.steps[0].fields.forEach((field) => {
    initial[field.name] = "";
  });
  return initial;
};

const formatBillingTypeLabel = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const token = text
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (token === "billable") return "Billable";
  if (token === "non billable" || token === "nonbillable") return "Non-Billable";

  return text;
};

const mapBillingTypeOptions = (options = []) =>
  (Array.isArray(options) ? options : [])
    .map((option) => {
      const value = String(option?.value ?? option ?? "").trim();
      if (!value) return null;

      return {
        ...(option && typeof option === "object" ? option : {}),
        value,
        label: formatBillingTypeLabel(option?.label ?? value),
      };
    })
    .filter(Boolean);

const applyDropdownOptions = (config, dropdownOptions) => ({
  ...config,
  steps: config.steps.map((step) => ({
    ...step,
    fields: (step.fields || []).map((field) => {
      const options =
        field.name === "billing_type"
          ? mapBillingTypeOptions(dropdownOptions?.[field.name])
          : dropdownOptions?.[field.name];
      return Array.isArray(options) && options.length > 0
        ? { ...field, options }
        : field;
    }),
  })),
});

const getEmployeeId = (employee) => employee?.employee_id || employee?.employeeId || employee?.id || employee?.serialNumber;

const getEmployeeRowKey = (employee, index) => {
  const employeeId = getEmployeeId(employee);
  const joiningDate = employee?.joiningDate || employee?.joining_date || "";
  const exitDate = employee?.exitDetails?.exitDate || employee?.exitDate || employee?.exit_date || "";

  if (employeeId) {
    return `${employeeId}-${joiningDate || exitDate || "row"}-${index}`;
  }

  return `employee-row-${index}`;
};

const getConsultantName = (employee) => employee?.consultant_name || employee?.consultantName || "";

const createEmployeeId = () => `emp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const withHeadcountFieldAliases = (employee = {}) => ({
  ...employee,
  consultant_name: employee.consultant_name ?? employee.consultantName ?? "",
  entity: employee.entity ?? "",
  joining_date: employee.joining_date ?? employee.joiningDate ?? "",
  joiningDate: employee.joiningDate ?? employee.joining_date ?? "",
  work_location:
    employee.work_location ??
    employee.workLocation ??
    employee.work_mode ??
    employee.workMode ??
    "",
  workLocation:
    employee.workLocation ??
    employee.work_location ??
    employee.workMode ??
    employee.work_mode ??
    "",
  mode:
    employee.mode ??
    employee.work_mode ??
    employee.workMode ??
    employee.employment_type ??
    employee.employmentType ??
    "",
  cost:
    employee.cost ??
    employee.payRate ??
    employee.pay_rate ??
    employee.cost_band ??
    employee.costBand ??
    "",
  customer:
    employee.customer ??
    employee.customerName ??
    employee.customer_name ??
    employee.clientName ??
    employee.client_name ??
    employee.client ??
    "",
  billing_type:
    employee.billing_type ??
    employee.billingType ??
    employee.bill_type ??
    employee.billType ??
    "",
  billingType:
    employee.billingType ??
    employee.billing_type ??
    employee.bill_type ??
    employee.billType ??
    "",
});

const normalizeOptionToken = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const resolveDropdownOptionValue = (rawValue, options = []) => {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return "";
  }

  const valueAsString = String(rawValue);
  const normalizedValue = normalizeOptionToken(rawValue);
  const optionList = Array.isArray(options) ? options : [];

  const exactMatch = optionList.find((option) => String(option?.value ?? "") === valueAsString);
  if (exactMatch) {
    return exactMatch.value;
  }

  const normalizedMatch = optionList.find((option) => {
    const optionValueToken = normalizeOptionToken(option?.value);
    const optionLabelToken = normalizeOptionToken(option?.label);
    return normalizedValue && (optionValueToken === normalizedValue || optionLabelToken === normalizedValue);
  });

  return normalizedMatch ? normalizedMatch.value : rawValue;
};

const toHeadcountFormData = (employee = {}, dropdownOptions = {}) => {
  const aliasedEmployee = withHeadcountFieldAliases(employee);
  const locationOptions = dropdownOptions.work_location || dropdownOptions.workLocation || [];
  const billingOptions = dropdownOptions.billing_type || dropdownOptions.billingType || [];

  const normalizedWorkLocation = resolveDropdownOptionValue(aliasedEmployee.work_location, locationOptions);
  const normalizedBillingType = resolveDropdownOptionValue(aliasedEmployee.billing_type, billingOptions);

  return {
    ...aliasedEmployee,
    entity: resolveDropdownOptionValue(aliasedEmployee.entity, dropdownOptions.entity || []),
    work_location: normalizedWorkLocation,
    workLocation: normalizedWorkLocation,
    mode: resolveDropdownOptionValue(aliasedEmployee.mode, dropdownOptions.mode || []),
    cost: resolveDropdownOptionValue(aliasedEmployee.cost, dropdownOptions.cost || []),
    customer: resolveDropdownOptionValue(aliasedEmployee.customer, dropdownOptions.customer || []),
    billing_type: normalizedBillingType,
    billingType: normalizedBillingType,
  };
};

const ensureOptionForValue = (options = [], value) => {
  if (value === undefined || value === null || value === "") {
    return Array.isArray(options) ? options : [];
  }

  const safeOptions = Array.isArray(options) ? options : [];
  const normalizedValue = normalizeOptionToken(value);
  const hasMatch = safeOptions.some((option) => {
    const optionValueToken = normalizeOptionToken(option?.value);
    const optionLabelToken = normalizeOptionToken(option?.label);
    return normalizedValue && (optionValueToken === normalizedValue || optionLabelToken === normalizedValue);
  });

  if (hasMatch) {
    return safeOptions;
  }

  return [{ value, label: String(value) }, ...safeOptions];
};

const withEditFallbackOptions = (config, formValues = {}) => {
  const fallbackFields = new Set(["work_location", "mode", "cost", "customer"]);

  return {
    ...config,
    steps: (config.steps || []).map((step) => ({
      ...step,
      fields: (step.fields || []).map((field) => {
        if (!fallbackFields.has(field.name)) {
          return field;
        }

        return {
          ...field,
          options: ensureOptionForValue(field.options, formValues[field.name]),
        };
      }),
    })),
  };
};

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

const extractEmployeeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.employees)) return data.employees;
  return [];
};

const extractTotalRecords = (data, fallback = 0) => {
  const total = Number(
    data?.totalElements ?? data?.total ?? data?.count ?? data?.data?.totalElements ?? fallback
  );
  return Number.isFinite(total) ? total : fallback;
};

const optionValuesFromMaster = (options = []) =>
  (Array.isArray(options) ? options : [])
    .map((option) => String(option?.value ?? option ?? "").trim())
    .filter(Boolean);

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

const firstNonEmptyValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

const validateHeadcountRequiredFields = (employee = {}) => {
  const missing = [];

  if (!firstNonEmptyValue(employee.work_location, employee.workLocation)) {
    missing.push("Work Location");
  }
  if (!firstNonEmptyValue(employee.mode)) {
    missing.push("Mode");
  }
  if (!firstNonEmptyValue(employee.cost)) {
    missing.push("Cost");
  }
  if (!firstNonEmptyValue(employee.customer)) {
    missing.push("Customer");
  }

  return missing;
};

export default function Headcount() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const formAction = searchParams.get("action");
  const initialEditEmployee = location.state?.editEmployee || null;
  const [employees, setEmployees] = useState([]);
  const [isAddingEmployee, setIsAddingEmployee] = useState(
    () => Boolean(initialEditEmployee) || formAction === "add" || formAction === "edit"
  );
  const [formData, setFormData] = useState(() =>
    initialEditEmployee ? withHeadcountFieldAliases(initialEditEmployee) : getInitialForm()
  );
  const [editingEmployeeId, setEditingEmployeeId] = useState(
    () => (initialEditEmployee ? getEmployeeId(initialEditEmployee) ?? null : null)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    () => String(location.state?.successMessage || "").trim()
  );
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [listReloadKey, setListReloadKey] = useState(0);
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
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const saveInFlightRef = useRef(false);
  const [tabDataCache, setTabDataCache] = useState({
    active: null,
    exited: null,
  });
  const currentFilters = activeTab === "active" ? activeFilters : exitedFilters;
  const activeFilterOptions = useMemo(
    () => ({
      billingType: optionValuesFromMaster(dropdownOptions.billing_type || dropdownOptions.billingType),
      entity: optionValuesFromMaster(dropdownOptions.entity),
      customer: optionValuesFromMaster(dropdownOptions.customer),
    }),
    [dropdownOptions]
  );
  const exitedFilterOptions = useMemo(
    () => ({
      billingType: optionValuesFromMaster(dropdownOptions.billing_type || dropdownOptions.billingType),
      entity: optionValuesFromMaster(dropdownOptions.entity),
      customer: optionValuesFromMaster(dropdownOptions.customer),
    }),
    [dropdownOptions]
  );
  const currentFilterOptions = activeTab === "active" ? activeFilterOptions : exitedFilterOptions;
  const displayedEmployees = useMemo(() => {
    const searchText = String(searchInput || "").trim().toLowerCase();

    if (!searchText) {
      return employees;
    }

    return employees.filter((employee) =>
      Object.values(employee).some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      )
    );
  }, [employees, searchInput]);
  const hasActiveFilters = Object.values(activeFilters).some((value) => String(value || "").trim());
  const hasExitedFilters = Object.values(exitedFilters).some((value) => String(value || "").trim());
  const hasCurrentFilters = activeTab === "active" ? hasActiveFilters : hasExitedFilters;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const startEntry = totalRecords === 0 ? 0 : (visiblePage - 1) * rowsPerPage + 1;
  const endEntry = totalRecords === 0 ? 0 : Math.min(startEntry + displayedEmployees.length - 1, totalRecords);
  const currentTabCache = tabDataCache[activeTab];
  const hasCurrentTabCache = Boolean(currentTabCache?.employees);

  useEffect(() => {
    const editEmployee = location.state?.editEmployee;
    if (!editEmployee) return;

    let isMounted = true;
    const editId = getEmployeeId(editEmployee);
    setSearchParams({ action: "edit" }, { replace: true, state: null });

    const loadEditEmployee = async () => {
      try {
        const fullEmployee = editId ? await fetchEmployeeById(editId) : null;
        if (!isMounted) return;
        setFormData(withHeadcountFieldAliases(fullEmployee || editEmployee));
      } catch {
        if (!isMounted) return;
        setFormData(withHeadcountFieldAliases(editEmployee));
      }
    };

    loadEditEmployee();

    return () => {
      isMounted = false;
    };
  }, [location.state, setSearchParams]);

  useEffect(() => {
    const requestedTab = location.state?.headcountTab;
    if (requestedTab !== "active" && requestedTab !== "exited") return;

    navigate("/headcount", { replace: true, state: null });
  }, [location.state, navigate]);

  const openForm = () => {
    setFormData(getInitialForm());
    setEditingEmployeeId(null);
    setActiveTab("active");
    setIsAddingEmployee(true);
    setSearchParams({ action: "add" });
  };

  const closeForm = useCallback(() => {
    setIsAddingEmployee(false);
    setEditingEmployeeId(null);
    setSearchParams({});
  }, [setSearchParams]);

  const updateActiveFilter = useCallback((fieldName, value) => {
    setCurrentPage(1);
    setActiveFilters((current) => ({ ...current, [fieldName]: value }));
  }, []);

  const updateExitedFilter = useCallback((fieldName, value) => {
    setCurrentPage(1);
    setExitedFilters((current) => ({ ...current, [fieldName]: value }));
  }, []);

  const updateCurrentFilter = useCallback((fieldName, value) => {
    if (activeTab === "active") {
      updateActiveFilter(fieldName, value);
      return;
    }

    updateExitedFilter(fieldName, value);
  }, [activeTab, updateActiveFilter, updateExitedFilter]);

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
    setSearchInput("");
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

  const switchTab = (nextTab) => {
    const cachedTabData = tabDataCache[nextTab];

    setActiveTab(nextTab);
    setCurrentPage(1);
    setSearchInput("");

    if (cachedTabData?.employees) {
      setEmployees(cachedTabData.employees);
      setTotalRecords(cachedTabData.totalRecords || cachedTabData.employees.length || 0);
      setIsLoading(false);
      setError(null);
    } else {
      setEmployees([]);
      setTotalRecords(0);
      setIsLoading(true);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(1, visiblePage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages, visiblePage + 1));
  };

  // Load employees from API with server-side pagination + filters
  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiParams = {
          page: currentPage,
          limit: rowsPerPage,
          billType: currentFilters.billingType,
          entity: currentFilters.entity,
          customer: currentFilters.customer,
        };
        const payload =
          activeTab === "active"
            ? await fetchActiveEmployees(apiParams)
            : await fetchExitedEmployees(apiParams);

        const loadedEmployees = extractEmployeeList(payload).map(withHeadcountFieldAliases);
        const nextTotalRecords = extractTotalRecords(payload, loadedEmployees.length);

        setEmployees(loadedEmployees);
        setTotalRecords(nextTotalRecords);
        setTabDataCache((current) => ({
          ...current,
          [activeTab]: {
            employees: loadedEmployees,
            totalRecords: nextTotalRecords,
          },
        }));

        const nextTotalPages = Math.max(1, Math.ceil(nextTotalRecords / rowsPerPage));
        if (currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
        }
      } catch (err) {
        if (!hasCurrentTabCache) {
          setEmployees([]);
          setTotalRecords(0);
        }
        setError(err?.message || "Failed to load employees");
        console.error("Error loading employees:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [activeTab, currentFilters.billingType, currentFilters.entity, currentFilters.customer, currentPage, rowsPerPage, listReloadKey, hasCurrentTabCache]);

  useEffect(() => {
    const otherTab = activeTab === "active" ? "exited" : "active";
    if (tabDataCache[otherTab]) {
      return undefined;
    }

    let isMounted = true;

    const preloadOtherTab = async () => {
      try {
        const payload =
          otherTab === "active"
            ? await fetchActiveEmployees({ page: 1, limit: rowsPerPage })
            : await fetchExitedEmployees({ page: 1, limit: rowsPerPage });

        if (!isMounted) return;

        const loadedEmployees = extractEmployeeList(payload).map(withHeadcountFieldAliases);
        const nextTotalRecords = extractTotalRecords(payload, loadedEmployees.length);

        setTabDataCache((current) => {
          if (current[otherTab]) {
            return current;
          }

          return {
            ...current,
            [otherTab]: {
              employees: loadedEmployees,
              totalRecords: nextTotalRecords,
            },
          };
        });
      } catch (err) {
        console.warn(`Failed to prefetch ${otherTab} headcount data:`, err);
      }
    };

    preloadOtherTab();

    return () => {
      isMounted = false;
    };
  }, [activeTab, rowsPerPage, tabDataCache, currentTabCache]);

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

  useEffect(() => {
    if (!successMessage) return undefined;

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleSubmit = async (data) => {
    if (saveInFlightRef.current) {
      return;
    }

    saveInFlightRef.current = true;
    setIsSavingEmployee(true);

    try {
      setError(null);
      setSuccessMessage("");
      const employeeData = { ...data };
      delete employeeData.serialNumber;

      const normalizedEmployee = withHeadcountFieldAliases({
        ...employeeData,
        employee_id: editingEmployeeId || employeeData.employee_id || employeeData.employeeId || createEmployeeId(),
        consultant_name: String(employeeData.consultant_name || employeeData.consultantName || "").trim(),
      });

      const missingFields = validateHeadcountRequiredFields(normalizedEmployee);
      if (missingFields.length > 0) {
        setError(`Please fill required fields: ${missingFields.join(", ")}.`);
        return;
      }

      const saveResult =
        editingEmployeeId !== null
          ? await updateEmployee(editingEmployeeId, normalizedEmployee)
          : await addEmployee(normalizedEmployee);

      const backendSuccess =
        String(saveResult?.message || saveResult?.raw?.message || "").trim();
      setSuccessMessage(
        backendSuccess ||
          (editingEmployeeId !== null
            ? "Employee updated successfully."
            : "Employee added successfully.")
      );

      setIsAddingEmployee(false);
      setEditingEmployeeId(null);
      setSearchParams({});
      setListReloadKey((current) => current + 1);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save employee. Please try again."));
      console.error("Error saving employee:", err);
    } finally {
      saveInFlightRef.current = false;
      setIsSavingEmployee(false);
    }
  };

  const formInitialData = useMemo(
    () =>
      isAddingEmployee && editingEmployeeId !== null
        ? toHeadcountFormData(formData, dropdownOptions)
        : formData,
    [dropdownOptions, editingEmployeeId, formData, isAddingEmployee]
  );

  const employeeFormConfig = useMemo(
    () => ({
      ...withEditFallbackOptions(
        applyDropdownOptions(employeeConfig, dropdownOptions),
        formInitialData
      ),
      showCancelAction: true,
      cancelLabel: "Cancel",
      onCancel: closeForm,
    }),
    [closeForm, dropdownOptions, formInitialData]
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

          {error ? (
            <div className={styles.errorBanner}>
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className={styles.successBanner}>
              {successMessage}
            </div>
          ) : null}

          <div className={styles.formPage}>
            <ReusableForm
              config={employeeFormConfig}
              onSubmit={handleSubmit}
              initialData={formInitialData}
              isSubmitting={isSavingEmployee}
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
        {successMessage ? (
          <div className={styles.successBanner}>
            {successMessage}
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
                onClick={() => switchTab("active")}
              >
                Active Employees
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "exited"}
                className={`${styles.tabButton} ${activeTab === "exited" ? styles.tabButtonActive : ""}`}
                onClick={() => switchTab("exited")}
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
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
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
                  <option key={option} value={option}>{formatBillingTypeLabel(option)}</option>
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
                {isLoading && employees.length === 0 ? (
                  <tr>
                    <td className={styles.emptyState} colSpan={activeTab === "exited" ? 9 : 7}>
                      Loading Headcount Data...
                    </td>
                  </tr>
                ) : displayedEmployees.length ? (
                  displayedEmployees.map((employee, index) => (
                    <tr key={getEmployeeRowKey(employee, index)}>
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
