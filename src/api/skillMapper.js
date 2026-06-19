export const SKILL_MAPPING = {
  React: 'React.js',
  Java: 'Core Java',
  HTML: 'HTML5',
  CSS: 'CSS3',
  Angular: 'Angular 4',
};

const mapSkill = (skill) => SKILL_MAPPING[skill] || skill;

const mapSkillsInformation = (skillsInformation) => {
  if (!skillsInformation || typeof skillsInformation !== 'object') return;

  if (skillsInformation.primary_skill) {
    skillsInformation.primary_skill = mapSkill(skillsInformation.primary_skill);
  }

  if (Array.isArray(skillsInformation.secondary_skills)) {
    skillsInformation.secondary_skills = skillsInformation.secondary_skills.map(mapSkill);
  }
};

export const mapParsedSkills = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return parsed;

  try {
    mapSkillsInformation(parsed.resumeJson?.skills_information);
    mapSkillsInformation(parsed.candidateForm?.skills_information);

    if (Array.isArray(parsed.candidateForm?.skills)) {
      parsed.candidateForm.skills = parsed.candidateForm.skills.map(mapSkill);
    } else if (typeof parsed.candidateForm?.skills === 'string' && parsed.candidateForm.skills.trim()) {
      parsed.candidateForm.skills = parsed.candidateForm.skills
        .split(/[;,•·\n]/)
        .map((skill) => mapSkill(skill.trim()))
        .filter(Boolean);
    }
  } catch {
    // Skill mapping must not prevent an otherwise valid resume from being parsed.
  }

  return parsed;
};
