import API from './axiosConfig';

/**
 * Get timesheet dashboard for an employee
 * @param {string} employeeId - Employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 * @returns {Promise<Object>} Dashboard data
 */
export const fetchTimesheetDashboard = async (employeeId, month, year) => {
  try {
    const response = await API.get('/api/timesheet/dashboard', {
      params: {
        employee_id: employeeId,
        month,
        year,
      },
    });
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching timesheet dashboard:', error);
    throw error;
  }
};

/**
 * Log a daily timesheet entry
 * @param {Object} entryData - Daily entry data (DailyEntryRequest)
 * @returns {Promise<Object>} Response from server
 */
export const logDailyEntry = async (entryData) => {
  try {
    const response = await API.post('/api/timesheet/daily', entryData);
    return response?.data || null;
  } catch (error) {
    console.error('Error logging daily timesheet entry:', error);
    throw error;
  }
};

/**
 * Log timesheet entries for a week
 * @param {Object} entriesData - Weekly entries data (WeeklyEntryRequest)
 * @returns {Promise<Object>} Response from server
 */
export const logWeeklyEntries = async (entriesData) => {
  try {
    const response = await API.post('/api/timesheet/weekly', entriesData);
    return response?.data || null;
  } catch (error) {
    console.error('Error logging weekly timesheet entries:', error);
    throw error;
  }
};

/**
 * Log timesheet entries for an entire month
 * @param {Object} entriesData - Monthly entries data (MonthlyEntryRequest)
 * @returns {Promise<Object>} Response from server
 */
export const logMonthlyEntries = async (entriesData) => {
  try {
    const response = await API.post('/api/timesheet/monthly', entriesData);
    return response?.data || null;
  } catch (error) {
    console.error('Error logging monthly timesheet entries:', error);
    throw error;
  }
};

/**
 * Submit approval for timesheet (approve or reject)
 * Backend endpoint: PUT /api/timesheet/approval
 * @param {Object} approvalData - Approval request data
 * @returns {Promise<Object>} Response from server
 */
export const submitTimesheetApproval = async (approvalData) => {
  try {
    const response = await API.put('/api/timesheet/approval', approvalData);
    return response?.data || null;
  } catch (error) {
    console.error('Error submitting timesheet approval:', error);
    throw error;
  }
};

/**
 * Get timesheet review for an employee
 * @param {string} employeeId - Employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 * @returns {Promise<Object>} Review data
 */
export const fetchTimesheetReview = async (employeeId, month, year) => {
  try {
    const response = await API.get('/api/timesheet/review', {
      params: {
        employee_id: employeeId,
        month,
        year,
      },
    });
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching timesheet review:', error);
    throw error;
  }
};

/**
 * Get team timesheet summary for a manager
 * @param {string} managerId - Manager ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 * @returns {Promise<Object>} Team summary data
 */
export const fetchTeamTimesheetSummary = async (managerId, month, year) => {
  try {
    const response = await API.get('/api/timesheet/team', {
      params: {
        manager_id: managerId,
        month,
        year,
      },
    });
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching team timesheet summary:', error);
    throw error;
  }
};

/**
 * Get project-wise hour distribution for an employee
 * @param {string} employeeId - Employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (YYYY)
 * @returns {Promise<Object>} Project distribution data
 */
export const fetchProjectDistribution = async (employeeId, month, year) => {
  try {
    const response = await API.get('/api/timesheet/projects', {
      params: {
        employee_id: employeeId,
        month,
        year,
      },
    });
    return response?.data || null;
  } catch (error) {
    console.error('Error fetching project distribution:', error);
    throw error;
  }
};
