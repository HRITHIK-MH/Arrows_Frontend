import React, { useEffect, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import FormField from "./FormField";
import { parseResume, mapResumeToFormFields, normalizeParsedResumePayload } from "../../api/resumeParserService";

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const toLower = (value) => normalizeText(value).toLowerCase();

const getResumeLines = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const getFileLike = (value) => {
  if (!value) return null;
  if (typeof File !== "undefined" && value instanceof File) return value;
  if (value?.file && typeof File !== "undefined" && value.file instanceof File) return value.file;
  if (value?.file && typeof value.file === "object") return value.file;
  if (typeof value === "object" && typeof value.name === "string") return value;
  return null;
};

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
  react: ["react", "reactjs", "react js"],
  "react-js": ["react", "reactjs", "react js", "react.js"],
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

const CandidateBasicInfoStep = ({
  formData,
  onChange,
  fields = [],
  onSetStepFields,
  validationErrors = {},
}) => {
  const isFresher = formData.candidateType === "fresher";
  const parsedResumeRef = React.useRef("");


  const fieldMap = useMemo(() => {
    const map = {};
    fields.forEach((field) => {
      map[field.name] = field;
    });
    return map;
  }, [fields]);

  useEffect(() => {
    if (!onSetStepFields) return;

    const hiddenForFresher = [
      "currentCompanyName",
      "jobTitleRole",
      "employmentType",
      "noticePeriod",
      "currentCtc",
      "expectedCtc",
    ];

    onSetStepFields(
      fields
        .filter((field) => !(isFresher && hiddenForFresher.includes(field.name)))
        .map((field) => ({
          name: field.name,
          label: field.label,
          required: Boolean(field.required),
        }))
    );
  }, [fields, isFresher, onSetStepFields]);

  useEffect(() => {
    const sourceIdOptions = Array.isArray(fieldMap.sourceId?.options)
      ? fieldMap.sourceId.options
      : [];
    const sourceNameOptions = Array.isArray(fieldMap.sourceName?.options)
      ? fieldMap.sourceName.options
      : [];

    if (formData.sourceId) {
      const matchedSource = sourceIdOptions.find(
        (option) => String(option.value) === String(formData.sourceId)
      );

      if (matchedSource?.sourceName && matchedSource.sourceName !== formData.sourceName) {
        onChange("sourceName", matchedSource.sourceName);
      }
      return;
    }

    if (formData.sourceName) {
      const matchedSource = sourceNameOptions.find(
        (option) => String(option.value) === String(formData.sourceName)
      );

      if (matchedSource?.sourceId && matchedSource.sourceId !== formData.sourceId) {
        onChange("sourceId", matchedSource.sourceId);
      }
    }
  }, [fieldMap, formData.sourceId, formData.sourceName, onChange]);

  useEffect(() => {
    if (formData.candidateTemplateMode === undefined || formData.candidateTemplateMode === null || formData.candidateTemplateMode === "") {
      onChange("candidateTemplateMode", "no");
    }
  }, [formData.candidateTemplateMode, onChange]);

  useEffect(() => {
    const resumeFromDocs = Array.isArray(formData.candidateDocuments)
      ? getFileLike(formData.candidateDocuments[0])
      : null;

    const sourceFile =
      getFileLike(formData.candidateTemplateFile) ||
      getFileLike(formData.candidateResume) ||
      resumeFromDocs;
    if (!sourceFile || typeof sourceFile !== "object") return;

    const fileKey = `${sourceFile.name || ""}-${sourceFile.size || 0}-${sourceFile.lastModified || 0}`;
    if (!fileKey || parsedResumeRef.current === fileKey) return;

    console.groupCollapsed("[ResumeDebug] Candidate Basic Info Auto Population");
    console.debug("[ResumeDebug] Uploaded file received by form:", {
      name: sourceFile?.name,
      type: sourceFile?.type,
      size: sourceFile?.size,
      lastModified: sourceFile?.lastModified,
      source: getFileLike(formData.candidateTemplateFile)
        ? "candidateTemplateFile"
        : getFileLike(formData.candidateResume)
          ? "candidateResume"
          : "candidateDocuments",
      fileKey,
    });

    let isCancelled = false;

    const parseAndMapResume = async () => {
      try {
        const parsedData = await parseResume(sourceFile);
        if (isCancelled) return;

        parsedResumeRef.current = fileKey;
        if (parsedData && typeof parsedData === "object") {
          console.debug("[ResumeDebug] GPT/API parsed JSON received by form:", parsedData);
          const normalizedParsedData = normalizeParsedResumePayload(parsedData);
          const mappedData = normalizedParsedData.personal_information || normalizedParsedData.professional_information
            ? mapResumeToFormFields(normalizedParsedData)
            : normalizedParsedData;
          console.debug("[ResumeDebug] Candidate form JSON used for mapping:", mappedData);

          const updates = {};

          if (!normalizeText(formData.firstName) && normalizeText(mappedData.firstName)) {
            updates.firstName = mappedData.firstName;
          }
          if (!normalizeText(formData.lastName) && normalizeText(mappedData.lastName)) {
            updates.lastName = mappedData.lastName;
          }

          if (!normalizeText(formData.primaryEmail) && normalizeText(mappedData.email)) {
            updates.primaryEmail = mappedData.email;
          }

          if (!normalizeText(formData.phoneNumber) && normalizeText(mappedData.phone)) {
            const digits = String(mappedData.phone).replace(/\D/g, "");
            if (digits.length >= 10) {
              updates.phoneNumber = digits.slice(-10);
            }
          }

          if (!normalizeText(formData.dateOfBirth) && normalizeText(mappedData.dateOfBirth)) {
            updates.dateOfBirth = mappedData.dateOfBirth;
          }

          if (!normalizeText(formData.gender) && normalizeText(mappedData.gender)) {
            updates.gender = mappedData.gender;
          }

          if (!normalizeText(formData.yearsExperience)) {
            const mappedExperience = mapExperienceValueToBucket(mappedData.totalExperience || mappedData.totalExperienceYears);
            if (mappedExperience) {
              updates.yearsExperience = mappedExperience;
              if (!normalizeText(formData.candidateType)) {
                updates.candidateType = mappedExperience === "0-1" ? "fresher" : "experienced";
              }
            }
          }

          if (!normalizeText(formData.currentCompanyName) && normalizeText(mappedData.currentCompany)) {
            updates.currentCompanyName = mappedData.currentCompany;
          }
          if (!normalizeText(formData.jobTitleRole) && normalizeText(mappedData.currentDesignation)) {
            updates.jobTitleRole = mappedData.currentDesignation;
          }
          if (!normalizeText(formData.employmentType) && normalizeText(mappedData.employmentType)) {
            updates.employmentType = mappedData.employmentType;
          }
          if (!normalizeText(formData.noticePeriod) && normalizeText(mappedData.noticePeriod)) {
            updates.noticePeriod = mappedData.noticePeriod;
          }
          if (!normalizeText(formData.currentCtc) && normalizeText(mappedData.currentCtc)) {
            updates.currentCtc = mappedData.currentCtc;
          }
          if (!normalizeText(formData.expectedCtc) && normalizeText(mappedData.expectedCtc)) {
            updates.expectedCtc = mappedData.expectedCtc;
          }

          if (!normalizeText(formData.primarySkill) && normalizeSkillInput(mappedData.skills).length > 0) {
            const skillsList = normalizeSkillInput(mappedData.skills);
            const primarySkillOptions = Array.isArray(fieldMap.primarySkill?.options) ? fieldMap.primarySkill.options : [];
            const mappedSkillValues = mapSkillTextsToValues(skillsList, primarySkillOptions);
            const skillValuesForRows = mappedSkillValues.length > 0 ? mappedSkillValues : skillsList;
            console.debug("[ResumeDebug] Skills mapping result from GPT/API data:", {
              rawSkills: mappedData.skills,
              skillsList,
              mappedSkillValues,
              selectedPrimarySkill: skillValuesForRows[0] || "",
              selectedSecondarySkill: skillValuesForRows[1] || "",
            });
            if (skillValuesForRows[0]) {
              updates.primarySkill = skillValuesForRows[0];
            }
            if (!normalizeText(formData.secondarySkill) && skillValuesForRows[1]) {
              updates.secondarySkill = skillValuesForRows[1];
            }

            const existingSkillRows = Array.isArray(formData.skills) ? formData.skills : [];
            const hasExistingPrimarySkill = existingSkillRows.some((row) => normalizeText(row?.primarySkill));
            if (!hasExistingPrimarySkill && skillValuesForRows.length > 0) {
              const skillDefaults = {
                ...getSkillDefaultsFromExperience(updates.yearsExperience || formData.yearsExperience, Number(mappedData.totalExperience) || 0),
                skillExperienceLevel: mappedData.skillExperienceLevel || undefined,
                skillExperienceYears: mappedData.skillExperienceYears || undefined,
                skillRating: mappedData.skillRating || undefined,
                skillComments: mappedData.skillComments || undefined,
              };
              updates.skills = skillValuesForRows.map((skillValue) => createSkillRow(skillValue, skillDefaults));
            }
          }

          Object.entries(updates).forEach(([fieldName, fieldValue]) => {
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
              onChange(fieldName, fieldValue);
            }
          });
          console.debug("[ResumeDebug] Final form values from GPT/API path:", {
            updates,
            nextFormValues: { ...formData, ...updates },
          });

          // If GPT parse succeeded, skip the local heuristic parser.
          if (Object.keys(updates).length > 0) {
            console.groupEnd();
            return;
          }
        }
      } catch (error) {
        console.error("GPT resume parsing failed, falling back to local parse:", error);
      }

      try {
        const extractedText = await readResumeText(sourceFile);
        if (isCancelled) return;

        if (!extractedText) {
          console.debug("[ResumeDebug] Local extraction produced no text.");
          console.groupEnd();
          return;
        }
        console.debug("[ResumeDebug] Extracted resume text length:", {
          length: extractedText.length,
          preview: extractedText.slice(0, 500),
        });

        parsedResumeRef.current = fileKey;
        const normalized = normalizeText(extractedText);
        const normalizedLower = toLower(normalized);
        const updates = {};

        const emailMatch = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const phoneMatch = normalized.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,6}/);

        if (!normalizeText(formData.primaryEmail) && emailMatch?.[0]) {
          updates.primaryEmail = emailMatch[0];
        }

        if (!normalizeText(formData.phoneNumber) && phoneMatch?.[0]) {
          const digits = phoneMatch[0].replace(/\D/g, "");
          if (digits.length >= 10) {
            updates.phoneNumber = digits.slice(-10);
          }
        }

        if (!normalizeText(formData.yearsExperience)) {
          const yearsNumber = extractExperienceYears(extractedText);
          const mappedExperience = mapYearsToBucket(yearsNumber ?? Number.NaN);
          if (mappedExperience) {
            updates.yearsExperience = mappedExperience;
            if (!normalizeText(formData.candidateType)) {
              updates.candidateType = (yearsNumber || 0) > 0 ? "experienced" : "fresher";
            }
          }
        }

        const extractedName = extractCandidateName(extractedText);
        if (!normalizeText(formData.firstName) && extractedName.firstName) {
          updates.firstName = extractedName.firstName;
        }
        if (!normalizeText(formData.lastName) && extractedName.lastName) {
          updates.lastName = extractedName.lastName;
        }

        if (!normalizeText(formData.dateOfBirth)) {
          const extractedDob = extractDateOfBirthValue(extractedText);
          if (extractedDob) {
            updates.dateOfBirth = extractedDob;
          }
        }

        if (!normalizeText(formData.gender)) {
          const extractedGender = extractGenderValue(extractedText);
          if (extractedGender) {
            updates.gender = extractedGender;
          }
        }

        const primarySkillOptions = Array.isArray(fieldMap.primarySkill?.options) ? fieldMap.primarySkill.options : [];
        const matchedSkills = collectMatchedSkillValues(extractedText, primarySkillOptions);
        const yearsNumber = extractExperienceYears(extractedText);
        const effectiveYearsBucket = updates.yearsExperience || formData.yearsExperience;
        const skillDefaults = getSkillDefaultsFromExperience(effectiveYearsBucket, yearsNumber);
        console.debug("[ResumeDebug] Skills mapping result from local extraction:", {
          matchedSkills,
          skillDefaults,
          primarySkillOptions,
        });

        if (!normalizeText(formData.primarySkill) && matchedSkills[0]) {
          updates.primarySkill = matchedSkills[0];
        }

        if (!normalizeText(formData.secondarySkill) && matchedSkills[1]) {
          updates.secondarySkill = matchedSkills[1];
        }

        if (matchedSkills.length > 0) {
          const existingSkillRows = Array.isArray(formData.skills) ? formData.skills : [];
          const hasExistingPrimarySkill = existingSkillRows.some((row) => normalizeText(row?.primarySkill));

          if (!hasExistingPrimarySkill) {
            updates.skills = matchedSkills.map((skillValue) => createSkillRow(skillValue, skillDefaults));
          }
        }

        if (!normalizeText(formData.skillRating) && normalizeText(updates.yearsExperience || formData.yearsExperience)) {
          const yearsValue = updates.yearsExperience || formData.yearsExperience;
          if (!normalizeText(formData.skillExperienceLevel)) {
            if (yearsValue === "0-1" || yearsValue === "1-3") {
              updates.skillExperienceLevel = "beginner";
            } else if (yearsValue === "3-5" || yearsValue === "5-8") {
              updates.skillExperienceLevel = "intermediate";
            } else {
              updates.skillExperienceLevel = "expert";
            }
          }
          if (yearsValue === "0-1") {
            updates.skillRating = "1";
          } else if (yearsValue === "1-3") {
            updates.skillRating = "2";
          } else if (yearsValue === "3-5") {
            updates.skillRating = "3";
          } else if (yearsValue === "5-8") {
            updates.skillRating = "4";
          } else {
            updates.skillRating = "5";
          }
        }

        const { company, role } = extractCompanyAndRole(extractedText);
        if (!normalizeText(formData.currentCompanyName) && company) {
          updates.currentCompanyName = company;
        }
        if (!normalizeText(formData.jobTitleRole) && role) {
          updates.jobTitleRole = role;
        }

        if (!normalizeText(formData.employmentType)) {
          if (normalizedLower.includes("full time") || normalizedLower.includes("full-time")) {
            updates.employmentType = "full-time";
          } else if (normalizedLower.includes("contract")) {
            updates.employmentType = "contract";
          } else if (normalizedLower.includes("intern") || normalizedLower.includes("internship")) {
            updates.employmentType = "internship";
          }
        }

        Object.entries(updates).forEach(([fieldName, fieldValue]) => {
          if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
            onChange(fieldName, fieldValue);
          }
        });
        console.debug("[ResumeDebug] Final form values from local fallback path:", {
          updates,
          nextFormValues: { ...formData, ...updates },
        });
        console.groupEnd();
      } catch (error) {
        console.error("Resume parsing failed:", error);
        console.groupEnd();
      }
    };

    void parseAndMapResume();

    return () => {
      isCancelled = true;
    };
  }, [
    fieldMap.primarySkill?.options,
    formData.candidateDocuments,
    formData.candidateResume,
    formData.candidateTemplateFile,
    formData.candidateType,
    formData.firstName,
    formData.lastName,
    formData.phoneNumber,
    formData.primaryEmail,
    formData.primarySkill,
    formData.skillExperienceLevel,
    formData.skillRating,
    formData.yearsExperience,
    onChange,
  ]);

  const renderField = (name, extraClass = "", overrides = {}) => {
    const field = fieldMap[name];
    if (!field) return null;
    const value =
      formData[field.name] || (field.type === "multiselect" ? [] : "");
    const fieldProps = { ...field, ...overrides };

    return (
      <div className={`candidate-cell${extraClass ? ` ${extraClass}` : ""}`}>
        <FormField
          key={fieldProps.name}
          label={fieldProps.label}
          type={fieldProps.type}
          name={fieldProps.name}
          value={value}
          onChange={onChange}
          required={fieldProps.required}
          options={fieldProps.options}
          validate={fieldProps.validate}
          error={validationErrors[fieldProps.name]}
          onValidation={fieldProps.onValidation}
          placeholder={fieldProps.placeholder}
          hideLabel={fieldProps.hideLabel}
          accept={fieldProps.accept}
          multiple={fieldProps.multiple}
          showBrowseButton={fieldProps.showBrowseButton}
          allowDecimal={fieldProps.allowDecimal}
          prefix={fieldProps.prefix}
          formData={formData}
          disabled={fieldProps.disabled}
        />
      </div>
    );
  };

  const selectedSkills = [
    ...new Set(
      (Array.isArray(formData.skills) ? formData.skills : [])
        .map((skill) => skill?.primarySkill)
        .filter(Boolean)
    ),
  ];

  const handleSkillsChange = (_, values) => {
    const nextSkills = (Array.isArray(values) ? values : []).map((primarySkill) => ({
      primarySkill,
    }));
    onChange("skills", nextSkills);
  };

  return (
    <div className="candidate-step">
      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Basic Info</h3>
          <div className="candidate-section-divider" />
        </div>
        <div className="candidate-grid">
          <div className="candidate-cell">
            <div className="job-template-choice">
              <div className="job-template-choice-label">
                Have Candidate Resume?
                <span className="required-star">*</span>
              </div>
              <div className="job-template-choice-options" role="radiogroup" aria-label="Have Candidate Resume">
                <label className="job-template-choice-option" htmlFor="candidateTemplateMode-no">
                  <input
                    id="candidateTemplateMode-no"
                    type="radio"
                    name="candidateTemplateMode"
                    value="no"
                    checked={formData.candidateTemplateMode !== "yes"}
                    onChange={() => {
                      onChange("candidateTemplateMode", "no");
                      onChange("candidateTemplateFile", "");
                      // Clear auto-filled resume fields
                      onChange("firstName", "");
                      onChange("lastName", "");
                      onChange("primaryEmail", "");
                      onChange("phoneNumber", "");
                      onChange("dateOfBirth", "");
                      onChange("gender", "");
                      onChange("yearsExperience", "");
                      onChange("candidateType", "");
                      onChange("primarySkill", "");
                      onChange("secondarySkill", "");
                      onChange("skills", []);
                      onChange("currentCompanyName", "");
                      onChange("jobTitleRole", "");
                      onChange("employmentType", "");
                      onChange("candidateDocuments", []);
                      onChange("candidateResume", "");
                    }}
                  />
                  <span>No</span>
                </label>
                <label className="job-template-choice-option" htmlFor="candidateTemplateMode-yes">
                  <input
                    id="candidateTemplateMode-yes"
                    type="radio"
                    name="candidateTemplateMode"
                    value="yes"
                    checked={formData.candidateTemplateMode === "yes"}
                    onChange={() => onChange("candidateTemplateMode", "yes")}
                  />
                  <span>Yes</span>
                </label>
              </div>
              {formData.candidateTemplateMode === "yes" && (
                <div className="job-template-upload-wrap">
                  {renderField("candidateTemplateFile")}
                </div>
              )}
            </div>
          </div>
          {renderField("candidateId")}
          {renderField("firstName")}
          {renderField("lastName")}
          {renderField("primaryEmail")}
          {renderField("phoneNumber")}
          {renderField("gender")}
          {renderField("dateOfBirth")}
          {renderField("yearsExperience")}
          {renderField("offersInHand")}
        </div>
      </div>

      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Current Company Info</h3>
          <div className="candidate-section-divider" />
        </div>
        <div className="candidate-type-toggle">
          <label className={`candidate-type-option${isFresher ? " active" : ""}`}>
            <input
              type="radio"
              name="candidateType"
              value="fresher"
              checked={isFresher}
              onChange={() => onChange("candidateType", "fresher")}
            />
            Fresher
          </label>
          <label className={`candidate-type-option${!isFresher ? " active" : ""}`}>
            <input
              type="radio"
              name="candidateType"
              value="experienced"
              checked={!isFresher}
              onChange={() => onChange("candidateType", "experienced")}
            />
            Experienced
          </label>
        </div>
        {!isFresher && (
          <div className="candidate-grid">
            {renderField("currentCompanyName")}
            {renderField("jobTitleRole")}
            {renderField("employmentType")}
            {renderField("noticePeriod")}
            {renderField("currentCtc")}
            {renderField("expectedCtc")}
          </div>
        )}
      </div>

      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Add Skill set</h3>
          <div className="candidate-section-divider" />
        </div>

        <div className="candidate-grid">
          <div className="candidate-cell candidate-skill-multiselect">
            <FormField
              {...fieldMap.primarySkill}
              value={selectedSkills}
              onChange={handleSkillsChange}
              formData={formData}
            />
          </div>
        </div>
      </div>

      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Source Info</h3>
          <div className="candidate-section-divider" />
        </div>
        <div className="candidate-grid source-info-grid">
          {renderField("sourceName", "dropdown-up")}
          {renderField("recruiterId", "dropdown-up")}
          {renderField("sourcedDate")}
        </div>
      </div>
    </div>
  );
};

export default CandidateBasicInfoStep;
