import { mapParsedSkills } from "./skillMapper";

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const toLower = (value) => normalizeText(value).toLowerCase();

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

const buildPdfText = (textItems = []) => {
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

const extractResumeText = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const ext = String(file.name || "").split(".").pop().toLowerCase();

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    const pdfjsWorkerSrc = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");

    if (pdfjsLib.GlobalWorkerOptions.workerSrc !== pdfjsWorkerSrc.default) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc.default;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      pages.push(buildPdfText(textContent.items));
    }

    return normalizeResumeDocument(pages.join("\n"));
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return normalizeResumeDocument(result?.value || "");
  }

  if (ext === "doc" || ext === "txt") {
    return normalizeResumeDocument(await file.text());
  }

  throw new Error(`Unsupported file type: ${ext}`);
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

const cleanResumeValue = (value) =>
  normalizeText(String(value || "").replace(/[|•]/g, " ").replace(/\s+/g, " ")).slice(0, 120);

const extractCandidateName = (text) => {
  const lines = getResumeLines(text);
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
    .replace(/^(mr|mrs|ms|miss|dr)\.??\s+/i, "")
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
  const lines = getResumeLines(text);
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
  const lines = getResumeLines(text);
  const labelledLine = lines.find((line) => /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?/i.test(line));
  if (!labelledLine) return "";

  const dateText = labelledLine.replace(/.*?(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*/i, "");
  return parseResumeDateToIso(dateText);
};

const extractYearsExperience = (text) => {
  const normalized = String(text || "");
  const experienceMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:\+?\s*)(?:years?|yrs?|y)\b/i);
  if (experienceMatch) {
    return Number.parseFloat(experienceMatch[1]);
  }

  const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  if (rangeMatch) {
    return Number.parseFloat(rangeMatch[2]);
  }

  return 0;
};

const extractEmploymentType = (text) => {
  const lower = toLower(text);
  if (lower.includes("full time") || lower.includes("full-time")) return "full-time";
  if (lower.includes("part time") || lower.includes("part-time")) return "part-time";
  if (lower.includes("contract")) return "contract";
  if (lower.includes("intern")) return "internship";
  if (lower.includes("freelance") || lower.includes("consultant")) return "freelance";
  return "";
};

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
  if (scopedLines.length === 0) return { company: "", role: "" };

  const datePattern = /^(\d{1,2}[/-]\d{4}|\d{4})\s*(?:to|–|-|—)?\s*(present|current|now|\d{1,2}[/-]\d{4}|\d{4})?/i;
  const section = scopedLines.slice(0, 8).join(" ");

  const roleMatch = section.match(/([A-Za-z][A-Za-z\s,&.-]{3,40})\s*-\s*([A-Za-z][A-Za-z\s,&.-]{3,40})/);
  if (roleMatch) {
    return {
      company: cleanRoleOrCompanyValue(roleMatch[1]),
      role: cleanRoleOrCompanyValue(roleMatch[2]),
    };
  }

  const companyLine = scopedLines.find((line) => /\b(at|with|for)\b/i.test(line) && /[A-Za-z]/.test(line));
  const roleLine = scopedLines.find((line) => /\b(manager|engineer|developer|consultant|analyst|specialist|director|lead|architect)\b/i.test(line));

  return {
    company: cleanRoleOrCompanyValue(companyLine || ""),
    role: cleanRoleOrCompanyValue(roleLine || ""),
  };
};

const extractSkills = (text) => {
  const lines = getResumeLines(text);
  const skillsIndex = lines.findIndex((line) => /^skills?\b/i.test(line));
  if (skillsIndex === -1) return [];

  const skills = [];
  const skillsLine = lines[skillsIndex];
  const inlineMatch = skillsLine.match(/^skills?\s*[:\-]\s*(.+)$/i);
  if (inlineMatch?.[1]) {
    skills.push(...inlineMatch[1].split(/[;,•·]/).map((part) => part.trim()).filter(Boolean));
  }

  for (let i = skillsIndex + 1; i < lines.length; i += 1) {
    const nextLine = lines[i];
    if (/^(experience|education|projects|certifications|languages|summary|profile|objective)\b/i.test(nextLine)) break;
    skills.push(...nextLine.split(/[;,•·\n]/).map((part) => part.trim()).filter(Boolean));
    if (skills.length >= 25) break;
  }

  return skills.filter(Boolean).slice(0, 25);
};

const extractEmail = (text) => {
  const match = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] || "";
};

const extractPhoneNumber = (text) => {
  const match = String(text || "").match(/(\+?\d[\d()\s.-]{7,}\d)/);
  if (!match) return "";
  const digits = match[0].replace(/[^\d]/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

const findNameLine = (text) => {
  const lines = getResumeLines(text);
  const candidateLine = lines.find((line, index) => {
    if (/^(?:candidate\s*name|full\s*name|name)\s*[:\-]/i.test(line)) return true;
    if (/@/.test(line) || /\d/.test(line)) return false;
    if (/\b(email|phone|mobile|linkedin|github|address)\b/i.test(line)) return false;
    return line.split(/\s+/).length >= 2;
  });
  return candidateLine || lines[0] || "";
};

const parseName = (text) => {
  const candidate = findNameLine(text).replace(/^(?:candidate\s*name|full\s*name|name)\s*[:\-]\s*/i, "");
  const cleaned = cleanResumeValue(candidate)
    .replace(/^(mr|mrs|ms|miss|dr)\.??\s+/i, "")
    .replace(/[^A-Za-z\s.'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length < 2) return { firstName: "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const parseResumeTextToForm = (text) => {
  const firstNameData = parseName(text);
  const totalExperienceYears = extractYearsExperience(text);
  const { company: currentCompany, role: currentDesignation } = extractLatestExperienceEntry(text);

  const result = {
    firstName: firstNameData.firstName,
    lastName: firstNameData.lastName,
    email: extractEmail(text),
    phone: extractPhoneNumber(text),
    gender: extractGenderValue(text),
    dateOfBirth: extractDateOfBirthValue(text),
    totalExperienceYears,
    totalExperience: totalExperienceYears,
    currentCompany,
    currentDesignation,
    employmentType: extractEmploymentType(text),
    skills: extractSkills(text),
  };

  return result;
};

const stripJsonCodeBlock = (value) =>
  String(value || "").replace(/```json|```/gi, "").trim();

const parseJsonFromText = (value) => {
  const cleanValue = stripJsonCodeBlock(value || "");
  if (!cleanValue) return null;

  try {
    return JSON.parse(cleanValue);
  } catch (parseError) {
    const jsonMatch = cleanValue.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (_err) {
        return null;
      }
    }
    return null;
  }
};

export const parseResume = async (file) => {
  if (!file) {
    throw new Error("No file provided for parsing");
  }

  const extension = String(file.name || "").split(".").pop().toLowerCase();
  if (!extension || !["pdf", "docx", "doc", "txt"].includes(extension)) {
    throw new Error("Unsupported resume format. Please upload PDF, DOCX, DOC, or TXT.");
  }

  const text = await extractResumeText(file);
  if (!text) {
    throw new Error("Unable to extract resume text");
  }

  const endpoint = String(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || "").trim();
  const deployment = String(import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || "").trim();
  const apiVersion = String(import.meta.env.VITE_AZURE_OPENAI_API_VERSION || "2025-01-01-preview").trim();
  const apiKey = String(import.meta.env.VITE_AZURE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || "").trim();

  if (!endpoint || !deployment || !apiKey) {
    throw new Error(
      "Azure OpenAI configuration is missing. Set VITE_AZURE_OPENAI_ENDPOINT, VITE_AZURE_OPENAI_DEPLOYMENT, and VITE_AZURE_OPENAI_API_KEY."
    );
  }

  const cleanedEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
  const url = `${cleanedEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(
    apiVersion
  )}`;

  const prompt = `Parse the resume text below and return only valid JSON with exactly two keys: resumeJson and candidateForm. The resumeJson value must be a structured object containing personal_information, professional_information, skills, education, certifications, projects, employment_history, and any other relevant sections. The candidateForm value should be a flat object with common candidate fields such as firstName, lastName, email, phone, gender, dateOfBirth, totalExperienceYears, currentCompany, currentDesignation, employmentType, and skills (skills should be an array of strings). Use empty strings or empty arrays when information is missing. Do not return any explanation or markdown. Resume text:\n\n${text}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a resume parser assistant. Extract structured JSON from the resume text and return only JSON.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const failureText = await response.text();
      throw new Error(`Azure OpenAI request failed: ${response.status} ${failureText}`);
    }

    const json = await response.json();
    const assistantText = json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text || "";
    const parsed = parseJsonFromText(assistantText);

    if (parsed && parsed.resumeJson && parsed.candidateForm) {
      console.log("Before Skill Mapping:", parsed);
      const mappedParsed = mapParsedSkills(parsed);
      console.log("After Skill Mapping:", mappedParsed);

      return {
        resumeJson: mappedParsed.resumeJson,
        candidateForm: mappedParsed.candidateForm,
      };
    }

    throw new Error("Azure OpenAI response did not contain valid resumeJson/candidateForm JSON.");
  } catch (azureError) {
    console.warn("Azure OpenAI parse failed, falling back to local extraction:", azureError);
    const candidateForm = parseResumeTextToForm(text);
    const parsed = {
      resumeJson: { text },
      candidateForm,
    };
    console.log("Before Skill Mapping:", parsed);
    const mappedParsed = mapParsedSkills(parsed);
    console.log("After Skill Mapping:", mappedParsed);

    return {
      resumeJson: mappedParsed.resumeJson,
      candidateForm: mappedParsed.candidateForm,
    };
  }
};

export const mapResumeToFormFields = (parsedData = {}) => {
  if (parsedData.candidateForm) {
    return parsedData.candidateForm;
  }

  return {
    firstName: parsedData.firstName || "",
    lastName: parsedData.lastName || "",
    email: parsedData.email || "",
    phone: parsedData.phone || "",
    dateOfBirth: parsedData.dateOfBirth || "",
    gender: parsedData.gender || "",
    totalExperience: parsedData.totalExperience || parsedData.totalExperienceYears || 0,
    currentCompany: parsedData.currentCompany || "",
    currentDesignation: parsedData.currentDesignation || "",
    employmentType: parsedData.employmentType || "",
    skills: Array.isArray(parsedData.skills) ? parsedData.skills.join(", ") : parsedData.skills || "",
  };
};
