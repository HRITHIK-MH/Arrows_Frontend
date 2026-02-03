import React, { useState } from 'react';
import axios from 'axios';
import MultiStepForm from './MultiStepForm';
import FormField from './FormField';
import './ReusableForm.css';
import { validateMandatoryField } from '../../utils/formValidation';

// Reusable form configuration
const createFormConfig = (config) => {
  return {
    steps: config.steps.map(step => ({
      title: step.title,
      skipValidation: Boolean(step.skipValidation),
      component: step.component
        ? step.component
        : (props) => (
          <FormStep
            {...props}
            fields={step.fields || []}
            title={step.title}
          />
        )
    })),
    validationRules: config.validationRules || {},
    columns: config.columns || []
  };
};

// Reusable step component
const FormStep = ({ formData, onChange, fields, title, onSetStepFields, validationErrors = {}, disabled = false }) => {
  console.log(`[FormStep] Rendering step: ${title}, validationErrors:`, validationErrors);
  console.log(`[FormStep] Received fields:`, fields.map(f => ({ name: f.name, hasOnValidation: !!f.onValidation, hasValidate: !!f.validate })));
  const isJobBasicInfo = title === "Job Basic Information" || title === "Job Information";
  const fieldMetaSignatureRef = React.useRef('');

  // Notify parent about fields in this step
  React.useEffect(() => {
    if (onSetStepFields) {
      const fieldMeta = fields.map(field => ({
        name: field.name,
        label: field.label,
        required: Boolean(field.required)
      }));

      const nextSignature = JSON.stringify(fieldMeta);
      if (fieldMetaSignatureRef.current === nextSignature) {
        return;
      }
      fieldMetaSignatureRef.current = nextSignature;
      onSetStepFields(fieldMeta);
    }
  }, [fields, onSetStepFields, isJobBasicInfo]);

  const renderField = (field) => {
    console.log(`[FormStep.renderField] Rendering field ${field.name}, error: ${validationErrors[field.name]}`);
      console.log(`[FormStep.renderField] Field ${field.name} has onValidation:`, !!field.onValidation);
    return (
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
        error={validationErrors[field.name]}
        onValidation={field.onValidation}
        placeholder={field.placeholder}
        hideLabel={field.hideLabel}
        accept={field.accept}
        multiple={field.multiple}
        prefix={field.prefix}
        formData={formData}
        disabled={disabled}
        showBrowseButton={field.showBrowseButton}
      />
    );
  };

  if (isJobBasicInfo) {
    // Create a map of fields by name (and cssClass where helpful)
    const fieldMap = {};
    fields.forEach(field => {
      if (field.cssClass) {
        fieldMap[field.cssClass] = field;
      }
      fieldMap[field.name] = field;
        if (field.name === 'jobPositionId' || field.name === 'positionName' || field.name === 'minExperience') {
          console.log(`[isJobBasicInfo] Field ${field.name} has onValidation:`, !!field.onValidation, ', validate:', !!field.validate);
        }
    });

    const getField = (name) => (fieldMap[name] ? renderField(fieldMap[name]) : null);

    const renderGroup = (label, required, minKey, maxKey) => (
      <div className="field-group">
        <div className="field-group-label">
          {label}
          {required && <span className="required-star">*</span>}
        </div>
        <div className="min-max-container">
          {getField(minKey)}
          {getField(maxKey)}
        </div>
      </div>
    );

    return (
      <div className="job-basic-info-step">
        <div className="job-section">
          <div className="job-section-header">
            <h3 className="job-section-title">Job Details</h3>
            <div className="job-section-divider" />
          </div>

          <div className="job-basic-info-grid">
            <div className="grid-cell grid-col-1 grid-row-1">
              {getField('jobPositionId')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-1">
              {getField('positionName')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-1">
              {renderGroup('Experience', true, 'minExperience', 'maxExperience')}
            </div>

            <div className="grid-cell grid-col-1 grid-row-2">
              {getField('jobDescriptionLink')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-2">
              {getField('positionLevel')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-2">
              {getField('location')}
            </div>

            <div className="grid-cell grid-col-1 grid-row-3">
              {getField('noOfPositions')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-3">
              {getField('jobReceivedDate')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-3">
              {getField('hiringType')}
            </div>

            <div className="grid-cell grid-col-1 grid-row-4">
              {renderGroup('Salary In CTC', true, 'minSalary', 'maxSalary')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-4">
              {getField('jobType')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-4">
              {getField('jdAttachment')}
            </div>

            <div className="grid-cell grid-col-1 grid-row-5">
              {getField('technicalSkills')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-5">
              {getField('softSkills')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-5">
              {getField('additionalSkills')}
            </div>
          </div>
        </div>

        <div className="job-section">
          <div className="job-section-header">
            <h3 className="job-section-title">Client Details</h3>
            <div className="job-section-divider" />
          </div>

          <div className="job-basic-info-grid job-basic-info-grid--client">
            <div className="grid-cell grid-col-1 grid-row-1">
              {getField('clientId')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-1">
              {getField('clientName')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-1">
              {getField('contactPersonName')}
            </div>
            <div className="grid-cell grid-col-1 grid-row-2">
              {getField('contactPersonEmail')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>{title}</h3>
      {fields.map(field => renderField(field))}
    </div>
  );
};

// Main reusable form component
const ReusableForm = ({ config, onSubmit, initialData, readOnly = false }) => {
  const [validationErrors, setValidationErrors] = useState({});

  const formConfig = createFormConfig(config);

  // Create validation functions
  const createValidationFunction = (ruleName) => {
    const rule = config.validationRules?.[ruleName];
    if (!rule) return null;

    return async (value, fieldName, formData) => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            // formData is now passed from FormField with current values
            const result = await rule(value, fieldName, formData);
            if (result && typeof result === 'object' && 'isValid' in result) {
              if (result.isValid) {
                resolve(result);
              } else {
                reject(result);
              }
            } else {
              // Handle case where result might not be in expected format
              resolve({ isValid: true });
            }
          } catch (error) {
            reject(error);
          }
        }, 500);
      });
    };
  };

  // Handle validation - persist errors until field value is valid
  const handleValidation = (fieldName, result) => {
    console.log(`[ReusableForm.handleValidation] Called for ${fieldName}:`, result);
    console.log(`[ReusableForm.handleValidation] Current errors before update:`, validationErrors);
    
    setValidationErrors(prev => {
      const updatedErrors = { ...prev };
      
      if (result.isValid) {
        // Only clear error if field is actually valid
        delete updatedErrors[fieldName];
        console.log(`[ReusableForm.handleValidation] ✅ Clearing error for ${fieldName}`);
      } else {
        // Set error message and keep it
        updatedErrors[fieldName] = result.message;
        console.log(`[ReusableForm.handleValidation] ❌ Setting error for ${fieldName}: ${result.message}`);
      }
      
      console.log(`[ReusableForm.handleValidation] Updated errors:`, updatedErrors);
      return updatedErrors;
    });
  };

  // Enhanced steps with validation
  const enhancedSteps = formConfig.steps.map((step, index) => {
    const StepComponent = step.component;
    const configStep = config.steps[index];
    const stepFields = configStep?.fields || [];
    const stepFieldsWithValidation = stepFields.map(field => ({
      ...field,
      validate: field.validationRule ? createValidationFunction(field.validationRule) : field.validate || null,
      onValidation: handleValidation
    }));

    if (configStep?.component) {
      return {
        title: step.title,
        skipValidation: Boolean(configStep?.skipValidation),
        component: (props) => (
          <StepComponent
            {...props}
            fields={stepFieldsWithValidation}
            onSetStepFields={props.onSetStepFields}
            validationErrors={validationErrors}
            disabled={readOnly}
          />
        )
      };
    }

    return {
      title: step.title,
      skipValidation: Boolean(configStep?.skipValidation),
      component: (props) => (
        <StepComponent
          {...props}
          fields={stepFieldsWithValidation}
          onSetStepFields={props.onSetStepFields}
          validationErrors={validationErrors}
          disabled={readOnly}
        />
      )
    };
  });

  // Validate all mandatory fields at once
  const validateAllMandatoryFields = async (data, fields) => {
    const errors = {};
    let isValid = true;

    for (const field of fields) {
      if (!field.required && !field.validationRule) {
        continue;
      }

      let result = null;
      if (field.validationRule) {
        const validateFn = createValidationFunction(field.validationRule);
        if (validateFn) {
          result = await validateFn(data[field.name], field.name, data);
        }
      } else if (field.required) {
        result = await validateMandatoryField(data[field.name], field.name, field.label);
      }

      if (result && !result.isValid) {
        errors[result.fieldName || field.name] = result.message;
        isValid = false;
      }
    }

    return { isValid, errors };
  };

  const handleSubmit = async (formData) => {
    try {
      // Validate all mandatory fields before submission
      const allFields = config.steps.flatMap(step => step.fields || []);
      const { isValid: isMandatoryValid, errors: mandatoryErrors } = await validateAllMandatoryFields(
        formData,
        allFields
      );

      // Update validation errors state
      if (!isMandatoryValid) {
        setValidationErrors(prev => ({
          ...prev,
          ...mandatoryErrors
        }));
        const missingFields = Object.values(mandatoryErrors).join('\n');
        alert(`Please fill in all required fields:\n\n${missingFields}`);
        return;
      }

      // Clear validation errors on successful validation
      setValidationErrors({});

      // Make AJAX call to submit the job
      const response = await axios.post('/api/jobs', formData);

      // Call the onSubmit callback if provided
      onSubmit?.(formData);

      // Handle successful submission
      console.log('Job submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting job:', error);

      // For development purposes, treat as success if it's a network error (no backend)
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.log('No backend server available, treating as successful submission for development');
        onSubmit?.(formData);
      } else {
        alert('Error submitting job. Please try again.');
        return;
      }
    }
  };

  // Validate fields on a specific step and update error state to show errors
  const validateStepFields = async (stepIndex, data) => {
    console.log(`[ReusableForm] validateStepFields called for step ${stepIndex}`);
    const stepFields = config.steps[stepIndex]?.fields || [];
    const updatedErrors = { ...validationErrors };
    
    // Validate all required fields on this step (and any custom rules)
    for (const field of stepFields) {
      const value = data[field.name];
      const fieldLabel = field.label ? field.label.replace('*', '').trim() : field.name;
      let result = null;

      if (field.validationRule) {
        const validateFn = createValidationFunction(field.validationRule);
        if (validateFn) {
          result = await validateFn(value, field.name, data);
        }
      } else if (field.required) {
        result = await validateMandatoryField(value, field.name, fieldLabel);
      }
      
      if (result) {
        if (!result.isValid) {
          // Field is invalid - set error
          updatedErrors[field.name] = result.message;
          console.log(`[validateStepFields] Setting error for ${field.name}: ${result.message}`);
        } else {
          // Field is valid - clear error if it exists
          if (updatedErrors[field.name]) {
            delete updatedErrors[field.name];
            console.log(`[validateStepFields] Clearing error for ${field.name}`);
          }
        }
      }
    }
    
    // Update validation errors state all at once
    setValidationErrors(updatedErrors);
    console.log(`[validateStepFields] Final validation errors:`, updatedErrors);
  };

  return (
    <div
      className={`reusable-form-page${config.formClassName ? ` ${config.formClassName}` : ''}${readOnly ? ' read-only' : ''}`}
    >
      {!config.hideTitle && <h1>{config.title}</h1>}
      <MultiStepForm 
        steps={enhancedSteps} 
        onSubmit={handleSubmit} 
        validationErrors={validationErrors}
        onValidateStep={validateStepFields}
        hideStepper={config.hideStepper}
        showDraftAction={config.showDraftAction}
        draftLabel={config.draftLabel}
        onSaveDraft={config.onSaveDraft}
        submitLabel={config.submitLabel}
        initialData={initialData}
        readOnly={readOnly}
      />
    </div>
  );
};

export default ReusableForm;
