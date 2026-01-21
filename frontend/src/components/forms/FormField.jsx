import React, { useEffect, useRef, useState } from 'react';
import './FormField.css';
import { validateMandatoryField } from '../../utils/formValidation';

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
  placeholder,
  hideLabel,
  accept,
  multiple,
  prefix
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customOption, setCustomOption] = useState('');
  const [customOptions, setCustomOptions] = useState([]);
  const [localError, setLocalError] = useState('');
  const dropdownRef = useRef(null);

  const handleChange = (e) => {
    const newValue = type === 'file'
      ? (e.target.multiple ? Array.from(e.target.files) : e.target.files[0])
      : e.target.value;
    console.log(`[FormField.handleChange] ${name}: value="${newValue}", required=${required}, onValidation=${!!onValidation}`);
    onChange(name, newValue);
    
    if (validate) {
      console.log(`[FormField.handleChange] Using custom validate for ${name}`);
      setIsValidating(true);
      validate(newValue, name).then(result => {
        console.log(`[FormField.handleChange] Custom validation done for ${name}:`, result);
        handleValidationResult(result);
      }).catch(err => {
        console.log(`[FormField.handleChange] Custom validation error for ${name}:`, err);
        handleValidationResult(err);
      }).finally(() => setIsValidating(false));
    } else if (required) {
      console.log(`[FormField.handleChange] Running mandatory validation for ${name}`);
      setIsValidating(true);
      const fieldLabel = label ? label.replace('*', '').trim() : name;
      validateMandatoryField(newValue, name, fieldLabel)
        .then(result => {
          console.log(`[FormField.handleChange] ✅ Mandatory validation result for ${name}:`, result);
          handleValidationResult(result);
        })
        .catch(err => {
          console.log(`[FormField.handleChange] ❌ Mandatory validation error for ${name}:`, err);
          handleValidationResult(err);
        })
        .finally(() => setIsValidating(false));
    }
  };

  const handleMultiSelectChange = (selectedValues) => {
    onChange(name, selectedValues);
    
    // Always trigger validation on change
    console.log(`[FormField multiselect onChange] Field: ${name}, Count: ${selectedValues?.length || 0}, Required: ${required}, HasError: ${!!error}`);
    
    if (validate) {
      // Custom validation function
      console.log(`[FormField] Using custom validate function for multiselect`);
      setIsValidating(true);
      validate(selectedValues, name).then(handleValidationResult).catch(handleValidationResult).finally(() => setIsValidating(false));
    } else if (required) {
      // For required fields, always validate on change to clear/show errors
      console.log(`[FormField] Validating required multiselect on change`);
      setIsValidating(true);
      const fieldLabel = label ? label.replace('*', '').trim() : name;
      validateMandatoryField(selectedValues, name, fieldLabel)
        .then(handleValidationResult)
        .catch(handleValidationResult)
        .finally(() => setIsValidating(false));
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

  const toggleMultiSelectItem = (optionValue) => {
    const selectedValues = Array.isArray(value) ? value : [];
    if (selectedValues.includes(optionValue)) {
      handleMultiSelectChange(selectedValues.filter(item => item !== optionValue));
    } else {
      handleMultiSelectChange([...selectedValues, optionValue]);
    }
  };

  const handleAddCustomOption = () => {
    const trimmed = customOption.trim();
    if (!trimmed) return;

    const baseOptions = Array.isArray(options) ? options : [];
    const exists = [...baseOptions, ...customOptions].some(
      (opt) => String(opt.value).toLowerCase() === trimmed.toLowerCase()
    );

    const newOption = { value: trimmed, label: trimmed };
    if (!exists) {
      setCustomOptions((prev) => [...prev, newOption]);
    }
    if (!Array.isArray(value) || !value.includes(newOption.value)) {
      handleMultiSelectChange([...(Array.isArray(value) ? value : []), newOption.value]);
    }
    setCustomOption('');
  };

  const handleValidationResult = (result) => {
    if (result && typeof result === 'object') {
      console.log(`[Validation] Field: ${name}, Valid: ${result.isValid}, Message: ${result.message}, onValidation exists: ${!!onValidation}`);
      
      // Update local error state immediately for instant UI feedback
      if (result.isValid) {
        setLocalError('');
        console.log(`[Validation] ✅ Local error cleared for ${name}`);
      } else {
        setLocalError(result.message);
        console.log(`[Validation] ❌ Local error set for ${name}: ${result.message}`);
      }
      
      // Also call parent callback for state management
      if (onValidation) {
        console.log(`[Validation] Calling onValidation callback for ${name}`);
        onValidation(name, result);
      } else {
        console.log(`[Validation] WARNING: onValidation is not defined for field ${name}`);
      }
    } else {
      console.log(`[Validation] Field: ${name}, Error: Invalid result format, onValidation exists: ${!!onValidation}`);
      setLocalError('Validation failed');
      if (onValidation) {
        onValidation(name, { isValid: false, message: 'Validation failed' });
      }
    }
  };

  const handleBlur = async () => {
    if (isValidating) return;

    setIsValidating(true);
    try {
      // If custom validation function is provided, use it
      if (validate) {
        const validationResult = await validate(value, name);
        handleValidationResult(validationResult);
      } 
      // For required fields without custom validation, validate that field has value
      else if (required) {
        // Extract label from prop (removing asterisk if present)
        const fieldLabel = label ? label.replace('*', '').trim() : name;
        const validationResult = await validateMandatoryField(value, name, fieldLabel);
        handleValidationResult(validationResult);
      }
    } catch (err) {
      handleValidationResult(err);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (!isDropdownOpen) {
      setSearchTerm('');
      return;
    }

    const handleOutsideClick = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const searchPlaceholder = (label || '').toLowerCase().includes('skill')
    ? 'Search skills'
    : 'Search';

  const selectionPlaceholder = (label || '').toLowerCase().includes('skill')
    ? 'Select skills'
    : 'Select options';

  const baseOptions = Array.isArray(options) ? options : [];
  const mergedOptions = [...baseOptions, ...customOptions].filter(
    (option, index, self) =>
      self.findIndex((item) => item.value === option.value) === index
  );
  const filteredOptions = mergedOptions.filter((option) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return String(option.label || option.value).toLowerCase().includes(term);
  });

  return (
    <div className={`form-field${name ? ` field-${name}` : ''}`}>
      <label htmlFor={name} className={hideLabel ? 'label-hidden' : undefined}>
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
        <div className="multiselect-container" ref={dropdownRef}>
          <div
            className={`selected-items${isDropdownOpen ? ' open' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen((prev) => !prev);
              }
            }}
          >
            {Array.isArray(value) && value.length > 0 ? (
              value.map((selectedValue) => {
                const option = mergedOptions.find(opt => opt.value === selectedValue);
                return (
                  <span key={selectedValue} className="selected-item">
                    {option?.label || selectedValue}
                    <button 
                      type="button" 
                      className="remove-item"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeMultiSelectItem(selectedValue);
                      }}
                      aria-label={`Remove ${option?.label || selectedValue}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })
            ) : (
              <span className="selected-placeholder">{selectionPlaceholder}</span>
            )}
          </div>

          {isDropdownOpen && (
            <div className="multiselect-dropdown">
              <input
                type="text"
                className="multiselect-search"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="multiselect-options">
                {filteredOptions.length === 0 && (
                  <div className="multiselect-empty">No results found</div>
                )}
                {filteredOptions.map((option) => (
                  <label key={option.value} className="multiselect-option">
                    <input
                      type="checkbox"
                      checked={Array.isArray(value) && value.includes(option.value)}
                      onChange={() => toggleMultiSelectItem(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="multiselect-add">
                <input
                  type="text"
                  value={customOption}
                  placeholder="Add more"
                  onChange={(e) => setCustomOption(e.target.value)}
                />
                <button type="button" onClick={handleAddCustomOption}>Add</button>
              </div>
            </div>
          )}
        </div>
      ) : type === 'select' ? (
        <select 
          id={name} 
          name={name} 
          value={value} 
          onChange={handleChange} 
          required={required}
        >
          <option value="">{placeholder || "Select..."}</option>
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
            placeholder={placeholder}
            rows="4"
          />
        ) : (
          (() => {
            const inputElement = (
              <input
                type={type}
                id={name}
                name={name}
                value={type === 'file' ? undefined : value}
                onChange={handleChange}
                onBlur={handleBlur}
                required={required}
                min={type === 'number' ? '0' : undefined}
                className={error ? 'error' : ''}
                placeholder={placeholder}
                accept={accept}
                multiple={type === 'file' ? multiple : undefined}
              />
            );

            if (!prefix) {
              return inputElement;
            }

            return (
              <div className={`field-control has-prefix${error ? ' error' : ''}`}>
                <span className="field-prefix">{prefix}</span>
                {inputElement}
              </div>
            );
          })()
        )
      )}
      {isValidating && <span className="validation-loading">Validating...</span>}
      {(localError || error) && (
        <>
          {console.log(`[FormField] Rendering error for ${name}: localError="${localError}", propError="${error}"`)}
          <span className="error-message">{localError || error}</span>
        </>
      )}
    </div>
  );
};

export default FormField;
