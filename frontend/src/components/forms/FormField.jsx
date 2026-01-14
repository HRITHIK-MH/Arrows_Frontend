import React, { useState } from 'react';
import './FormField.css';

const FormField = ({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  required, 
  options, 
  validate,
  error,
  onValidation,
  multiple // New prop for multiselect
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = async (e) => {
    let newValue;
    
    if (type === 'multiselect') {
      // Handle multiselect
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      newValue = selectedOptions;
    } else {
      newValue = e.target.value;
    }
    
    onChange(name, newValue);
    
    // Trigger validation on change for immediate feedback
    if (validate) {
      setIsValidating(true);
      try {
        const validationResult = await validate(newValue, name);
        handleValidationResult(validationResult);
      } catch (err) {
        handleValidationResult(err);
      } finally {
        setIsValidating(false);
      }
    } else if (error) {
      // Clear error when user starts typing valid input
      onValidation(name, { isValid: true });
    }
  };

  const handleValidationResult = (result) => {
    if (result && typeof result === 'object') {
      onValidation(name, result);
    } else {
      onValidation(name, { isValid: false, message: 'Validation failed' });
    }
  };

  const handleBlur = async () => {
    // Only validate on blur if we haven't validated on change and there's a value
    if (validate && value && !isValidating) {
      setIsValidating(true);
      try {
        const validationResult = await validate(value, name);
        handleValidationResult(validationResult);
      } catch (err) {
        handleValidationResult(err);
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {type === 'select' || type === 'multiselect' ? (
        <select 
          id={name} 
          name={name} 
          value={type === 'multiselect' ? undefined : value} 
          onChange={handleChange} 
          required={required}
          multiple={type === 'multiselect'}
        >
          {type !== 'multiselect' && <option value="">Select...</option>}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              selected={type === 'multiselect' ? (value && value.includes(option.value)) : undefined}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            required={required}
            className={error ? 'error' : ''}
            rows="4"
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            required={required}
            min={type === 'number' ? '0' : undefined}
            className={error ? 'error' : ''}
          />
        )
      )}
      {isValidating && <span className="validation-loading">Validating...</span>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormField;