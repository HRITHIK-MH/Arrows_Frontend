import API, { createServiceApi } from './axiosConfig';

const interviewApi = createServiceApi('');
const INTERVIEWS_ENDPOINT = '/interviews';
const INTERVIEW_META_FILTERS_ENDPOINT = '/interviews/meta/filters';
const INTERVIEW_GROUP_AVAILABLE_USERS_ENDPOINT = '/interview-groups/available-users';

export const fetchInterviews = async ({ page = 1, limit = 100, search, candidateId, status, interviewType, sortBy = 'interviewDateTime', sortOrder = 'asc' } = {}) => {
  const params = {
    page,
    limit,
    search,
    candidateId,
    status,
    interviewType,
    sortBy,
    sortOrder,
  };
  const response = await interviewApi.get(INTERVIEWS_ENDPOINT, { params, skipAuthRedirect: true });
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const createInterview = async (payload) => {
  const response = await interviewApi.post(INTERVIEWS_ENDPOINT, payload, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const fetchInterviewFiltersMeta = async () => {
  const response = await interviewApi.get(INTERVIEW_META_FILTERS_ENDPOINT, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || response?.data || null;
};

const unwrapArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const fetchAvailableInterviewers = async () => {
  const response = await interviewApi.get(INTERVIEW_GROUP_AVAILABLE_USERS_ENDPOINT, {
    skipAuthRedirect: true,
  });
  return unwrapArray(response?.data);
};

export const fetchInterviewDetail = async (interviewId) => {
  const response = await interviewApi.get(`${INTERVIEWS_ENDPOINT}/${encodeURIComponent(interviewId)}`);
  return response?.data?.data || null;
};

export const updateInterviewStatus = async (interviewId, statusUpdate) => {
  const response = await interviewApi.patch(`${INTERVIEWS_ENDPOINT}/${encodeURIComponent(interviewId)}/status`, statusUpdate, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const deleteInterview = async (interviewId) => {
  const response = await interviewApi.delete(`${INTERVIEWS_ENDPOINT}/${encodeURIComponent(interviewId)}`, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};
