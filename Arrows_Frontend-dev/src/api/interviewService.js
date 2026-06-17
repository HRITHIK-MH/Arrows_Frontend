import API from './axiosConfig';

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
  const response = await API.post('/interviews', payload);
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const fetchInterviewDetail = async (interviewId) => {
  const response = await API.get(`/interviews/${encodeURIComponent(interviewId)}`);
  return response?.data?.data || null;
};

export const updateInterviewStatus = async (interviewId, statusUpdate) => {
  const response = await API.patch(`/interviews/${encodeURIComponent(interviewId)}/status`, statusUpdate);
  return response?.data?.data || null;
};
