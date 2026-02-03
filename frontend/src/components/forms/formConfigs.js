import TeamMembersStep from "./TeamMembersStep";
import PermissionStep from "./PermissionStep";
import CandidateBasicInfoStep from "./CandidateBasicInfoStep";
import CandidateDocumentsStep from "./CandidateDocumentsStep";
import ClientBasicInfoStep from "./ClientBasicInfoStep";

// Example configurations for different forms
// Job Application Form Configuration
export const jobApplicationConfig = {
  title: "Job Application Form",
  itemName: "Applications",
  steps: [
    {
      title: "Personal Information",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true
        },
        {
          name: "lastName",
          label: "Last Name",
          type: "text",
          required: true
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true
        }
      ]
    },
    {
      title: "Experience & Skills",
      fields: [
        {
          name: "minExperience",
          label: "Min Experience (years)",
          type: "number",
          required: true,
          validationRule: "experience"
        },
        {
          name: "maxExperience",
          label: "Max Experience (years)",
          type: "number",
          required: true,
          validationRule: "experience"
        },
        {
          name: "skills",
          label: "Skills",
          type: "text",
          required: true
        }
      ]
    },
    {
      title: "Contact Information",
      fields: [
        {
          name: "phone",
          label: "Phone Number",
          type: "tel",
          required: true,
          validationRule: "phone"
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          required: true
        }
      ]
    }
  ],
  validationRules: {
    experience: (value) => {
      if (!value && value !== 0) {
        return { isValid: false, message: 'This field is required' };
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { isValid: false, message: 'Please enter a valid number' };
      }

      if (numValue < 0) {
        return { isValid: false, message: 'Experience cannot be negative' };
      }

      if (numValue > 50) {
        return { isValid: false, message: 'Experience cannot exceed 50 years' };
      }

      return { isValid: true };
    },
    phone: (value) => {
      if (!value) {
        return { isValid: false, message: 'Phone number is required' };
      }

      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[ -()]/g, ''))) {
        return { isValid: false, message: 'Please enter a valid phone number' };
      }

      return { isValid: true };
    }
  },
  columns: [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'minExperience', label: 'Min Exp' },
    { key: 'maxExperience', label: 'Max Exp' },
    { key: 'skills', label: 'Skills' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' }
  ]
};

// Contact Form Configuration
export const contactFormConfig = {
  title: "Contact Us",
  itemName: "Messages",
  steps: [
    {
      title: "Your Information",
      fields: [
        {
          name: "name",
          label: "Full Name",
          type: "text",
          required: true
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true
        }
      ]
    },
    {
      title: "Message",
      fields: [
        {
          name: "subject",
          label: "Subject",
          type: "text",
          required: true
        },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: true
        }
      ]
    }
  ],
  validationRules: {
    message: (value) => {
      if (!value) {
        return { isValid: false, message: 'Message is required' };
      }

      if (value.length < 10) {
        return { isValid: false, message: 'Message must be at least 10 characters' };
      }

      return { isValid: true };
    }
  },
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'message', label: 'Message' }
  ]
};

// Job Opening Creation Form Configuration
export const jobOpeningConfig = {
  title: "Create Job Opening",
  itemName: "Job Openings",
  formClassName: "job-opening-form",
  hideTitle: true,
  showDraftAction: true,
  draftLabel: "Save as Draft",
  submitLabel: "Create JD",
  steps: [
    {
      title: "Job Information",
      fields: [
        {
          name: "jobPositionId",
          label: "Job Position Id *",
          type: "text",
          required: true,
          cssClass: "grid-col-1 grid-row-1",
          validationRule: "requiredField",
          placeholder: "Enter Job Position Id"
        },
        {
          name: "positionName",
          label: "Position Name *",
          type: "text",
          required: true,
          cssClass: "grid-col-2 grid-row-1",
          validationRule: "requiredField",
          placeholder: "Enter Position Name"
        },
        {
          name: "minExperience",
          label: "Experience Min",
          type: "number",
          required: true,
          cssClass: "grid-col-3 grid-row-1",
          validationRule: "experience",
          hideLabel: true,
          prefix: "Min"
        },
        {
          name: "maxExperience",
          label: "Experience Max",
          type: "number",
          required: true,
          cssClass: "grid-col-3 grid-row-1",
          validationRule: "experience",
          hideLabel: true,
          prefix: "Max"
        },
        {
          name: "jobDescriptionLink",
          label: "Job Description Link",
          type: "text",
          required: false,
          cssClass: "grid-col-1 grid-row-2",
          placeholder: "JD link"
        },
        {
          name: "positionLevel",
          label: "Position Level *",
          type: "select",
          required: true,
          cssClass: "grid-col-2 grid-row-2",
          placeholder: "Select",
          options: [
            { value: "entry", label: "Entry Level" },
            { value: "junior", label: "Junior" },
            { value: "mid", label: "Mid Level" },
            { value: "senior", label: "Senior" },
            { value: "lead", label: "Lead" },
            { value: "manager", label: "Manager" },
            { value: "director", label: "Director" },
            { value: "executive", label: "Executive" }
          ]
        },
        {
          name: "location",
          label: "Location *",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-2",
          placeholder: "Select",
          options: [
            { value: "remote", label: "Remote" },
            { value: "onsite", label: "On-site" },
            { value: "hybrid", label: "Hybrid" },
            { value: "new-york", label: "New York, NY" },
            { value: "san-francisco", label: "San Francisco, CA" },
            { value: "austin", label: "Austin, TX" },
            { value: "seattle", label: "Seattle, WA" },
            { value: "boston", label: "Boston, MA" },
            { value: "chicago", label: "Chicago, IL" },
            { value: "los-angeles", label: "Los Angeles, CA" },
            { value: "miami", label: "Miami, FL" },
            { value: "denver", label: "Denver, CO" }
          ]
        },
        {
          name: "noOfPositions",
          label: "No of Positions *",
          type: "number",
          required: true,
          cssClass: "grid-col-1 grid-row-3",
          placeholder: "No of positions"
        },
        {
          name: "jobReceivedDate",
          label: "Job Received Date *",
          type: "date",
          required: true,
          cssClass: "grid-col-2 grid-row-3"
        },
        {
          name: "hiringType",
          label: "Hiring Type *",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-3",
          placeholder: "Select",
          options: [
            { value: "direct", label: "Direct Hire" },
            { value: "contract", label: "Contract" },
            { value: "temp", label: "Temporary" },
            { value: "contract-to-hire", label: "Contract to Hire" },
            { value: "internship", label: "Internship" },
            { value: "freelance", label: "Freelance" }
          ]
        },
        {
          name: "minSalary",
          label: "Salary Min",
          type: "number",
          required: true,
          cssClass: "grid-col-1 grid-row-4",
          validationRule: "salary",
          hideLabel: true,
          prefix: "Min"
        },
        {
          name: "maxSalary",
          label: "Salary Max",
          type: "number",
          required: true,
          cssClass: "grid-col-1 grid-row-4",
          validationRule: "salary",
          hideLabel: true,
          prefix: "Max"
        },
        {
          name: "jobType",
          label: "Job Type *",
          type: "select",
          required: true,
          cssClass: "grid-col-2 grid-row-4",
          placeholder: "Select",
          options: [
            { value: "full-time", label: "Full Time Employment" },
            { value: "part-time", label: "Part Time" },
            { value: "contract", label: "Contract" },
            { value: "internship", label: "Internship" }
          ]
        },
        {
          name: "jdAttachment",
          label: "JD Attachment *",
          type: "file",
          required: true,
          cssClass: "grid-col-3 grid-row-4",
          accept: ".pdf",
          placeholder: "Attachment",
          showBrowseButton: true
        },
        {
          name: "technicalSkills",
          label: "Technical Skill *",
          type: "multiselect",
          required: true,
          cssClass: "grid-col-1 grid-row-5",
          options: [
            { value: "javascript", label: "JavaScript" },
            { value: "react", label: "React" },
            { value: "node", label: "Node.js" },
            { value: "python", label: "Python" },
            { value: "java", label: "Java" },
            { value: "csharp", label: "C#" },
            { value: "php", label: "PHP" },
            { value: "ruby", label: "Ruby" },
            { value: "sql", label: "SQL" },
            { value: "mongodb", label: "MongoDB" },
            { value: "aws", label: "AWS" },
            { value: "docker", label: "Docker" },
            { value: "kubernetes", label: "Kubernetes" },
            { value: "git", label: "Git" },
            { value: "html", label: "HTML" },
            { value: "css", label: "CSS" },
            { value: "typescript", label: "TypeScript" },
            { value: "vue", label: "Vue.js" },
            { value: "angular", label: "Angular" },
            { value: "dotnet", label: ".NET" }
          ]
        },
        {
          name: "softSkills",
          label: "Soft Skill *",
          type: "multiselect",
          required: true,
          cssClass: "grid-col-2 grid-row-5",
          options: [
            { value: "communication", label: "Communication" },
            { value: "leadership", label: "Leadership" },
            { value: "teamwork", label: "Teamwork" },
            { value: "problem-solving", label: "Problem Solving" },
            { value: "time-management", label: "Time Management" },
            { value: "adaptability", label: "Adaptability" },
            { value: "creativity", label: "Creativity" },
            { value: "critical-thinking", label: "Critical Thinking" },
            { value: "emotional-intelligence", label: "Emotional Intelligence" },
            { value: "conflict-resolution", label: "Conflict Resolution" },
            { value: "negotiation", label: "Negotiation" },
            { value: "decision-making", label: "Decision Making" },
            { value: "mentoring", label: "Mentoring" },
            { value: "presentation", label: "Presentation Skills" },
            { value: "networking", label: "Networking" },
            { value: "cultural-awareness", label: "Cultural Awareness" }
          ]
        },
        {
          name: "additionalSkills",
          label: "Additional Skill",
          type: "text",
          required: false,
          cssClass: "grid-col-3 grid-row-5",
          placeholder: "Select Skill"
        },
        {
          name: "clientId",
          label: "Client Id *",
          type: "select",
          required: true,
          cssClass: "grid-col-1 grid-row-1",
          placeholder: "Select Client Id",
          options: [
            { value: "C1292938", label: "C1292938" },
            { value: "C1292432", label: "C1292432" },
            { value: "C1292921", label: "C1292921" }
          ]
        },
        {
          name: "clientName",
          label: "Client Name",
          type: "text",
          required: false,
          cssClass: "grid-col-2 grid-row-1",
          placeholder: "Enter Client Name"
        },
        {
          name: "contactPersonName",
          label: "Contact Person Name",
          type: "text",
          required: false,
          cssClass: "grid-col-3 grid-row-1",
          placeholder: "Enter Contact Person Name"
        },
        {
          name: "contactPersonEmail",
          label: "Contact Person Email Id",
          type: "email",
          required: false,
          cssClass: "grid-col-1 grid-row-2",
          placeholder: "Enter Contact Person Email"
        }
      ]
    },
    {
      title: "Team Members",
      component: TeamMembersStep,
      skipValidation: true,
      fields: [
        {
          name: "teamMembers",
          label: "Team Members",
          type: "custom",
          required: false
        }
      ]
    },
    {
      title: "Submission",
      component: PermissionStep,
      fields: [
        {
          name: "permissionVisibility",
          label: "Visibility",
          type: "custom",
          required: false
        },
        {
          name: "permissionAccess",
          label: "Access",
          type: "custom",
          required: false
        }
      ]
    }
  ],
  validationRules: {
    experience: (value, fieldName, formData) => {
      console.log(`[Validation.experience] Called - fieldName: ${fieldName}, value: ${value}, formData:`, formData);
      
      if (!value && value !== 0) {
        console.log(`[Validation.experience] Field is required`);
        return { isValid: false, message: 'This field is required' };
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        console.log(`[Validation.experience] Invalid number`);
        return { isValid: false, message: 'Please enter a valid number' };
      }

      if (numValue < 0) {
        console.log(`[Validation.experience] Negative value`);
        return { isValid: false, message: 'Experience cannot be negative' };
      }

      if (numValue > 50) {
        console.log(`[Validation.experience] Too high`);
        return { isValid: false, message: 'Experience cannot exceed 50 years' };
      }

      // Cross-field validation for experience
      const currentFormData = { ...(formData || {}), [fieldName]: value };
      const minExp = parseFloat(currentFormData.minExperience || 0);
      const maxExp = parseFloat(currentFormData.maxExperience || 0);

      // Check if both min and max are defined (have actual values, not empty strings)
      const minDefined = currentFormData.minExperience !== undefined && currentFormData.minExperience !== '' && currentFormData.minExperience !== null;
      const maxDefined = currentFormData.maxExperience !== undefined && currentFormData.maxExperience !== '' && currentFormData.maxExperience !== null;

      console.log(`[Validation.experience] Cross-field check - minExp: ${minExp}, maxExp: ${maxExp}, minDefined: ${minDefined}, maxDefined: ${maxDefined}`);

      if (minDefined && maxDefined && minExp > maxExp) {
        console.log(`[Validation.experience] ❌ Min > Max - throwing error`);
        return { isValid: false, message: 'Min experience cannot be greater than max experience' };
      }

      console.log(`[Validation.experience] ✅ Valid`);
      return { isValid: true };
    },
    salary: (value, fieldName, formData) => {
      console.log(`[Validation.salary] Called - fieldName: ${fieldName}, value: ${value}, formData:`, formData);
      
      if (!value && value !== 0) {
        console.log(`[Validation.salary] Field is required`);
        return { isValid: false, message: 'This field is required' };
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        console.log(`[Validation.salary] Invalid number`);
        return { isValid: false, message: 'Please enter a valid salary amount' };
      }

      if (numValue < 0) {
        console.log(`[Validation.salary] Negative value`);
        return { isValid: false, message: 'Salary cannot be negative' };
      }

      if (numValue > 10000000) {
        console.log(`[Validation.salary] Too high`);
        return { isValid: false, message: 'Salary seems too high' };
      }

      // Cross-field validation for salary
      const currentFormData = { ...(formData || {}), [fieldName]: value };
      const minSalary = parseFloat(currentFormData.minSalary || 0);
      const maxSalary = parseFloat(currentFormData.maxSalary || 0);

      // Check if both min and max are defined (have actual values, not empty strings)
      const minDefined = currentFormData.minSalary !== undefined && currentFormData.minSalary !== '' && currentFormData.minSalary !== null;
      const maxDefined = currentFormData.maxSalary !== undefined && currentFormData.maxSalary !== '' && currentFormData.maxSalary !== null;

      console.log(`[Validation.salary] Cross-field check - minSalary: ${minSalary}, maxSalary: ${maxSalary}, minDefined: ${minDefined}, maxDefined: ${maxDefined}`);

      if (minDefined && maxDefined && minSalary > maxSalary) {
        console.log(`[Validation.salary] ❌ Min > Max - throwing error`);
        return { isValid: false, message: 'Min salary cannot be greater than max salary' };
      }

      console.log(`[Validation.salary] ✅ Valid`);
      return { isValid: true };
    },
    skills: (value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return { isValid: false, message: 'Please select at least one required skill' };
      }

      if (Array.isArray(value) && value.length > 10) {
        return { isValid: false, message: 'Please select no more than 10 skills' };
      }

      return { isValid: true };
    },
    benefits: () => {
      // Benefits is optional, so no validation required
      return { isValid: true };
    },
    requiredField: async (value, fieldName) => {
      // Check if value is empty
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldLabels = {
          jobPositionId: 'Job Position Id',
          positionName: 'Position Name'
        };
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        return { isValid: false, message: `${fieldLabel} is required` };
      }

      // Additional validation for specific fields
      if (fieldName === 'jobPositionId') {
        // Validate Job Position ID format
        if (!/^[A-Z0-9\-_]{1,20}$/.test(value)) {
          return { 
            isValid: false, 
            message: 'Job Position ID must be 1-20 characters (alphanumeric, hyphens, underscores only)' 
          };
        }

        try {
          // Try to validate against backend if available
          const response = await fetch('/api/validate-job-position-id', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobPositionId: value })
          });

          if (response.ok) {
            const result = await response.json();
            return result;
          } else {
            // Backend validation failed
            const error = await response.json();
            return { isValid: false, message: error.message || 'This Job Position ID is not valid' };
          }
        } catch (error) {
          console.warn(`Backend validation unavailable for ${fieldName}, using client-side validation only`, error);
          // Return success for client-side validation only
          return { isValid: true };
        }
      }

      return { isValid: true };
    },
    description: async (value) => {
      if (!value) {
        return { isValid: false, message: 'This field is required' };
      }

      try {
        // Make AJAX call to validate description
        const response = await fetch('/api/validate-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: value })
        });

        const result = await response.json();

        if (!response.ok) {
          return { isValid: false, message: result.message || 'Description validation failed' };
        }

        return result;
      } catch (error) {
        console.error('Error validating description:', error);

        // Fallback to basic client-side validation if server is unavailable
        if (value.length < 50) {
          return { isValid: false, message: 'Description must be at least 50 characters' };
        }

        if (value.length > 5000) {
          return { isValid: false, message: 'Description cannot exceed 5000 characters' };
        }

        return { isValid: true };
      }
    }
  },
  columns: [
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'department', label: 'Department' },
    { key: 'employmentType', label: 'Type' },
    { key: 'location', label: 'Location' },
    { key: 'minExperience', label: 'Min Exp' },
    { key: 'maxExperience', label: 'Max Exp' },
    { key: 'minSalary', label: 'Min Salary' },
    { key: 'maxSalary', label: 'Max Salary' },
    { key: 'requiredSkills', label: 'Required Skills' }
  ]
};

// Candidate Configuration
export const candidateConfig = {
  title: "Add Candidate",
  itemName: "Candidates",
  formClassName: "candidate-form",
  hideTitle: true,
  showDraftAction: true,
  draftLabel: "Save as Draft",
  submitLabel: "Submit",
  steps: [
    {
      title: "Candidate Information",
      component: CandidateBasicInfoStep,
      fields: [
        {
          name: "candidateId",
          label: "Candidate Id *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Candidate Id"
        },
        {
          name: "namePrefix",
          label: "Title",
          type: "select",
          required: true,
          validationRule: "namePrefixRequired",
          hideLabel: true,
          placeholder: "None",
          options: [
            { value: "none", label: "None" },
            { value: "mr", label: "Mr." },
            { value: "mrs", label: "Mrs." },
            { value: "ms", label: "Ms." }
          ]
        },
        {
          name: "firstName",
          label: "First Name *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          hideLabel: true,
          placeholder: "Enter First Name"
        },
        {
          name: "lastName",
          label: "Last Name *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Last Name"
        },
        {
          name: "primaryEmail",
          label: "Primary Email Address *",
          type: "email",
          required: true,
          placeholder: "Enter Email Address"
        },
        {
          name: "secondaryEmail",
          label: "Secondary Email Address",
          type: "email",
          required: false,
          placeholder: "Enter Email Address"
        },
        {
          name: "phoneNumber",
          label: "Phone Number *",
          type: "tel",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Phone Number",
          prefix: "+91"
        },
        {
          name: "gender",
          label: "Gender",
          type: "select",
          required: false,
          placeholder: "Select",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
          ]
        },
        {
          name: "yearsExperience",
          label: "Years of Experience *",
          type: "select",
          required: true,
          validationRule: "requiredField",
          placeholder: "Select",
          options: [
            { value: "0-1", label: "0-1 years" },
            { value: "1-3", label: "1-3 years" },
            { value: "3-5", label: "3-5 years" },
            { value: "5-8", label: "5-8 years" },
            { value: "8-12", label: "8-12 years" },
            { value: "12+", label: "12+ years" }
          ]
        },
        {
          name: "offersInHand",
          label: "Offers In Hand *",
          type: "select",
          required: true,
          validationRule: "requiredField",
          placeholder: "Select",
          options: [
            { value: "0", label: "0" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3+", label: "3+" }
          ]
        },
        {
          name: "comments",
          label: "Comments / Remarks",
          type: "textarea",
          required: false,
          placeholder: "Comments / Remarks"
        },
        {
          name: "currentCompanyName",
          label: "Current Company Name *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Company Name"
        },
        {
          name: "jobTitleRole",
          label: "Job Title / Role *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Job Title"
        },
        {
          name: "employmentType",
          label: "Employment Type",
          type: "select",
          required: false,
          placeholder: "Select Employment Type",
          options: [
            { value: "full-time", label: "Full Time" },
            { value: "part-time", label: "Part Time" },
            { value: "contract", label: "Contract" },
            { value: "internship", label: "Internship" }
          ]
        },
        {
          name: "noticePeriod",
          label: "Notice Period *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Total Duration"
        },
        {
          name: "currentCtc",
          label: "Current CTC *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Current CTC"
        },
        {
          name: "expectedCtc",
          label: "Expected CTC *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Expected CTC"
        },
        {
          name: "sourceId",
          label: "Source Id",
          type: "text",
          required: false,
          placeholder: "Source Id"
        },
        {
          name: "recruiterId",
          label: "Recruiter Id",
          type: "text",
          required: false,
          placeholder: "Recruiter Id"
        },
        {
          name: "sourceName",
          label: "Source Name",
          type: "text",
          required: false,
          placeholder: "Source Name"
        },
        {
          name: "sourcedDate",
          label: "Sourced Date",
          type: "date",
          required: false
        }
      ]
    },
    {
      title: "Candidate Documents",
      component: CandidateDocumentsStep,
      fields: [
        {
          name: "candidateResume",
          label: "Resume *",
          type: "file",
          required: true,
          validationRule: "requiredField",
          accept: ".pdf,.doc,.docx",
          placeholder: "Upload Resume"
        },
        {
          name: "candidateCoverLetter",
          label: "Cover Letter",
          type: "file",
          required: false,
          accept: ".pdf,.doc,.docx",
          placeholder: "Upload Cover Letter"
        },
        {
          name: "candidatePortfolio",
          label: "Portfolio Link",
          type: "text",
          required: false,
          placeholder: "Enter Portfolio URL"
        },
        {
          name: "candidateAdditionalDocs",
          label: "Additional Documents",
          type: "file",
          required: false,
          accept: ".pdf,.doc,.docx",
          multiple: true,
          placeholder: "Upload Supporting Docs"
        }
      ]
    }
  ],
  validationRules: {
    requiredField: async (value, fieldName) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldLabels = {
          candidateId: 'Candidate Id',
          firstName: 'First Name',
          lastName: 'Last Name',
          primaryEmail: 'Primary Email Address',
          phoneNumber: 'Phone Number',
          yearsExperience: 'Years of Experience',
          offersInHand: 'Offers In Hand',
          currentCompanyName: 'Current Company Name',
          jobTitleRole: 'Job Title / Role',
          noticePeriod: 'Notice Period',
          currentCtc: 'Current CTC',
          expectedCtc: 'Expected CTC',
          candidateResume: 'Resume'
        };
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        return { isValid: false, message: `${fieldLabel} is required` };
      }
      return { isValid: true };
    }
  },
  columns: [
    { key: 'candidateId', label: 'Candidate Id' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'primaryEmail', label: 'Primary Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'yearsExperience', label: 'Experience' },
    { key: 'currentCompanyName', label: 'Current Company' },
    { key: 'jobTitleRole', label: 'Job Title' }
  ]
};

// Client Configuration
export const clientConfig = {
  title: "Add Client",
  itemName: "Clients",
  formClassName: "client-form",
  hideTitle: true,
  showDraftAction: true,
  draftLabel: "Save as Draft",
  submitLabel: "Submit",
  hideStepper: true,
  steps: [
    {
      title: "Client Information",
      component: ClientBasicInfoStep,
      fields: [
        {
          name: "clientId",
          label: "Client ID *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "CS342415"
        },
        {
          name: "clientName",
          label: "Client Name *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Last Name"
        },
        {
          name: "contactEmail",
          label: "Contact Email Address *",
          type: "email",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Email Address"
        },
        {
          name: "contactNumber",
          label: "Contact Number *",
          type: "tel",
          required: true,
          validationRule: "requiredField",
          placeholder: "Enter Phone Number",
          prefix: "+91"
        },
        {
          name: "primaryContactPerson",
          label: "Primary Contact Person *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Person Name"
        },
        {
          name: "secondaryContactPerson",
          label: "Secondary Contact Person *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Person Name"
        },
        {
          name: "accountManager",
          label: "Account Manager *",
          type: "text",
          required: true,
          validationRule: "requiredField",
          placeholder: "Account Manager"
        },
        {
          name: "activeFrom",
          label: "Active From *",
          type: "date",
          required: true,
          validationRule: "requiredField"
        },
        {
          name: "comments",
          label: "Comments / Remarks",
          type: "textarea",
          required: false,
          placeholder: "Comments / Remarks"
        }
      ]
    }
  ],
  validationRules: {
    requiredField: async (value, fieldName) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldLabels = {
          clientId: 'Client ID',
          clientName: 'Client Name',
          contactEmail: 'Contact Email Address',
          contactNumber: 'Contact Number',
          primaryContactPerson: 'Primary Contact Person',
          secondaryContactPerson: 'Secondary Contact Person',
          accountManager: 'Account Manager',
          activeFrom: 'Active From'
        };
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        return { isValid: false, message: `${fieldLabel} is required` };
      }
      return { isValid: true };
    },
    namePrefixRequired: async (value) => {
      if (!value || value === 'none') {
        return { isValid: false, message: 'Title is required' };
      }
      return { isValid: true };
    }
  },
  columns: [
    { key: 'clientId', label: 'Client ID' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'contactEmail', label: 'Email' },
    { key: 'contactNumber', label: 'Phone' },
    { key: 'primaryContactPerson', label: 'Primary Contact Person' },
    { key: 'accountManager', label: 'Account Manager' },
    { key: 'activeFrom', label: 'Active From' }
  ]
};
