import React, { useState } from 'react';
import './MultiStepForm.css';

const MultiStepForm = ({ steps, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="multi-step-form">
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className={`step ${index <= currentStep ? 'active' : ''}`}>
            <span className="step-number">{index + 1}</span>
            <span className="step-label">Step {index + 1} of {steps.length}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <CurrentStepComponent formData={formData} onChange={handleChange} />
        <div className="form-buttons">
          {currentStep > 0 && <button type="button" onClick={handlePrev}>Previous</button>}
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={handleNext}>Next</button>
          ) : (
            <button type="submit">Submit</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MultiStepForm;