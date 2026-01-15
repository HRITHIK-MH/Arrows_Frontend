import React, { useState } from 'react';
import './MultiStepForm.css';

const MultiStepForm = ({ steps, onSubmit, validationErrors = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [stepFields, setStepFields] = useState({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSetStepFields = (fields) => {
    setStepFields(prev => ({
      ...prev,
      [currentStep]: fields
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    const currentStepFieldNames = stepFields[currentStep] || [];
    
    if (currentStepFieldNames.length === 0) {
      return true; // No fields to validate
    }

    // Check if all required fields have values and no validation errors
    return currentStepFieldNames.every(fieldName => {
      const value = formData[fieldName];
      const hasError = validationErrors[fieldName];
      
      // Field must have a non-empty value and no validation error
      const hasValue = 
        value !== undefined && 
        value !== null && 
        value !== '' &&
        (Array.isArray(value) ? value.length > 0 : true);
      
      return hasValue && !hasError;
    });
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
              disabled={!isCurrentStepValid()}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit"
              disabled={!isCurrentStepValid()}
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