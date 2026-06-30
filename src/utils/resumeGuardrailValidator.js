const RESPONSIBILITY_KEYWORDS = [
  'implemented',
  'developed',
  'designed',
  'created',
  'workflow',
  'dashboard',
  'integration',
  'process',
  'solution',
  'project',
  'responsible',
  'managed',
  'improving',
  'improved',
  'enabling',
  'ensuring',
  'contributed',
  'followed',
  'acted',
  'resolved',
  'architected',
];

const DESIGNATION_ACTION_KEYWORDS = [
  'implemented',
  'developed',
  'designed',
  'created',
  'responsible',
  'managed',
  'built',
  'delivered',
  'integrated',
  'automated',
];

const ACTIVE_END_DATE_PATTERN = /\b(present|current|till\s*date|to\s*date|ongoing|now)\b/i;

const normalizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const normalizeToken = (value) => normalizeText(value).toLowerCase();

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const cloneResumeJson = (resumeJson) => {
  if (!isObject(resumeJson)) return resumeJson;

  try {
    return structuredClone(resumeJson);
  } catch (_error) {
    return JSON.parse(JSON.stringify(resumeJson));
  }
};

const getFirstTextValue = (object = {}, keys = []) => {
  if (!isObject(object)) return '';

  for (const key of keys) {
    const value = normalizeText(object[key]);
    if (value) return value;
  }

  return '';
};

const getCompanyValue = (employmentRecord = {}) =>
  getFirstTextValue(employmentRecord, [
    'company',
    'company_name',
    'employer',
    'organization',
    'organisation',
    'current_company',
  ]);

const getDesignationValue = (employmentRecord = {}) =>
  getFirstTextValue(employmentRecord, [
    'designation',
    'job_title',
    'job_title_role',
    'title',
    'role',
    'position',
    'current_designation',
  ]);

const getEndDateValue = (employmentRecord = {}) =>
  getFirstTextValue(employmentRecord, [
    'end_date',
    'to_date',
    'end',
    'duration_end',
    'employment_end_date',
  ]);

const getStartDateValue = (employmentRecord = {}) =>
  getFirstTextValue(employmentRecord, [
    'start_date',
    'from_date',
    'start',
    'duration_start',
    'employment_start_date',
  ]);

const getPeriodValue = (employmentRecord = {}) =>
  getFirstTextValue(employmentRecord, ['period', 'duration', 'date_range', 'dates', 'tenure']);

const containsResponsibilityKeyword = (value, keywords = RESPONSIBILITY_KEYWORDS) => {
  const normalized = normalizeToken(value);
  return keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(normalized));
};

export const isValidCurrentCompany = (value) => {
  const company = normalizeText(value);
  if (!company) return false;
  if (company.length > 80) return false;
  if (containsResponsibilityKeyword(company)) return false;
  if (company.split(/\s+/).length > 8) return false;
  if (/\b(each|before|after|where|which|that|using|through|across|for)\b/i.test(company) && company.split(/\s+/).length > 4) {
    return false;
  }
  if (/[.!?]\s*$/.test(company)) return false;
  return true;
};

const looksLikeResponsibilitySentence = (value) => {
  const text = normalizeText(value);
  if (!text) return true;
  if (/[.!?]\s*$/.test(text)) return true;
  if (/\b(each|before|after|where|which|that|using|through|across|for)\b/i.test(text) && text.split(/\s+/).length > 6) {
    return true;
  }
  return containsResponsibilityKeyword(text, DESIGNATION_ACTION_KEYWORDS);
};

export const isValidCurrentDesignation = (value) => {
  const designation = normalizeText(value);
  if (!designation) return false;
  if (designation.length > 100) return false;
  if (designation.split(/\s+/).length > 10) return false;
  if (looksLikeResponsibilitySentence(designation)) return false;
  return true;
};

const parseYearMonth = (value, { allowActiveValue = false } = {}) => {
  const raw = normalizeText(value);
  if (!raw) return 0;
  if (allowActiveValue && ACTIVE_END_DATE_PATTERN.test(raw)) return Number.POSITIVE_INFINITY;

  const parsedDate = new Date(raw);
  if (!Number.isNaN(parsedDate.getTime())) return parsedDate.getTime();

  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) return 0;

  const year = Number.parseInt(yearMatch[0], 10);
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthIndex = monthNames.findIndex((month) => new RegExp(`\\b${month}`, 'i').test(raw));
  const month = monthIndex >= 0 ? monthIndex : 0;
  return new Date(year, month, 1).getTime();
};

const getStartSortValue = (employmentRecord = {}) => {
  const startDate = getStartDateValue(employmentRecord);
  if (startDate) return parseYearMonth(startDate);

  const periodStart = getPeriodValue(employmentRecord).split(/\s+(?:-|to|–|—)\s+/i)[0];
  return parseYearMonth(periodStart);
};

const isActiveEmploymentRecord = (employmentRecord = {}) => {
  if (!isObject(employmentRecord)) return false;

  const endDate = getEndDateValue(employmentRecord);
  const period = getPeriodValue(employmentRecord);
  const status = getFirstTextValue(employmentRecord, ['status', 'employment_status']);

  if (!endDate) return true;
  if (ACTIVE_END_DATE_PATTERN.test(`${endDate} ${period} ${status}`)) return true;
  return false;
};

const getLatestActiveEmploymentRecord = (employmentHistory = []) => {
  if (!Array.isArray(employmentHistory)) return null;

  const activeRecords = employmentHistory.filter(isActiveEmploymentRecord);
  if (activeRecords.length === 0) return null;

  return activeRecords
    .slice()
    .sort((left, right) => getStartSortValue(right) - getStartSortValue(left))[0];
};

export const applyResumeGuardrails = (resumeJson = {}) => {
  if (!isObject(resumeJson)) return resumeJson;

  const guardedResumeJson = cloneResumeJson(resumeJson);
  const professionalInformation = guardedResumeJson.professional_information || {};
  guardedResumeJson.professional_information = professionalInformation;
  const employmentHistory = Array.isArray(guardedResumeJson.employment_history)
    ? guardedResumeJson.employment_history
    : [];

  if (employmentHistory.length === 0) {
    professionalInformation.current_company = null;
    professionalInformation.current_designation = null;
    return guardedResumeJson;
  }

  const activeEmployment = getLatestActiveEmploymentRecord(employmentHistory);
  if (!activeEmployment) {
    if (!isValidCurrentCompany(professionalInformation.current_company)) {
      professionalInformation.current_company = null;
    }
    if (!isValidCurrentDesignation(professionalInformation.current_designation)) {
      professionalInformation.current_designation = null;
    }
    return guardedResumeJson;
  }

  const currentCompany = getCompanyValue(activeEmployment);
  const currentDesignation = getDesignationValue(activeEmployment);

  if (isValidCurrentCompany(currentCompany)) {
    professionalInformation.current_company = currentCompany;
  } else {
    professionalInformation.current_company = null;
  }

  if (isValidCurrentDesignation(currentDesignation)) {
    professionalInformation.current_designation = currentDesignation;
  } else {
    professionalInformation.current_designation = null;
  }

  return guardedResumeJson;
};
