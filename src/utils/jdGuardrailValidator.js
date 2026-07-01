import { JD_SCHEMA } from '../api/jdSchema.js';

const normalizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const cloneValue = (value) => {
  try {
    return structuredClone(value);
  } catch (_error) {
    return JSON.parse(JSON.stringify(value));
  }
};

const cleanList = (value) => {
  const values = Array.isArray(value)
    ? value
    : String(value || '').split(/[;,|/\n]/);

  return [...new Set(
    values
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .filter((item) => item.length <= 80)
      .filter((item) => item.split(/\s+/).length <= 8)
  )];
};

const numberValue = (value) => {
  const matched = String(value ?? '').match(/\d+(?:\.\d+)?/);
  return matched ? Number(matched[0]) : 0;
};

const cleanCtcValue = (value) => {
  const matched = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return matched ? matched[0] : '';
};

const isResponsibilityLike = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text) return false;
  if (/[.!?]$/.test(text)) return true;
  if (text.split(/\s+/).length > 10) return true;
  return /\b(responsible|develop|design|implement|manage|coordinate|collaborate|ensure|build|create|deliver|support)\b/i.test(text);
};

const cleanJobName = (value) => {
  const jobName = normalizeText(value);
  if (!jobName) return '';
  if (jobName.length > 80) return '';
  if (isResponsibilityLike(jobName)) return '';
  return jobName;
};

const normalizePositionLevel = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text) return '';
  if (/\b(entry|fresher|graduate|trainee)\b/.test(text)) return 'Entry Level';
  if (/\b(junior|jr)\b/.test(text)) return 'Junior';
  if (/\b(mid|intermediate)\b/.test(text)) return 'Mid Level';
  if (/\b(senior|sr)\b/.test(text)) return 'Senior';
  if (/\b(lead|principal)\b/.test(text)) return 'Lead';
  if (/\b(manager|management)\b/.test(text)) return 'Manager';
  if (/\bdirector\b/.test(text)) return 'Director';
  if (/\b(executive|vp|vice president)\b/.test(text)) return 'Executive';
  return normalizeText(value);
};

const normalizeWorkType = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text) return '';
  if (/\b(remote|work from home|wfh)\b/.test(text)) return 'Remote';
  if (/\b(hybrid)\b/.test(text)) return 'Hybrid';
  if (/\b(on[-\s]?site|office|onsite)\b/.test(text)) return 'On-site';
  return normalizeText(value);
};

const normalizeEmploymentType = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text) return '';
  if (/\b(intern|internship|trainee)\b/.test(text)) return 'Internship';
  if (/\b(contract|contractor|c2c|consultant)\b/.test(text)) return 'Contract';
  if (/\b(part[-\s]?time)\b/.test(text)) return 'Part Time';
  if (/\b(full[-\s]?time|permanent|employee|payroll)\b/.test(text)) return 'Full Time Employment';
  return normalizeText(value);
};

export const applyJdGuardrails = (jdJson = {}) => {
  const guarded = {
    job_information: { ...JD_SCHEMA.job_information, ...(cloneValue(jdJson?.job_information || {})) },
    experience_requirements: { ...JD_SCHEMA.experience_requirements, ...(cloneValue(jdJson?.experience_requirements || {})) },
    compensation: { ...JD_SCHEMA.compensation, ...(cloneValue(jdJson?.compensation || {})) },
    skills: { ...JD_SCHEMA.skills, ...(cloneValue(jdJson?.skills || {})) },
    job_description: normalizeText(jdJson?.job_description),
  };

  guarded.job_information.job_id = normalizeText(guarded.job_information.job_id);
  guarded.job_information.job_name = cleanJobName(guarded.job_information.job_name);
  guarded.job_information.position_level = normalizePositionLevel(guarded.job_information.position_level);
  guarded.job_information.work_type = normalizeWorkType(guarded.job_information.work_type);
  guarded.job_information.employment_type = normalizeEmploymentType(guarded.job_information.employment_type);
  guarded.job_information.number_of_positions = Math.min(Math.max(Math.trunc(numberValue(guarded.job_information.number_of_positions)), 0), 999);
  guarded.job_information.location = cleanList(guarded.job_information.location);

  let minExperience = numberValue(guarded.experience_requirements.minimum_experience);
  let maxExperience = numberValue(guarded.experience_requirements.maximum_experience);
  minExperience = Math.min(Math.max(minExperience, 0), 60);
  maxExperience = Math.min(Math.max(maxExperience, 0), 60);
  if (minExperience && maxExperience && minExperience > maxExperience) {
    [minExperience, maxExperience] = [maxExperience, minExperience];
  }
  guarded.experience_requirements.minimum_experience = minExperience;
  guarded.experience_requirements.maximum_experience = maxExperience;

  guarded.compensation.minimum_ctc = cleanCtcValue(guarded.compensation.minimum_ctc);
  guarded.compensation.maximum_ctc = cleanCtcValue(guarded.compensation.maximum_ctc);

  guarded.skills.technical_skills = cleanList(guarded.skills.technical_skills);
  guarded.skills.additional_skills = cleanList(guarded.skills.additional_skills);
  guarded.skills.soft_skills = cleanList(guarded.skills.soft_skills);

  return guarded;
};
