import React, { useState } from 'react';
import './MultiStepForm.css';

const MultiStepForm = ({ steps, onSubmit, validationErrors = {}, onValidateStep }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepFields, setStepFields] = useState({});

  const normalizeLabel = (label, fallback) => {
    if (!label) return fallback;
    return label.replace('*', '').trim() || fallback;
  };

  const getStepIssues = (stepIndex) => {
    const currentStepFields = stepFields[stepIndex] || [];

    if (currentStepFields.length === 0) {
      return { missing: [], invalid: [] };
    }

    return currentStepFields.reduce(
      (acc, field) => {
        const fieldName = typeof field === 'string' ? field : field.name;
        const fieldLabel = normalizeLabel(
          typeof field === 'string' ? field : field.label,
          fieldName
        );
        const isRequired = typeof field === 'string' ? true : field.required;
        const value = formData[fieldName];
        const hasError = validationErrors[fieldName];

        const hasValue =
          value !== undefined &&
          value !== null &&
          value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true);

        if (isRequired && !hasValue) {
          acc.missing.push(fieldLabel);
        } else if (hasError) {
          acc.invalid.push(fieldLabel);
        }

        return acc;
      },
      { missing: [], invalid: [] }
    );
  };

  const showStepWarning = (stepIndex) => {
    const { missing, invalid } = getStepIssues(stepIndex);
    if (missing.length === 0 && invalid.length === 0) {
      return;
    }

    const lines = [];
    if (missing.length) {
      lines.push(`Missing: ${missing.join(', ')}`);
    }
    if (invalid.length) {
      lines.push(`Invalid: ${invalid.join(', ')}`);
    }
    window.alert(lines.join('\n'));
  };

  const validateCurrentStep = (stepIndex) => {
    const { missing, invalid } = getStepIssues(stepIndex);
    return missing.length === 0 && invalid.length === 0;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Trigger validation for the current step fields
      if (onValidateStep) {
        onValidateStep(currentStep, formData);
      }
      
      // Check if current step is valid before proceeding
      if (validateCurrentStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      } else {
        showStepWarning(currentStep);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field, value) => {
    console.log(`[MultiStepForm.handleChange] field=${field}, value=`, value, 'typeof=', typeof value, 'isArray=', Array.isArray(value));
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      console.log('[MultiStepForm.handleChange] next formData preview:', next);
      return next;
    });
  };

  const handleSetStepFields = (fields) => {
    setStepFields(prev => ({
      ...prev,
      [currentStep]: fields
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if current step is valid before submitting
    if (validateCurrentStep(currentStep)) {
      onSubmit(formData);
    } else {
      showStepWarning(currentStep);
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    const { missing, invalid } = getStepIssues(currentStep);
    return missing.length === 0 && invalid.length === 0;
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="multi-step-form">
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className={`step ${index <= currentStep ? 'active' : ''}`}>
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step.title || `Step ${index + 1}`}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <CurrentStepComponent 
          formData={formData} 
          onChange={handleChange} 
          onSetStepFields={handleSetStepFields}
          validationErrors={validationErrors}
        />
        <div className="form-buttons">
          {currentStep > 0 && <button type="button" onClick={handlePrev}>Previous</button>}
          {currentStep < steps.length - 1 ? (
            <button 
              type="button" 
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;
