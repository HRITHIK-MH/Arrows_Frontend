import API, { createServiceApi } from './axiosConfig';

const clientJobApi = createServiceApi('');

const unwrapRecruiterItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeRecruiterItem = (item, index) => {
  if (!item || typeof item !== 'object') return null;

  const recruiterId = String(item?.userId || item?.id || item?.recruiterId || '').trim();
  const recruiterName = String(item?.name || item?.displayName || item?.fullName || '').trim();
  if (!recruiterId || !recruiterName) return null;

  return {
    id: recruiterId,
    name: recruiterName,
    email:
      String(item?.email || item?.contactEmail || item?.userEmail || '')
        .trim() || `${recruiterName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    role: String(item?.assignmentRole || item?.role || 'Recruiter')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (ch) => ch.toUpperCase()),
    sortIndex: Number.isFinite(Number(item?.sortIndex)) ? Number(item?.sortIndex) : index,
  };
};

const normalizeTeamMemberPayload = (member) => {
  const userId = String(member?.userId || member?.id || member?.recruiterId || '').trim();
  if (!userId) return null;

  return {
    userId,
    assignmentRole: String(member?.assignmentRole || member?.role || 'Recruiter').trim(),
  };
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '').trim(),
  );

export const fetchRecruiters = async ({ openingJobId } = {}) => {
  const response = await clientJobApi.get('/recruiters', {
    params: openingJobId ? { openingJobId } : undefined,
    skipAuthRedirect: true,
  });
  const items = unwrapRecruiterItems(response?.data);

  return items
    .map((item, index) => normalizeRecruiterItem(item, index))
    .filter(Boolean);
};

export const fetchJobTeamMembers = async (openingJobId) => {
  if (!openingJobId) return [];

  const response = await clientJobApi.get(`/jobs/${encodeURIComponent(openingJobId)}/team-members`, {
    skipAuthRedirect: true,
  });
  const items = unwrapRecruiterItems(response?.data);

  return items
    .map((item, index) => normalizeRecruiterItem(item, index))
    .filter(Boolean);
};

export const saveTeamMembers = async ({ jobOpeningId, openingJobId, teamMembers = [], permissions = {} }) => {
  const persistedJobOpeningId = String(jobOpeningId || '').trim();
  const normalizedTeamMembers = Array.isArray(teamMembers)
    ? teamMembers.map(normalizeTeamMemberPayload).filter(Boolean)
    : [];

  if (!isUuid(persistedJobOpeningId) || normalizedTeamMembers.length === 0) {
    console.warn('[saveTeamMembers] Skipping team member assignment because required DB ids are missing.', {
      jobOpeningId: persistedJobOpeningId,
      openingJobId,
      teamMembers,
    });
    return null;
  }

  const payload = {
    jobOpeningId: persistedJobOpeningId,
    teamMembers: normalizedTeamMembers,
    permissions: {
      visibility: permissions.visibility || 'private',
      access: permissions.access || 'restricted',
    },
  };

  console.log('[saveTeamMembers] POST /jobs/team-members payload:', payload);

  return clientJobApi.post('/jobs/team-members', payload, {
    skipAuthRedirect: true,
  });
};
