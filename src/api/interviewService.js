import API, { createServiceApi } from './axiosConfig';

const interviewApi = createServiceApi('');
const INTERVIEWS_ENDPOINT = '/interviews';
const INTERVIEW_META_FILTERS_ENDPOINT = '/interviews/meta/filters';
const INTERVIEW_GROUPS_ENDPOINT = '/interview-groups';
const INTERVIEW_GROUP_CREATE_META_ENDPOINT = '/interview-groups/create/meta';
const INTERVIEW_GROUP_AVAILABLE_USERS_ENDPOINT = '/interview-groups/{groupId}/available-users';
const INTERVIEW_GROUP_TEAM_MEMBERS_META_ENDPOINT = '/interview-groups/team-members/meta';
const INTERVIEW_GROUP_TEAM_MEMBERS_ENDPOINT = '/interview-groups/{groupId}/team-members';
const INTERVIEW_GROUP_ENDPOINT = '/interview-groups/{groupId}';

const normalizeInterviewGroupApiId = (groupId) => {
  if (!groupId || typeof groupId !== 'object') return String(groupId || '').trim();
  return String(
    groupId.backendGroupId ||
      groupId.groupId ||
      groupId.interviewGroupId ||
      groupId._id ||
      groupId.uuid ||
      groupId.id ||
      ''
  ).trim();
};

export const fetchInterviews = async ({ page = 1, limit = 100, search, candidateId, status, interviewType, sortBy = 'interviewDateTime', sortOrder = 'asc' } = {}) => {
  const params = {
    page,
    limit,
    search,
    candidateId,
    status,
    interviewType,
    sortBy,
    sortOrder,
  };
  const response = await interviewApi.get(INTERVIEWS_ENDPOINT, { params, skipAuthRedirect: true });
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const createInterview = async (payload) => {
  const response = await interviewApi.post(INTERVIEWS_ENDPOINT, payload, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const fetchInterviewFiltersMeta = async () => {
  const response = await interviewApi.get(INTERVIEW_META_FILTERS_ENDPOINT, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || response?.data || null;
};

export const fetchInterviewGroups = async ({ page = 1, limit = 100, search, status } = {}) => {
  const params = { page, limit, search, status };
  const response = await interviewApi.get(INTERVIEW_GROUPS_ENDPOINT, { params, skipAuthRedirect: true });
  return response?.data?.data || { items: [], pagination: { page, limit, totalRecords: 0, totalPages: 0 } };
};

export const fetchInterviewGroupCreateMeta = async () => {
  const response = await interviewApi.get(INTERVIEW_GROUP_CREATE_META_ENDPOINT, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || response?.data || null;
};

export const createInterviewGroup = async (payload) => {
  const response = await interviewApi.post(INTERVIEW_GROUPS_ENDPOINT, payload, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const fetchInterviewGroup = async (groupId) => {
  if (!groupId) return null;
  const endpoint = INTERVIEW_GROUP_ENDPOINT.replace('{groupId}', encodeURIComponent(groupId));
  const response = await interviewApi.get(endpoint, { skipAuthRedirect: true });
  return response?.data?.data || null;
};

export const updateInterviewGroup = async (groupId, payload) => {
  if (!groupId) return null;
  const endpoint = INTERVIEW_GROUP_ENDPOINT.replace('{groupId}', encodeURIComponent(groupId));
  const response = await interviewApi.put(endpoint, payload, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const deleteInterviewGroup = async (groupId) => {
  if (!groupId) return null;
  const endpoint = INTERVIEW_GROUP_ENDPOINT.replace('{groupId}', encodeURIComponent(groupId));
  const response = await interviewApi.delete(endpoint, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const fetchInterviewGroupTeamMembersMeta = async () => {
  const response = await interviewApi.get(INTERVIEW_GROUP_TEAM_MEMBERS_META_ENDPOINT, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || response?.data || null;
};

export const addInterviewGroupTeamMember = async (groupId, payload) => {
  const apiGroupId = normalizeInterviewGroupApiId(groupId);
  if (!apiGroupId) return null;
  const endpoint = INTERVIEW_GROUP_TEAM_MEMBERS_ENDPOINT.replace('{groupId}', encodeURIComponent(apiGroupId));
  const response = await interviewApi.post(endpoint, payload, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const updateInterviewGroupTeamMember = async (groupId, userId, payload) => {
  if (!groupId || !userId) return null;
  const endpoint = `${INTERVIEW_GROUP_TEAM_MEMBERS_ENDPOINT.replace('{groupId}', encodeURIComponent(groupId))}/${encodeURIComponent(userId)}`;
  const response = await interviewApi.put(endpoint, payload, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const deleteInterviewGroupTeamMember = async (groupId, userId) => {
  if (!groupId || !userId) return null;
  const endpoint = `${INTERVIEW_GROUP_TEAM_MEMBERS_ENDPOINT.replace('{groupId}', encodeURIComponent(groupId))}/${encodeURIComponent(userId)}`;
  const response = await interviewApi.delete(endpoint, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

const unwrapArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const fetchAvailableInterviewers = async (groupId) => {
  if (!groupId) return [];
  const endpoint = INTERVIEW_GROUP_AVAILABLE_USERS_ENDPOINT.replace('{groupId}', encodeURIComponent(groupId));
  const response = await interviewApi.get(endpoint, {
    skipAuthRedirect: true,
  });
  return unwrapArray(response?.data);
};

export const fetchInterviewDetail = async (interviewId) => {
  const response = await interviewApi.get(`${INTERVIEWS_ENDPOINT}/${encodeURIComponent(interviewId)}`);
  return response?.data?.data || null;
};

export const updateInterviewStatus = async (interviewId, statusUpdate) => {
  const response = await interviewApi.patch(`${INTERVIEWS_ENDPOINT}/${encodeURIComponent(interviewId)}/status`, statusUpdate, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};

export const deleteInterview = async (interviewId) => {
  const response = await interviewApi.delete(`${INTERVIEWS_ENDPOINT}/${encodeURIComponent(interviewId)}`, {
    skipAuthRedirect: true,
  });
  return response?.data?.data || null;
};
