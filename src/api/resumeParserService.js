import { PROMPT_ARROWS_MAPPING, PROMPT_ARROWS_PARSE } from './resumePrompts';
import { mapParsedSkills } from './skillMapper';

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeNumberValue = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return value;
};

const normalizeSkills = (skills) => {
  if (!skills) return '';
  if (Array.isArray(skills)) {
    return skills
      .map((skill) => {
        if (typeof skill === 'string') return skill;
        return skill?.skill_name || skill?.name || skill?.primary_skill || '';
      })
      .filter(Boolean)
      .join('; ');
  }
  return normalizeValue(skills);
};

const mapArrowsCandidateFormToFlatFields = (candidateForm = {}) => {
  const candidate = candidateForm.candidate_information || {};
  const company = candidateForm.current_company_information || {};
  const skills = candidateForm.skills_information || {};
  const secondarySkills = Array.isArray(skills.secondary_skills) ? skills.secondary_skills : [];
  const skillList = [skills.primary_skill, ...secondarySkills].filter(Boolean);

  return {
    candidateId: normalizeValue(candidate.candidate_id),
    candidateTemplateMode: candidate.have_candidate_resume === true ? 'yes' : '',
    firstName: normalizeValue(candidate.first_name),
    lastName: normalizeValue(candidate.last_name),
    email: normalizeValue(candidate.primary_email_address),
    phone: normalizeValue(candidate.phone_number),
    gender: normalizeValue(candidate.gender).toLowerCase(),
    dateOfBirth: normalizeValue(candidate.date_of_birth),
    totalExperience: normalizeValue(candidate.years_of_experience),
    offersInHand: normalizeValue(candidate.offers_in_hand),
    comments: normalizeValue(candidate.comments_remarks),
    candidateType: normalizeValue(company.candidate_type).toLowerCase(),
    currentCompany: normalizeValue(company.current_company_name),
    currentDesignation: normalizeValue(company.job_title_role),
    employmentType: normalizeValue(company.employment_type).toLowerCase(),
    noticePeriod: normalizeNumberValue(company.notice_period_days),
    currentCtc: normalizeNumberValue(company.current_ctc_lpa),
    expectedCtc: normalizeNumberValue(company.expected_ctc_lpa),
    skills: skillList.join('; '),
    skillExperienceLevel: normalizeValue(skills.experience_level).toLowerCase(),
    skillExperienceYears: normalizeNumberValue(skills.skill_experience_years),
    skillRating: normalizeNumberValue(skills.rating),
    skillComments: normalizeValue(skills.comments),
    _candidateForm: candidateForm,
  };
};

export const normalizeParsedResumePayload = (parsedData = {}) => {
  if (!parsedData || typeof parsedData !== 'object') return {};

  const candidateForm = parsedData.candidateForm || parsedData.candidate_form;
  if (candidateForm?.candidate_information || candidateForm?.skills_information) {
    return {
      ...mapArrowsCandidateFormToFlatFields(candidateForm),
      resumeJson: parsedData.resumeJson || parsedData.resume_json || null,
    };
  }

  if (parsedData.candidate_information || parsedData.skills_information) {
    return mapArrowsCandidateFormToFlatFields(parsedData);
  }

  return parsedData;
};

const stripJsonCodeBlock = (value) =>
  String(value || '').replace(/```json|```/gi, '').trim();

const extractJson = (value) => {
  const cleanValue = stripJsonCodeBlock(value);
  if (!cleanValue) return null;

  try {
    return JSON.parse(cleanValue);
  } catch (_parseError) {
    const jsonMatch = cleanValue.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_nestedParseError) {
      return null;
    }
  }
};

const getAzureOpenAiConfig = () => {
  const endpoint = normalizeValue(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT).replace(/\/+$/, '');
  const deployment = normalizeValue(import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT);
  const apiVersion = normalizeValue(import.meta.env.VITE_AZURE_OPENAI_API_VERSION) || '2025-01-01-preview';
  const apiKey = normalizeValue(import.meta.env.VITE_AZURE_OPENAI_API_KEY);

  return { endpoint, deployment, apiVersion, apiKey };
};

const callAzureOpenAi = async (messages, stageName) => {
  const { endpoint, deployment, apiVersion, apiKey } = getAzureOpenAiConfig();

  if (!endpoint || !deployment || !apiKey) {
    throw new Error(
      'Azure OpenAI frontend configuration is missing. Set VITE_AZURE_OPENAI_ENDPOINT, VITE_AZURE_OPENAI_DEPLOYMENT, VITE_AZURE_OPENAI_API_VERSION, and VITE_AZURE_OPENAI_API_KEY in .env.dev.'
    );
  }

  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
  const payload = {
    messages,
    temperature: 0,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  };

  console.debug(`[ResumeDebug] Azure GPT request payload (${stageName}):`, {
    url,
    deployment,
    apiVersion,
    messages: messages.map((message) => ({
      role: message.role,
      contentLength: String(message.content || '').length,
      contentPreview: String(message.content || '').slice(0, 500),
    })),
  });

  const sendRequest = (bodyPayload) => fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(bodyPayload),
  });

  let response = await sendRequest(payload);
  let responseText = await response.text();

  if (!response.ok && /response_format|json_object/i.test(responseText)) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.response_format;
    console.warn(`[ResumeDebug] Azure rejected JSON mode for ${stageName}; retrying without response_format.`);
    response = await sendRequest(fallbackPayload);
    responseText = await response.text();
  }

  console.debug(`[ResumeDebug] Azure API response status (${stageName}):`, {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    throw new Error(`Azure OpenAI ${stageName} failed: ${response.status} ${responseText}`);
  }

  const responseJson = extractJson(responseText) || {};
  console.debug(`[ResumeDebug] Azure raw response (${stageName}):`, responseJson);

  return responseJson?.choices?.[0]?.message?.content || responseJson?.choices?.[0]?.text || '';
};

/**
 * Parse resume file and extract structured JSON using GPT
 * @param {File} file - Resume file (PDF, DOCX, DOC)
 * @returns {Promise} Parsed resume data in structured JSON format
 */
export const parseResume = async (file) => {
  if (!file) {
    throw new Error('No file provided for parsing');
  }

  console.groupCollapsed('[ResumeDebug] Resume Upload -> Azure OpenAI Parse');
  console.debug('[ResumeDebug] Uploaded file received:', {
    name: file?.name,
    type: file?.type,
    size: file?.size,
    lastModified: file?.lastModified,
  });
  const azureConfig = getAzureOpenAiConfig();
  console.debug('[ResumeDebug] API configuration:', {
    parseMode: 'frontend-direct-azure-openai',
    mode: import.meta.env.MODE,
    viteApiUrl: import.meta.env.VITE_API_URL || '',
    viteBackendUrl: import.meta.env.VITE_BACKEND_URL || '',
    azureEndpoint: azureConfig.endpoint,
    azureDeployment: azureConfig.deployment,
    azureApiVersion: azureConfig.apiVersion,
    azureApiKeyConfigured: Boolean(azureConfig.apiKey),
  });

  try {
    const resumeText = await extractResumeText(file);
    console.debug('[ResumeDebug] Extracted resume text length:', {
      length: resumeText.length,
      preview: resumeText.slice(0, 500),
    });

    if (!resumeText.trim()) {
      throw new Error('No extractable resume text found');
    }

    const resumeJsonText = await callAzureOpenAi(
      [
        { role: 'system', content: PROMPT_ARROWS_PARSE },
        { role: 'user', content: resumeText },
      ],
      'resume-json-generation'
    );
    console.debug('[ResumeDebug] GPT response (resume JSON text):', resumeJsonText);

    const resumeJson = extractJson(resumeJsonText);
    console.debug('[ResumeDebug] Parsed resume JSON:', resumeJson);
    if (!resumeJson) {
      throw new Error('GPT returned invalid resume JSON');
    }

    const candidateFormText = await callAzureOpenAi(
      [
        { role: 'system', content: PROMPT_ARROWS_MAPPING },
        { role: 'user', content: JSON.stringify(resumeJson, null, 2) },
      ],
      'candidate-form-mapping'
    );
    console.debug('[ResumeDebug] GPT response (candidate form text):', candidateFormText);

    const candidateForm = extractJson(candidateFormText);
    console.debug('[ResumeDebug] Parsed candidate form JSON:', candidateForm);
    if (!candidateForm) {
      throw new Error('GPT returned invalid candidate form JSON');
    }

    const parsedResponse = {
      resumeJson,
      candidateForm,
    };
    const mappedResponse = mapParsedSkills(parsedResponse);
    const normalizedResponse = normalizeParsedResumePayload(mappedResponse);
    console.debug('[ResumeDebug] Combined parsed JSON:', parsedResponse);
    console.debug('[ResumeDebug] Normalized candidate form JSON:', normalizedResponse);
    return normalizedResponse;
  } catch (err) {
    console.error('[ResumeDebug] Resume parsing failed:', {
      message: err?.message,
    });
    throw new Error(err?.message || 'Failed to parse resume');
  } finally {
    console.groupEnd();
  }
};

/**
 * Map parsed resume JSON to candidate form fields
 * @param {Object} parsedData - Parsed resume data from GPT
 * @returns {Object} Mapped candidate form data
 */
export const mapResumeToFormFields = (parsedData = {}) => {
  console.groupCollapsed('[ResumeDebug] Resume JSON -> Candidate Form Mapping');
  console.debug('[ResumeDebug] Parsed JSON input:', parsedData);
  const normalizedPayload = normalizeParsedResumePayload(parsedData);
  if (normalizedPayload !== parsedData) {
    console.debug('[ResumeDebug] Candidate form JSON:', normalizedPayload);
    console.groupEnd();
    return normalizedPayload;
  }

  const personal = parsedData.personal_information || {};
  const professional = parsedData.professional_information || {};
  const skills = parsedData.skills || [];
  const education = parsedData.education || [];
  const certifications = parsedData.certifications || [];
  const projects = parsedData.projects || [];
  const employment = parsedData.employment_history || [];

  const candidateFormJson = {
    // Personal Information
    firstName: personal.first_name || '',
    lastName: personal.last_name || '',
    fullName: personal.full_name || '',
    email: personal.email || '',
    phone: personal.phone || '',
    gender: personal.gender || '',
    dateOfBirth: personal.date_of_birth || '',
    location: personal.location || '',

    // Professional Information
    totalExperience: professional.total_experience_years || 0,
    currentCompany: professional.current_company || '',
    currentDesignation: professional.current_designation || '',
    employmentType: professional.employment_type || '',
    noticePeriod: professional.notice_period_days || 0,
    currentCtc: professional.current_ctc || '',
    expectedCtc: professional.expected_ctc || '',

    // Skills (formatted as comma-separated)
    skills: normalizeSkills(skills),

    // Education
    education: education
      .map((e) => `${e.degree}, ${e.specialization} from ${e.institution} (${e.graduation_year})`)
      .join('; '),

    // Certifications
    certifications: certifications
      .map((c) => `${c.name} - ${c.issuer}`)
      .join('; '),

    // Projects
    projects: projects
      .map((p) => `${p.project_name}: ${p.description} (${(p.technologies || []).join(', ')})`)
      .join('; '),

    // Employment History
    employmentHistory: employment
      .map((e) => `${e.company} - ${e.designation} (${e.start_date} to ${e.end_date})`)
      .join('; '),

    // Raw parsed data for reference
    _parsedResume: parsedData,
  };
  console.debug('[ResumeDebug] Candidate form JSON:', candidateFormJson);
  console.groupEnd();
  return candidateFormJson;
};

/**
 * Extract text from resume file (helper for preview)
 * @param {File} file - Resume file
 * @returns {Promise<string>} Extracted text
 */
export const extractResumeText = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const ext = file.name.split('.').pop().toLowerCase();
  console.groupCollapsed('[ResumeDebug] File Extraction');
  console.debug('[ResumeDebug] Extracting resume text:', {
    name: file?.name,
    type: file?.type,
    size: file?.size,
    extension: ext,
  });

  try {
    if (ext === 'pdf') {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjsWorkerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');

      if (pdfjsLib.GlobalWorkerOptions.workerSrc !== pdfjsWorkerSrc.default) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc.default;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;
      let text = '';

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        text += pageText + '\n';
      }

      console.debug('[ResumeDebug] Extracted resume text length:', {
        length: text.length,
        pages: pdfDocument.numPages,
        preview: text.slice(0, 500),
      });
      return text;
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth/mammoth.browser');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result?.value || '';
      console.debug('[ResumeDebug] Extracted resume text length:', {
        length: text.length,
        preview: text.slice(0, 500),
      });
      return text;
    }

    throw new Error(`Unsupported file type: ${ext}`);
  } finally {
    console.groupEnd();
  }
};
