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
  steps: [
    {
      title: "Job Basic Information",
      fields: [
        {
          name: "jobPositionId",
          label: "Job Position ID *",
          type: "text",
          required: true,
          cssClass: "grid-col-1 grid-row-1",
          validationRule: "requiredField"
        },
        {
          name: "positionName",
          label: "Position Name *",
          type: "text",
          required: true,
          cssClass: "grid-col-2 grid-row-1",
          validationRule: "requiredField"
        },
        {
          name: "minValue",
          label: "Min *",
          type: "number",
          required: true,
          cssClass: "min-max-field",
          validationRule: "requiredField"
        },
        {
          name: "maxValue",
          label: "Max *",
          type: "number",
          required: true,
          cssClass: "min-max-field",
          validationRule: "requiredField"
        },
        {
          name: "jobDescriptionLink",
          label: "Job Description Link",
          type: "text",
          required: true,
          cssClass: "grid-col-1 grid-row-2"
        },
        {
          name: "positionLevel",
          label: "Position Level",
          type: "select",
          required: true,
          cssClass: "grid-col-2 grid-row-2",
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
          name: "noOfPositions",
          label: "No of Positions",
          type: "number",
          required: true,
          cssClass: "grid-col-1 grid-row-3"
        },
        {
          name: "jobReceivedDate",
          label: "Job Received Date",
          type: "date",
          required: true,
          cssClass: "grid-col-2 grid-row-3"
        },
        {
          name: "hiringType",
          label: "Hiring Type",
          type: "select",
          required: true,
          cssClass: "grid-col-3 grid-row-3",
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
          name: "technicalSkills",
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
          name: "softSkills",
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
          name: "additionalSkills",
          label: "Additional Skills",
          type: "textarea",
          required: false,
          cssClass: "grid-col-3 grid-row-4"
        }
      ]
    },
    {
      title: "Requirements & Compensation",
      fields: [
        {
          name: "minExperience",
          label: "Minimum Experience (years)",
          type: "number",
          required: true,
          validationRule: "experience"
        },
        {
          name: "maxExperience",
          label: "Maximum Experience (years)",
          type: "number",
          required: true,
          validationRule: "experience"
        },
        {
          name: "minSalary",
          label: "Minimum Salary",
          type: "number",
          required: true,
          validationRule: "salary"
        },
        {
          name: "maxSalary",
          label: "Maximum Salary",
          type: "number",
          required: true,
          validationRule: "salary"
        },
        {
          name: "requiredSkills",
          label: "Required Skills",
          type: "multiselect",
          required: true,
          validationRule: "skills",
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
            { value: "agile", label: "Agile/Scrum" },
            { value: "leadership", label: "Leadership" }
          ]
        }
      ]
    },
    {
      title: "Job Description",
      fields: [
        {
          name: "jobDescription",
          label: "Job Description",
          type: "textarea",
          required: true,
          validationRule: "description"
        },
        {
          name: "responsibilities",
          label: "Key Responsibilities",
          type: "textarea",
          required: true,
          validationRule: "description"
        },
        {
          name: "benefits",
          label: "Benefits & Perks",
          type: "multiselect",
          required: false,
          validationRule: "benefits",
          options: [
            { value: "health-insurance", label: "Health Insurance" },
            { value: "dental-insurance", label: "Dental Insurance" },
            { value: "vision-insurance", label: "Vision Insurance" },
            { value: "401k", label: "401(k) Matching" },
            { value: "paid-time-off", label: "Paid Time Off" },
            { value: "remote-work", label: "Remote Work Options" },
            { value: "flexible-hours", label: "Flexible Hours" },
            { value: "professional-development", label: "Professional Development" },
            { value: "gym-membership", label: "Gym Membership" },
            { value: "meal-allowance", label: "Meal Allowance" },
            { value: "stock-options", label: "Stock Options" },
            { value: "bonus", label: "Performance Bonus" },
            { value: "parental-leave", label: "Parental Leave" },
            { value: "mental-health", label: "Mental Health Support" },
            { value: "learning-budget", label: "Learning Budget" },
            { value: "company-retreats", label: "Company Retreats" }
          ]
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
      const currentFormData = { ...formData, [fieldName]: value };
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
      const currentFormData = { ...formData, [fieldName]: value };
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
          jobPositionId: 'Job Position ID',
          positionName: 'Position Name',
          minValue: 'Min',
          maxValue: 'Max'
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