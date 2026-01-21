import React, { useState } from 'react';
import axios from 'axios';
import MultiStepForm from './MultiStepForm';
import FormField from './FormField';
import './ReusableForm.css';

// Reusable form configuration
const createFormConfig = (config) => {
  return {
    steps: config.steps.map(step => ({
      title: step.title,
      component: (props) => <FormStep {...props} fields={step.fields} title={step.title} />
    })),
    validationRules: config.validationRules || {},
    columns: config.columns || []
  };
};

// Reusable step component
const FormStep = ({ formData, onChange, fields, title, onSetStepFields, validationErrors = {} }) => {
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

  const renderField = (field) => (
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
    />
  );

  if (isJobBasicInfo) {
    // Create a map of fields by name (and cssClass where helpful)
    const fieldMap = {};
    fields.forEach(field => {
      if (field.cssClass) {
        fieldMap[field.cssClass] = field;
      }
      fieldMap[field.name] = field;
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
const ReusableForm = ({ config, onSubmit }) => {
  const [validationErrors, setValidationErrors] = useState({});

  const formConfig = createFormConfig(config);

  // Create validation functions
  const createValidationFunction = (ruleName) => {
    const rule = config.validationRules?.[ruleName];
    if (!rule) return null;

    return async (value, fieldName) => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await rule(value, fieldName);
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

  // Handle validation
  const handleValidation = (fieldName, result) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? null : result.message
    }));
  };

  // Enhanced steps with validation
  const enhancedSteps = formConfig.steps.map((step, index) => {
    const StepComponent = step.component;
    return {
      title: step.title,
      component: (props) => (
        <StepComponent
          {...props}
          fields={config.steps[index].fields.map(field => ({
            ...field,
            validate: field.validationRule ? createValidationFunction(field.validationRule) : null,
            onValidation: handleValidation
          }))}
          onSetStepFields={props.onSetStepFields}
          validationErrors={validationErrors}
        />
      )
    };
  });

  const handleSubmit = async (formData) => {
    try {
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

  return (
    <div className={`reusable-form-page${config.formClassName ? ` ${config.formClassName}` : ''}`}>
      {!config.hideTitle && <h1>{config.title}</h1>}
      <MultiStepForm steps={enhancedSteps} onSubmit={handleSubmit} validationErrors={validationErrors} />
    </div>
  );
};

export default ReusableForm;
