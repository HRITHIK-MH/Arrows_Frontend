export const SKILL_MAPPING = {
  React: "React.js",
  Java: "Core Java",
  HTML: "HTML5",
  CSS: "CSS3",
  Angular: "Angular 4",
};

export const mapParsedSkills = (parsed) => {
  if (!parsed) return parsed;

  try {
    if (parsed.resumeJson && parsed.resumeJson.skills_information) {
      const info = parsed.resumeJson.skills_information;
      if (info.primary_skill && SKILL_MAPPING[info.primary_skill]) {
        info.primary_skill = SKILL_MAPPING[info.primary_skill] || info.primary_skill;
      }
      if (Array.isArray(info.secondary_skills)) {
        info.secondary_skills = info.secondary_skills.map((s) => SKILL_MAPPING[s] || s);
      }
    }

    if (parsed.candidateForm) {
      const cf = parsed.candidateForm;
      if (Array.isArray(cf.skills)) {
        cf.skills = cf.skills.map((s) => SKILL_MAPPING[s] || s);
      } else if (typeof cf.skills === "string" && cf.skills.trim()) {
        const parts = String(cf.skills).split(/[;,•·\n]/).map((p) => p.trim()).filter(Boolean);
        cf.skills = parts.map((s) => SKILL_MAPPING[s] || s);
      }
    }
  } catch (e) {
    // noop - mapping should never break parsing
  }

  return parsed;
};
