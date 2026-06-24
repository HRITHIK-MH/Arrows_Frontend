import API from './axiosConfig';

/**
 * Add a new employee to headcount
 * @param {Object} employeeData - Employee details
 * @returns {Promise<Object>} Response with added employee data
 */
export const addEmployee = async (employeeData) => {
  try {
    const response = await API.post('/headcount/addEmployee', employeeData);
    return response?.data?.data || response?.data || null;
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
    const response = await API.get('/headcount/activeEmployees', {
      params: {
        page,
        limit,
        search: search || undefined,
        bill_type: billType || undefined,
        entity: entity || undefined,
        customer: customer || undefined,
      },
    });
    return response?.data || { content: [], totalElements: 0, totalPages: 0, currentPage: page };
  } catch (error) {
    console.error('Error fetching active employees:', error);
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
    const response = await API.put(`/headcount/updateEmployee/${employeeId}`, employeeData);
    return response?.data || null;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

/**
 * Exit an employee (mark as exited)
 * Backend expects: { employee_id, exitDate, exitReason } in POST body
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
    };
    const response = await API.post('/headcount/exitEmployee', exitRequest);
    return response?.data || null;
  } catch (error) {
    console.error('Error exiting employee:', error);
    throw error;
  }
};
