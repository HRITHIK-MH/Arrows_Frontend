import { createServiceApi } from './axiosConfig';

const headcountApi = createServiceApi('');

const EMPTY_EMPLOYEES_RESPONSE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 1,
};

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

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
    cost: firstValue(employee.cost),
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
    billing_type: firstValue(employeeData.billingType, employeeData.billing_type),
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
    billing_type: firstValue(employeeData.billingType, employeeData.billing_type),
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
    });
    return normalizeHeadcountEmployee(response?.data?.data || response?.data || {});
  } catch (error) {
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
    const response = await headcountApi.get('/headcount/activeEmployees', {
      skipAuthRedirect: true,
      params: {
        page,
        limit,
        search: search || undefined,
        bill_type: billType || undefined,
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
    const response = await headcountApi.get('/headcount/exitedEmployees', {
      skipAuthRedirect: true,
      params: {
        page,
        limit,
        search: search || undefined,
        bill_type: billType || undefined,
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
    });
    return normalizeHeadcountEmployee(response?.data?.data || response?.data || {});
  } catch (error) {
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
    });
    return response?.data || null;
  } catch (error) {
    console.error('Error exiting employee:', error);
    throw error;
  }
};
