/* eslint-disable no-unused-vars */
import { createServiceApi } from './axiosConfig';

const skillApi = createServiceApi('');

/**
 * Create a new soft skill
 * @param {string} skillName - Name of the soft skill
 * @returns {Promise} API response
 */
export const addSoftSkill = async (skillName) => {
  try {
    const response = await skillApi.post('/skills/soft', { skillName });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to add skill';
    return { success: false, error: errorMessage };
  }
};

/**
 * Fetch all soft skills
 * @returns {Promise} List of soft skills
 */
export const fetchSoftSkills = async () => {
  try {
    const response = await skillApi.get('/skills/soft');
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to fetch soft skills';
    return { success: false, error: errorMessage };
  }
};

/**
 * Check if a soft skill already exists
 * @param {string} skillName - Name of the soft skill
 * @returns {Promise} Boolean indicating if skill exists
 */
export const checkSoftSkillExists = async (skillName) => {
  try {
    const response = await skillApi.get('/skills/soft/check', {
      params: { skillName },
    });
    return { success: true, exists: response.data?.exists || false };
  } catch (error) {
    // If endpoint doesn't exist, return false (local checking will be used)
    return { success: false, exists: false };
  }
};
