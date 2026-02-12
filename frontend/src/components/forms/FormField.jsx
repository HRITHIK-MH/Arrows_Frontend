import { useEffect, useRef, useState } from 'react';
import { validateMandatoryField } from '../../utils/formValidation';
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
  prefix,
  formData,
  disabled,
  showBrowseButton,
  suppressError
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customOption, setCustomOption] = useState('');
  const [customOptions, setCustomOptions] = useState([]);
  const [localError, setLocalError] = useState('');
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const safeOptions = Array.isArray(options) ? options : [];
  const safeLabel = typeof label === 'string' ? label : '';
  const cleanedLabel = safeLabel.replace('*', '').trim();
  const normalizedSelectOptions = safeOptions
    .map((option, index) => {
      if (option && typeof option === 'object') {
        const optionValue = Object.prototype.hasOwnProperty.call(option, 'value') ? option.value : '';
        const optionLabel = Object.prototype.hasOwnProperty.call(option, 'label')
          ? option.label
          : optionValue;
        return {
          key: String(optionValue ?? `option-${index}`),
          value: optionValue,
          label: String(optionLabel ?? ''),
        };
      }

      return {
        key: String(option ?? `option-${index}`),
        value: option,
        label: String(option ?? ''),
      };
    })
    .filter((option) => option.label !== '');

  // Sync prop error with local error when prop changes
  // This ensures errors from parent (Next button click) are displayed
  // And when parent clears the error (after validation passes), localError is also cleared
  useEffect(() => {
    console.log(`[FormField.useEffect] ${name}: error prop changed to:`, error);
    if (error) {
      // Always update localError when parent has an error
      console.log(`[FormField.useEffect] Syncing prop error to local: ${name} = ${error}`);
      setLocalError(error);
    } else {
      // When parent clears the error, clear localError immediately
      console.log(`[FormField.useEffect] Clearing error for ${name} - error prop is now empty`);
      setLocalError('');
    }
  }, [error, name]);

  const handleChange = (e) => {
    const newValue = type === 'file'
      ? (e.target.multiple ? Array.from(e.target.files) : e.target.files[0])
      : e.target.value;
    console.log(`[FormField.handleChange] ${name}: value=`, newValue, ` (type=${type}), required=${required}, hasError=${!!error}, onValidation=${!!onValidation}, formData:`, formData);
    onChange(name, newValue);
    triggerFieldValidation(newValue);
  };

  const triggerFieldValidation = (newValue) => {
    // Validate if:
    // 1. Custom validation function exists, OR
    // 2. Field is required, OR
    // 3. There's already an error showing (user is correcting it)
    const shouldValidate = validate || required || error;
    if (!shouldValidate) return;

    if (validate) {
      console.log(`[FormField.triggerFieldValidation] Using custom validate for ${name}`);
      setIsValidating(true);
      const currentFormData = formData || {};
      const updatedFormData = { ...currentFormData, [name]: newValue };
      Promise.resolve(validate(newValue, name, updatedFormData))
        .then(result => {
          console.log(`[FormField.triggerFieldValidation] Custom validation done for ${name}:`, result);
          handleValidationResult(result);
        })
        .catch(err => {
          console.log(`[FormField.triggerFieldValidation] Custom validation error for ${name}:`, err);
          handleValidationResult(err);
        })
        .finally(() => setIsValidating(false));
      return;
    }

    // For required fields or fields with errors, run mandatory validation
    console.log(`[FormField.triggerFieldValidation] Running mandatory validation for ${name}`);
    setIsValidating(true);
    const fieldLabel = cleanedLabel || name;
    validateMandatoryField(newValue, name, fieldLabel)
      .then(result => {
        console.log(`[FormField.triggerFieldValidation] ✅ Validation result for ${name}:`, result);
        handleValidationResult(result);
      })
      .catch(err => {
        console.log(`[FormField.triggerFieldValidation] ❌ Validation error for ${name}:`, err);
        handleValidationResult(err);
      })
      .finally(() => setIsValidating(false));
  };

  const handleMultiSelectChange = (selectedValues) => {
    onChange(name, selectedValues);
    
    // Always trigger validation on change
    console.log(`[FormField multiselect onChange] Field: ${name}, Count: ${selectedValues?.length || 0}, Required: ${required}, HasError: ${!!error}, formData:`, formData);
    
    if (validate) {
      // Custom validation function
      console.log(`[FormField] Using custom validate function for multiselect`);
      setIsValidating(true);
      // Pass updated formData with new value to validation function
      const currentFormData = formData || {};
      const updatedFormData = { ...currentFormData, [name]: selectedValues };
      console.log(`[FormField] Calling validate with updatedFormData:`, updatedFormData);
      validate(selectedValues, name, updatedFormData).then(handleValidationResult).catch(handleValidationResult).finally(() => setIsValidating(false));
    } else if (required) {
      // For required fields, always validate on change to clear/show errors
      console.log(`[FormField] Validating required multiselect on change`);
      setIsValidating(true);
      const fieldLabel = cleanedLabel || name;
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
      
      // Also call parent callback for state management - this is critical for clearing errors
      if (onValidation) {
        console.log(`[Validation] Calling onValidation callback for ${name}, isValid: ${result.isValid}`);
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
        const fieldLabel = cleanedLabel || name;
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

  const searchPlaceholder = safeLabel.toLowerCase().includes('skill')
    ? 'Search skills'
    : 'Search';

  const selectionPlaceholder = safeLabel.toLowerCase().includes('skill')
    ? 'Select skills'
    : 'Select options';

  const baseOptions = safeOptions;
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
      {type === 'file' && console.log(`[FormField.render] ${name} render, prop value=`, value, 'typeof=', typeof value, 'isArray=', Array.isArray(value))}
      <label htmlFor={name} className={hideLabel ? 'label-hidden' : undefined}>
        {safeLabel.includes('*') ? (
          <>
            {cleanedLabel}
            <span className="required-star">*</span>
          </>
        ) : (
          safeLabel
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
        <div className={`select-field${isDropdownOpen ? ' open' : ''}`} ref={dropdownRef}>
          <button
            type="button"
            id={name}
            className="select-trigger"
            onClick={() => !disabled && setIsDropdownOpen((prev) => !prev)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <span className="select-value">
              {normalizedSelectOptions.find((opt) => String(opt.value) === String(value))?.label || placeholder || "Select..."}
            </span>
            <span className="select-chevron" aria-hidden="true" />
          </button>
          {isDropdownOpen && (
            <div className="select-dropdown" role="listbox">
              {normalizedSelectOptions.length === 0 ? (
                <div className="select-empty">No options available</div>
              ) : (
                normalizedSelectOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`select-option${String(option.value) === String(value) ? ' selected' : ''}`}
                    onClick={() => {
                      onChange(name, option.value);
                      triggerFieldValidation(option.value);
                      setIsDropdownOpen(false);
                    }}
                    role="option"
                    aria-selected={String(option.value) === String(value)}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
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
            disabled={disabled}
          />
        ) : (
          (() => {
            // Custom rendering for file inputs to show the selected filename in a read-only text box
            if (type === 'file') {
              const fileName = Array.isArray(value)
                ? value.map((f) => (f && f.name) || String(f)).join(', ')
                : (value && value.name) || (typeof value === 'string' ? value : '');

              return (
                <div className={`file-field${error ? ' error' : ''}`}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id={name}
                    name={name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={required}
                    className="file-input-hidden"
                    style={{ display: 'none' }}
                    accept={accept}
                    multiple={multiple}
                    aria-label={label}
                    disabled={disabled}
                  />
                  <div className={`file-input-display${showBrowseButton ? ' with-button' : ' no-button'}`}>
                    <span className="file-icon upload-icon" aria-hidden="true">⬆</span>
                    {showBrowseButton && (
                      <button
                        type="button"
                        className="file-browse-btn"
                        onClick={() => {
                          if (!disabled && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={disabled}
                      >
                        Browse
                      </button>
                    )}
                    <input
                      type="text"
                      readOnly
                      value={fileName || ''}
                      placeholder={placeholder || 'No file chosen'}
                      className={`file-visual-input${error ? ' error' : ''}`}
                      onClick={() => {
                        if (!disabled && fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      disabled={disabled}
                    />
                  </div>
                </div>
              );
            }

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
                disabled={disabled}
              />
            );

            if (!prefix) {
              return (
                <>
                  {inputElement}
                  {type === 'file' && value && (
                    Array.isArray(value) ? (
                      <div className="selected-files">
                        {value.map((f, idx) => (
                          <div key={idx} className="selected-file">{(f && f.name) || String(f)}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="selected-files">
                        <div className="selected-file">{(value && value.name) || String(value)}</div>
                      </div>
                    )
                  )}
                </>
              );
            }

            return (
              <div className={`field-control has-prefix${error ? ' error' : ''}`}>
                <span className="field-prefix">{prefix}</span>
                {inputElement}
                {/* Display selected file name(s) for file inputs */}
                {type === 'file' && value && (
                  Array.isArray(value) ? (
                    <div className="selected-files">
                      {value.map((f, idx) => (
                        <div key={idx} className="selected-file">{(f && f.name) || String(f)}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="selected-files">
                      <div className="selected-file">{(value && value.name) || String(value)}</div>
                    </div>
                  )
                )}
              </div>
            );
          })()
        )
      )}
      {isValidating && <span className="validation-loading">Validating...</span>}
      {!suppressError && (localError || error) && (
        <>
          {console.log(`[FormField] Rendering error for ${name}: localError="${localError}", propError="${error}"`)}
          <span className="error-message">{localError || error}</span>
        </>
      )}
    </div>
  );
};

export default FormField;
