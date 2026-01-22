import TeamMembersStep from "./TeamMembersStep";
import PermissionStep from "./PermissionStep";

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
          placeholder: "Attachment"
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

      // Cross-field validation for experience
      const currentFormData = { ...(formData || {}), [fieldName]: value };
      const minExp = parseFloat(currentFormData.minExperience || 0);
      const maxExp = parseFloat(currentFormData.maxExperience || 0);

      if (currentFormData.minExperience !== undefined &&
          currentFormData.maxExperience !== undefined &&
          minExp > maxExp) {
        return { isValid: false, message: 'Min experience cannot be greater than max experience' };
      }

      return { isValid: true };
    },
    salary: (value, fieldName, formData) => {
      if (!value && value !== 0) {
        return { isValid: false, message: 'This field is required' };
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { isValid: false, message: 'Please enter a valid salary amount' };
      }

      if (numValue < 0) {
        return { isValid: false, message: 'Salary cannot be negative' };
      }

      if (numValue > 10000000) {
        return { isValid: false, message: 'Salary seems too high' };
      }

      // Cross-field validation for salary
      const currentFormData = { ...(formData || {}), [fieldName]: value };
      const minSalary = parseFloat(currentFormData.minSalary || 0);
      const maxSalary = parseFloat(currentFormData.maxSalary || 0);

      if (currentFormData.minSalary !== undefined &&
          currentFormData.maxSalary !== undefined &&
          minSalary > maxSalary) {
        return { isValid: false, message: 'Min salary cannot be greater than max salary' };
      }

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
  steps: [
    {
      title: "Candidate Basic Information",
      fields: [
        {
          name: "candidateId",
          label: "Candidate ID *",
          type: "text",
          required: true,
          cssClass: "grid-col-1 grid-row-1",
          validationRule: "requiredField"
        },
        {
          name: "candidateName",
          label: "Full Name *",
          type: "text",
          required: true,
          cssClass: "grid-col-2 grid-row-1",
          validationRule: "requiredField"
        },
        {
          name: "candidateEmail",
          label: "Email *",
          type: "email",
          required: true,
          cssClass: "grid-col-1 grid-row-2"
        },
        {
          name: "candidatePhone",
          label: "Phone",
          type: "tel",
          required: true,
          cssClass: "grid-col-2 grid-row-2"
        },
        {
          name: "candidateLocation",
          label: "Location",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-2",
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
          name: "candidateExperience",
          label: "Years of Experience *",
          type: "number",
          required: true,
          cssClass: "grid-col-1 grid-row-3",
          validationRule: "requiredField"
        },
        {
          name: "candidatePosition",
          label: "Applied Position",
          type: "text",
          required: true,
          cssClass: "grid-col-2 grid-row-3"
        },
        {
          name: "candidateStatus",
          label: "Status",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-3",
          options: [
            { value: "new", label: "New" },
            { value: "shortlisted", label: "Shortlisted" },
            { value: "interview", label: "Interview" },
            { value: "rejected", label: "Rejected" },
            { value: "hired", label: "Hired" }
          ]
        },
        {
          name: "candidateSkills",
          label: "Technical Skills",
          type: "multiselect",
          required: true,
          cssClass: "grid-col-1 grid-row-4",
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
          name: "candidateSoftSkills",
          label: "Soft Skills",
          type: "multiselect",
          required: true,
          cssClass: "grid-col-2 grid-row-4",
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
          name: "candidateAdditionalInfo",
          label: "Additional Information",
          type: "textarea",
          required: false,
          cssClass: "grid-col-3 grid-row-4"
        }
      ]
    },
    {
      title: "Candidate Details",
      fields: [
        {
          name: "candidateEducation",
          label: "Education",
          type: "text",
          required: true
        },
        {
          name: "candidateResume",
          label: "Resume Link",
          type: "text",
          required: false
        },
        {
          name: "candidateNotes",
          label: "Interview Notes",
          type: "textarea",
          required: false
        }
      ]
    }
  ],
  validationRules: {
    requiredField: async (value, fieldName) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldLabels = {
          candidateId: 'Candidate ID',
          candidateName: 'Full Name',
          candidateExperience: 'Years of Experience'
        };
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        return { isValid: false, message: `${fieldLabel} is required` };
      }
      return { isValid: true };
    }
  },
  columns: [
    { key: 'candidateName', label: 'Candidate Name' },
    { key: 'candidateEmail', label: 'Email' },
    { key: 'candidatePhone', label: 'Phone' },
    { key: 'candidatePosition', label: 'Applied Position' },
    { key: 'candidateExperience', label: 'Experience' },
    { key: 'candidateStatus', label: 'Status' },
    { key: 'candidateLocation', label: 'Location' },
    { key: 'candidateSkills', label: 'Skills' }
  ]
};

// Client Configuration
export const clientConfig = {
  title: "Add Client",
  itemName: "Clients",
  steps: [
    {
      title: "Client Basic Information",
      fields: [
        {
          name: "clientId",
          label: "Client ID *",
          type: "text",
          required: true,
          cssClass: "grid-col-1 grid-row-1",
          validationRule: "requiredField"
        },
        {
          name: "clientName",
          label: "Client Name *",
          type: "text",
          required: true,
          cssClass: "grid-col-2 grid-row-1",
          validationRule: "requiredField"
        },
        {
          name: "clientEmail",
          label: "Email *",
          type: "email",
          required: true,
          cssClass: "grid-col-1 grid-row-2"
        },
        {
          name: "clientPhone",
          label: "Phone",
          type: "tel",
          required: true,
          cssClass: "grid-col-2 grid-row-2"
        },
        {
          name: "clientLocation",
          label: "Location",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-2",
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
          name: "clientCompany",
          label: "Company Name *",
          type: "text",
          required: true,
          cssClass: "grid-col-1 grid-row-3",
          validationRule: "requiredField"
        },
        {
          name: "clientIndustry",
          label: "Industry",
          type: "text",
          required: true,
          cssClass: "grid-col-2 grid-row-3"
        },
        {
          name: "clientStatus",
          label: "Status",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-3",
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "prospect", label: "Prospect" },
            { value: "archived", label: "Archived" }
          ]
        },
        {
          name: "clientBudget",
          label: "Budget (Min) *",
          type: "number",
          required: true,
          cssClass: "grid-col-1 grid-row-4"
        },
        {
          name: "clientBudgetMax",
          label: "Budget (Max)",
          type: "number",
          required: true,
          cssClass: "grid-col-2 grid-row-4"
        },
        {
          name: "clientBillingType",
          label: "Billing Type",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-4",
          options: [
            { value: "hourly", label: "Hourly" },
            { value: "fixed", label: "Fixed Price" },
            { value: "retainer", label: "Retainer" },
            { value: "project", label: "Project Based" }
          ]
        }
      ]
    },
    {
      title: "Client Details",
      fields: [
        {
          name: "clientWebsite",
          label: "Website",
          type: "text",
          required: false
        },
        {
          name: "clientDescription",
          label: "Client Description",
          type: "textarea",
          required: false
        },
        {
          name: "clientNotes",
          label: "Notes",
          type: "textarea",
          required: false
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
          clientCompany: 'Company Name'
        };
        const fieldLabel = fieldLabels[fieldName] || fieldName;
        return { isValid: false, message: `${fieldLabel} is required` };
      }
      return { isValid: true };
    }
  },
  columns: [
    { key: 'clientName', label: 'Client Name' },
    { key: 'clientCompany', label: 'Company' },
    { key: 'clientEmail', label: 'Email' },
    { key: 'clientPhone', label: 'Phone' },
    { key: 'clientIndustry', label: 'Industry' },
    { key: 'clientLocation', label: 'Location' },
    { key: 'clientBudget', label: 'Budget' },
    { key: 'clientStatus', label: 'Status' }
  ]
};
