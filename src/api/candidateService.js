import API from './axiosConfig';

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
  const response = await API.post('/candidates', payload);
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const fetchCandidateFiltersMeta = async () => {
  const response = await API.get('/candidates/meta/filters', {
    skipAuthRedirect: true,
  });
  return response?.data?.data || response?.data || null;
};

export const fetchCandidateDetail = async (candidateId) => {
  const response = await API.get(`/candidates/${encodeURIComponent(candidateId)}`);
  return response?.data?.data || null;
};

export const createCandidate = async (candidate) => {
  // Use the information endpoint which expects the CandidateInformationRequest shape
  const response = await API.post('/candidates/information', candidate);
  return response?.data?.data || null;
};

export const updateCandidate = async (candidateId, candidate) => {
  const response = await API.put(`/candidates/${encodeURIComponent(candidateId)}`, candidate);
  return response?.data?.data || null;
};

export const deleteCandidate = async (candidateId, options = { softDelete: true }) => {
  const response = await API.delete(`/candidates/${encodeURIComponent(candidateId)}`, {
    data: options,
  });
  return response?.data?.data || null;
};
