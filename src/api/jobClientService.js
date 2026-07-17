import API, { createServiceApi } from './axiosConfig';

const clientJobApi = createServiceApi('');

const unwrapList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.records)) {
    return payload.records;
  }

  return [];
};

const unwrapPage = (response) => {
  const payload = response?.data;
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const hasPaginationFields = (value) =>
    value && (
      value.page !== undefined ||
      value.limit !== undefined ||
      value.totalRecords !== undefined ||
      value.totalPages !== undefined
    );
  const paginationSource = data?.pagination || (hasPaginationFields(data) ? data : payload);
  const pagination = hasPaginationFields(paginationSource)
    ? {
        page: paginationSource.page,
        limit: paginationSource.limit,
        totalRecords: paginationSource.totalRecords,
        totalPages: paginationSource.totalPages,
      }
    : null;

  if (Array.isArray(data)) {
    return { items: data, pagination: null };
  }

  if (Array.isArray(data?.items)) {
    return { items: data.items, pagination };
  }

  if (Array.isArray(data?.records)) {
    return { items: data.records, pagination };
  }

  if (Array.isArray(data?.content)) {
    return { items: data.content, pagination };
  }

  return { items: unwrapList(response), pagination };
};

const extractApiEnvelope = (response) => {
  const payload = response?.data;
  if (!payload || typeof payload !== 'object') {
    return { status: true, message: '', data: payload };
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    return {
      status: payload.status,
      message: payload.message,
      data: payload.data,
      statusCode: payload.statusCode,
    };
  }

  return { status: true, message: '', data: payload };
};

const toApiError = (fallbackMessage, envelope) => {
  const message = String(envelope?.message || fallbackMessage || 'Request failed').trim();
  const error = new Error(message || 'Request failed');
  error.response = {
    data: {
      status: false,
      statusCode: envelope?.statusCode || 400,
      message,
      data: envelope?.data ?? null,
    },
  };
  return error;
};

const assertApiSucceeded = (response, fallbackMessage) => {
  const envelope = extractApiEnvelope(response);
  if (envelope.status === false) {
    throw toApiError(fallbackMessage, envelope);
  }
  return envelope;
};

const assertJobCreatePersisted = (response) => {
  const envelope = assertApiSucceeded(response, 'Failed to save job opening in DB.');
  const data = envelope?.data;

  if (!data || typeof data !== 'object') {
    throw toApiError('Job opening save did not return persisted data.', envelope);
  }

  const isSaved = data.saved;
  const openingJobId = String(data.openingJobId || data.jobPositionId || data.jobOpeningId || data.jobId || data.id || '').trim();

  if (isSaved === false || !openingJobId) {
    throw toApiError('Job opening was not saved in DB. Please try again.', envelope);
  }

  return response;
};

const assertJobUpdatePersisted = (response) => {
  const envelope = assertApiSucceeded(response, 'Failed to update job opening in DB.');
  const data = envelope?.data;

  if (!data || typeof data !== 'object') {
    throw toApiError('Job opening update did not return persisted data.', envelope);
  }

  const openingJobId = String(data.openingJobId || data.jobPositionId || data.jobOpeningId || data.jobId || data.id || '').trim();
  if (!openingJobId) {
    throw toApiError('Job opening update was not confirmed by DB.', envelope);
  }

  return response;
};

const normalizeText = (value, fallback = '-') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

export const fetchJobs = async () =>
  unwrapList(await clientJobApi.get('/jobs'));

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '').trim(),
  );

const firstNonEmpty = (...values) =>
  values.map((value) => String(value ?? '').trim()).find(Boolean) || '';

const getClientDbId = (row = {}) =>
  firstNonEmpty(
    row?.clientId,
    row?.clientID,
    row?.backendClientId,
    row?.clientDbId,
    row?.clientDBId,
    row?.clientDatabaseId,
    row?.clientUUID,
    row?.clientUuid,
    row?.uuid,
    row?.id,
    row?._id,
    row?.clientMasterId,
    row?.clientMasterID,
  );

const getClientDisplayId = (row = {}) =>
  firstNonEmpty(
    row?.clientCode,
    row?.clientNumber,
    row?.externalClientId,
    row?.externalClientID,
    row?.clientID,
    row?.displayClientID,
    row?.displayClientId,
    row?.clientId,
  );

const toIsoInstant = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const toIsoLocalDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toIntOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : null;
};

export const toJobRequest = (row = {}) => {
  const clientId = String(row.clientId || '').trim();

  return {
    clientId: isUuid(clientId) ? clientId : null,
    openingJobId: String(row.openingJobId || row.jobPositionId || '').trim() || null,
    externalJobRef: String(row.openingJobId || row.jobPositionId || '').trim() || null,
    jobTitle: String(row.postingTitle || row.positionName || row.jobTitle || '').trim(),
    jobDescription: String(row.jobDescription || row.additionalSkills || '').trim() || null,
    employmentType: String(row.jobType || row.employmentType || '').trim() || null,
    positionLevel: String(row.positionLevel || '').trim() || null,
    noOfPositions: toIntOrNull(row.noOfPositions),
    workMode: String(row.workType || row.hiringType || row.workMode || '').trim() || null,
    experienceMin: toIntOrNull(row.minExperience),
    experienceMax: toIntOrNull(row.maxExperience),
    ctcMin: toNumberOrNull(row.minSalary),
    ctcMax: toNumberOrNull(row.maxSalary),
    currencyCode: 'INR',
    ctcUnit: 'LPA',
    jobStatus: String(row.jobOpeningStatus || row.jobStatus || 'Active').trim(),
    priority: String(row.priority || 'Medium').trim(),
    createdByUserId: null,
    jobReceivedDate: toIsoInstant(row.jobReceivedDate),
    validityUpto: toIsoLocalDate(row.validityUpto),
    targetDate: toIsoLocalDate(row.targetDate),
    locationCity: String(row.city || row.location || '').trim() || null,
    locationState: null,
    locationCountry: null,
    headcountFilled: toIntOrNull(row.headcountFilled),
    jobFunction: String(row.jobFunction || '').trim() || null,
    seniorityLevel: String(row.seniorityLevel || '').trim() || null,
  };
};

export const createJob = async (row) =>
  assertJobCreatePersisted(await clientJobApi.post('/jobs/job-information', toJobRequest(row)));

export const updateJob = async (jobId, row) =>
  assertJobUpdatePersisted(await clientJobApi.patch(`/jobs/${encodeURIComponent(jobId)}/status`, toJobRequest(row)));

export const deleteJob = async (jobId) =>
  clientJobApi.delete(`/jobs/${encodeURIComponent(jobId)}`);

const CLIENTS_ENDPOINT = '/clients';
const CLIENTS_CREATE_META_ENDPOINT = '/clients/create/meta';
const CLIENTS_META_FILTERS_ENDPOINT = '/clients/meta/filters';
const CLIENT_ENDPOINT = '/clients/{clientId}';

const attachPagination = (items, pagination) => Object.assign(items, {
  pagination: pagination || null,
});

export const fetchClients = async ({ page = 1, limit = 10 } = {}) => {
  const response = await clientJobApi.get(CLIENTS_ENDPOINT, { params: { page, limit } });
  const pageData = unwrapPage(response);
  return attachPagination(pageData.items, pageData.pagination);
};

export const fetchClientFiltersMeta = async () => {
  const response = await clientJobApi.get(CLIENTS_META_FILTERS_ENDPOINT);
  return response?.data?.data || response?.data || null;
};

export const fetchClientCreateMeta = async () => {
  const response = await clientJobApi.get(CLIENTS_CREATE_META_ENDPOINT);
  return response?.data?.data || response?.data || null;
};

export const fetchClientById = async (clientId) => {
  if (!clientId) return null;
  const endpoint = CLIENT_ENDPOINT.replace('{clientId}', encodeURIComponent(clientId));
  const response = await clientJobApi.get(endpoint);
  return response?.data?.data || response?.data || null;
};

const toSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const fetchSkills = async () =>
  unwrapList(await clientJobApi.get('/skills/technical'));

export const fetchSoftSkills = async () =>
  unwrapList(await clientJobApi.get('/skills/soft'));

export const fetchPositionLevels = async () =>
  unwrapList(await clientJobApi.get('/positions/levels'));

export const fetchWorkTypes = async () =>
  unwrapList(await clientJobApi.get('/work-types'));

export const fetchEmploymentTypes = async () =>
  unwrapList(await clientJobApi.get('/employment-types'));

export const fetchLocations = async () =>
  unwrapList(await clientJobApi.get('/locations'));

export const fetchJobInformationMeta = async () => {
  const response = await clientJobApi.get('/jobs/job-information/meta');
  return response?.data ?? null;
};

export const fetchClientRequirementMeta = async () => {
  const response = await clientJobApi.get('/jobs/client-requirement/meta');
  return response?.data ?? null;
};

export const toSkillOption = (row) => {
  const skillName = String(row?.skillName || row?.name || '').trim();
  const skillCode = String(row?.skillCode || '').trim();
  const skillId = String(row?.skillId || row?.id || '').trim();

  if (!skillName && !skillCode && !skillId) {
    return null;
  }

  return {
    value: skillCode || toSlug(skillName) || skillId,
    label: skillName || skillCode || skillId,
  };
};

export const toClientRequest = (row = {}) => {
  const clientId = String(row.clientId || row.displayClientId || '').trim() || null;
  const clientName = String(row.clientName || row.name || '').trim();
  const clientType = String(row.secondaryContactPerson || '').trim() || null;
  const industry = String(row.accountManager  || '').trim() || null;
  const status = String(row.clientStatus || row.status || 'Active').trim();
  const contactPersonName = String(
    row.primaryContactPerson ||
    row.contactPersonName ||
    row.contactPerson ||
    ''
  ).trim() || null;
  const contactPersonEmail = String(
    row.contactEmail ||
    row.contactPersonEmail ||
    row.email ||
    ''
  ).trim() || null;
  const contactPersonPhone = String(
    row.contactNumber ||
    row.contactPersonPhone ||
    row.phone ||
    ''
  ).trim() || null;
  const city = String(row.activeFrom ||  '').trim() || null;
  const address = String(row.comments || '').trim() || null;

  return {
    clientId,
    clientName,
    clientType,
    industry,
    status,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
    city,
    address,
  };
};

export const createClient = (payload) =>
  clientJobApi.post(CLIENTS_ENDPOINT, toClientRequest(payload));

export const updateClient = (clientId, payload) => {
  const endpoint = CLIENT_ENDPOINT.replace('{clientId}', encodeURIComponent(clientId));
  return clientJobApi.put(endpoint, toClientRequest(payload));
};

export const deleteClient = (clientId) => {
  const endpoint = CLIENT_ENDPOINT.replace('{clientId}', encodeURIComponent(clientId));
  return clientJobApi.delete(endpoint);
};

export const normalizeClientRecord = (row, index = 0) => {
  const backendClientId = getClientDbId(row);
  const displayClientId = getClientDisplayId(row) || `CL-${index + 1}`;

  return {
    ...row,
    backendClientId,
    clientId: displayClientId,
    displayClientId,
    clientName: normalizeText(row?.clientName || row?.name || row?.companyName),

    contactEmail: normalizeText(
      row?.contactPersonEmail ||
      row?.contactEmail ||
      row?.primaryContactEmail ||
      row?.email
    ),

    contactNumber: normalizeText(
      row?.contactPersonPhone ||
      row?.contactNumber ||
      row?.contactPhone ||
      row?.primaryContactPhone ||
      row?.phone
    ),

    primaryContactPerson: normalizeText(
      row?.contactPersonName ||
      row?.primaryContactPerson ||
      row?.contactPerson ||
      row?.primaryContactName
    ),

    secondaryContactPerson: normalizeText(
      row?.secondaryContactPerson ||
      row?.secondaryContactName ||
      row?.secondaryContactPersonName
    ),

    accountManager: normalizeText(
      row?.assignedPerson ||
      row?.assignedPersonName ||
      row?.accountManager ||
      row?.accountManagerName
    ),

    activeFrom: row?.activeFrom || row?.activeFromDate || row?.activeDate || '',
    comments: row?.comments || row?.note || row?.address || '',
    clientStatus: normalizeText(row?.status || row?.clientStatus, 'Active'),
    clientLocation: normalizeText(row?.city || row?.clientLocation || row?.location),
  };
};

export const toClientOption = (row) => {
  const clientId = String(getClientDbId(row) || row?.clientId || row?.clientID || row?.id || '').trim();
  const clientName = String(row?.clientName || row?.name || '').trim();

  if (!clientId || !clientName) {
    return null;
  }

  return {
    value: clientId,
    label: clientName,
    clientId,
    id: clientId,
    clientName,
  };
};

export const normalizeJobRecord = (row, index = 0) => ({
  jobId: row?.jobId || row?.id || null,
  jobPositionId: row?.jobPositionId || row?.openingJobId || row?.jobId || `JOP-${String(index + 1).padStart(3, '0')}`,
  openingJobId: row?.openingJobId || row?.jobPositionId || row?.jobId || '',
  postingTitle: row?.postingTitle || row?.positionName || row?.title || '-',
  positionName: row?.positionName || row?.postingTitle || row?.title || '-',
  location: row?.location || row?.city || '-',
  targetDate: row?.targetDate || row?.jobReceivedDate || '',
  jobOpeningStatus: row?.jobOpeningStatus || row?.status || 'Active',
  priority: row?.priority || 'Medium',
  clientId: row?.clientId || '-',
  clientName: row?.clientName || row?.company || '-',
  contactPersonName: row?.contactPersonName || '-',
  contactPersonEmail: row?.contactPersonEmail || row?.contactEmail || '-',
  assignedRecruiters: row?.assignedRecruiters || '-',
  hiringManager: row?.hiringManager || '-',
  candidates: Array.isArray(row?.candidates) ? row.candidates : [],
  ...row,
});
