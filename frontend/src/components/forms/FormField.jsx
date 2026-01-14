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
  onValidation
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(name, newValue);
    
    // Trigger validation
    if (validate) {
      setIsValidating(true);
      validate(newValue, name).then(handleValidationResult).catch(handleValidationResult).finally(() => setIsValidating(false));
    } else if (error) {
      onValidation(name, { isValid: true });
    }
  };

  const handleMultiSelectChange = (selectedValues) => {
    onChange(name, selectedValues);
    
    // Trigger validation
    if (validate) {
      setIsValidating(true);
      validate(selectedValues, name).then(handleValidationResult).catch(handleValidationResult).finally(() => setIsValidating(false));
    } else if (error) {
      onValidation(name, { isValid: true });
    }
  };

  const removeMultiSelectItem = (itemToRemove) => {
    const newValue = value.filter(item => item !== itemToRemove);
    handleMultiSelectChange(newValue);
  };

  const addMultiSelectItem = (optionValue) => {
    const newValue = [...(value || []), optionValue];
    handleMultiSelectChange(newValue);
  };

  const handleValidationResult = (result) => {
    if (result && typeof result === 'object') {
      onValidation(name, result);
    } else {
      onValidation(name, { isValid: false, message: 'Validation failed' });
    }
  };

  const handleBlur = async () => {
    // Validate on blur if we have a validation function and haven't already started validating
    if (validate && !isValidating) {
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
      <label htmlFor={name}>
        {label.includes('*') ? (
          <>
            {label.replace('*', '')}
            <span className="required-star">*</span>
          </>
        ) : (
          label
        )}
      </label>
      {type === 'multiselect' ? (
        <div className="multiselect-container">
          {/* Selected items display */}
          {value && value.length > 0 && (
            <div className="selected-items">
              {value.map((selectedValue) => {
                const option = options.find(opt => opt.value === selectedValue);
                return (
                  <span key={selectedValue} className="selected-item">
                    {option?.label || selectedValue}
                    <button 
                      type="button" 
                      className="remove-item"
                      onClick={() => removeMultiSelectItem(selectedValue)}
                      aria-label={`Remove ${option?.label || selectedValue}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Dropdown for selecting new items */}
          <select 
            id={name} 
            name={name} 
            value="" 
            onChange={(e) => {
              if (e.target.value && (!value || !value.includes(e.target.value))) {
                addMultiSelectItem(e.target.value);
              }
              e.target.value = ""; // Reset select
            }}
            className="multiselect-dropdown"
          >
            <option value="">Add skill...</option>
            {options
              .filter(option => !value || !value.includes(option.value))
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>
      ) : type === 'select' ? (
        <select 
          id={name} 
          name={name} 
          value={value} 
          onChange={handleChange} 
          required={required}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
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