import React from 'react';
import ReusableForm from '../../components/forms/ReusableForm';
import { jobApplicationConfig, contactFormConfig, jobOpeningConfig } from '../../components/forms/formConfigs';

const ExampleFormsPage = () => {
  const handleJobSubmit = (data) => {
    console.log('Job application submitted:', data);
    // Handle job application submission
  };

  const handleContactSubmit = (data) => {
    console.log('Contact form submitted:', data);
    // Handle contact form submission
  };

  const handleJobOpeningSubmit = (data) => {
    console.log('Job opening created:', data);
    // Handle job opening creation
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Example Forms - Reusable Components</h1>

      <div style={{ marginBottom: '50px' }}>
        <h2>Job Application Form</h2>
        <ReusableForm
          config={jobApplicationConfig}
          onSubmit={handleJobSubmit}
        />
      </div>

      <div style={{ marginBottom: '50px' }}>
        <h2>Create Job Opening Form</h2>
        <ReusableForm
          config={jobOpeningConfig}
          onSubmit={handleJobOpeningSubmit}
        />
      </div>

      <div style={{ marginBottom: '50px' }}>
        <h2>Contact Form</h2>
        <ReusableForm
          config={contactFormConfig}
          onSubmit={handleContactSubmit}
        />
      </div>

      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>How to Create Your Own Form:</h3>
        <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`const myFormConfig = {
  title: "My Custom Form",
  itemName: "Submissions",
  steps: [
    {
      title: "Step 1",
      fields: [
        {
          name: "fieldName",
          label: "Field Label",
          type: "text|email|number|tel|textarea|select",
          required: true,
          validationRule: "customRule" // optional
        }
      ]
    }
  ],
  validationRules: {
    customRule: (value, fieldName, formData) => {
      // Your validation logic
      return { isValid: true }; // or { isValid: false, message: "Error" }
    }
  },
  columns: [
    { key: 'fieldName', label: 'Column Label' }
  ]
};

// Use it in your component:
<ReusableForm config={myFormConfig} onSubmit={handleSubmit} />`}
        </pre>
      </div>
    </div>
  );
};

export default ExampleFormsPage;