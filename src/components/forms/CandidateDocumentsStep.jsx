import React, { useMemo, useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { normalizeParsedResumePayload } from "../../api/resumeParserService";

const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const toLower = (value) => normalizeText(value).toLowerCase();

const hasInternshipSignal = (...values) =>
  values.some((value) => /\b(intern|internship|trainee)\b/i.test(normalizeText(value)));

const getResumeLines = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const normalizeResumeDocument = (value) =>
  String(value || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

const readDocxText = async (file) => {
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return normalizeResumeDocument(result?.value || "");
};

const readPdfText = async (file) => {
  if (pdfjsLib.GlobalWorkerOptions.workerSrc !== pdfjsWorkerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  const pages = [];

  const buildPageText = (textItems = []) => {
    const positionedItems = textItems
      .map((item) => {
        if (!("str" in item)) return null;
        return {
          text: String(item.str || ""),
          x: Number(item.transform?.[4] || 0),
          y: Number(item.transform?.[5] || 0),
          hasEOL: Boolean(item.hasEOL),
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (Math.abs(b.y - a.y) > 2) return b.y - a.y;
        return a.x - b.x;
      });

    const lines = [];
    let currentLine = [];
    let currentY = null;

    positionedItems.forEach((item) => {
      const startsNewLine = currentY !== null && Math.abs(item.y - currentY) > 2;
      if (startsNewLine && currentLine.length > 0) {
        lines.push(currentLine.join(" "));
        currentLine = [];
      }

      currentY = item.y;

      if (item.text.trim()) {
        currentLine.push(item.text.trim());
      }

      if (item.hasEOL && currentLine.length > 0) {
        lines.push(currentLine.join(" "));
        currentLine = [];
        currentY = null;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine.join(" "));
    }

    return lines.join("\n");
  };

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = buildPageText(textContent.items);
    pages.push(pageText);
  }

  return normalizeResumeDocument(pages.join("\n"));
};

const readResumeText = async (file) => {
  const extension = String(file?.name || "").split(".").pop()?.toLowerCase();
  if (!extension) return "";
  if (extension === "pdf") return readPdfText(file);
  if (extension === "docx") return readDocxText(file);
  if (extension === "doc" || extension === "txt") return normalizeResumeDocument(await file.text());
  return "";
};

const parseResumeDateToIso = (value) => {
  const raw = String(value || "").trim().replace(/[,]/g, " ").replace(/\s+/g, " ");
  if (!raw) return "";

  const dayMonthYear = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (dayMonthYear) {
    const day = Number.parseInt(dayMonthYear[1], 10);
    const month = Number.parseInt(dayMonthYear[2], 10);
    let year = Number.parseInt(dayMonthYear[3], 10);
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const monthNameYear = raw.match(/([A-Za-z]{3,9})\s+(\d{1,2})\s+(\d{4})/);
  if (monthNameYear) {
    const parsedDate = new Date(`${monthNameYear[1]} ${monthNameYear[2]} ${monthNameYear[3]}`);
    if (!Number.isNaN(parsedDate.getTime())) {
      const yyyy = parsedDate.getFullYear();
      const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(parsedDate.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const parsedDate = new Date(raw);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const yyyy = parsedDate.getFullYear();
  const mm = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(parsedDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const extractCandidateName = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labelledLine = lines.find((line) => /^(?:candidate\s*name|full\s*name|name)\s*[:\-]/i.test(line));
  const candidateLine = labelledLine
    ? labelledLine.replace(/^(?:candidate\s*name|full\s*name|name)\s*[:\-]\s*/i, "")
    : lines.find(
        (line) =>
          !/@/.test(line) &&
          !/\d{7,}/.test(line) &&
          /^[A-Za-z][A-Za-z\s.'-]+$/.test(line) &&
          line.split(/\s+/).length >= 2
      );

  const cleaned = cleanResumeValue(candidateLine || "")
    .replace(/^(mr|mrs|ms|miss|dr)\.?\s+/i, "")
    .replace(/[^A-Za-z\s.'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length < 2) {
    return { firstName: "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const extractGenderValue = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labelledLine = lines.find((line) => /^(?:gender|sex)\s*[:\-]/i.test(line));
  const labelledValue = labelledLine?.match(/(?:gender|sex)\s*[:\-]?\s*(male|female|other|non[-\s]?binary|m|f)\b/i)?.[1];
  const fallbackValue = lines
    .slice(0, 12)
    .join(" ")
    .match(/\b(male|female|other|non[-\s]?binary)\b/i)?.[1];

  const rawValue = String(labelledValue || fallbackValue || "").toLowerCase().replace(/\s+/g, "");
  if (rawValue === "m" || rawValue === "male") return "male";
  if (rawValue === "f" || rawValue === "female") return "female";
  if (rawValue === "other" || rawValue === "non-binary" || rawValue === "nonbinary") return "other";
  return "";
};

const extractDateOfBirthValue = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const labelledLine = lines.find((line) => /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?/i.test(line));
  if (!labelledLine) return "";

  const dateText = labelledLine.replace(/.*?(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*/i, "");
  return parseResumeDateToIso(dateText);
};

const mapYearsToBucket = (yearsNumber) => {
  if (!Number.isFinite(yearsNumber) || yearsNumber < 0) return "";
  if (yearsNumber <= 1) return "0-1";
  if (yearsNumber <= 3) return "1-3";
  if (yearsNumber <= 5) return "3-5";
  if (yearsNumber <= 8) return "5-8";
  if (yearsNumber <= 12) return "8-12";
  return "12+";
};

const mapExperienceValueToBucket = (value) => {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return "";
  if (["0-1", "1-3", "3-5", "5-8", "8-12", "12+"].includes(raw)) return raw;

  const numericMatch = raw.match(/\d+(?:\.\d+)?/);
  if (!numericMatch) return "";
  return mapYearsToBucket(Number(numericMatch[0]));
};

const cleanResumeValue = (value) =>
  normalizeText(String(value || "").replace(/[|•]/g, " ").replace(/\s+/g, " ")).slice(0, 120);

const cleanRoleOrCompanyValue = (value) =>
  cleanResumeValue(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
    .replace(/\b(?:experience|employment|current company info)\b.*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const extractLatestExperienceEntry = (text) => {
  const lines = getResumeLines(text);
  if (lines.length === 0) return { company: "", role: "" };

  const experienceIndex = lines.findIndex(
    (line) => /^experience$/i.test(line) || /professional\s+experience/i.test(line)
  );

  const scopedLines = experienceIndex >= 0 ? lines.slice(experienceIndex + 1) : lines;
  const datePrefixPattern = /^(\d{1,2}[/-]\d{4}|\d{4})\s*(?:to|–|-|—)?\s*(present|current|now|\d{1,2}[/-]\d{4}|\d{4})?/i;
  const scoreDateText = (dateText) => {
    const lower = String(dateText || "").toLowerCase();
    if (/present|current|now/.test(lower)) return Number.MAX_SAFE_INTEGER;
    const match = lower.match(/(\d{1,2})[/-](\d{4})|(\d{4})/);
    if (!match) return 0;
    if (match[2]) {
      return Number.parseInt(match[2], 10) * 12 + Number.parseInt(match[1], 10);
    }
    return Number.parseInt(match[3], 10) * 12;
  };

  const candidates = [];

  for (let index = 0; index < scopedLines.length; index += 1) {
    const line = scopedLines[index];
    const dateMatch = line.match(datePrefixPattern);
    if (!dateMatch) continue;

    const matchedDateText = dateMatch[0] || "";
    const inlineRemainder = line.slice(matchedDateText.length).replace(/^[\s,:-]+/, "").trim();
    const candidateLine = inlineRemainder || (scopedLines[index + 1] || "").trim();
    if (!candidateLine || /@|http|linkedin/i.test(candidateLine)) continue;

    const parts = candidateLine
      .split(",")
      .map((part) => cleanRoleOrCompanyValue(part))
      .filter(Boolean);
    if (parts.length === 0) continue;

    candidates.push({
      company: parts[0] || "",
      role: parts.slice(1).join(", ") || "",
      score: scoreDateText(matchedDateText),
      index,
    });
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    });

    return {
      company: candidates[0].company,
      role: candidates[0].role,
    };
  }

  return { company: "", role: "" };
};

const SKILL_ALIAS_MAP = {
  java: ["core java", "java", "spring boot", "spring"],
  python: ["python", "python3"],
  react: ["react", "reactjs", "react js", "react.js"],
  node: ["node", "nodejs", "node js", "express"],
  aws: ["aws", "amazon web services"],
  "angular-4": ["angular", "angularjs", "angular 2", "angular 4", "angular 5"],
  css3: ["css", "css3"],
  html5: ["html", "html5"],
  javascript: ["javascript", "js"],
};

const collectMatchedSkillValues = (text, options = []) => {
  const normalizedText = ` ${toLower(text).replace(/[^a-z0-9+#.\s]/g, " ")} `;

  return options
    .filter((option) => {
      const value = String(option?.value || "").toLowerCase();
      const label = String(option?.label || option?.value || "").toLowerCase();
      const aliases = SKILL_ALIAS_MAP[value] || [label, value];

      return aliases.some((alias) => {
        const normalizedAlias = String(alias || "").toLowerCase().trim();
        if (!normalizedAlias) return false;
        const escapedAlias = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|\\s)${escapedAlias}(\\s|$)`, "i").test(normalizedText);
      });
    })
    .map((option) => option.value);
};

const normalizeSkillInput = (skills) => {
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => {
        if (typeof skill === "string") return skill;
        return skill?.skill_name || skill?.name || skill?.primary_skill || "";
      })
      .map((skill) => String(skill || "").trim())
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return String(skills)
      .split(/[;,/|&•·\n]/)
      .map((skill) => String(skill || "").trim())
      .filter(Boolean);
  }

  if (skills && typeof skills === "object") {
    const extracted = [];
    if (skills.primary_skill || skills.primarySkill) {
      extracted.push(String(skills.primary_skill || skills.primarySkill).trim());
    }
    if (Array.isArray(skills.secondary_skills)) {
      extracted.push(...skills.secondary_skills.map((skill) => String(skill || "").trim()));
    }
    if (Array.isArray(skills.skills)) {
      extracted.push(...skills.skills.map((skill) => String(skill || "").trim()));
    }
    return extracted.filter(Boolean);
  }

  return [];
};

const mapSkillTextToValue = (skillText, options = []) => {
  const normalizedText = String(skillText || "").trim();
  if (!normalizedText) return "";

  const matched = collectMatchedSkillValues(normalizedText, options);
  if (matched.length > 0) return matched[0];

  const lowerValue = normalizedText.toLowerCase();
  const directOption = options.find((option) => {
    const optionValue = String(option?.value || "").toLowerCase();
    const optionLabel = String(option?.label || option?.value || "").toLowerCase();
    return optionValue === lowerValue || optionLabel === lowerValue;
  });

  return directOption ? directOption.value : "";
};

const mapSkillTextsToValues = (skills, options = []) =>
  normalizeSkillInput(skills)
    .map((skill) => mapSkillTextToValue(skill, options))
    .filter(Boolean);

const getSkillDefaultsFromExperience = (yearsBucket, yearsNumber) => {
  let skillExperienceLevel = "";
  let skillRating = "";

  if (yearsBucket === "0-1" || yearsBucket === "1-3") {
    skillExperienceLevel = "beginner";
  } else if (yearsBucket === "3-5" || yearsBucket === "5-8") {
    skillExperienceLevel = "intermediate";
  } else if (yearsBucket) {
    skillExperienceLevel = "expert";
  }

  if (yearsBucket === "0-1") {
    skillRating = "1";
  } else if (yearsBucket === "1-3") {
    skillRating = "2";
  } else if (yearsBucket === "3-5") {
    skillRating = "3";
  } else if (yearsBucket === "5-8") {
    skillRating = "4";
  } else if (yearsBucket) {
    skillRating = "5";
  }

  const numericYears = Number.isFinite(yearsNumber) ? Math.max(0, Number(yearsNumber.toFixed(1))) : "";

  return {
    skillExperienceLevel,
    skillRating,
    skillExperienceYears: numericYears ? String(numericYears) : "",
  };
};

const createSkillRow = (primarySkill, defaults = {}) => ({
  primarySkill: primarySkill || "",
  enableSecondarySkill: false,
  secondarySkill: "",
  skillExperienceLevel: defaults.skillExperienceLevel || "",
  skillExperienceYears: defaults.skillExperienceYears || "",
  skillRating: defaults.skillRating || "",
  skillComments: defaults.skillComments || "",
  secondarySkillExperienceLevel: "",
  secondarySkillExperienceYears: "",
  secondarySkillRating: "",
  secondarySkillComments: "",
});

const extractCompanyAndRole = (text) => {
  const lines = getResumeLines(text);
  if (lines.length === 0) return { company: "", role: "" };

  const latestExperience = extractLatestExperienceEntry(text);
  if (latestExperience.company) {
    return {
      company: cleanRoleOrCompanyValue(latestExperience.company),
      role: cleanRoleOrCompanyValue(latestExperience.role || ""),
    };
  }

  const companyLine = lines.find((line) => /^(?:current\s+company|company|organization|employer)\s*[:\-]/i.test(line));
  const roleLine = lines.find((line) => /^(?:current\s+(?:designation|role)|designation|job\s*title|title|role)\s*[:\-]/i.test(line));

  let company = cleanRoleOrCompanyValue(companyLine?.replace(/^(?:current\s+company|company|organization|employer)\s*[:\-]\s*/i, "") || "");
  let role = cleanRoleOrCompanyValue(roleLine?.replace(/^(?:current\s+(?:designation|role)|designation|job\s*title|title|role)\s*[:\-]\s*/i, "") || "");

  if (!company || !role) {
    const lineWithAt = lines.find((line) => /\s+at\s+/i.test(line) && !/@|http|linkedin/i.test(line));

    if (lineWithAt) {
      const [left = "", right = ""] = lineWithAt.split(/\s+at\s+/i);
      if (!role) role = cleanRoleOrCompanyValue(left);
      if (!company) company = cleanRoleOrCompanyValue(right);
    }
  }

  if (!company || !role) {
    const experienceIndex = lines.findIndex((line) => /^experience$/i.test(line) || /professional\s+experience/i.test(line));
    if (experienceIndex >= 0) {
      const windowLines = lines.slice(experienceIndex + 1, experienceIndex + 6);
      const meaningfulLines = windowLines.filter((line) => !/@|\b(?:present|yrs?|years?|months?)\b/i.test(line));
      if (!role && meaningfulLines[0]) {
        role = cleanRoleOrCompanyValue(meaningfulLines[0]);
      }
      if (!company && meaningfulLines[1]) {
        company = cleanRoleOrCompanyValue(meaningfulLines[1]);
      }
    }
  }

  return { company, role };
};

const extractExperienceYears = (text) => {
  const lines = getResumeLines(text);
  const normalized = normalizeText(text);
  const currentYear = new Date().getFullYear();

  const toValidYears = (value) => {
    const years = Number.parseFloat(value);
    if (!Number.isFinite(years)) return null;
    if (years < 0 || years > 45) return null;
    return years;
  };

  const parseYearsFromText = (value) => {
    const source = String(value || "");
    if (!source) return null;

    const yearsMonthsMatch = source.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(\d{1,2})\s*(?:months?|mos?)/i);
    if (yearsMonthsMatch?.[1]) {
      const years = Number.parseFloat(yearsMonthsMatch[1]);
      const months = Number.parseFloat(yearsMonthsMatch[2] || "0");
      return toValidYears(years + months / 12);
    }

    const explicitRangeMatch = source.match(/(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
    if (explicitRangeMatch?.[2]) {
      return toValidYears(explicitRangeMatch[2]);
    }

    const labelledMatch = source.match(/(?:total|overall|relevant)?\s*experience\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    if (labelledMatch?.[1]) {
      return toValidYears(labelledMatch[1]);
    }

    const standardMatch = source.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\s+of\s+experience)?/i);
    if (standardMatch?.[1]) {
      return toValidYears(standardMatch[1]);
    }

    return null;
  };

  const parseRangesFromText = (value) => {
    const source = String(value || "");
    if (!source) return null;

    const monthYearMatches = Array.from(
      source.matchAll(/(\d{1,2})[/-](\d{4})\s*(?:to|-|–)\s*(present|current|now|\d{1,2}[/-]\d{4})/gi)
    );
    if (monthYearMatches.length === 0) return null;

    const ranges = monthYearMatches
      .map((match) => {
        const startMonth = Number.parseInt(match[1], 10);
        const startYear = Number.parseInt(match[2], 10);
        const endRaw = String(match[3] || "").toLowerCase();

        let endMonth = new Date().getMonth() + 1;
        let endYear = currentYear;

        if (!/present|current|now/.test(endRaw)) {
          const endMatch = endRaw.match(/(\d{1,2})[/-](\d{4})/);
          if (!endMatch) return null;
          endMonth = Number.parseInt(endMatch[1], 10);
          endYear = Number.parseInt(endMatch[2], 10);
        }

        if (
          startMonth < 1 ||
          startMonth > 12 ||
          endMonth < 1 ||
          endMonth > 12 ||
          startYear < 1980 ||
          startYear > currentYear + 1 ||
          endYear < 1980 ||
          endYear > currentYear + 1
        ) {
          return null;
        }

        const startTotal = startYear * 12 + startMonth;
        const endTotal = endYear * 12 + endMonth;
        if (endTotal <= startTotal) return null;

        return { startTotal, endTotal };
      })
      .filter(Boolean);

    if (ranges.length === 0) return null;

    const earliest = ranges.reduce((min, current) => (current.startTotal < min.startTotal ? current : min));
    const latest = ranges.reduce((max, current) => (current.endTotal > max.endTotal ? current : max));
    const totalMonths = latest.endTotal - earliest.startTotal;

    if (totalMonths <= 0 || totalMonths > 45 * 12) return null;
    return Number((totalMonths / 12).toFixed(1));
  };

  if (!normalized) return null;

  const labelledLineMatch = lines
    .map((line) => parseYearsFromText(line))
    .find((value, index) => {
      if (!Number.isFinite(value)) return false;
      return /(?:total|overall|relevant)?\s*experience\s*[:\-]?/i.test(lines[index]);
    });
  if (Number.isFinite(labelledLineMatch)) {
    return labelledLineMatch;
  }

  const directYears = parseYearsFromText(normalized);
  if (Number.isFinite(directYears)) {
    return directYears;
  }

  const experienceStartIndex = lines.findIndex((line) =>
    /^(?:experience|work experience|professional experience|employment history)$/i.test(line) ||
    /professional\s+experience|work\s+experience|employment\s+history/i.test(line)
  );
  const sectionTail = experienceStartIndex >= 0 ? lines.slice(experienceStartIndex + 1) : lines;
  const sectionEndOffset = sectionTail.findIndex((line) =>
    /^(?:education|skills|projects|certifications?|summary|profile|objective|achievements?)$/i.test(line)
  );
  const scopedLines =
    experienceStartIndex >= 0
      ? sectionTail.slice(0, sectionEndOffset >= 0 ? sectionEndOffset : undefined)
      : lines;

  const scopedRanges = parseRangesFromText(scopedLines.join(" "));
  if (Number.isFinite(scopedRanges)) {
    return scopedRanges;
  }

  const fallbackRanges = parseRangesFromText(normalized);
  if (Number.isFinite(fallbackRanges)) {
    return fallbackRanges;
  }

  const lineYears = lines.map((line) => parseYearsFromText(line)).find((value) => Number.isFinite(value));
  if (Number.isFinite(lineYears)) {
    return lineYears;
  }

  return null;
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const CandidateDocumentsStep = ({ formData, onChange, onSetStepFields }) => {
  const documents = Array.isArray(formData.candidateDocuments)
    ? formData.candidateDocuments
    : [];

  const [mappedResumeFields, setMappedResumeFields] = useState(new Set());
  const previousDocsCountRef = useRef(documents.length);

  const clearMappedResumeFields = () => {
    mappedResumeFields.forEach((fieldName) => {
      onChange(fieldName, "");
    });
    setMappedResumeFields(new Set());
  };

  // Clear mapped fields when all documents are removed
  useEffect(() => {
    if (previousDocsCountRef.current > 0 && documents.length === 0) {
      clearMappedResumeFields();
    }
    previousDocsCountRef.current = documents.length;
  }, [documents.length]);

  const isAllowedDocument = (file) => {
    const extension = file?.name?.split(".").pop()?.toLowerCase();
    return Boolean(extension && ALLOWED_EXTENSIONS.has(extension));
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
      .filter(isAllowedDocument)
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }));
    if (files.length === 0) return;
    const nextDocs = [...documents, ...files];
    onChange("candidateDocuments", nextDocs);
    if (!formData.candidateResume) {
      onChange("candidateResume", files[0]);
    }
    void mapResumeToFields(files[0]?.file);
  };

  const handleFileChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const handleRemove = (docId) => {
    const nextDocs = documents.filter((doc) => doc.id !== docId);
    onChange("candidateDocuments", nextDocs);
    if (nextDocs.length === 0) {
      onChange("candidateResume", "");
      return;
    }
    if (formData.candidateResume) {
      const resumeId =
        formData.candidateResume?.name &&
          formData.candidateResume?.size !== undefined
          ? `${formData.candidateResume.name}-${formData.candidateResume.lastModified}-${formData.candidateResume.size}`
          : null;
      if (resumeId && !nextDocs.some((doc) => doc.id === resumeId)) {
        onChange("candidateResume", nextDocs[0].file || nextDocs[0]);
      }
    }
  };

  const inputId = useMemo(() => "candidate-documents-input", []);

  const mapResumeToFields = async (file) => {
    if (!file) return;

    console.groupCollapsed("[ResumeDebug] Candidate Documents Auto Population");
    console.debug("[ResumeDebug] Uploaded file received by documents step:", {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      lastModified: file?.lastModified,
    });

    let parsed;
    try {
      const form = new FormData();
      form.append("file", file);
      console.debug("[ResumeDebug] GPT request payload handoff:", {
        transport: "multipart/form-data",
        url: "/api/candidates/documents/parse",
        fieldName: "file",
        fileName: file?.name,
      });
      const res = await fetch("/api/candidates/documents/parse", { method: "POST", body: form });
      console.debug("[ResumeDebug] API response status:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        contentType: res.headers.get("content-type"),
      });
      const json = await res.json();
      console.debug("[ResumeDebug] GPT/API raw response:", json);
      parsed = normalizeParsedResumePayload(json?.data || json);
      console.debug("[ResumeDebug] Parsed JSON:", json?.data || json);
      console.debug("[ResumeDebug] Normalized candidate form JSON:", parsed);
      if (!parsed) throw new Error("No parse result");
    } catch (err) {
      // fallback to client-side parsing if server-side fails
      // eslint-disable-next-line no-console
      console.warn("Server-side resume parse failed, falling back to client parsing:", err);
    }

    if (parsed) {
      // --- server-side parsing: use API response directly ---
      const updates = {};
      const fieldNames = new Set();
      console.debug("[ResumeDebug] Candidate form JSON used for mapping:", parsed);

      if (!normalizeText(formData.firstName) && parsed.firstName) {
        updates.firstName = parsed.firstName;
        fieldNames.add("firstName");
      }
      if (!normalizeText(formData.lastName) && parsed.lastName) {
        updates.lastName = parsed.lastName;
        fieldNames.add("lastName");
      }

      if (!normalizeText(formData.primaryEmail) && parsed.email) {
        updates.primaryEmail = parsed.email;
        fieldNames.add("primaryEmail");
      }

      if (!normalizeText(formData.phoneNumber) && parsed.phone) {
        const digits = String(parsed.phone).replace(/\D/g, "");
        if (digits.length >= 10) {
          updates.phoneNumber = digits.slice(-10);
          fieldNames.add("phoneNumber");
        }
      }

      if (!normalizeText(formData.yearsExperience) && (parsed.totalExperienceYears || parsed.totalExperience)) {
        const yearsValue = mapExperienceValueToBucket(parsed.totalExperienceYears || parsed.totalExperience);
        if (yearsValue) {
          const isInternshipCandidate = hasInternshipSignal(parsed.currentDesignation, parsed.employmentType);
          const hasCurrentWorkEvidence = [
            parsed.currentCompany,
            parsed.currentDesignation,
            parsed.employmentType,
            formData.currentCompanyName,
            formData.jobTitleRole,
            formData.employmentType,
          ].some((value) => normalizeText(value));
          updates.yearsExperience = yearsValue;
          fieldNames.add("yearsExperience");
          if (!normalizeText(formData.candidateType)) {
            updates.candidateType = isInternshipCandidate
              ? "fresher"
              : hasCurrentWorkEvidence || yearsValue !== "0-1"
                ? "experienced"
                : "fresher";
            fieldNames.add("candidateType");
          }
        }
      }

      const isParsedInternshipCandidate = hasInternshipSignal(parsed.currentDesignation, parsed.employmentType);

      if (!normalizeText(formData.candidateType) && parsed.candidateType) {
        updates.candidateType = parsed.candidateType;
        fieldNames.add("candidateType");
      }
      if (isParsedInternshipCandidate && !normalizeText(formData.candidateType)) {
        updates.candidateType = "fresher";
        fieldNames.add("candidateType");
      }
      if (!isParsedInternshipCandidate && !normalizeText(formData.currentCompanyName) && parsed.currentCompany) {
        updates.currentCompanyName = parsed.currentCompany;
        fieldNames.add("currentCompanyName");
      }
      if (!isParsedInternshipCandidate && !normalizeText(formData.jobTitleRole) && parsed.currentDesignation) {
        updates.jobTitleRole = parsed.currentDesignation;
        fieldNames.add("jobTitleRole");
      }
      if (!isParsedInternshipCandidate && !normalizeText(formData.employmentType) && parsed.employmentType) {
        updates.employmentType = parsed.employmentType;
        fieldNames.add("employmentType");
      }
      if (!normalizeText(formData.noticePeriod) && parsed.noticePeriod) {
        updates.noticePeriod = parsed.noticePeriod;
        fieldNames.add("noticePeriod");
      }
      if (!normalizeText(formData.currentCtc) && parsed.currentCtc) {
        updates.currentCtc = parsed.currentCtc;
        fieldNames.add("currentCtc");
      }
      if (!normalizeText(formData.expectedCtc) && parsed.expectedCtc) {
        updates.expectedCtc = parsed.expectedCtc;
        fieldNames.add("expectedCtc");
      }

      const parsedSkills = normalizeSkillInput(parsed.skills);
      if (!normalizeText(formData.primarySkill) && parsedSkills.length > 0) {
        const configSkillOptions = [
          { value: "java", label: "Core Java" },
          { value: "python", label: "Python" },
          { value: "react", label: "React" },
          { value: "node", label: "Node.js" },
          { value: "aws", label: "AWS" },
          { value: "html5", label: "HTML5" },
          { value: "css3", label: "CSS3" },
          { value: "javascript", label: "JavaScript" },
          { value: "jquery", label: "jQuery" },
          { value: "bootstrap", label: "Bootstrap" },
          { value: "angular-4", label: "Angular 4" },
          { value: "backbone-js", label: "Backbone.js" },
        ];

        // Match parsed skills against config options
        const matchedSkills = mapSkillTextsToValues(parsedSkills, configSkillOptions);
        console.debug("[ResumeDebug] Skills mapping result from GPT/API data:", {
          rawSkills: parsed.skills,
          parsedSkills,
          matchedSkills,
          configSkillOptions,
        });

        if (matchedSkills.length === 0 && parsedSkills[0]) {
          // fallback: use first parsed skill as-is
          updates.primarySkill = parsedSkills[0];
          fieldNames.add("primarySkill");
        } else if (matchedSkills.length > 0) {
          updates.primarySkill = matchedSkills[0];
          fieldNames.add("primarySkill");
          if (!normalizeText(formData.secondarySkill) && matchedSkills[1]) {
            updates.secondarySkill = matchedSkills[1];
            fieldNames.add("secondarySkill");
          }
        }

        if ((matchedSkills.length > 0 || parsedSkills.length > 0) && !Array.isArray(formData.skills)
          || formData.skills?.every((row) => !normalizeText(row?.primarySkill))) {
          const existingSkillRows = Array.isArray(formData.skills) ? formData.skills : [];
          const hasExistingPrimarySkill = existingSkillRows.some((row) => normalizeText(row?.primarySkill));
          const skillDefaults = {
            ...getSkillDefaultsFromExperience(updates.yearsExperience || formData.yearsExperience, Number(parsed.totalExperienceYears || parsed.totalExperience) || 0),
            skillExperienceLevel: parsed.skillExperienceLevel || undefined,
            skillExperienceYears: parsed.skillExperienceYears || undefined,
            skillRating: parsed.skillRating || undefined,
            skillComments: parsed.skillComments || undefined,
          };

          if (!hasExistingPrimarySkill) {
            const skillsToAdd = matchedSkills.length > 0 ? matchedSkills : parsedSkills;
            updates.skills = skillsToAdd.map((skillValue) => createSkillRow(skillValue, skillDefaults));
            fieldNames.add("skills");
          }
        }
      }

      Object.entries(updates).forEach(([fieldName, fieldValue]) => {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
          onChange(fieldName, fieldValue);
        }
      });

      setMappedResumeFields(fieldNames);
      console.debug("[ResumeDebug] Final form values from GPT/API path:", {
        updates,
        mappedFieldNames: Array.from(fieldNames),
        nextFormValues: { ...formData, ...updates },
      });
      console.groupEnd();
    } else {
      // --- fallback: local parsing (previous behavior) ---
      const text = await readResumeText(file);
      if (!text) {
        console.debug("[ResumeDebug] Local extraction produced no text.");
        console.groupEnd();
        return;
      }
      console.debug("[ResumeDebug] Extracted resume text length:", {
        length: text.length,
        preview: text.slice(0, 500),
      });

      const updates = {};
      const fieldNames = new Set();
      const normalizedLower = normalizeText(text).toLowerCase();
      const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,6}/);

      if (!normalizeText(formData.primaryEmail) && emailMatch?.[0]) {
        updates.primaryEmail = emailMatch[0];
        fieldNames.add("primaryEmail");
      }

      if (!normalizeText(formData.phoneNumber) && phoneMatch?.[0]) {
        const digits = phoneMatch[0].replace(/\D/g, "");
        if (digits.length >= 10) {
          updates.phoneNumber = digits.slice(-10);
          fieldNames.add("phoneNumber");
        }
      }

      if (!normalizeText(formData.yearsExperience)) {
        const yearsValue = mapYearsToBucket(extractExperienceYears(text) ?? Number.NaN);
        if (yearsValue) {
          updates.yearsExperience = yearsValue;
          fieldNames.add("yearsExperience");
          if (!normalizeText(formData.candidateType)) {
            updates.candidateType = yearsValue === "0-1" ? "fresher" : "experienced";
            fieldNames.add("candidateType");
          }
        }
      }

      const extractedName = extractCandidateName(text);
      if (!normalizeText(formData.firstName) && extractedName.firstName) {
        updates.firstName = extractedName.firstName;
        fieldNames.add("firstName");
      }
      if (!normalizeText(formData.lastName) && extractedName.lastName) {
        updates.lastName = extractedName.lastName;
        fieldNames.add("lastName");
      }

      if (!normalizeText(formData.dateOfBirth)) {
        const extractedDob = extractDateOfBirthValue(text);
        if (extractedDob) {
          updates.dateOfBirth = extractedDob;
          fieldNames.add("dateOfBirth");
        }
      }

      if (!normalizeText(formData.gender)) {
        const extractedGender = extractGenderValue(text);
        if (extractedGender) {
          updates.gender = extractedGender;
          fieldNames.add("gender");
        }
      }

      if (!normalizeText(formData.primarySkill)) {
        const configSkillOptions = [
          { value: "java", label: "Core Java" },
          { value: "python", label: "Python" },
          { value: "react", label: "React" },
          { value: "node", label: "Node.js" },
          { value: "aws", label: "AWS" },
          { value: "html5", label: "HTML5" },
          { value: "css3", label: "CSS3" },
          { value: "javascript", label: "JavaScript" },
          { value: "jquery", label: "jQuery" },
          { value: "bootstrap", label: "Bootstrap" },
          { value: "angular-4", label: "Angular 4" },
          { value: "backbone-js", label: "Backbone.js" },
        ];
        const matchedSkills = collectMatchedSkillValues(text, configSkillOptions);
        console.debug("[ResumeDebug] Skills mapping result from local extraction:", {
          matchedSkills,
          configSkillOptions,
        });
        if (matchedSkills[0]) {
          updates.primarySkill = matchedSkills[0];
          fieldNames.add("primarySkill");
        }
        if (!normalizeText(formData.secondarySkill) && matchedSkills[1]) {
          updates.secondarySkill = matchedSkills[1];
          fieldNames.add("secondarySkill");
        }

        if (matchedSkills.length > 0) {
          const existingSkillRows = Array.isArray(formData.skills) ? formData.skills : [];
          const hasExistingPrimarySkill = existingSkillRows.some((row) => normalizeText(row?.primarySkill));
          const yearsNumber = extractExperienceYears(text);
          const effectiveYearsBucket = updates.yearsExperience || formData.yearsExperience;
          const skillDefaults = getSkillDefaultsFromExperience(effectiveYearsBucket, yearsNumber);

          if (!hasExistingPrimarySkill) {
            updates.skills = matchedSkills.map((skillValue) => createSkillRow(skillValue, skillDefaults));
            fieldNames.add("skills");
          }
        }
      }

      const { company, role } = extractCompanyAndRole(text);
      const isInternshipCandidate = hasInternshipSignal(role);
      if (isInternshipCandidate && !normalizeText(formData.candidateType)) {
        updates.candidateType = "fresher";
        fieldNames.add("candidateType");
      }
      if (!isInternshipCandidate && !normalizeText(formData.currentCompanyName) && company) {
        updates.currentCompanyName = company;
        fieldNames.add("currentCompanyName");
      }
      if (!isInternshipCandidate && !normalizeText(formData.jobTitleRole) && role) {
        updates.jobTitleRole = role;
        fieldNames.add("jobTitleRole");
      }
      if (!isInternshipCandidate && !normalizeText(formData.candidateType) && (company || role) && updates.candidateType === "fresher") {
        updates.candidateType = "experienced";
        fieldNames.add("candidateType");
      }

      if (!isInternshipCandidate && !normalizeText(formData.employmentType)) {
        if (normalizedLower.includes("full time") || normalizedLower.includes("full-time")) {
          updates.employmentType = "full-time";
          fieldNames.add("employmentType");
        } else if (normalizedLower.includes("contract")) {
          updates.employmentType = "contract";
          fieldNames.add("employmentType");
        }
      }

      Object.entries(updates).forEach(([fieldName, fieldValue]) => {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
          onChange(fieldName, fieldValue);
        }
      });

      setMappedResumeFields(fieldNames);
      console.debug("[ResumeDebug] Final form values from local fallback path:", {
        updates,
        mappedFieldNames: Array.from(fieldNames),
        nextFormValues: { ...formData, ...updates },
      });
      console.groupEnd();
    }
  };

  return (
    <div className="candidate-documents-step">
      {/* Resume parsing is performed server-side — uploaded files are sent to the backend */}

      <div className="document-upload-header">Upload Document</div>
      <label
        htmlFor={inputId}
        className="document-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="document-dropzone-icon">📄</div>
        <div className="document-dropzone-text">
          <span className="dropzone-link">Click Here</span> to upload your Documents or drag.
        </div>
        <div className="document-dropzone-subtext">Supported Formats: PDF, DOC, DOCX (20 MB)</div>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.doc,.docx"
          multiple
          className="document-input"
          onChange={handleFileChange}
        />
      </label>

      <div className="document-list">
        {documents.length === 0 && (
          <div className="document-empty">No documents uploaded yet.</div>
        )}
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className={`document-item ${index % 2 === 0 ? "document-item--blue" : "document-item--peach"}`}
          >
            <div className="document-info">
              <div className="document-icon">📄</div>
              <div>
                <div className="document-name">{doc.name}</div>
                <div className="document-meta">
                  {doc.type ? doc.type.replace("application/", "") : "file"} |{" "}
                  {formatBytes(doc.size)}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="document-delete"
              aria-label={`Remove ${doc.name}`}
              onClick={() => handleRemove(doc.id)}
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateDocumentsStep;