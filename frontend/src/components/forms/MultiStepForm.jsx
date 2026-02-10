import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import './MultiStepForm.css';

const MultiStepForm = ({
  steps,
  onSubmit,
  validationErrors = {},
  onValidateStep,
  showDraftAction = false,
  draftLabel = "Save as Draft",
  onSaveDraft,
  submitLabel = "Submit",
  hideStepper = false,
  initialData = null,
  readOnly = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => initialData || {});
  const [stepFields, setStepFields] = useState({});

  const normalizeLabel = (label, fallback) => {
    if (!label) return fallback;
    return label.replace('*', '').trim() || fallback;
  };

  const getStepIssues = (stepIndex) => {
    const currentStepFields = stepFields[stepIndex] || [];

    if (currentStepFields.length === 0) {
      return { missing: [], invalid: [] };
    }

    return currentStepFields.reduce(
      (acc, field) => {
        const fieldName = typeof field === 'string' ? field : field.name;
        const fieldLabel = normalizeLabel(
          typeof field === 'string' ? field : field.label,
          fieldName
        );
        const isRequired = typeof field === 'string' ? true : field.required;
        const value = formData[fieldName];
        const hasError = validationErrors[fieldName];

        const hasValue =
          value !== undefined &&
          value !== null &&
          value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true);

        if (isRequired && !hasValue) {
          acc.missing.push(fieldLabel);
        } else if (hasError) {
          acc.invalid.push(fieldLabel);
        }

        return acc;
      },
      { missing: [], invalid: [] }
    );
  };

  const showStepWarning = (stepIndex) => {
    if (steps[stepIndex]?.skipValidation) {
      return;
    }
    const { missing, invalid } = getStepIssues(stepIndex);
    if (missing.length === 0 && invalid.length === 0) {
      return;
    }

    const lines = [];
    if (missing.length) {
      lines.push(`Missing: ${missing.join(', ')}`);
    }
    if (invalid.length) {
      lines.push(`Invalid: ${invalid.join(', ')}`);
    }
    window.alert(lines.join('\n'));
  };

  const validateCurrentStep = (stepIndex) => {
    if (steps[stepIndex]?.skipValidation) {
      return true;
    }
    const { missing, invalid } = getStepIssues(stepIndex);
    return missing.length === 0 && invalid.length === 0;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Trigger validation for the current step fields
      if (onValidateStep && !steps[currentStep]?.skipValidation) {
        onValidateStep(currentStep, formData);
      }
      
      // Check if current step is valid before proceeding
      if (validateCurrentStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      } else {
        showStepWarning(currentStep);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field, value) => {
    console.log(`[MultiStepForm.handleChange] field=${field}, value=`, value, 'typeof=', typeof value, 'isArray=', Array.isArray(value));
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      console.log('[MultiStepForm.handleChange] next formData preview:', next);
      return next;
    });
  };

  const handleSetStepFields = (fields) => {
    setStepFields(prev => ({
      ...prev,
      [currentStep]: fields
    }));
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (currentStep < steps.length - 1) {
      handleNext();
      return;
    }
    // Check if current step is valid before submitting
    if (validateCurrentStep(currentStep)) {
      onSubmit(formData);
    } else {
      showStepWarning(currentStep);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  const getStepState = (index) => {
    if (index < currentStep) return 'complete';
    if (index === currentStep) return 'active';
    return 'upcoming';
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(formData);
    }
  };


  return (
    <div className="multi-step-form">
      {!hideStepper && (
        <div className="step-indicator">
          {steps.map((step, index) => {
            const state = getStepState(index);
            return (
              <div
                key={index}
                className={`step ${state}`}
                aria-current={state === 'active' ? 'step' : undefined}
              >
                <span className="step-circle" aria-hidden="true">
                  {state === 'complete' ? (
                    <FiCheck className="step-check" aria-hidden="true" />
                  ) : state === 'active' ? (
                    <span className="step-number">{index + 1}</span>
                  ) : (
                    <span className="step-dot" />
                  )}
                </span>
                <span className="step-label">{step.title || `Step ${index + 1}`}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="multi-step-form-body">
        <div className="form-step-scroll">
          <CurrentStepComponent 
            formData={formData} 
            onChange={handleChange} 
            onSetStepFields={handleSetStepFields}
            validationErrors={validationErrors}
          />
        </div>
        <div className="form-buttons">
          {showDraftAction && (
            <button
              type="button"
              className="form-btn secondary"
              onClick={handleSaveDraft}
            >
              {draftLabel}
            </button>
          )}
          <div className="form-buttons-right">
            {currentStep > 0 && (
            <button
              type="button"
              className="form-btn secondary"
              onClick={handlePrev}
              disabled={readOnly}
            >
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className="form-btn primary"
              onClick={handleNext}
              disabled={readOnly}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className="form-btn primary"
              onClick={handleSubmit}
              disabled={readOnly}
            >
              {submitLabel}
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
