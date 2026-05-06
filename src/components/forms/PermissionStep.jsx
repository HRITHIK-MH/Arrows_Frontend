import React, { useEffect } from "react";
import FormField from "./FormField";

const JOB_ACTIVATION_OPTIONS = [
  { value: "validity-upto", label: "Validity Upto" },
  { value: "hold-after-month", label: "Target" },
];

const FOCUS_LOCATION_OPTIONS = [
  { value: "base", label: "Base" },
  { value: "any", label: "Any" },
];

const FOCUS_LOCATION_VALUE_OPTIONS = [
  { value: "chennai", label: "Chennai" },
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "mumbai", label: "Mumbai" },
  { value: "delhi", label: "Delhi" },
  { value: "noida", label: "Noida" },
  { value: "gurgaon", label: "Gurgaon" },
  { value: "coimbatore", label: "Coimbatore" },
  { value: "kolkata", label: "Kolkata" },
];

const FOCUS_LOCATION_VALUES = new Set(FOCUS_LOCATION_VALUE_OPTIONS.map((option) => option.value));

const AVAILABILITY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "1week", label: "1 week" },
  { value: "2week", label: "2 week" },
  { value: "1month", label: "1 month" },
  { value: "2month", label: "2 month" },
  { value: "3month", label: "3 month" },
];

const getInterviewStageLabel = (value) => {
  const matched = String(value).match(/^interview-(\d+)$/i);
  if (matched?.[1]) {
    return `Interview ${matched[1]}`;
  }
  const clientMatched = String(value).match(/^client-interview-(\d+)$/i);
  if (clientMatched?.[1]) {
    return `Client Interview ${clientMatched[1]}`;
  }
  if (value === "client-interview") return "Client Interview";
  if (value === "hr-interview") return "HR Interview";
  if (value === "preboarding") return "Preboarding";
  return String(value);
};

const PermissionStep = ({ formData, onChange, onSetStepFields, fields = [], validationErrors = {}, disabled = false }) => {
  const [isInterviewPopupOpen, setInterviewPopupOpen] = React.useState(false);
  const [stagePopupMode, setStagePopupMode] = React.useState("interview");
  const [interviewCountInput, setInterviewCountInput] = React.useState(
    String(formData.interviewCount || "")
  );

  const fieldMap = React.useMemo(() => {
    const map = {};
    fields.forEach((field) => {
      if (field?.name) {
        map[field.name] = field;
      }
    });
    return map;
  }, [fields]);

  const clientIdConfig = fieldMap.clientId || {
    name: "clientId",
    label: "Client Id *",
    type: "select",
    required: true,
    options: []
  };
  const clientNameConfig = fieldMap.clientName || {
    name: "clientName",
    label: "Client Name",
    type: "text",
    required: false
  };
  const contactPersonNameConfig = fieldMap.contactPersonName || {
    name: "contactPersonName",
    label: "Contact Person Name",
    type: "text",
    required: false
  };
  const contactPersonEmailConfig = fieldMap.contactPersonEmail || {
    name: "contactPersonEmail",
    label: "Contact Person Email Id",
    type: "email",
    required: false
  };
  const hiringTypeConfig = fieldMap.hiringType || {
    name: "hiringType",
    label: "Hiring Type *",
    type: "select",
    required: true,
    options: []
  };

  const jobActivationStatus = formData.jobActivationStatus || "validity-upto";
  const focusLocationType = formData.focusLocationType || "base";
  const selectedJobLocations = (Array.isArray(formData.location)
    ? formData.location
    : formData.location
      ? [formData.location]
      : [])
    .map((item) => String(item || "").toLowerCase())
    .filter((item) => FOCUS_LOCATION_VALUES.has(item));
  const availabilityOptions = Array.isArray(formData.availabilityOptions)
    ? formData.availabilityOptions
    : [];
  const interviewStages = Array.isArray(formData.interviewStages)
    ? formData.interviewStages
    : [];
  const clientInterviewStages = Array.isArray(formData.clientInterviewStages)
    ? formData.clientInterviewStages
    : [];
  const interviewStageNames =
    formData.interviewStageNames && typeof formData.interviewStageNames === "object"
      ? formData.interviewStageNames
      : {};
  const finalStages = Array.isArray(formData.finalStages)
    ? formData.finalStages
    : [];

  useEffect(() => {
    setInterviewCountInput(String(formData.interviewCount || ""));
  }, [formData.interviewCount]);

  useEffect(() => {
    if (formData.jobActivationStatus === undefined) {
      onChange("jobActivationStatus", "validity-upto");
    }
    if (formData.focusLocationType === undefined) {
      onChange("focusLocationType", "base");
    }
    if (formData.focusLocationValue === undefined) {
      const fallbackLocations = selectedJobLocations.length ? selectedJobLocations : ["chennai"];
      onChange("focusLocationValue", fallbackLocations);
    }
    if (formData.availabilityOptions === undefined) {
      onChange("availabilityOptions", ["immediate", "1month"]);
    }
    if (formData.interviewStages === undefined) {
      onChange("interviewStages", []);
    }
    if (formData.clientInterviewStages === undefined) {
      onChange("clientInterviewStages", []);
    }
    if (formData.clientInterviewCount === undefined) {
      onChange("clientInterviewCount", 0);
    }
    if (formData.interviewStageNames === undefined) {
      onChange("interviewStageNames", {});
    }
    if (formData.finalStages === undefined) {
      onChange("finalStages", ["preboarding"]);
    }
  }, [
    formData.jobActivationStatus,
    formData.focusLocationType,
    formData.focusLocationValue,
    selectedJobLocations,
    formData.availabilityOptions,
    formData.interviewStages,
    formData.clientInterviewStages,
    formData.clientInterviewCount,
    formData.interviewStageNames,
    formData.finalStages,
    onChange,
  ]);

  useEffect(() => {
    const currentValues = Array.isArray(formData.focusLocationValue)
      ? formData.focusLocationValue
      : formData.focusLocationValue
        ? [formData.focusLocationValue]
        : [];

    if (focusLocationType === "base") {
      const nextBaseValues = selectedJobLocations.length ? selectedJobLocations : ["chennai"];
      const normalizedCurrent = currentValues.map((item) => String(item || "").toLowerCase());
      const isSame =
        normalizedCurrent.length === nextBaseValues.length &&
        normalizedCurrent.every((item, index) => item === nextBaseValues[index]);
      if (!isSame) {
        onChange("focusLocationValue", nextBaseValues);
      }
      return;
    }
  }, [focusLocationType, formData.focusLocationValue, selectedJobLocations, onChange]);

  const handleFocusLocationTypeChange = (nextType) => {
    onChange("focusLocationType", nextType);

    const currentValues = Array.isArray(formData.focusLocationValue)
      ? formData.focusLocationValue
      : formData.focusLocationValue
        ? [formData.focusLocationValue]
        : [];

    const fallbackValues = selectedJobLocations.length ? selectedJobLocations : ["chennai"];

    if (nextType === "base") {
      onChange("focusLocationValue", fallbackValues);
      return;
    }

    onChange("focusLocationValue", []);
  };

  useEffect(() => {
    if (onSetStepFields) {
      const mappedStepFields = [
        clientIdConfig,
        clientNameConfig,
        contactPersonNameConfig,
        contactPersonEmailConfig,
        hiringTypeConfig,
      ].map((field) => ({
        name: field.name,
        label: field.label,
        required: Boolean(field.required),
      }));

      onSetStepFields([
        ...mappedStepFields,
        { name: "jobActivationStatus", label: "Job Activation", required: false },
        { name: "jobActivationDate", label: "Job Activation Date", required: false },
        { name: "focusLocationType", label: "Focus Location", required: false },
        { name: "focusLocationValue", label: "Focus Location Value", required: false },
        { name: "availabilityOptions", label: "Availability", required: false },
        { name: "interviewCount", label: "Interview Count", required: false },
        { name: "interviewStages", label: "Interview Stages", required: false },
        { name: "clientInterviewCount", label: "Client Interview Count", required: false },
        { name: "clientInterviewStages", label: "Client Interview Stages", required: false },
        { name: "interviewStageNames", label: "Interview Stage Names", required: false },
        { name: "finalStages", label: "Final Hiring Stages", required: false },
      ]);
    }
  }, [
    clientIdConfig,
    clientNameConfig,
    contactPersonNameConfig,
    contactPersonEmailConfig,
    hiringTypeConfig,
    onSetStepFields,
  ]);

  const toggleAvailabilityOption = (option) => {
    const nextOptions = availabilityOptions.includes(option)
      ? availabilityOptions.filter((item) => item !== option)
      : [...availabilityOptions, option];
    onChange("availabilityOptions", nextOptions);
  };

  const openStagePopup = (mode) => {
    setStagePopupMode(mode);
    if (mode === "clientInterview") {
      setInterviewCountInput(String(formData.clientInterviewCount || 0));
    } else {
      setInterviewCountInput(String(formData.interviewCount || 0));
    }
    setInterviewPopupOpen(true);
  };

  const generateInterviewStages = () => {
    const parsedCount = Number.parseInt(interviewCountInput, 10);
    const normalizedCount = Number.isNaN(parsedCount)
      ? 0
      : Math.max(0, Math.min(parsedCount, 20));

    const stagePrefix = stagePopupMode === "clientInterview" ? "client-interview" : "interview";
    const stages = Array.from({ length: normalizedCount }, (_, index) => `${stagePrefix}-${index + 1}`);
    const nextStageNames = stages.reduce((acc, stage) => {
      const fallbackLabel = getInterviewStageLabel(stage);
      acc[stage] = interviewStageNames[stage] ?? fallbackLabel;
      return acc;
    }, {});

    if (stagePopupMode === "clientInterview") {
      onChange("clientInterviewCount", normalizedCount);
      onChange("clientInterviewStages", stages);
      onChange("interviewStageNames", {
        ...interviewStageNames,
        ...nextStageNames,
      });
    } else {
      onChange("interviewCount", normalizedCount);
      onChange("interviewStages", stages);
      onChange("interviewStageNames", {
        ...interviewStageNames,
        ...nextStageNames,
      });
    }
    setInterviewPopupOpen(false);
  };

  const handleInterviewStageNameChange = (stage, nextLabel) => {
    const normalizedLabel = String(nextLabel || "").slice(0, 40);
    onChange("interviewStageNames", {
      ...interviewStageNames,
      [stage]: normalizedLabel,
    });
  };

  const toggleFinalStage = (stage) => {
    const nextStages = finalStages.includes(stage)
      ? finalStages.filter((item) => item !== stage)
      : [...finalStages, stage];
    onChange("finalStages", nextStages);
  };

  const orderedFinalStages = ["hr-interview", "preboarding"].filter((stage) =>
    finalStages.includes(stage)
  );

  const hiringProcessFlow = [
    { key: "sourced", label: "Sourced", meta: "" },
    { key: "screening", label: "Screening", meta: "1 stage" },
    ...interviewStages.map((stage) => ({
      key: stage,
      label: interviewStageNames[stage] ?? getInterviewStageLabel(stage),
      meta: "Interview stage",
      isEditable: true,
    })),
    ...clientInterviewStages.map((stage) => ({
      key: stage,
      label: interviewStageNames[stage] ?? getInterviewStageLabel(stage),
      meta: "Client interview stage",
      isEditable: true,
    })),
    ...orderedFinalStages.map((stage) => ({
      key: stage,
      label: interviewStageNames[stage] ?? getInterviewStageLabel(stage),
      meta: stage === "preboarding" ? "" : "Final stage",
      isEditable: false,
    })),
  ];

  return (
    <div className="permission-step">
      <div className="job-section">
        <div className="job-section-header">
          <h3 className="job-section-title">Client Details</h3>
          <div className="job-section-divider" />
        </div>

        <div className="job-basic-info-grid job-basic-info-grid--client">
          <div className="grid-cell grid-col-1 grid-row-1">
            <FormField
              label={clientIdConfig.label}
              type={clientIdConfig.type || "select"}
              name={clientIdConfig.name}
              value={formData[clientIdConfig.name] || ""}
              onChange={onChange}
              required={Boolean(clientIdConfig.required)}
              options={clientIdConfig.options || []}
              placeholder={clientIdConfig.placeholder || "Select Client Id"}
              error={validationErrors[clientIdConfig.name]}
              formData={formData}
              disabled={disabled || Boolean(clientIdConfig.disabled)}
            />
          </div>
          <div className="grid-cell grid-col-2 grid-row-1">
            <FormField
              label={clientNameConfig.label}
              type={clientNameConfig.type || "text"}
              name={clientNameConfig.name}
              value={formData[clientNameConfig.name] || ""}
              onChange={onChange}
              required={Boolean(clientNameConfig.required)}
              placeholder={clientNameConfig.placeholder || "Enter Client Name"}
              error={validationErrors[clientNameConfig.name]}
              formData={formData}
              disabled={disabled || Boolean(clientNameConfig.disabled)}
            />
          </div>
          <div className="grid-cell grid-col-1 grid-row-2">
            <FormField
              label={contactPersonNameConfig.label}
              type={contactPersonNameConfig.type || "text"}
              name={contactPersonNameConfig.name}
              value={formData[contactPersonNameConfig.name] || ""}
              onChange={onChange}
              required={Boolean(contactPersonNameConfig.required)}
              validate={contactPersonNameConfig.validate}
              placeholder={contactPersonNameConfig.placeholder || "Enter Contact Person Name"}
              error={validationErrors[contactPersonNameConfig.name]}
              formData={formData}
              disabled={disabled || Boolean(contactPersonNameConfig.disabled)}
            />
          </div>
          <div className="grid-cell grid-col-2 grid-row-2">
            <FormField
              label={contactPersonEmailConfig.label}
              type={contactPersonEmailConfig.type || "email"}
              name={contactPersonEmailConfig.name}
              value={formData[contactPersonEmailConfig.name] || ""}
              onChange={onChange}
              required={Boolean(contactPersonEmailConfig.required)}
              validate={contactPersonEmailConfig.validate}
              placeholder={contactPersonEmailConfig.placeholder || "Enter Contact Person Email"}
              error={validationErrors[contactPersonEmailConfig.name]}
              formData={formData}
              disabled={disabled || Boolean(contactPersonEmailConfig.disabled)}
            />
          </div>
          <div className="grid-cell grid-col-3 grid-row-1">
            <FormField
              label={hiringTypeConfig.label}
              type={hiringTypeConfig.type || "select"}
              name={hiringTypeConfig.name}
              value={formData[hiringTypeConfig.name] || ""}
              onChange={onChange}
              required={Boolean(hiringTypeConfig.required)}
              options={hiringTypeConfig.options || []}
              placeholder={hiringTypeConfig.placeholder || "Select"}
              error={validationErrors[hiringTypeConfig.name]}
              formData={formData}
              disabled={disabled || Boolean(hiringTypeConfig.disabled)}
            />
          </div>
        </div>
      </div>

      <div className="permission-grid">
        <section className="permission-panel">
          <div className="permission-header">
            <h3 className="permission-title">Job Activation</h3>
            <p className="permission-subtitle">
              Status &amp; Duration of the Job to be active
            </p>
          </div>
          <div className="permission-options inline">
            {JOB_ACTIVATION_OPTIONS.map((option) => (
              <label key={option.value} className="permission-option">
                <input
                  type="radio"
                  name="jobActivationStatus"
                  value={option.value}
                  checked={jobActivationStatus === option.value}
                  onChange={() => onChange("jobActivationStatus", option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <input
            type="date"
            className="permission-input"
            value={formData.jobActivationDate || ""}
            onChange={(event) => onChange("jobActivationDate", event.target.value)}
          />
        </section>

        <section className="permission-panel">
          <div className="permission-header">
            <h3 className="permission-title">Preferred Location</h3>
            <p className="permission-subtitle">Candidate Location</p>
          </div>
          <div className="permission-options inline">
            {FOCUS_LOCATION_OPTIONS.map((option) => (
              <label key={option.value} className="permission-option">
                <input
                  type="radio"
                  name="focusLocationType"
                  value={option.value}
                  checked={focusLocationType === option.value}
                  onChange={() => handleFocusLocationTypeChange(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <FormField
            label="Location"
            type="multiselect"
            name="focusLocationValue"
            value={Array.isArray(formData.focusLocationValue) ? formData.focusLocationValue : (formData.focusLocationValue ? [formData.focusLocationValue] : [])}
            onChange={onChange}
            required={false}
            options={FOCUS_LOCATION_VALUE_OPTIONS}
            placeholder="Select locations"
            formData={formData}
            disabled={disabled}
            hideLabel
          />
        </section>

        <section className="permission-panel permission-panel--availability">
          <div className="permission-header">
            <h3 className="permission-title">Availability</h3>
            <p className="permission-subtitle">
              Candidate availability for the Job
            </p>
          </div>
          <div className="permission-options inline">
            {AVAILABILITY_OPTIONS.map((option) => (
              <label key={option.value} className="permission-option">
                <input
                  type="checkbox"
                  checked={availabilityOptions.includes(option.value)}
                  onChange={() => toggleAvailabilityOption(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="permission-panel permission-panel--hiring-process">
          <div className="permission-header">
            <h3 className="permission-title">Hiring Process</h3>
            <p className="permission-subtitle">Configure the hiring flow including interview stages</p>
          </div>

          <div className="permission-options inline">
            <div className="hiring-process-toolbar">
              <button
                type="button"
                className="hiring-process-add-btn"
                onClick={() => openStagePopup("interview")}
                aria-label="Add interview stages"
              >
                +
              </button>
              <span className="hiring-process-count-text">
                {formData.interviewCount ? `${formData.interviewCount} interview stages configured` : "No interview stages configured"}
              </span>
            </div>
            <div className="hiring-process-toolbar">
              <button
                type="button"
                className="hiring-process-add-btn"
                onClick={() => openStagePopup("clientInterview")}
                aria-label="Add client interview stages"
              >
                +
              </button>
              <span className="hiring-process-count-text">
                {formData.clientInterviewCount
                  ? `${formData.clientInterviewCount} client interview stages configured`
                  : "No client interview stages configured"}
              </span>
            </div>
            <label className="permission-option">
              <input
                type="checkbox"
                checked={finalStages.includes("hr-interview")}
                onChange={() => toggleFinalStage("hr-interview")}
              />
              <span>HR Interview</span>
            </label>
            <label className="permission-option">
              <input
                type="checkbox"
                checked={finalStages.includes("preboarding")}
                onChange={() => toggleFinalStage("preboarding")}
              />
              <span>Preboarding</span>
            </label>
          </div>

          <div className="hiring-flow-widget" aria-label="Hiring process flow">
            <div className="hiring-flow-header">Hiring Flow</div>
            <div className="hiring-flow-track">
              {hiringProcessFlow.map((stage, index) => (
                <div key={`${stage.key}-${index}`} className="hiring-flow-stage">
                  {stage.isEditable ? (
                    <input
                      type="text"
                      className="hiring-flow-stage-input"
                      value={stage.label}
                      onChange={(event) => handleInterviewStageNameChange(stage.key, event.target.value)}
                      placeholder={getInterviewStageLabel(stage.key)}
                      disabled={disabled}
                      aria-label={`Rename ${getInterviewStageLabel(stage.key)}`}
                      maxLength={40}
                    />
                  ) : (
                    <span className="hiring-flow-stage-title">{stage.label}</span>
                  )}
                  {stage.meta ? <span className="hiring-flow-stage-meta">{stage.meta}</span> : null}
                </div>
              ))}
            </div>
          </div>

          {isInterviewPopupOpen ? (
            <div className="hiring-process-popup-backdrop" role="dialog" aria-modal="true">
              <div className="hiring-process-popup">
                <h4 className="hiring-process-popup-title">
                  {stagePopupMode === "clientInterview" ? "Set Client Interview Stages" : "Set Interview Stages"}
                </h4>
                <label className="hiring-process-popup-label" htmlFor="interview-count-input">
                  Number of {stagePopupMode === "clientInterview" ? "Client Interviews" : "Interviews"}
                </label>
                <input
                  id="interview-count-input"
                  type="number"
                  min="0"
                  max="20"
                  className="hiring-process-popup-input"
                  value={interviewCountInput}
                  onChange={(event) => setInterviewCountInput(event.target.value)}
                  placeholder="Enter count (e.g. 2)"
                />
                <div className="hiring-process-popup-actions">
                  <button
                    type="button"
                    className="hiring-process-popup-btn secondary"
                    onClick={() => setInterviewPopupOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="hiring-process-popup-btn primary"
                    onClick={generateInterviewStages}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default PermissionStep;
