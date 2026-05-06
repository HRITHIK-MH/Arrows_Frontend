import axios from 'axios';
import React, { useState, useMemo, useCallback } from 'react';
import { validateMandatoryField } from '../../utils/formValidation';
import FormField from './FormField';
import MultiStepForm from './MultiStepForm';
import './ReusableForm.css';

const DRAFT_STORAGE_PREFIX = 'reusable-form-draft';

const getDraftStorageKey = (config) => {
  const formIdentity =
    config?.draftKey ||
    config?.itemName ||
    config?.title ||
    config?.submitEndpoint ||
    'form';

  return `${DRAFT_STORAGE_PREFIX}:${String(formIdentity).toLowerCase().replace(/\s+/g, '-')}`;
};

const sanitizeDraftData = (value) => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDraftData(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    };
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return {
      size: value.size,
      type: value.type,
    };
  }

  if (typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      acc[key] = sanitizeDraftData(val);
      return acc;
    }, {});
  }

  return value;
};

const loadDraftData = (draftStorageKey) => {
  if (typeof window === 'undefined') return null;

  try {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) return null;

    const parsed = JSON.parse(rawDraft);
    if (parsed && typeof parsed === 'object' && parsed.data && typeof parsed.data === 'object') {
      return parsed.data;
    }

    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    console.error('Failed to load draft data:', error);
    return null;
  }
};

// Reusable form configuration
const createFormConfig = (config) => {
  const allFields = config.steps.flatMap((configStep) => configStep.fields || []);

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
            allFields={allFields}
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
const FormStep = ({ formData, onChange, fields, allFields = fields, title, onSetStepFields, validationErrors = {}, disabled = false }) => {
  const isJobBasicInfo = title === "Job Basic Information" || title === "Job Information";
  const fieldMetaSignatureRef = React.useRef('');
  const jdParsedFileRef = React.useRef('');
  const [jdExtractionStatus, setJdExtractionStatus] = React.useState({ state: 'idle', message: '' });

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
  }, [fields, formData.clientId, formData.clientName, onChange]);

  React.useEffect(() => {
    if (!isJobBasicInfo) return;

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

        const extractedText = await readUploadedFileText(uploadedFile);
        const fileNameWithoutExt = normalizeText(String(uploadedFile.name || '').replace(/\.[^.]+$/, ''));
        const documentText = normalizeText(extractedText);
        const combinedText = normalizeText(`${fileNameWithoutExt} ${documentText}`);
        const normalizedText = normalizeToken(combinedText);

        const updates = {};
        const availableFields = Array.isArray(allFields) && allFields.length ? allFields : fields;
        const getAvailableField = (fieldName) =>
          availableFields.find((field) => field.name === fieldName);
        const extractLabelValue = (labels, stopLabels = []) => {
          const labelPattern = labels.map((label) => label.replace(/\s+/g, '\\s*')).join('|');
          const stopLabelPattern = [
            ...stopLabels,
            'job\\s*name',
            'position\\s*name',
            'job\\s*title',
            'role',
            'client\\s*id',
            'client\\s*name',
            'contact\\s*person\\s*name',
            'contact\\s*person\\s*email(?:\\s*id)?',
            'contact\\s*email(?:\\s*id)?',
            'position\\s*level',
            'location',
            'job\\s*type',
            'employment\\s*type',
            'work\\s*type',
            'hiring\\s*type',
            'positions?',
            'openings?',
            'min(?:imum)?\\s*(?:experience|exp|salary|ctc)',
            'max(?:imum)?\\s*(?:experience|exp|salary|ctc)',
            'salary',
            'ctc',
            'technical\\s*skills?',
            'soft\\s*skills?',
            'additional\\s*skills?'
          ].join('|');
          const match = documentText.match(
            new RegExp(`(?:${labelPattern})\\s*[:\\-]\\s*(.+?)(?=\\s+(?:${stopLabelPattern})\\s*[:\\-]|$)`, 'i')
          );
          return normalizeText(match?.[1] || '');
        };

        let positionMatch = documentText.match(
          /(?:job\s*name|position\s*name|job\s*title|role)\s*[:\-]\s*(.+?)(?=\s+(?:position\s*level|location|job\s*type|employment\s*type|work\s*type|hiring\s*type|positions?|openings?|min(?:imum)?\s*(?:experience|exp|salary|ctc)|max(?:imum)?\s*(?:experience|exp|salary|ctc)|salary|ctc|technical\s*skills?|soft\s*skills?|additional\s*skills?)\s*[:\-]|$)/i
        )?.[1];
        if (positionMatch) {
          // Stop at common adjacent field labels (e.g. "Min Experience", "Max Experience", "Experience")
          positionMatch = positionMatch.replace(/\s*(?:min(?:imum)?|max(?:imum)?)\s*(?:experience|exp)?.*$/i, '').trim();
          positionMatch = positionMatch.replace(/\s*experience\b.*$/i, '').trim();
          // Limit to first 4 words and 100 chars
          positionMatch = positionMatch.split(/\s+/).slice(0, 4).join(' ').substring(0, 100);
        }

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

        const normalizeSalaryNumber = (value) => {
          const raw = String(value || '').replace(/,/g, '').trim();
          if (!raw) return '';
          const parsed = Number.parseFloat(raw);
          if (!Number.isFinite(parsed)) return '';
          return String(Math.round(parsed));
        };

        const salaryRangeMatch = combinedText.match(
          /(?:salary|ctc|compensation|package)\s*(?:range)?\s*[:\-]?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:to|\-|–)\s*(\d[\d,]*(?:\.\d+)?)/i
        );
        const minSalaryMatch = combinedText.match(
          /(?:min(?:imum)?\s*(?:salary|ctc|compensation|package)|(?:salary|ctc)\s*min)\s*[:\-]?\s*(\d[\d,]*(?:\.\d+)?)/i
        );
        const maxSalaryMatch = combinedText.match(
          /(?:max(?:imum)?\s*(?:salary|ctc|compensation|package)|(?:salary|ctc)\s*max)\s*[:\-]?\s*(\d[\d,]*(?:\.\d+)?)/i
        );

        const minSalary = normalizeSalaryNumber(salaryRangeMatch?.[1] || minSalaryMatch?.[1]);
        const maxSalary = normalizeSalaryNumber(salaryRangeMatch?.[2] || maxSalaryMatch?.[1]);

        if (minSalary && !normalizeText(formData.minSalary)) {
          updates.minSalary = minSalary;
        }
        if (maxSalary && !normalizeText(formData.maxSalary)) {
          updates.maxSalary = maxSalary;
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

        const locationField = getAvailableField('location');
        const locationValues = collectMatchingOptionValues(normalizedText, locationField?.options || []);
        if (locationValues.length > 0 && !normalizeText(formData.location)) {
          updates.location = locationValues;
        }

        const positionLevelField = getAvailableField('positionLevel');
        const positionLevelValue = findMatchingOptionValue(normalizedText, positionLevelField?.options || []);
        if (positionLevelValue && !normalizeText(formData.positionLevel)) {
          updates.positionLevel = positionLevelValue;
        }

        const jobTypeField = getAvailableField('jobType');
        const jobTypeValue = findMatchingOptionValue(normalizedText, jobTypeField?.options || []);
        if (jobTypeValue && !normalizeText(formData.jobType)) {
          updates.jobType = jobTypeValue;
        }

        const hiringTypeField = getAvailableField('hiringType');
        const hiringTypeValue = findMatchingOptionValue(normalizedText, hiringTypeField?.options || []);
        if (hiringTypeValue && !normalizeText(formData.hiringType)) {
          updates.hiringType = hiringTypeValue;
        }

        const clientIdField = getAvailableField('clientId');
        const clientIdValue = findMatchingOptionValue(normalizedText, clientIdField?.options || []);
        if (clientIdValue && !normalizeText(formData.clientId)) {
          updates.clientId = clientIdValue;
        }

        const matchedClientOption = clientIdField?.options?.find(
          (option) => String(option.value) === String(clientIdValue || formData.clientId)
        );
        const clientNameFromLabel = extractLabelValue(['client\\s*name']);
        const clientNameFromOption = matchedClientOption?.clientName || matchedClientOption?.name || '';
        const clientName = clientNameFromLabel || clientNameFromOption;
        if (clientName && !normalizeText(formData.clientName)) {
          updates.clientName = clientName;
        }

        const contactPersonName = extractLabelValue([
          'contact\\s*person\\s*name',
          'contact\\s*name'
        ]);
        if (contactPersonName && !normalizeText(formData.contactPersonName)) {
          updates.contactPersonName = contactPersonName;
        }

        const contactEmail = documentText.match(
          /(?:contact\s*person\s*email(?:\s*id)?|contact\s*email(?:\s*id)?|email)\s*[:\-]\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i
        )?.[1];
        if (contactEmail && !normalizeText(formData.contactPersonEmail)) {
          updates.contactPersonEmail = contactEmail;
        }

        const technicalField = getAvailableField('technicalSkills');
        const extractedTechnicalSkills = collectMatchingOptionValues(normalizedText, technicalField?.options || []);
        if (extractedTechnicalSkills.length > 0) {
          updates.technicalSkills = mergeUnique(formData.technicalSkills, extractedTechnicalSkills);
        }

        const softField = getAvailableField('softSkills');
        const extractedSoftSkills = collectMatchingOptionValues(normalizedText, softField?.options || []);
        if (extractedSoftSkills.length > 0) {
          updates.softSkills = mergeUnique(formData.softSkills, extractedSoftSkills);
        }

        const additionalSkillsMatch = combinedText.match(
          /(?:additional\s*skills?|additional\s*skill)\s*[:\-]\s*(.+?)(?=(?:technical\s*skills?|soft\s*skills?|job\s*type|hiring\s*type|location|position\s*level|positions?|openings?|minimum\s*experience|maximum\s*experience|min\s*experience|max\s*experience|job\s*description|responsibilities|qualifications|$))/i
        )?.[1];
        const extractedAdditionalSkills = normalizeText(additionalSkillsMatch);
        if (extractedAdditionalSkills && !normalizeText(formData.additionalSkills)) {
          updates.additionalSkills = extractedAdditionalSkills;
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
    allFields,
    fields,
    formData.additionalSkills,
    formData.clientId,
    formData.clientName,
    formData.contactPersonEmail,
    formData.contactPersonName,
    formData.hiringType,
    formData.jdAttachment,
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
    const isAutoMappedClientName = isJobBasicInfo && field.name === "clientName";

    return (
      <FormField
        key={field.name}
        label={field.label}
        type={field.type}
        name={field.name}
        value={
          formData[field.name] !== undefined && formData[field.name] !== null
            ? formData[field.name]
            : (field.type === 'multiselect' ? [] : '')
        }
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
        disabled={disabled || Boolean(field.disabled) || isAutoMappedClientName}
        showBrowseButton={field.showBrowseButton}
        useParentValidation
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

    return (
      <div className="job-basic-info-step">
        <div className="job-section">
          <div className="job-section-header">
            <h3 className="job-section-title">Job Details</h3>
            <div className="job-section-divider" />
          </div>

          <div className="job-basic-info-grid">
            <div className="grid-cell grid-col-1 grid-row-1">
              <div className="job-template-upload-wrap">
                {getField('jdAttachment')}
                {jdExtractionStatus.state !== 'idle' ? (
                  <div className={`jd-extraction-status jd-extraction-status--${jdExtractionStatus.state}`}>
                    {jdExtractionStatus.message}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid-cell grid-col-2 grid-row-1">
              {getField('jobPositionId')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-1">
              {getField('positionName')}
            </div>
            <div className="grid-cell grid-col-1 grid-row-2">
              {renderGroup('Experience', true, 'minExperience', 'maxExperience')}
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
              {renderGroup('Salary In CTC', true, 'minSalary', 'maxSalary')}
            </div>

            <div className="grid-cell grid-col-1 grid-row-4">
              {getField('jobType')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-4">
              {getField('softSkills')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-4">
              {getField('hiringManager')}
            </div>

            <div className="grid-cell grid-col-1 grid-row-5">
              {getField('technicalSkills')}
            </div>
            <div className="grid-cell grid-col-2 grid-row-5">
              {getField('additionalSkills')}
            </div>
            <div className="grid-cell grid-col-3 grid-row-5">
              {renderField(normalizedAddTechnicalConfig)}
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
  const [showDraftRestoredMessage, setShowDraftRestoredMessage] = useState(false);

  const draftStorageKey = useMemo(() => getDraftStorageKey(config), [config]);

  const draftLoadResult = useMemo(() => {
    if (initialData) {
      return { data: initialData, restoredFromDraft: false };
    }

    const draftData = loadDraftData(draftStorageKey);
    return {
      data: draftData || null,
      restoredFromDraft: Boolean(draftData),
    };
  }, [initialData, draftStorageKey]);

  const resolvedInitialData = draftLoadResult.data;

  const formConfig = useMemo(() => createFormConfig(config), [config]);

  React.useEffect(() => {
    setValidationErrors({});
  }, [initialData, config]);

  React.useEffect(() => {
    if (!draftLoadResult.restoredFromDraft) return;

    setShowDraftRestoredMessage(true);
    const timer = window.setTimeout(() => {
      setShowDraftRestoredMessage(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [draftLoadResult.restoredFromDraft]);

  const clearSavedDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch (error) {
      console.error('Failed to clear draft data:', error);
    }
  }, [draftStorageKey]);

  const handleSaveDraft = useCallback(
    async (formData) => {
      if (config.onSaveDraft) {
        await config.onSaveDraft(formData);
        return;
      }

      if (typeof window === 'undefined') return;

      try {
        const payload = {
          savedAt: new Date().toISOString(),
          data: sanitizeDraftData(formData),
        };

        window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
        alert(`${config.itemName || config.title || 'Form'} draft saved successfully`);
      } catch (error) {
        console.error('Failed to save draft data:', error);
        alert('Failed to save draft. Please try again.');
      }
    },
    [config, draftStorageKey]
  );

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

    if (["primarySkill", "skillExperienceYears", "skillRating", "skillExperienceLevel"].includes(fieldName)) {
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

  const validateFieldOnChange = useCallback(async (fieldName, value, formData) => {
    const allFields = config.steps.flatMap((step) => step.fields || []);
    const field = allFields.find((item) => item.name === fieldName);

    if (!field || (!field.required && !field.validationRule)) {
      return;
    }

    let result = null;

    if (field.validationRule) {
      const validateFn = createValidationFunction(field.validationRule);
      if (validateFn) {
        result = await validateFn(value, fieldName, formData);
      }
    } else if (field.required) {
      const fieldLabel = field.label ? field.label.replace('*', '').trim() : field.name;
      result = await validateMandatoryField(value, field.name, fieldLabel);
    }

    if (result) {
      handleValidation(fieldName, result);
    }
  }, [config.steps, createValidationFunction, handleValidation]);

  const handleSubmit = async (formData) => {
    const itemLabel = String(config.itemName || 'Form').toLowerCase();
    let didRunSubmitCallback = false;

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
      didRunSubmitCallback = true;
      onSubmit?.(formData);

      clearSavedDraft();

      // Handle successful submission
      console.log(`${config.itemName || 'Form'} submitted successfully`);
    } catch (error) {
      console.error(`Error submitting ${itemLabel}:`, error);

      if (config.localSubmitOnly) {
        if (!didRunSubmitCallback) {
          onSubmit?.(formData);
        }
        clearSavedDraft();
        return;
      }

      // For development purposes, treat as success if it's a network error (no backend)
      if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
        console.log('No backend server available, treating as successful submission for development');
        onSubmit?.(formData);
        clearSavedDraft();
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
      {showDraftRestoredMessage && (
        <div className="draft-restored-alert">
          Draft restored successfully.
        </div>
      )}
      <MultiStepForm
        steps={enhancedSteps}
        onSubmit={handleSubmit}
        validationErrors={validationErrors}
        onValidateStep={validateStepFields}
        onFieldChange={validateFieldOnChange}
        hideStepper={config.hideStepper}
        showDraftAction={config.showDraftAction ?? true}
        draftLabel={config.draftLabel}
        onSaveDraft={handleSaveDraft}
        submitLabel={config.submitLabel}
        showCancelAction={config.showCancelAction}
        cancelLabel={config.cancelLabel}
        onCancel={config.onCancel}
        initialData={resolvedInitialData}
        readOnly={readOnly}
      />
    </div>
  );
};

export default ReusableForm;
