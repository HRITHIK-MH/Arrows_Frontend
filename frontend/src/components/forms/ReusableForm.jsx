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
  const isJobBasicInfo = title === "Job Basic Information";

  // Notify parent about fields in this step
  React.useEffect(() => {
    if (onSetStepFields) {
      if (isJobBasicInfo) {
        // For Job Basic Info, only track fields that are actually displayed in the grid
        const displayedFields = fields.filter(field => 
          field.cssClass || field.name === 'minValue' || field.name === 'maxValue'
        );
        const fieldNames = displayedFields.map(f => f.name);
        onSetStepFields(fieldNames);
      } else {
        // For other steps, track all fields
        const fieldNames = fields.map(f => f.name);
        onSetStepFields(fieldNames);
      }
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
      multiple={field.type === 'multiselect'}
    />
  );

  if (isJobBasicInfo) {
    // Create a map of fields by their cssClass for easier lookup
    const fieldMap = {};
    fields.forEach(field => {
      if (field.cssClass) {
        fieldMap[field.cssClass] = field;
      }
      // Also map by name for min/max fields
      if (field.name === 'minValue' || field.name === 'maxValue') {
        fieldMap[field.name] = field;
      }
    });

    return (
      <div className="job-basic-info-step">
        <h3 style={{ borderBottom: '2px dotted #ccc', paddingBottom: '10px' }}>{title}</h3>
        <div className="job-basic-info-grid">
          {/* Row 1 */}
          <div className="grid-cell grid-col-1 grid-row-1">
            {fieldMap['grid-col-1 grid-row-1'] && renderField(fieldMap['grid-col-1 grid-row-1'])}
          </div>
          <div className="grid-cell grid-col-2 grid-row-1">
            {fieldMap['grid-col-2 grid-row-1'] && renderField(fieldMap['grid-col-2 grid-row-1'])}
          </div>
          <div className="grid-cell grid-col-3 grid-row-1">
            <div className="min-max-container">
              {fieldMap['minValue'] && renderField(fieldMap['minValue'])}
              {fieldMap['maxValue'] && renderField(fieldMap['maxValue'])}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid-cell grid-col-1 grid-row-2">
            {fieldMap['grid-col-1 grid-row-2'] && renderField(fieldMap['grid-col-1 grid-row-2'])}
          </div>
          <div className="grid-cell grid-col-2 grid-row-2">
            {fieldMap['grid-col-2 grid-row-2'] && renderField(fieldMap['grid-col-2 grid-row-2'])}
          </div>
          <div className="grid-cell grid-col-3 grid-row-2">
            {fieldMap['grid-col-3 grid-row-2'] && renderField(fieldMap['grid-col-3 grid-row-2'])}
          </div>

          {/* Row 3 */}
          <div className="grid-cell grid-col-1 grid-row-3">
            {fieldMap['grid-col-1 grid-row-3'] && renderField(fieldMap['grid-col-1 grid-row-3'])}
          </div>
          <div className="grid-cell grid-col-2 grid-row-3">
            {fieldMap['grid-col-2 grid-row-3'] && renderField(fieldMap['grid-col-2 grid-row-3'])}
          </div>
          <div className="grid-cell grid-col-3 grid-row-3">
            {fieldMap['grid-col-3 grid-row-3'] && renderField(fieldMap['grid-col-3 grid-row-3'])}
          </div>

          {/* Row 4 */}
          <div className="grid-cell grid-col-1 grid-row-4">
            {fieldMap['grid-col-1 grid-row-4'] && renderField(fieldMap['grid-col-1 grid-row-4'])}
          </div>
          <div className="grid-cell grid-col-2 grid-row-4">
            {fieldMap['grid-col-2 grid-row-4'] && renderField(fieldMap['grid-col-2 grid-row-4'])}
          </div>
          <div className="grid-cell grid-col-3 grid-row-4">
            {fieldMap['grid-col-3 grid-row-4'] && renderField(fieldMap['grid-col-3 grid-row-4'])}
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
    <div className="reusable-form-page">
      <h1>{config.title}</h1>
      <MultiStepForm steps={enhancedSteps} onSubmit={handleSubmit} validationErrors={validationErrors} />
    </div>
  );
};

export default ReusableForm;