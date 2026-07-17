import API, { createServiceApi } from './axiosConfig';

const candidateApi = createServiceApi('');
const CANDIDATE_INFORMATION_ENDPOINT = '/candidates/information';
const CANDIDATE_INFORMATION_META_ENDPOINT = '/candidates/information/meta';

const unwrapList = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export const fetchCandidates = async ({
  page = 1,
  limit = 20,
  search,
  source,
  rating,
  stage,
  status,
  sortBy = 'modifiedTime',
  sortOrder = 'desc'
} = {}) => {
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

  const fallback = {
    items: [],
    pagination: { page, limit, totalRecords: 0, totalPages: 0 },
  };

  const retryDelaysMs = [1000, 2500];
  const maxAttempts = retryDelaysMs.length + 1;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await candidateApi.get('/candidates', {
        params,
        timeout: 90000,
      });

      const payload = response?.data;
      const wrappedData = payload?.data;
      const isSuccessEnvelope = payload?.status !== false;

      if (!isSuccessEnvelope) {
        const apiMessage = String(payload?.message || 'Failed to load candidates.').trim();
        throw new Error(apiMessage || 'Failed to load candidates.');
      }

      return wrappedData || fallback;
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts) {
        break;
      }

      const retryAfter = retryDelaysMs[attempt - 1] || 1000;
      console.warn(`fetchCandidates attempt ${attempt} failed; retrying in ${retryAfter}ms`, err);
      await new Promise((resolve) => setTimeout(resolve, retryAfter));
    }
  }

  throw lastError || new Error('Failed to load candidates.');
};


export const fetchCandidateGenders = async () =>
  unwrapList(
    await candidateApi.get('/candidates/genders', {
    })
  );

export const fetchCandidateExperienceYears = async () =>
  unwrapList(
    await candidateApi.get('/candidates/experience-years', {
    })
  );

export const fetchCandidateOffersInHand = async () =>
  unwrapList(
    await candidateApi.get('/candidates/offers-in-hand', {
    })
  );

export const fetchPrimarySkills = async () =>
  unwrapList(
    await candidateApi.get('/skills/primary', {
    })
  );

export const fetchExperienceLevels = async () =>
  unwrapList(
    await candidateApi.get('/experience-levels', {
    })
  );

export const fetchSources = async () =>
  unwrapList(
    await candidateApi.get('/sources', {
    })
  );

export const fetchEmploymentTypes = async () =>
  unwrapList(
    await candidateApi.get('/employment-types', {
    })
  );

export const fetchCandidateFiltersMeta = async () => {
  const maxAttempts = 2;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const response = await candidateApi.get(CANDIDATE_INFORMATION_META_ENDPOINT, {
        timeout: 60000, // longer timeout for meta fetch
      });
      return response?.data?.data || response?.data || null;
    } catch (err) {
      attempt += 1;
      if (attempt >= maxAttempts) throw err;
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  return null;
};


export const fetchCandidateDetail = async (candidateId) => {
  const response = await candidateApi.get(`/candidates/${encodeURIComponent(candidateId)}`, {
  });
  return response?.data?.data || null;
};

export const createCandidate = async (candidate) => {
  const response = await candidateApi.post(CANDIDATE_INFORMATION_ENDPOINT, candidate, {
  });
  return response?.data?.data || null;
};

export const updateCandidate = async (candidateId, candidate) => {
  const response = await candidateApi.put(`/candidates/${encodeURIComponent(candidateId)}`, candidate, {
  });
  return response?.data?.data || null;
};

export const deleteCandidate = async (candidateId, options = { softDelete: true }) => {
  const response = await candidateApi.delete(`/candidates/${encodeURIComponent(candidateId)}`, {
    data: options,
  });
  return response?.data?.data || null;
};
