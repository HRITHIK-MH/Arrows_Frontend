import axios from 'axios';
import React, { useState, useMemo, useCallback } from 'react';
import { validateMandatoryField } from '../../utils/formValidation';
import FormField from './FormField';
import MultiStepForm from './MultiStepForm';
import API from '../../api/axiosConfig';
import './ReusableForm.css';

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

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const normalizeToken = (value) => normalizeText(value).toLowerCase();

const toArray = (value) => (Array.isArray(value) ? value : []);

const uniqueValues = (items) => [...new Set(items.filter(Boolean))];

const mergeUnique = (existing, incoming) => uniqueValues([...toArray(existing), ...toArray(incoming)]);

const findMatchingOptionValue = (text, options = []) => {
  const normalized = normalizeToken(text);
  if (!normalized) return '';

  const matched = options.find((option) => {
    const label = normalizeToken(option?.label ?? option?.value);
    const value = normalizeToken(option?.value);
    return (label && normalized.includes(label)) || (value && normalized.includes(value));
  });

  return matched?.value || '';
};

const collectMatchingOptionValues = (text, options = []) => {
  const normalized = normalizeToken(text);
  if (!normalized) return [];

  return uniqueValues(
    options
      .filter((option) => {
        const label = normalizeToken(option?.label ?? option?.value);
        const value = normalizeToken(option?.value);
        return (label && normalized.includes(label)) || (value && normalized.includes(value));
      })
      .map((option) => option?.value)
  );
};

const readDocxText = async (file) => {
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return normalizeText(result?.value || '');
};

const readUploadedFileText = async (file) => {
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase();

  if (extension === 'docx') {
    return readDocxText(file);
  }

  if (extension === 'txt' || extension === 'doc') {
    return normalizeText(await file.text());
  }

  return '';
};

// Reusable step component
const FormStep = ({ formData, onChange, fields, title, onSetStepFields, validationErrors = {}, disabled = false }) => {
  const isJobBasicInfo = title === "Job Basic Information" || title === "Job Information";
  const fieldMetaSignatureRef = React.useRef('');
  const jdParsedFileRef = React.useRef('');
  const [jdExtractionStatus, setJdExtractionStatus] = React.useState({ state: 'idle', message: '' });
  const [jdGenerationLoading, setJdGenerationLoading] = React.useState(false);
  const [jdGenerationError, setJdGenerationError] = React.useState('');

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

  React.useEffect(() => {
    if (!isJobBasicInfo) return;

    const clientIdField = fields.find((field) => field.name === "clientId");
    const selectedClientId = formData.clientId;
    if (!clientIdField || !Array.isArray(clientIdField.options) || !selectedClientId) {
      return;
    }

    const matchedClient = clientIdField.options.find(
      (option) => String(option.value) === String(selectedClientId)
    );
    const mappedClientName = matchedClient?.clientName || matchedClient?.name || "";

    if (mappedClientName && mappedClientName !== formData.clientName) {
      onChange("clientName", mappedClientName);
    }
  }, [fields, formData.clientId, formData.clientName, isJobBasicInfo, onChange]);

  const handleGenerateJD = React.useCallback(async () => {
    if (!isJobBasicInfo) return;

    const positionName = normalizeText(formData.positionName || '');
    const minExperience = normalizeText(formData.minExperience || '');
    const maxExperience = normalizeText(formData.maxExperience || '');

    if (!positionName) {
      setJdGenerationError('Please enter a position name before generating JD');
      return;
    }

    setJdGenerationLoading(true);
    setJdGenerationError('');

    try {
      const payload = {
        positionName,
        minExperience: minExperience ? parseInt(minExperience, 10) : undefined,
        maxExperience: maxExperience ? parseInt(maxExperience, 10) : undefined,
      };

      const candidateEndpoints = ['/extendedb-ai/generate-jd', '/jobs/generate-jd'];
      let response = null;

      for (const endpoint of candidateEndpoints) {
        try {
          response = await API.post(endpoint, payload, {
            skipAuthRedirect: true,
          });
          break;
        } catch (requestError) {
          const statusCode = requestError?.response?.status;
          const isRecoverable = statusCode === 404 || statusCode === 405;
          if (!isRecoverable || endpoint === candidateEndpoints[candidateEndpoints.length - 1]) {
            throw requestError;
          }
        }
      }

      const generatedJD =
        response?.data?.description ||
        response?.data?.jdDescription ||
        response?.data?.jobDescription ||
        response?.data?.content ||
        '';
      if (generatedJD) {
        onChange('jdDescription', generatedJD);
        setJdGenerationError('');
      } else {
        setJdGenerationError('Failed to generate JD: No description returned');
      }
    } catch (error) {
      console.error('Error generating JD:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to generate JD';
      setJdGenerationError(errorMsg);
    } finally {
      setJdGenerationLoading(false);
    }
  }, [formData.positionName, formData.minExperience, formData.maxExperience, isJobBasicInfo, onChange]);

  React.useEffect(() => {
    if (!isJobBasicInfo) return;

    const jdTemplateMode = formData.jdTemplateMode || 'manual';
    if (jdTemplateMode === 'manual') {
      // Clear auto-filled fields when switching to manual mode (No)
      const fieldsToClear = [
        'positionName',
        'minExperience',
        'maxExperience',
        'noOfPositions',
        'location',
        'positionLevel',
        'jobType',
        'hiringType',
        'technicalSkills',
        'softSkills',
        'additionalSkills',
        'jdAttachment'
      ];

      fieldsToClear.forEach(field => {
        const currentValue = formData[field];
        // Only clear if field has a value
        if (currentValue) {
          if (Array.isArray(currentValue)) {
            onChange(field, []);
          } else {
            onChange(field, '');
          }
        }
      });

      setJdExtractionStatus({ state: 'idle', message: '' });
      jdParsedFileRef.current = '';
    }
  }, [formData.jdTemplateMode, isJobBasicInfo, onChange]);

  React.useEffect(() => {
    if (!isJobBasicInfo) return;

    const jdTemplateMode = formData.jdTemplateMode || 'manual';
    if (jdTemplateMode !== 'template') {
      setJdExtractionStatus({ state: 'idle', message: '' });
      return;
    }

    const uploadedFile = formData.jdAttachment;
    if (!uploadedFile || typeof uploadedFile !== 'object') {
      setJdExtractionStatus({ state: 'idle', message: '' });
      return;
    }

    const fileKey = `${uploadedFile.name || ''}-${uploadedFile.size || 0}-${uploadedFile.lastModified || 0}`;
    if (jdParsedFileRef.current === fileKey) {
      return;
    }

    let isCancelled = false;

    const parseAndPopulate = async () => {
      try {
        setJdExtractionStatus({ state: 'loading', message: 'Reading JD and extracting fields...' });

        const fileNameWithoutExt = normalizeText(String(uploadedFile.name || '').replace(/\.[^.]+$/, ''));
        const extractedText = await readUploadedFileText(uploadedFile);
        const combinedText = normalizeText(`${fileNameWithoutExt} ${extractedText}`);
        const normalizedText = normalizeToken(combinedText);

        const updates = {};

        let positionMatch = combinedText.match(/(?:position\s*name|job\s*title|role)\s*[:\-]\s*([^:\n\r,]+)/i)?.[1];
        if (positionMatch) {
          // Stop at common adjacent field labels (e.g. "Min Experience", "Max Experience", "Experience")
          positionMatch = positionMatch.replace(/\s*(?:min(?:imum)?|max(?:imum)?)\s*(?:experience|exp)?.*$/i, '').trim();
          positionMatch = positionMatch.replace(/\s*experience\b.*$/i, '').trim();
          // Limit to first 4 words and 100 chars
          positionMatch = positionMatch.split(/\s+/).slice(0, 4).join(' ').substring(0, 100);
        }
        positionMatch = positionMatch || fileNameWithoutExt;

        if (positionMatch && !normalizeText(formData.positionName)) {
          updates.positionName = normalizeText(positionMatch);
        }

        const rangeMatch = normalizedText.match(/(\d{1,2})\s*(?:to|\-|–)\s*(\d{1,2})\s*(?:years|year|yrs|yr)/i);
        const minMatch = normalizedText.match(/(?:minimum|min)\s*(?:experience)?\s*[:\-]?\s*(\d{1,2})/i);
        const maxMatch = normalizedText.match(/(?:maximum|max)\s*(?:experience)?\s*[:\-]?\s*(\d{1,2})/i);

        const minExperience = rangeMatch?.[1] || minMatch?.[1] || '';
        const maxExperience = rangeMatch?.[2] || maxMatch?.[1] || '';

        if (minExperience && !normalizeText(formData.minExperience)) {
          updates.minExperience = minExperience;
        }
        if (maxExperience && !normalizeText(formData.maxExperience)) {
          updates.maxExperience = maxExperience;
        }

        const openingsMatch = normalizedText.match(/(?:positions?|openings?)\s*[:\-]?\s*(\d{1,3})/i);
        if (openingsMatch?.[1] && !normalizeText(formData.noOfPositions)) {
          updates.noOfPositions = openingsMatch[1];
        }

        if (!normalizeText(formData.jobReceivedDate)) {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          updates.jobReceivedDate = `${yyyy}-${mm}-${dd}`;
        }

        const locationField = fields.find((field) => field.name === 'location');
        const locationValue = findMatchingOptionValue(normalizedText, locationField?.options || []);
        if (locationValue && !normalizeText(formData.location)) {
          updates.location = locationValue;
        }

        const positionLevelField = fields.find((field) => field.name === 'positionLevel');
        const positionLevelValue = findMatchingOptionValue(normalizedText, positionLevelField?.options || []);
        if (positionLevelValue && !normalizeText(formData.positionLevel)) {
          updates.positionLevel = positionLevelValue;
        }

        const jobTypeField = fields.find((field) => field.name === 'jobType');
        const jobTypeValue = findMatchingOptionValue(normalizedText, jobTypeField?.options || []);
        if (jobTypeValue && !normalizeText(formData.jobType)) {
          updates.jobType = jobTypeValue;
        }

        const hiringTypeField = fields.find((field) => field.name === 'hiringType');
        const hiringTypeValue = findMatchingOptionValue(normalizedText, hiringTypeField?.options || []);
        if (hiringTypeValue && !normalizeText(formData.hiringType)) {
          updates.hiringType = hiringTypeValue;
        }

        const technicalField = fields.find((field) => field.name === 'technicalSkills');
        const extractedTechnicalSkills = collectMatchingOptionValues(normalizedText, technicalField?.options || []);
        if (extractedTechnicalSkills.length > 0) {
          updates.technicalSkills = mergeUnique(formData.technicalSkills, extractedTechnicalSkills);
        }

        const softField = fields.find((field) => field.name === 'softSkills');
        const extractedSoftSkills = collectMatchingOptionValues(normalizedText, softField?.options || []);
        if (extractedSoftSkills.length > 0) {
          updates.softSkills = mergeUnique(formData.softSkills, extractedSoftSkills);
        }

        if (fileNameWithoutExt) {
          const existingAdditionalSkills = normalizeText(formData.additionalSkills);
          if (!existingAdditionalSkills) {
            updates.additionalSkills = `Extracted from ${uploadedFile.name}`;
          }
        }

        if (isCancelled) return;

        Object.entries(updates).forEach(([key, value]) => {
          onChange(key, value);
        });

        const extension = String(uploadedFile.name || '').split('.').pop()?.toLowerCase();
        const unsupportedExtraction = extension === 'pdf';
        const fieldCount = Object.keys(updates).length;
        if (fieldCount > 0) {
          const note = unsupportedExtraction ? ' PDF text extraction is limited; mapped what was detectable.' : '';
          setJdExtractionStatus({ state: 'success', message: `${fieldCount} field(s) auto-filled from uploaded JD.${note}` });
        } else if (unsupportedExtraction) {
          setJdExtractionStatus({ state: 'warning', message: 'PDF upload detected. Direct text extraction is limited in current setup.' });
        } else {
          setJdExtractionStatus({ state: 'warning', message: 'JD uploaded, but no matching values were detected for form fields.' });
        }

        jdParsedFileRef.current = fileKey;
      } catch (error) {
        if (isCancelled) return;
        setJdExtractionStatus({ state: 'error', message: 'Unable to parse this file. Try DOCX or TXT format.' });
      }
    };

    parseAndPopulate();

    return () => {
      isCancelled = true;
    };
  }, [
    fields,
    formData.additionalSkills,
    formData.hiringType,
    formData.jdAttachment,
    formData.jdTemplateMode,
    formData.jobType,
    formData.location,
    formData.maxExperience,
    formData.minExperience,
    formData.noOfPositions,
    formData.positionLevel,
    formData.positionName,
    formData.softSkills,
    formData.technicalSkills,
    isJobBasicInfo,
    onChange
  ]);

  const renderField = (field) => {
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
        disabled={disabled || Boolean(field.disabled)}
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
    });

    const getField = (name) => (fieldMap[name] ? renderField(fieldMap[name]) : null);
    const getFirstAvailableField = (keys, predicate) => {
      for (const key of keys) {
        if (fieldMap[key]) {
          return renderField(fieldMap[key]);
        }
      }
      if (typeof predicate === 'function') {
        const matchedField = fields.find(predicate);
        if (matchedField) {
          return renderField(matchedField);
        }
      }
      return null;
    };

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

    const technicalSkillsOptions = Array.isArray(fieldMap.technicalSkills?.options)
      ? fieldMap.technicalSkills.options
      : [];

    const fallbackAddTechnicalOptions = technicalSkillsOptions.length
      ? technicalSkillsOptions
      : [
        { value: 'machine-learning', label: 'Machine Learning' },
        { value: 'deep-learning', label: 'Deep Learning' },
        { value: 'nlp', label: 'NLP' },
        { value: 'data-science', label: 'Data Science' },
        { value: 'computer-vision', label: 'Computer Vision' },
        { value: 'azure', label: 'Microsoft Azure' }
      ];

    const addTechnicalConfig =
      fieldMap.addTechnicalSkills ||
      fieldMap.addTechnicalSkill ||
      fieldMap.additionalTechnicalSkills ||
      fieldMap['grid-col-1 grid-row-6'] ||
      fields.find((field) => {
        const fieldName = String(field?.name || '').toLowerCase();
        const fieldLabel = String(field?.label || '').toLowerCase();
        return (
          field?.cssClass?.includes('grid-row-6') ||
          fieldName.includes('addtechnical') ||
          (fieldName.includes('technical') && fieldName.includes('additional')) ||
          (fieldLabel.includes('add') && fieldLabel.includes('technical'))
        );
      }) ||
      {
        name: 'extraTechnicalSkills',
        label: 'Add Technical Skill',
        type: 'multiselect',
        required: false
      };

    const addTechnicalFieldName = addTechnicalConfig.name || 'extraTechnicalSkills';
    const addTechnicalFieldOptions = Array.isArray(addTechnicalConfig.options) && addTechnicalConfig.options.length
      ? addTechnicalConfig.options
      : fallbackAddTechnicalOptions;
    const normalizedAddTechnicalConfig = {
      ...addTechnicalConfig,
      name: addTechnicalFieldName,
      label: addTechnicalConfig.label || 'Add Technical Skill',
      type: 'multiselect',
      required: Boolean(addTechnicalConfig.required),
      options: addTechnicalFieldOptions,
      placeholder: addTechnicalConfig.placeholder || 'Select skills'
    };

    const jdTemplateMode = formData.jdTemplateMode || 'manual';
    const showJdAttachmentField = jdTemplateMode === 'template';
    const jdTemplateModeError = validationErrors.jdTemplateMode;

    return (
      <div className="job-basic-info-step">
        <div className="job-section">
          <div className="job-section-header">
            <h3 className="job-section-title">Job Details</h3>
            <div className="job-section-divider" />
          </div>

          <div className="job-template-row">
            <div className="job-template-choice">
              <div className="job-template-choice-label">
                Have JD Template?
                <span className="required-star">*</span>
              </div>
              <div className="job-template-choice-options" role="radiogroup">
                <label className="job-template-choice-option" htmlFor="jdTemplateMode">
                  <input
                    id="jdTemplateMode"
                    type="radio"
                    name="jdTemplateMode"
                    value="manual"
                    checked={jdTemplateMode === 'manual'}
                    onChange={() => onChange('jdTemplateMode', 'manual')}
                    disabled={disabled}
                  />
                  <span>No</span>
                </label>
                <label className="job-template-choice-option" htmlFor="jdTemplateMode-template">
                  <input
                    id="jdTemplateMode-template"
                    type="radio"
                    name="jdTemplateMode"
                    value="template"
                    checked={jdTemplateMode === 'template'}
                    onChange={() => onChange('jdTemplateMode', 'template')}
                    disabled={disabled}
                  />
                  <span>Yes</span>
                </label>
              </div>
              {jdTemplateModeError ? <div className="error-text">{jdTemplateModeError}</div> : null}
              {showJdAttachmentField ? (
                <div className="job-template-upload-wrap">
                  {getField('jdAttachment')}
                  {jdExtractionStatus.state !== 'idle' ? (
                    <div className={`jd-extraction-status jd-extraction-status--${jdExtractionStatus.state}`}>
                      {jdExtractionStatus.message}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
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
              <div className="jd-description-wrapper">
                <label className="form-label">
                  JD Description
                </label>
                <textarea
                  className="jd-description-textarea"
                  name="jdDescription"
                  value={formData.jdDescription || ''}
                  onChange={(e) => onChange('jdDescription', e.target.value)}
                  placeholder="Enter or generate JD description"
                  rows="4"
                  disabled={disabled}
                />
                <button
                  type="button"
                  className="generate-jd-button"
                  onClick={handleGenerateJD}
                  disabled={disabled || jdGenerationLoading}
                >
                  {jdGenerationLoading ? 'Generating...' : 'Generate JD'}
                </button>
                {jdGenerationError && (
                  <div className="jd-generation-error">
                    {jdGenerationError}
                  </div>
                )}
              </div>
            </div>

            <div className="grid-cell grid-col-1 grid-row-5">
              {getField('technicalSkills')}
              <div className="stacked-field-below">

                {renderField(normalizedAddTechnicalConfig)}
              </div>
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

  const formConfig = useMemo(() => createFormConfig(config), [config]);

  React.useEffect(() => {
    setValidationErrors({});
  }, [initialData, config]);

  // Create validation functions
  const createValidationFunction = useCallback((ruleName) => {
    const rule = config.validationRules?.[ruleName];
    if (!rule) return null;

    return async (value, fieldName, formData) => {
      try {
        const result = await rule(value, fieldName, formData);
        if (result && typeof result === 'object' && 'isValid' in result) {
          return result;
        }
        return { isValid: true };
      } catch (error) {
        if (error && typeof error === 'object' && 'isValid' in error) {
          return error;
        }
        return { isValid: false, message: 'Validation failed' };
      }
    };
  }, [config.validationRules]);

  // Handle validation - persist errors until field value is valid
  const handleValidation = useCallback((fieldName, result) => {
    setValidationErrors(prev => {
      const updatedErrors = { ...prev };

      if (result.isValid) {
        // Only clear error if field is actually valid
        delete updatedErrors[fieldName];
      } else {
        // Set error message and keep it
        updatedErrors[fieldName] = result.message;
      }

      return updatedErrors;
    });
  }, []);

  // Enhanced steps with validation
  const enhancedSteps = useMemo(() => {
    return formConfig.steps.map((step, index) => {
      const configStep = config.steps[index];
      const stepFields = configStep?.fields || [];
      const stepFieldsWithValidation = stepFields.map(field => ({
        ...field,
        validate: field.validationRule ? createValidationFunction(field.validationRule) : field.validate || null,
        onValidation: handleValidation
      }));

      return {
        title: step.title,
        skipValidation: Boolean(configStep?.skipValidation),
        fields: stepFieldsWithValidation,
        component: step.component || FormStep,
        componentProps: {
          fields: stepFieldsWithValidation,
          validationErrors: validationErrors,
          disabled: readOnly
        }
      };
    });
  }, [formConfig, config.steps, createValidationFunction, handleValidation, validationErrors, readOnly]);

  const resolveFieldValue = useCallback((data, fieldName) => {
    if (data && data[fieldName] !== undefined) {
      return data[fieldName];
    }

    if (["primarySkill", "skillExperienceLevel", "skillLastUsed"].includes(fieldName)) {
      return data?.skills?.[0]?.[fieldName];
    }

    return data?.[fieldName];
  }, []);

  // Validate all mandatory fields at once
  const validateAllMandatoryFields = async (data, fields) => {
    const errors = {};

    const validationResults = await Promise.all(
      fields.map(async (field) => {
        if (!field.required && !field.validationRule) {
          return null;
        }

        if (field.validationRule) {
          const validateFn = createValidationFunction(field.validationRule);
          if (!validateFn) return null;
          const result = await validateFn(resolveFieldValue(data, field.name), field.name, data);
          return { field, result };
        }

        if (field.required) {
          const result = await validateMandatoryField(
            resolveFieldValue(data, field.name),
            field.name,
            field.label
          );
          return { field, result };
        }

        return null;
      })
    );

    validationResults.forEach((item) => {
      if (!item) return;
      const { field, result } = item;
      if (result && !result.isValid) {
        errors[result.fieldName || field.name] = result.message;
      }
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (formData) => {
    const itemLabel = String(config.itemName || 'Form').toLowerCase();

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

      if (config.submitRequest) {
        await config.submitRequest(formData);
      } else if (config.submitEndpoint) {
        await axios.post(config.submitEndpoint, formData);
      }

      // Call the onSubmit callback if provided
      onSubmit?.(formData);

      // Handle successful submission
      console.log(`${config.itemName || 'Form'} submitted successfully`);
    } catch (error) {
      console.error(`Error submitting ${itemLabel}:`, error);

      // For development purposes, treat as success if it's a network error (no backend)
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.log('No backend server available, treating as successful submission for development');
        onSubmit?.(formData);
      } else {
        alert(`Error submitting ${itemLabel}. Please try again.`);
        return;
      }
    }
  };

  // Validate fields on a specific step and update error state to show errors
  const validateStepFields = async (stepIndex, data) => {
    console.log(`[ReusableForm] validateStepFields called for step ${stepIndex}`);
    const stepFields = config.steps[stepIndex]?.fields || [];
    const updatedErrors = { ...validationErrors };
    const missingFields = [];
    const missingNames = [];
    const invalidFields = [];
    const invalidNames = [];

    const isEmptyValue = (value) =>
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    const fieldResults = await Promise.all(
      stepFields.map(async (field) => {
        const value = resolveFieldValue(data, field.name);
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

        return { field, fieldLabel, value, result };
      })
    );

    fieldResults.forEach(({ field, fieldLabel, value, result }) => {
      if (!result) return;

      if (!result.isValid) {
        updatedErrors[field.name] = result.message;
        console.log(`[validateStepFields] Setting error for ${field.name}: ${result.message}`);

        if (field.required && isEmptyValue(value)) {
          missingFields.push(fieldLabel);
          missingNames.push(field.name);
        } else {
          invalidFields.push(fieldLabel);
          invalidNames.push(field.name);
        }
      } else if (updatedErrors[field.name]) {
        delete updatedErrors[field.name];
        console.log(`[validateStepFields] Clearing error for ${field.name}`);
      }
    });

    // Update validation errors state all at once
    setValidationErrors(updatedErrors);
    console.log(`[validateStepFields] Final validation errors:`, updatedErrors);

    return {
      isValid: missingFields.length === 0 && invalidFields.length === 0,
      errors: updatedErrors,
      missingFields,
      missingNames,
      invalidFields,
      invalidNames
    };
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
