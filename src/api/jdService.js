import { buildJdGenerationPrompt, buildJdMappingPrompt, JD_PARSE_PROMPT } from "./jdPrompts";
import { JD_SCHEMA } from "./jdSchema";
import { applyJdGuardrails } from "../utils/jdGuardrailValidator";
import { requestChatCompletion } from "./aiProxyService";

const cleanValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const cleanList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => cleanValue(item)).filter(Boolean);
  }
  return cleanValue(value)
    .split(/[;,|/\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const stripJsonCodeBlock = (value) =>
  cleanValue(value).replace(/```json|```/gi, "").trim();

const parseJsonResponse = (value) => {
  const cleaned = stripJsonCodeBlock(value);
  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_nestedError) {
      return null;
    }
  }
};

// Routes through the backend AI proxy (Azure key stays server-side).
const callAzure = ({ messages, stage, jsonMode, signal }) =>
  requestChatCompletion({
    messages,
    temperature: 0,
    maxTokens: 3500,
    jsonMode,
    signal,
  }).catch((error) => {
    throw new Error(`Azure OpenAI ${stage} failed: ${error.message}`);
  });

export const normalizeJdJson = (value = {}) => {
  const job = value.job_information || {};
  const experience = value.experience_requirements || {};
  const compensation = value.compensation || {};
  const skills = value.skills || {};

  return {
    job_information: {
      ...JD_SCHEMA.job_information,
      ...job,
      job_id: cleanValue(job.job_id),
      job_name: cleanValue(job.job_name),
      position_level: cleanValue(job.position_level),
      work_type: cleanValue(job.work_type),
      employment_type: cleanValue(job.employment_type),
      number_of_positions: job.number_of_positions ?? 0,
      location: cleanList(job.location),
    },
    experience_requirements: {
      ...JD_SCHEMA.experience_requirements,
      ...experience,
    },
    compensation: {
      ...JD_SCHEMA.compensation,
      ...compensation,
    },
    skills: {
      ...JD_SCHEMA.skills,
      technical_skills: cleanList(skills.technical_skills),
      additional_skills: cleanList(skills.additional_skills),
      soft_skills: cleanList(skills.soft_skills),
    },
    job_description: cleanValue(value.job_description),
  };
};

export const parseJdTextWithAzure = async (jdText) => {
  if (!cleanValue(jdText)) {
    throw new Error("No JD text was extracted from the uploaded document.");
  }

  const parseContent = await callAzure({
    stage: "jd-document-parse",
    jsonMode: true,
    messages: [
      {
        role: "system",
        content: JD_PARSE_PROMPT,
      },
      {
        role: "user",
        content: jdText,
      },
    ],
  });

  console.debug("[JDDebug] GPT parsed JD JSON text:", parseContent);
  const parsedJd = parseJsonResponse(parseContent);
  if (!parsedJd) {
    throw new Error("GPT returned invalid JD JSON.");
  }

  console.debug("[JDDebug] Parsed compact JD JSON:", parsedJd);

  const mappingContent = await callAzure({
    stage: "jd-form-mapping",
    jsonMode: true,
    messages: [
      {
        role: "system",
        content: "You map parsed JD JSON into the ARROWS Job Form schema. Return JSON only.",
      },
      {
        role: "user",
        content: buildJdMappingPrompt(parsedJd),
      },
    ],
  });

  console.debug("[JDDebug] GPT mapped Job Form JSON text:", mappingContent);
  const mappedJd = parseJsonResponse(mappingContent);
  if (!mappedJd) {
    throw new Error("GPT returned invalid ARROWS Job Form JSON.");
  }

  const normalized = applyJdGuardrails(normalizeJdJson(mappedJd));
  console.debug("[JDDebug] Mapped ARROWS Job Form JSON:", normalized);
  return normalized;
};

export const buildJdSchemaFromForm = (formData = {}, labels = {}) =>
  applyJdGuardrails({
    job_information: {
      job_id: cleanValue(formData.jobPositionId),
      job_name: cleanValue(formData.positionName),
      position_level: cleanValue(labels.positionLevel || formData.positionLevel),
      work_type: cleanValue(labels.workType || formData.hiringType),
      employment_type: cleanValue(labels.employmentType || formData.jobType),
      number_of_positions: Number(formData.noOfPositions) || 0,
      location: cleanList(labels.location || formData.location),
    },
    experience_requirements: {
      minimum_experience: Number(formData.minExperience) || 0,
      maximum_experience: Number(formData.maxExperience) || 0,
    },
    compensation: {
      minimum_ctc: cleanValue(formData.minSalary),
      maximum_ctc: cleanValue(formData.maxSalary),
    },
    skills: {
      technical_skills: cleanList(labels.technicalSkills || formData.technicalSkills),
      additional_skills: cleanList(formData.additionalSkills),
      soft_skills: cleanList(labels.softSkills || formData.softSkills),
    },
    job_description: cleanValue(formData.jdPrompt || formData.generatedJd),
  });

export const generateJdWithAzure = async (jobFormJson, sourceJdText = "") => {
  const guardedJobFormJson = applyJdGuardrails(jobFormJson);
  const content = await callAzure({
    stage: "jd-generation",
    jsonMode: true,
    messages: [
      {
        role: "system",
        content: "You generate professional enterprise job descriptions as strict JSON. Return JSON only.",
      },
      {
        role: "user",
        content: buildJdGenerationPrompt(guardedJobFormJson, sourceJdText),
      },
    ],
  });

  console.debug("[JDDebug] GPT generated JD JSON text:", content);
  const generatedJson = parseJsonResponse(content);
  if (!generatedJson) {
    throw new Error("GPT returned invalid generated JD JSON.");
  }

  const jobTitle = cleanValue(generatedJson.job_title);
  const description = cleanList(generatedJson.description);
  const responsibilities = cleanList(generatedJson.responsibilities);
  const qualifications = cleanList(generatedJson.qualifications);
  const educationRequirements = cleanList(generatedJson.education_requirements);
  const experienceRequirements = cleanList(generatedJson.experience_requirements);

  const sections = [
    jobTitle ? `Job Title: ${jobTitle}` : "",
    description.length
      ? `\nDescription\n${description.join("\n\n")}`
      : "",
    responsibilities.length
      ? `\nResponsibilities\n${responsibilities.map((item) => `- ${item}`).join("\n")}`
      : "",
    qualifications.length
      ? `\nQualifications\n${qualifications.map((item) => `- ${item}`).join("\n")}`
      : "",
    educationRequirements.length
      ? `\nEducation Requirements\n${educationRequirements.map((item) => `- ${item}`).join("\n")}`
      : "",
    experienceRequirements.length
      ? `\nExperience Requirements\n${experienceRequirements.map((item) => `- ${item}`).join("\n")}`
      : "",
  ].filter(Boolean);

  const generatedText = sections.join("\n").trim();
  if (!generatedText) {
    throw new Error("GPT returned an empty generated JD.");
  }

  console.debug("[JDDebug] Generated JD JSON:", generatedJson);
  console.debug("[JDDebug] Formatted generated JD:", generatedText);
  return generatedText;
};
