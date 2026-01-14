import React, { useState } from 'react';
import MultiStepForm from './MultiStepForm';
import FormField from './FormField';
import './ReusableForm.css';

// Reusable form configuration
const createFormConfig = (config) => {
  return {
    steps: config.steps.map(step => ({
      component: (props) => <FormStep {...props} fields={step.fields} title={step.title} />
    })),
    validationRules: config.validationRules || {},
    columns: config.columns || []
  };
};

// Reusable step component
const FormStep = ({ formData, onChange, fields, title }) => {
  return (
    <div>
      <h3>{title}</h3>
      {fields.map(field => (
        <FormField
          key={field.name}
          label={field.label}
          type={field.type}
          name={field.name}
          value={formData[field.name] || (field.type === 'multiselect' ? [] : '')}
          onChange={onChange}
          required={field.required}
          options={field.options}
          validate={field.validate}
          error={field.error}
          onValidation={field.onValidation}
          multiple={field.type === 'multiselect'}
        />
      ))}
    </div>
  );
};

// Main reusable form component
const ReusableForm = ({ config, onSubmit }) => {
  const [validationErrors, setValidationErrors] = useState({});

  const formConfig = createFormConfig(config);

  // Create validation functions
  const createValidationFunction = (ruleName) => {
    const rule = config.validationRules?.[ruleName];
    if (!rule) return null;

    return async (value, fieldName) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const result = rule(value, fieldName, formData);
          if (result.isValid) {
            resolve(result);
          } else {
            reject(result);
          }
        }, 500);
      });
    };
  };

  // Handle validation
  const handleValidation = (fieldName, result) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? null : result.message
    }));
  };

  // Enhanced steps with validation
  const enhancedSteps = formConfig.steps.map((step, index) => ({
    component: (props) => (
      <step.component
        {...props}
        fields={config.steps[index].fields.map(field => ({
          ...field,
          validate: field.validationRule ? createValidationFunction(field.validationRule) : null,
          error: validationErrors[field.name],
          onValidation: handleValidation
        }))}
      />
    )
  }));

  const handleSubmit = (formData) => {
    onSubmit?.(formData);
    alert('Form submitted successfully!');
  };

  return (
    <div className="reusable-form-page">
      <h1>{config.title}</h1>
      <MultiStepForm steps={enhancedSteps} onSubmit={handleSubmit} />
    </div>
  );
};

export default ReusableForm;