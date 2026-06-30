const SCORE_WEIGHTS = {
  skills: 60,
  experience: 25,
  title: 15,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .trim();

const splitText = (value) =>
  normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 1);

const normalizeSkill = (value) => normalizeText(value).replace(/\s+/g, ' ');

const extractLabel = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(extractLabel).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return (
      value.label ||
      value.name ||
      value.skill_name ||
      value.skillName ||
      value.value ||
      value.title ||
      ''
    );
  }
  return '';
};

const collectList = (...values) => {
  const items = [];

  values.forEach((value) => {
    if (value === null || value === undefined || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => items.push(...collectList(item)));
      return;
    }

    if (typeof value === 'object') {
      const label = extractLabel(value);
      if (label) items.push(label);
      return;
    }

    String(value)
      .split(/[,;|/]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => items.push(item));
  });

  return [...new Set(items.map(normalizeSkill).filter(Boolean))];
};

const parseNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const matched = String(value || '').match(/\d+(?:\.\d+)?/);
  return matched ? Number(matched[0]) : null;
};

const getResumeJson = (resume = {}) => resume.resumeJson || resume.resume_json || resume._parsedResume || resume;

const getResumeSkills = (resume = {}) => {
  const resumeJson = getResumeJson(resume);
  return collectList(
    resume.skills,
    resumeJson?.skills,
    resumeJson?.skills_information?.primary_skill,
    resumeJson?.skills_information?.secondary_skills,
    resume?._candidateForm?.skills_information?.primary_skill,
    resume?._candidateForm?.skills_information?.secondary_skills
  );
};

const getJobSkills = (job = {}) =>
  collectList(
    job.technicalSkills,
    job.addTechnicalSkills,
    job.extraTechnicalSkills,
    job.requiredSkills,
    job.primarySkills,
    job.secondarySkills,
    job.technical_skills,
    job.skills
  );

const calculateSkillMatch = (jobSkills, resumeSkills) => {
  if (!jobSkills.length) {
    return {
      ratio: 0.5,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const matchedSkills = jobSkills.filter((jobSkill) =>
    resumeSkills.some(
      (resumeSkill) =>
        resumeSkill === jobSkill ||
        resumeSkill.includes(jobSkill) ||
        jobSkill.includes(resumeSkill)
    )
  );

  const missingSkills = jobSkills.filter((skill) => !matchedSkills.includes(skill));

  return {
    ratio: matchedSkills.length / jobSkills.length,
    matchedSkills,
    missingSkills,
  };
};

const calculateExperienceMatch = (job = {}, resume = {}) => {
  const resumeJson = getResumeJson(resume);
  const candidateExperience = parseNumber(
    resume.totalExperience ??
      resumeJson?.professional_information?.total_experience_years ??
      resume?._candidateForm?.candidate_information?.years_of_experience
  );
  const minExperience = parseNumber(job.minExperience ?? job.min_experience);
  const maxExperience = parseNumber(job.maxExperience ?? job.max_experience);

  if (candidateExperience === null || (minExperience === null && maxExperience === null)) {
    return {
      ratio: 0.5,
      candidateExperience,
      minExperience,
      maxExperience,
    };
  }

  if (minExperience !== null && candidateExperience < minExperience) {
    return {
      ratio: minExperience > 0 ? clamp(candidateExperience / minExperience, 0, 1) : 1,
      candidateExperience,
      minExperience,
      maxExperience,
    };
  }

  if (maxExperience !== null && candidateExperience > maxExperience) {
    return {
      ratio: 0.85,
      candidateExperience,
      minExperience,
      maxExperience,
    };
  }

  return {
    ratio: 1,
    candidateExperience,
    minExperience,
    maxExperience,
  };
};

const calculateTitleMatch = (job = {}, resume = {}) => {
  const resumeJson = getResumeJson(resume);
  const jobTokens = splitText(job.postingTitle || job.positionName || job.jobTitle);
  const resumeTokens = splitText(
    [
      resume.currentDesignation,
      resumeJson?.professional_information?.current_designation,
      resume?._candidateForm?.current_company_information?.job_title_role,
      resume.skills,
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (!jobTokens.length || !resumeTokens.length) {
    return {
      ratio: 0.5,
      matchedTitleTokens: [],
    };
  }

  const resumeTokenSet = new Set(resumeTokens);
  const matchedTitleTokens = [...new Set(jobTokens.filter((token) => resumeTokenSet.has(token)))];

  return {
    ratio: matchedTitleTokens.length / new Set(jobTokens).size,
    matchedTitleTokens,
  };
};

export const calculateAtsScore = (input = {}) => {
  const rawInput = input || {};
  const job = rawInput.job && typeof rawInput.job === 'object' ? rawInput.job : {};
  const resume = rawInput.resume && typeof rawInput.resume === 'object' ? rawInput.resume : {};
  const jobSkills = getJobSkills(job);
  const resumeSkills = getResumeSkills(resume);
  const skillMatch = calculateSkillMatch(jobSkills, resumeSkills);
  const experienceMatch = calculateExperienceMatch(job, resume);
  const titleMatch = calculateTitleMatch(job, resume);

  const score = Math.round(
    skillMatch.ratio * SCORE_WEIGHTS.skills +
      experienceMatch.ratio * SCORE_WEIGHTS.experience +
      titleMatch.ratio * SCORE_WEIGHTS.title
  );

  return {
    score: clamp(score, 0, 100),
    breakdown: {
      skills: Math.round(skillMatch.ratio * 100),
      experience: Math.round(experienceMatch.ratio * 100),
      title: Math.round(titleMatch.ratio * 100),
      matchedSkills: skillMatch.matchedSkills,
      missingSkills: skillMatch.missingSkills,
      candidateExperience: experienceMatch.candidateExperience,
      requiredExperience: {
        min: experienceMatch.minExperience,
        max: experienceMatch.maxExperience,
      },
      matchedTitleTokens: titleMatch.matchedTitleTokens,
    },
  };
};
