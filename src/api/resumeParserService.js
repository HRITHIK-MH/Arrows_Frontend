import API from './axiosConfig';

/**
 * Parse resume file and extract structured JSON using GPT
 * @param {File} file - Resume file (PDF, DOCX, DOC)
 * @returns {Promise} Parsed resume data in structured JSON format
 */
export const parseResume = async (file) => {
  if (!file) {
    throw new Error('No file provided for parsing');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await API.post('/candidates/documents/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response?.data?.data || response?.data || {};
  } catch (err) {
    console.error('Resume parsing failed:', err);
    throw new Error(err?.response?.data?.message || 'Failed to parse resume');
  }
};

/**
 * Map parsed resume JSON to candidate form fields
 * @param {Object} parsedData - Parsed resume data from GPT
 * @returns {Object} Mapped candidate form data
 */
export const mapResumeToFormFields = (parsedData = {}) => {
  const personal = parsedData.personal_information || {};
  const professional = parsedData.professional_information || {};
  const skills = parsedData.skills || [];
  const education = parsedData.education || [];
  const certifications = parsedData.certifications || [];
  const projects = parsedData.projects || [];
  const employment = parsedData.employment_history || [];

  return {
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
    skills: skills
      .map((s) => `${s.skill_name} (${s.experience_years}yrs, ${s.proficiency_level || 'N/A'})`)
      .join('; '),

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

    return text;
  } else if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth/mammoth.browser');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result?.value || '';
  }

  throw new Error(`Unsupported file type: ${ext}`);
};
