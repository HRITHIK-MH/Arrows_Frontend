export const CANDIDATE_FORM_SCHEMA = {
  candidate_information: {
    candidate_id: '',
    have_candidate_resume: true,
    first_name: '',
    last_name: '',
    primary_email_address: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    years_of_experience: '',
    offers_in_hand: '',
    comments_remarks: '',
  },
  current_company_information: {
    candidate_type: 'Experienced',
    current_company_name: '',
    job_title_role: '',
    employment_type: '',
    notice_period_days: '',
    current_ctc_lpa: '',
    expected_ctc_lpa: '',
  },
  skills_information: {
    primary_skill: '',
    secondary_skills: [],
    experience_level: '',
    skill_experience_years: '',
    rating: '',
    comments: '',
  },
  source_information: {
    source_name: '',
    recruiter: '',
    sourced_date: '',
  },
};

export const FIELD_MAPPING = {
  'candidate_information.first_name': 'personal_information.first_name',
  'candidate_information.last_name': 'personal_information.last_name',
  'candidate_information.primary_email_address': 'personal_information.email',
  'candidate_information.phone_number': 'personal_information.phone',
  'candidate_information.gender': 'personal_information.gender',
  'candidate_information.date_of_birth': 'personal_information.date_of_birth',
  'candidate_information.years_of_experience': 'professional_information.total_experience_years',
  'current_company_information.current_company_name': 'professional_information.current_company',
  'current_company_information.job_title_role': 'professional_information.current_designation',
  'current_company_information.employment_type': 'professional_information.employment_type',
  'current_company_information.notice_period_days': 'professional_information.notice_period_days',
  'current_company_information.current_ctc_lpa': 'professional_information.current_ctc',
  'current_company_information.expected_ctc_lpa': 'professional_information.expected_ctc',
};

const isDevEnvironment = () => Boolean(import.meta.env?.DEV);

const debugMapper = (message, payload) => {
  if (isDevEnvironment()) {
    console.debug(`[ResumeFieldMapper] ${message}`, payload);
  }
};

export const getNestedValue = (object, path) => {
  if (!object || !path) return undefined;
  return String(path)
    .split('.')
    .reduce((current, key) => (current == null ? undefined : current[key]), object);
};

export const setNestedValue = (object, path, value) => {
  if (!object || !path) return object;

  const keys = String(path).split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, object);

  target[lastKey] = value;
  return object;
};

const cloneCandidateFormSchema = () => ({
  candidate_information: { ...CANDIDATE_FORM_SCHEMA.candidate_information },
  current_company_information: { ...CANDIDATE_FORM_SCHEMA.current_company_information },
  skills_information: {
    ...CANDIDATE_FORM_SCHEMA.skills_information,
    secondary_skills: [...CANDIDATE_FORM_SCHEMA.skills_information.secondary_skills],
  },
  source_information: { ...CANDIDATE_FORM_SCHEMA.source_information },
});

const normalizeMappedValue = (value) => {
  if (value === undefined || value === null) return '';
  return value;
};

const normalizeSkillName = (skill) => {
  if (typeof skill === 'string') return skill.trim();
  return String(skill?.skill_name || skill?.name || skill?.primary_skill || '').trim();
};

const getExplicitPrimarySkill = (resumeJson = {}) => {
  const candidates = [
    resumeJson?.skills_information?.primary_skill,
    resumeJson?.primary_skill,
    resumeJson?.professional_information?.primary_skill,
  ];

  const explicitValue = candidates.map(normalizeSkillName).find(Boolean);
  if (explicitValue) return explicitValue;

  if (!Array.isArray(resumeJson?.skills)) return '';

  const primarySkillObject = resumeJson.skills.find(
    (skill) => skill?.is_primary === true || skill?.primary === true || skill?.type === 'primary'
  );

  return normalizeSkillName(primarySkillObject);
};

const mapSkills = (candidateForm, resumeJson = {}) => {
  const skills = Array.isArray(resumeJson.skills)
    ? resumeJson.skills.map(normalizeSkillName).filter(Boolean)
    : [];
  const explicitPrimarySkill = getExplicitPrimarySkill(resumeJson);
  const primarySkill = explicitPrimarySkill || skills[0] || '';
  const primarySkillLower = primarySkill.toLowerCase();
  const secondarySkills = skills.filter((skill, index) => {
    if (!primarySkill) return index > 0;
    if (explicitPrimarySkill) return skill.toLowerCase() !== primarySkillLower;
    return index > 0;
  });

  candidateForm.skills_information.primary_skill = primarySkill;
  candidateForm.skills_information.secondary_skills = secondarySkills;
};

export const mapResumeToCandidateForm = (resumeJson = {}) => {
  debugMapper('Resume JSON received', resumeJson);
  debugMapper('Mapping started');
  const candidateForm = cloneCandidateFormSchema();

  try {
    Object.entries(FIELD_MAPPING).forEach(([candidatePath, resumePath]) => {
      const value = getNestedValue(resumeJson, resumePath);
      setNestedValue(candidateForm, candidatePath, normalizeMappedValue(value));
    });

    mapSkills(candidateForm, resumeJson || {});
  } catch (error) {
    debugMapper('Mapping failed; returning schema defaults', {
      message: error?.message,
    });
  }

  debugMapper('Mapping completed');
  debugMapper('Candidate Form generated', candidateForm);
  return candidateForm;
};
