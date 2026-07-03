const normalizeDocumentText = (value) =>
  String(value || "")
    .replace(/\u00A0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const countMatches = (text, patterns = []) =>
  patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);

const RESUME_SECTION_PATTERNS = [
  /\bprofessional\s+summary\b/i,
  /\bcareer\s+summary\b/i,
  /\bwork\s+experience\b/i,
  /\bprofessional\s+experience\b/i,
  /\bemployment\s+history\b/i,
  /\btechnical\s+skills\b/i,
  /\bskills?\b/i,
  /\beducation\b/i,
  /\bcertifications?\b/i,
  /\bprojects?\b/i,
  /\bachievements?\b/i,
];

const RESUME_CONTACT_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,6}/,
  /\blinkedin\.com\/in\//i,
  /\bgithub\.com\//i,
];

const RESUME_ROLE_PATTERNS = [
  /\b(client|company|employer)\s*[:\-]/i,
  /\b(role|designation|job\s+title)\s*[:\-]/i,
  /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*(?:-|to|–)\s*(?:present|current|still|\d{4})\b/i,
  /\b\d+(?:\.\d+)?\+?\s+years?\b/i,
];

const JD_SECTION_PATTERNS = [
  /\bjob\s+description\b/i,
  /\bjob\s+summary\b/i,
  /\brole\s+overview\b/i,
  /\bkey\s+responsibilities\b/i,
  /\bresponsibilities\b/i,
  /\brequirements\b/i,
  /\bqualification[s]?\b/i,
  /\bdesired\s+profile\b/i,
  /\bcandidate\s+profile\b/i,
  /\bmust\s+have\b/i,
  /\bgood\s+to\s+have\b/i,
  /\babout\s+the\s+role\b/i,
];

const JD_FIELD_PATTERNS = [
  /\b(job\s+title|job\s+name|position\s+name|role)\s*[:\-]/i,
  /\bnumber\s+of\s+(positions|openings)\s*[:\-]/i,
  /\b(openings|vacancies)\s*[:\-]/i,
  /\b(location|work\s+location)\s*[:\-]/i,
  /\bemployment\s+type\s*[:\-]/i,
  /\bwork\s+(type|mode)\s*[:\-]/i,
  /\b(min(?:imum)?|max(?:imum)?)\s+experience\b/i,
  /\b(ctc|salary|compensation)\b/i,
];

export const getDocumentTypeSignals = (text) => {
  const normalized = normalizeDocumentText(text);

  const resumeContactScore = countMatches(normalized, RESUME_CONTACT_PATTERNS);
  const resumeSectionScore = countMatches(normalized, RESUME_SECTION_PATTERNS);
  const resumeRoleScore = countMatches(normalized, RESUME_ROLE_PATTERNS);
  const jdSectionScore = countMatches(normalized, JD_SECTION_PATTERNS);
  const jdFieldScore = countMatches(normalized, JD_FIELD_PATTERNS);

  return {
    normalized,
    resumeScore: resumeContactScore * 2 + resumeSectionScore + resumeRoleScore,
    jdScore: jdSectionScore * 2 + jdFieldScore,
    resumeContactScore,
    resumeSectionScore,
    resumeRoleScore,
    jdSectionScore,
    jdFieldScore,
  };
};

export const isResumeDocument = (text) => {
  const signals = getDocumentTypeSignals(text);
  if (!signals.normalized) return false;

  const hasContactAndResumeBody =
    signals.resumeContactScore > 0 &&
    (signals.resumeSectionScore >= 2 || signals.resumeRoleScore >= 1);
  const hasStrongResumeShape =
    signals.resumeSectionScore >= 4 &&
    signals.resumeRoleScore >= 1;

  return (hasContactAndResumeBody || hasStrongResumeShape) && signals.resumeScore >= signals.jdScore;
};

export const isJobDescriptionDocument = (text) => {
  const signals = getDocumentTypeSignals(text);
  if (!signals.normalized) return false;

  const hasExplicitJdShape = signals.jdSectionScore >= 2 && signals.jdFieldScore >= 1;
  const hasStrongJdShape = signals.jdSectionScore >= 3;
  const looksMoreLikeResume = signals.resumeContactScore > 0 && signals.resumeScore > signals.jdScore;

  return (hasExplicitJdShape || hasStrongJdShape) && !looksMoreLikeResume;
};