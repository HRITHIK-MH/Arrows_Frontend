import { createServiceApi } from './axiosConfig';

const headcountApi = createServiceApi('');

const EMPTY_EMPLOYEES_RESPONSE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 1,
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const FAILURE_STATUS_VALUES = new Set(['failed', 'failure', 'error', 'not_found', 'not found']);
const READ_TIMEOUT_MS = 90000;
const MUTATION_TIMEOUT_MS = 90000;
const READ_RETRY_DELAYS_MS = [1500];

const normalizeBillTypeFilter = (value = '') => {
  const text = String(value || '').trim();
  if (!text) return '';

  const token = text
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (token === 'billable') return 'billable';
  if (token === 'non billable' || token === 'nonbillable') return 'non-billable';

  return text;
};

const extractBackendErrorMessage = (payload, fallback) =>
  firstValue(
    payload?.message,
    payload?.error,
    payload?.data?.message,
    payload?.data?.error,
    fallback
  );

const extractBackendSuccessMessage = (payload, fallback) =>
  firstValue(payload?.message, payload?.data?.message, fallback);

const shouldRetryReadError = (error) =>
  error?.code === 'ECONNABORTED' || !error?.response;

const waitForRetry = (delayMs) => new Promise((resolve) => window.setTimeout(resolve, delayMs));

const getWithRetry = async (url, config = {}) => {
  const attempts = READ_RETRY_DELAYS_MS.length + 1;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await headcountApi.get(url, {
        timeout: READ_TIMEOUT_MS,
        ...config,
      });
    } catch (error) {
      lastError = error;
      if (!shouldRetryReadError(error) || attempt >= attempts) {
        break;
      }

      const retryDelay = READ_RETRY_DELAYS_MS[attempt - 1] || 1000;
      await waitForRetry(retryDelay);
    }
  }

  throw lastError;
};

const assertSuccessfulMutation = (payload, fallbackMessage) => {
  if (!payload || typeof payload !== 'object') {
    return;
  }

  if (payload.status === false) {
    throw new Error(extractBackendErrorMessage(payload, fallbackMessage));
  }

  if (typeof payload.status === 'string') {
    const normalizedStatus = payload.status.trim().toLowerCase();
    if (FAILURE_STATUS_VALUES.has(normalizedStatus)) {
      throw new Error(extractBackendErrorMessage(payload, fallbackMessage));
    }
  }
};

export const normalizeHeadcountEmployee = (employee = {}) => {
  const exitDate = firstValue(employee.exitDate, employee.exit_date, employee.exitDetails?.exitDate);
  const exitReason = firstValue(employee.exitReason, employee.exit_reason, employee.exitDetails?.exitReason);
  const status = firstValue(employee.status, employee.employee_status);
  const isExited = Boolean(
    employee.isExited ||
    String(status || '').toLowerCase() === 'exited' ||
    exitDate ||
    exitReason
  );

  return {
    ...employee,
    employee_id: firstValue(employee.employee_id, employee.employeeId, employee.id),
    employeeId: firstValue(employee.employeeId, employee.employee_id, employee.id),
    consultant_name: firstValue(employee.consultant_name, employee.consultantName, employee.first_name),
    lastName: firstValue(employee.lastName, employee.last_name),
    email: firstValue(employee.email),
    joining_date: firstValue(employee.joining_date, employee.joiningDate),
    joiningDate: firstValue(employee.joiningDate, employee.joining_date),
    entity: firstValue(employee.entity),
    work_location: firstValue(employee.work_location, employee.workLocation),
    workLocation: firstValue(employee.workLocation, employee.work_location),
    mode: firstValue(employee.mode),
    cost: firstValue(employee.cost, employee.cost_code, employee.costCode, employee.code_cost, employee.codeCost, employee.cost_band, employee.costBand),
    cost_code: firstValue(employee.cost_code, employee.costCode, employee.code_cost, employee.codeCost, employee.cost),
    costCode: firstValue(employee.costCode, employee.cost_code, employee.codeCost, employee.code_cost, employee.cost),
    customer: firstValue(employee.customer),
    billing_type: firstValue(employee.billing_type, employee.billingType, employee.bill_type),
    billingType: firstValue(employee.billingType, employee.billing_type, employee.bill_type),
    createdBy: firstValue(employee.createdBy, employee.created_by),
    updatedBy: firstValue(employee.updatedBy, employee.updated_by),
    status: isExited ? 'exited' : (status || 'active'),
    isExited,
    exitDetails: isExited
      ? {
          ...employee.exitDetails,
          exitDate,
          exitReason,
        }
      : employee.exitDetails,
  };
};

const normalizeHeadcountEmployees = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeHeadcountEmployee);
  }
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const normalizeListField = (fieldName) =>
    Array.isArray(payload[fieldName])
      ? { [fieldName]: payload[fieldName].map(normalizeHeadcountEmployee) }
      : {};

  return {
    ...payload,
    ...normalizeListField('content'),
    ...normalizeListField('data'),
    ...normalizeListField('employees'),
    ...(payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? { data: normalizeHeadcountEmployees(payload.data) }
      : {}),
  };
};

const omitEmptyValues = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

const toAddHeadcountRequest = (employeeData = {}) =>
  omitEmptyValues({
    employee_id: firstValue(employeeData.employee_id, employeeData.employeeId, employeeData.id),
    consultant_name: firstValue(employeeData.consultant_name, employeeData.consultantName),
    joining_date: firstValue(employeeData.joiningDate, employeeData.joining_date),
    entity: firstValue(employeeData.entity),
    work_location: firstValue(employeeData.workLocation, employeeData.work_location),
    mode: firstValue(employeeData.mode),
    cost: firstValue(employeeData.cost),
    customer: firstValue(employeeData.customer),
    billing_type: normalizeBillTypeFilter(firstValue(employeeData.billingType, employeeData.billing_type)),
    created_by: firstValue(employeeData.createdBy, employeeData.created_by, 'Demo Admin'),
  });

const toUpdateHeadcountRequest = (employeeData = {}) =>
  omitEmptyValues({
    consultant_name: firstValue(employeeData.consultant_name, employeeData.consultantName),
    joining_date: firstValue(employeeData.joiningDate, employeeData.joining_date),
    entity: firstValue(employeeData.entity),
    work_location: firstValue(employeeData.workLocation, employeeData.work_location),
    mode: firstValue(employeeData.mode),
    cost: firstValue(employeeData.cost),
    customer: firstValue(employeeData.customer),
    billing_type: normalizeBillTypeFilter(firstValue(employeeData.billingType, employeeData.billing_type)),
    updated_by: firstValue(employeeData.updatedBy, employeeData.updated_by, 'Demo Admin'),
  });

/**
 * Add a new employee to headcount
 * @param {Object} employeeData - Employee details
 * @returns {Promise<Object>} Response with added employee data
 */
export const addEmployee = async (employeeData) => {
  try {
    const response = await headcountApi.post('/headcount/addEmployee', toAddHeadcountRequest(employeeData), {
      skipAuthRedirect: true,
      timeout: MUTATION_TIMEOUT_MS,
    });
    assertSuccessfulMutation(response?.data, 'Failed to save employee.');

    const savedEmployee = response?.data?.data || response?.data || {};
    if (!savedEmployee || typeof savedEmployee !== 'object') {
      throw new Error('Failed to save employee. Empty response from backend.');
    }

    return {
      employee: normalizeHeadcountEmployee(savedEmployee),
      message: String(extractBackendSuccessMessage(response?.data, 'Employee added successfully.') || 'Employee added successfully.').trim(),
      raw: response?.data || null,
    };
  } catch (error) {
    const backendMessage = extractBackendErrorMessage(error?.response?.data);
    if (backendMessage) {
      throw new Error(String(backendMessage).trim());
    }

    if (error?.code === 'ECONNABORTED') {
      throw new Error('Save request timed out before backend responded. Please try again.');
    }

    console.error('Error adding employee:', error);
    throw error;
  }
};

/**
 * Get list of active employees with optional filters and pagination
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} Active employees list with pagination info
 */
export const fetchActiveEmployees = async ({
  page = 1,
  limit = 10,
  search = '',
  billType = '',
  entity = '',
  customer = ''
} = {}) => {
  try {
    const normalizedBillType = normalizeBillTypeFilter(billType);
    const response = await getWithRetry('/headcount/activeEmployees', {
      skipAuthRedirect: true,
      params: {
        page,
        limit,
        search: search || undefined,
        bill_type: normalizedBillType || undefined,
        entity: entity || undefined,
        customer: customer || undefined,
      },
    });
    return normalizeHeadcountEmployees(response?.data) || { ...EMPTY_EMPLOYEES_RESPONSE, currentPage: page };
  } catch (error) {
    if ([204, 404].includes(error?.response?.status)) {
      return { ...EMPTY_EMPLOYEES_RESPONSE, currentPage: page };
    }
    console.error('Error fetching active employees:', error);
    throw error;
  }
};

/**
 * Get list of exited employees with optional filters and pagination
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} Exited employees list with pagination info
 */
export const fetchExitedEmployees = async ({
  page = 1,
  limit = 10,
  search = '',
  billType = '',
  entity = '',
  customer = ''
} = {}) => {
  try {
    const normalizedBillType = normalizeBillTypeFilter(billType);
    const response = await getWithRetry('/headcount/exitedEmployees', {
      skipAuthRedirect: true,
      params: {
        page,
        limit,
        search: search || undefined,
        bill_type: normalizedBillType || undefined,
        entity: entity || undefined,
        customer: customer || undefined,
      },
    });
    return normalizeHeadcountEmployees(response?.data) || { ...EMPTY_EMPLOYEES_RESPONSE, currentPage: page };
  } catch (error) {
    if ([204, 404].includes(error?.response?.status)) {
      return { ...EMPTY_EMPLOYEES_RESPONSE, currentPage: page };
    }
    console.error('Error fetching exited employees:', error);
    throw error;
  }
};


const findEmployeeInPayload = (payload, employeeId) => {
  const employees = Array.isArray(payload)
    ? payload
    : payload?.content || payload?.data?.content || payload?.data || payload?.employees || [];

  return Array.isArray(employees)
    ? employees.find((employee) => String(firstValue(employee.employee_id, employee.employeeId, employee.id)) === String(employeeId))
    : null;
};

const extractEmployeeTotal = (payload, fallback = 0) => {
  const total = Number(payload?.totalElements ?? payload?.total ?? payload?.count ?? payload?.data?.totalElements ?? fallback);
  return Number.isFinite(total) ? total : fallback;
};

const findEmployeeByPaging = async (employeeId, fetcher) => {
  const pageSize = 200;
  let page = 1;
  let totalPages = 1;

  do {
    const payload = await fetcher({ page, limit: pageSize });
    const found = findEmployeeInPayload(payload, employeeId);
    if (found) {
      return normalizeHeadcountEmployee(found);
    }

    const employees = Array.isArray(payload)
      ? payload
      : payload?.content || payload?.data?.content || payload?.data || payload?.employees || [];
    totalPages = Math.max(1, Math.ceil(extractEmployeeTotal(payload, Array.isArray(employees) ? employees.length : 0) / pageSize));
    page += 1;
  } while (page <= totalPages);

  return null;
};

/**
 * Get one employee by employee id from the existing list endpoints.
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object|null>} Employee details
 */
export const fetchEmployeeById = async (employeeId) => {
  const activeEmployee = await findEmployeeByPaging(employeeId, fetchActiveEmployees);
  if (activeEmployee) {
    return activeEmployee;
  }

  return findEmployeeByPaging(employeeId, fetchExitedEmployees);
};

/**
 * Update employee details
 * @param {string} employeeId - Employee ID to update
 * @param {Object} employeeData - Updated employee data
 * @returns {Promise<Object>} Status response
 */
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await headcountApi.put(`/headcount/updateEmployee/${employeeId}`, toUpdateHeadcountRequest(employeeData), {
      skipAuthRedirect: true,
      timeout: MUTATION_TIMEOUT_MS,
    });
    assertSuccessfulMutation(response?.data, 'Failed to update employee.');
    return {
      message: String(extractBackendSuccessMessage(response?.data, 'Employee updated successfully.') || 'Employee updated successfully.').trim(),
      raw: response?.data || null,
    };
  } catch (error) {
    const backendMessage = extractBackendErrorMessage(error?.response?.data);
    if (backendMessage) {
      throw new Error(String(backendMessage).trim());
    }

    if (error?.code === 'ECONNABORTED') {
      throw new Error('Update request timed out before backend responded. Please try again.');
    }

    console.error('Error updating employee:', error);
    throw error;
  }
};

/**
 * Exit an employee (mark as exited)
 * Backend expects: { employee_id, exit_date, exit_reason, updated_by } in POST body
 * @param {string} employeeId - Employee ID
 * @param {Object} exitData - Exit details { exitDate, exitReason }
 * @returns {Promise<Object>} Status response
 */
export const exitEmployee = async (employeeId, exitData) => {
  try {
    const exitRequest = {
      employee_id: employeeId,
      exit_date: exitData.exitDate,
      exit_reason: exitData.exitReason,
      updated_by: firstValue(exitData.updatedBy, exitData.updated_by, 'Demo Admin'),
    };
    const response = await headcountApi.post('/headcount/exitEmployee', exitRequest, {
      skipAuthRedirect: true,
      timeout: MUTATION_TIMEOUT_MS,
    });
    assertSuccessfulMutation(response?.data, 'Failed to save exit details.');
    return {
      message: String(extractBackendSuccessMessage(response?.data, 'Employee exit details saved successfully.') || 'Employee exit details saved successfully.').trim(),
      raw: response?.data || null,
    };
  } catch (error) {
    const backendMessage = extractBackendErrorMessage(error?.response?.data);
    if (backendMessage) {
      throw new Error(String(backendMessage).trim());
    }

    if (error?.code === 'ECONNABORTED') {
      throw new Error('Exit request timed out before backend responded. Please try again.');
    }

    console.error('Error exiting employee:', error);
    throw error;
  }
};
