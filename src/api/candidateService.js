import API, { createServiceApi } from './axiosConfig';

const candidateApi = createServiceApi('');
const CANDIDATE_INFORMATION_ENDPOINT = '/candidates/information';

export const fetchCandidates = async ({ page = 1, limit = 100, search, source, rating, stage, status, sortBy = 'modifiedTime', sortOrder = 'desc' } = {}) => {
  const params = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(source ? { source } : {}),
    ...(rating ? { rating } : {}),
    ...(stage ? { stage } : {}),
    ...(status ? { status } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
  };

  const response = await candidateApi.get('/candidates', {
    params,
    skipAuth: true,
    skipAuthRedirect: true,
  });
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const fetchCandidateFiltersMeta = async () => {
  // Retry once on transient timeouts/network blips. Increase per-request timeout.
  const maxAttempts = 2;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const response = await candidateApi.get('/candidates/meta/filters', {
        skipAuthRedirect: true,
        timeout: 30000,
      });
      return response?.data?.data || response?.data || null;
    } catch (err) {
      attempt += 1;
      if (attempt >= maxAttempts) throw err;
      // small backoff before retrying
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  return null;
};

export const fetchCandidateDetail = async (candidateId) => {
  const response = await candidateApi.get(`/candidates/${encodeURIComponent(candidateId)}`);
  return response?.data?.data || null;
};

export const createCandidate = async (candidate) => {
  const response = await candidateApi.post(CANDIDATE_INFORMATION_ENDPOINT, candidate, {
    skipAuth: true,
    skipAuthRedirect: true,
  });
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
