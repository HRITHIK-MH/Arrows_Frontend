import API, { createServiceApi } from './axiosConfig';

const interviewApi = createServiceApi('interview');

export const fetchInterviews = async ({ page = 1, limit = 100, search, candidateId, status, interviewType, sortBy = 'interviewDateTime', sortOrder = 'asc' } = {}) => {
  const payload = {
    page,
    limit,
    search,
    candidateId,
    status,
    interviewType,
    sortBy,
    sortOrder,
  };
  const response = await interviewApi.post('/interviews', payload);
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const fetchInterviewFiltersMeta = async () => {
  const response = await interviewApi.get('/interviews/meta/filters', {
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
  const response = await interviewApi.get('/interview-groups/available-users', {
    skipAuthRedirect: true,
  });
  return unwrapArray(response?.data);
};

export const fetchInterviewDetail = async (interviewId) => {
  const response = await interviewApi.get(`/interviews/${encodeURIComponent(interviewId)}`);
  return response?.data?.data || null;
};

export const updateInterviewStatus = async (interviewId, statusUpdate) => {
  const response = await interviewApi.patch(`/interviews/${encodeURIComponent(interviewId)}/status`, statusUpdate);
  return response?.data?.data || null;
};
