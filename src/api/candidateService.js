import API, { createServiceApi } from './axiosConfig';

const candidateApi = createServiceApi('');

export const fetchCandidates = async ({ page = 1, limit = 100, search, source, rating, stage, status, sortBy = 'modifiedTime', sortOrder = 'desc' } = {}) => {
  const payload = {
    page,
    limit,
    search,
    source,
    rating,
    stage,
    status,
    sortBy,
    sortOrder,
  };
  const response = await candidateApi.post('/candidates', payload, {
    skipAuth: true,
    skipAuthRedirect: true,
  });
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const fetchCandidateFiltersMeta = async () => {
  const response = await candidateApi.get('/candidates/meta/filters', {
    skipAuthRedirect: true,
  });
  return response?.data?.data || response?.data || null;
};

export const fetchCandidateDetail = async (candidateId) => {
  const response = await candidateApi.get(`/candidates/${encodeURIComponent(candidateId)}`);
  return response?.data?.data || null;
};

export const createCandidate = async (candidate) => {
  // Use the information endpoint which expects the CandidateInformationRequest shape
  const response = await candidateApi.post('/candidates/information', candidate);
  return response?.data?.data || null;
};

export const updateCandidate = async (candidateId, candidate) => {
  const response = await candidateApi.put(`/candidates/${encodeURIComponent(candidateId)}`, candidate);
  return response?.data?.data || null;
};

export const deleteCandidate = async (candidateId, options = { softDelete: true }) => {
  const response = await candidateApi.delete(`/candidates/${encodeURIComponent(candidateId)}`, {
    data: options,
  });
  return response?.data?.data || null;
};
