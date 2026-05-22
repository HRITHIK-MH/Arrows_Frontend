import API from './axiosConfig';

const unwrapList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
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

const normalizeText = (value, fallback = '-') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

export const fetchJobs = async () => unwrapList(await API.get('jobs'));

export const fetchClients = async () =>
  unwrapList(
    await API.get('clients', {
      // Client list endpoint currently fails when local login token is attached.
      // Skip auth header so dropdown options can still load.
      skipAuth: true,
    })
  );

export const createClient = (payload) => API.post('clients', payload);

export const updateClient = (clientId, payload) =>
  API.put(`clients/${encodeURIComponent(clientId)}`, payload);

export const deleteClient = (clientId) =>
  API.delete(`clients/${encodeURIComponent(clientId)}`);

export const normalizeClientRecord = (row, index = 0) => ({
  clientId: row?.clientId || row?.id || `CL-${index + 1}`,
  clientName: normalizeText(row?.clientName || row?.name),
  contactEmail: normalizeText(row?.contactEmail || row?.email),
  contactNumber: normalizeText(row?.contactNumber || row?.phone),
  primaryContactPerson: normalizeText(row?.primaryContactPerson || row?.contactPersonName),
  secondaryContactPerson: normalizeText(row?.secondaryContactPerson),
  accountManager: normalizeText(row?.accountManager || row?.assignedPerson),
  activeFrom: row?.activeFrom || row?.createdAt || '',
  comments: row?.comments || row?.note || '',
  clientStatus: normalizeText(row?.clientStatus || row?.status, 'Active'),
  clientLocation: normalizeText(row?.clientLocation || row?.location),
});

export const toClientOption = (row) => {
  const clientId = String(row?.clientId || row?.clientID || row?.id || '').trim();
  const clientName = String(row?.clientName || row?.name || '').trim();

  if (!clientId || !clientName) {
    return null;
  }

  return {
    value: clientName,
    label: clientName,
    clientId,
    id: clientId,
  };
};

export const normalizeJobRecord = (row, index = 0) => ({
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
