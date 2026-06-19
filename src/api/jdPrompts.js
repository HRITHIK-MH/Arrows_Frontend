export const JD_PARSE_PROMPT = `
You are an enterprise Job Description parser.

Extract information from the Job Description.

Return ONLY valid JSON.

Schema:

{
  "job_name": "",
  "minimum_experience": null,
  "maximum_experience": null,
  "position_level": "",
  "work_type": "",
  "employment_type": "",
  "location": [],
  "technical_skills": [],
  "soft_skills": []
}

Do not return explanations.
Use null when information is unavailable.
Do not guess or infer details that are not present in the source JD.

When explicitly present, normalize these fields to the following allowed labels:
- position_level: Entry Level, Junior, Mid Level, Senior, Lead, Manager, Director, Executive
- work_type: Remote, Hybrid, On-site
- employment_type: Full Time Employment, Part Time, Contract, Internship
`;

export const buildJdMappingPrompt = (jdJson) => `
You are an ATS Job Form Mapping Engine.

Map the JD JSON into the ARROWS Job Form schema.

Return ONLY valid JSON.
Map only values present in the JD JSON.
Use empty strings, 0, or empty arrays when information is unavailable.
Do not invent missing form values.
Use only these exact dropdown labels:
- position_level: Entry Level, Junior, Mid Level, Senior, Lead, Manager, Director, Executive
- work_type: Remote, Hybrid, On-site
- employment_type: Full Time Employment, Part Time, Contract, Internship

JD JSON:

${JSON.stringify(jdJson, null, 2)}

Job Form Schema:

{
  "job_information": {
    "job_name": "",
    "position_level": "",
    "work_type": "",
    "employment_type": "",
    "number_of_positions": 0,
    "location": []
  },
  "experience_requirements": {
    "minimum_experience": 0,
    "maximum_experience": 0
  },
  "skills": {
    "technical_skills": [],
    "additional_skills": [],
    "soft_skills": []
  }
}
`;

export const buildJdGenerationPrompt = (jobFormJson, sourceJdText = "") => `
You are a Senior Technical Recruiter.

Generate a professional enterprise-grade Job Description.

Requirements:

- Professional recruiter tone
- ATS friendly
- Well structured, polished, and detailed
- Write a strong two-paragraph role description when enough source information is available
- Convert source requirements into clear, action-oriented responsibilities and qualifications
- Improve grammar, readability, and professional tone without changing meaning
- Remove duplicate requirements
- Use ONLY information present in the Job Form JSON or Source JD
- Do not invent tools, degrees, certifications, methodologies, benefits, locations, responsibilities, or qualifications
- Do not claim that a degree is unnecessary unless the source explicitly says so
- If education requirements are not present, return an empty array
- If preferred qualifications are not present, return an empty array
- Include:
  1. Description
  2. Responsibilities
  3. Qualifications
  4. Education Requirements
  5. Experience Requirements

Return ONLY valid JSON.
Do not return explanations.

Format:

{
  "job_title": "",
  "description": [],
  "responsibilities": [],
  "qualifications": [],
  "education_requirements": [],
  "experience_requirements": []
}

Job Form JSON:

${JSON.stringify(jobFormJson, null, 2)}

Source JD:

${sourceJdText || "Not provided. Use only the Job Form JSON."}
`;
