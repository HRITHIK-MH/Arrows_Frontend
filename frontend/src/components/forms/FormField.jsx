import React, { useEffect, useRef, useState } from 'react';
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
  const dropdownRef = useRef(null);

  const handleChange = (e) => {
    const newValue = type === 'file'
      ? (e.target.multiple ? Array.from(e.target.files) : e.target.files[0])
      : e.target.value;
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
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormField;
