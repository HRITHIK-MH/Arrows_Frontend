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

export const saveTeamMembers = async ({ openingJobId, teamMembers = [], permissions = {} }) => {
  if (!openingJobId || !Array.isArray(teamMembers) || teamMembers.length === 0) {
    return null;
  }

  return clientJobApi.post('/job-openings/team-members', {
    openingJobId,
    teamMembers,
    permissions: {
      visibility: permissions.visibility || 'private',
      access: permissions.access || 'restricted',
    },
  }, {
    skipAuthRedirect: true,
  });
};
