import React, { useState } from 'react';
import FormField from './FormField';
import './Step1.css';

const Step1 = ({ formData, onChange }) => {
  const [validationErrors, setValidationErrors] = useState({});

  // Simulate AJAX validation for experience fields
  const validateExperience = async (value, fieldName) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For empty required fields
        if (!value && value !== 0) {
          reject({ isValid: false, message: 'This field is required' });
          return;
        }

        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
          reject({ isValid: false, message: 'Please enter a valid number' });
          return;
        }
        
        if (numValue < 0) {
          reject({ isValid: false, message: 'Experience cannot be negative' });
          return;
        }
        
        if (numValue > 50) {
          reject({ isValid: false, message: 'Experience cannot exceed 50 years' });
          return;
        }
        
        // Get current form data including the current field being validated
        const currentFormData = { ...formData, [fieldName]: value };
        const minExp = parseFloat(currentFormData.minExperience || 0);
        const maxExp = parseFloat(currentFormData.maxExperience || 0);
        
        if (currentFormData.minExperience !== undefined && currentFormData.maxExperience !== undefined && minExp > maxExp) {
          reject({ isValid: false, message: 'Min experience cannot be greater than max experience' });
          return;
        }
        
        resolve({ isValid: true });
      }, 500); // Reduced delay for better UX
    });
  };

  const handleValidation = (fieldName, result) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? null : result.message
    }));
  };

  return (
    <div>
      <h3>Personal Information</h3>
      <FormField
        label="First Name"
        type="text"
        name="firstName"
        value={formData.firstName || ''}
        onChange={onChange}
        required
      />
      <FormField
        label="Last Name"
        type="text"
        name="lastName"
        value={formData.lastName || ''}
        onChange={onChange}
        required
      />
      <FormField
        label="Email"
        type="email"
        name="email"
        value={formData.email || ''}
        onChange={onChange}
        required
      />
      <div className="experience-row">
        <FormField
          label="Min Experience (years)"
          type="number"
          name="minExperience"
          value={formData.minExperience || ''}
          onChange={onChange}
          required
          validate={validateExperience}
          error={validationErrors.minExperience}
          onValidation={handleValidation}
        />
        <FormField
          label="Max Experience (years)"
          type="number"
          name="maxExperience"
          value={formData.maxExperience || ''}
          onChange={onChange}
          required
          validate={validateExperience}
          error={validationErrors.maxExperience}
          onValidation={handleValidation}
        />
      </div>
    </div>
  );
};

export default Step1;