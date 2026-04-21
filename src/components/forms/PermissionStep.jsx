import React, { useEffect } from "react";
import FormField from "./FormField";

const JOB_ACTIVATION_OPTIONS = [
  { value: "validity-upto", label: "Validity Upto" },
  { value: "hold-after-month", label: "Hold after 1 Month" },
  { value: "hold", label: "Hold" },
  { value: "inactive", label: "In Active" },
  { value: "closed", label: "Closed" },
];

const FOCUS_LOCATION_OPTIONS = [
  { value: "base", label: "Base" },
  { value: "any", label: "Any" },
  { value: "others", label: "Others" },
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
  if (value === "client-interview") return "Client Interview";
  if (value === "hr-interview") return "HR Interview";
  if (value === "preboarding") return "Preboarding";
  return String(value);
};

const PermissionStep = ({ formData, onChange, onSetStepFields }) => {
  const [isInterviewPopupOpen, setInterviewPopupOpen] = React.useState(false);
  const [interviewCountInput, setInterviewCountInput] = React.useState(
    String(formData.interviewCount || "")
  );

  const jobActivationStatus = formData.jobActivationStatus || "validity-upto";
  const subVendor = formData.subVendor || "no";
  const focusLocationType = formData.focusLocationType || "base";
  const availabilityOptions = Array.isArray(formData.availabilityOptions)
    ? formData.availabilityOptions
    : [];
  const interviewStages = Array.isArray(formData.interviewStages)
    ? formData.interviewStages
    : [];
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
    if (formData.subVendor === undefined) {
      onChange("subVendor", "no");
    }
    if (formData.focusLocationType === undefined) {
      onChange("focusLocationType", "base");
    }
    if (formData.focusLocationValue === undefined) {
      onChange("focusLocationValue", ["chennai"]);
    }
    if (formData.availabilityOptions === undefined) {
      onChange("availabilityOptions", ["immediate", "1month"]);
    }
    if (formData.interviewStages === undefined) {
      onChange("interviewStages", []);
    }
    if (formData.finalStages === undefined) {
      onChange("finalStages", ["preboarding"]);
    }
  }, [
    formData.jobActivationStatus,
    formData.subVendor,
    formData.focusLocationType,
    formData.focusLocationValue,
    formData.availabilityOptions,
    formData.interviewStages,
    formData.finalStages,
    onChange,
  ]);

  useEffect(() => {
    if (onSetStepFields) {
      onSetStepFields([
        { name: "jobActivationStatus", label: "Job Activation", required: false },
        { name: "jobActivationDate", label: "Job Activation Date", required: false },
        { name: "subVendor", label: "Sub Vendor", required: false },
        { name: "focusLocationType", label: "Focus Location", required: false },
        { name: "focusLocationValue", label: "Focus Location Value", required: false },
        { name: "availabilityOptions", label: "Availability", required: false },
        { name: "interviewCount", label: "Interview Count", required: false },
        { name: "interviewStages", label: "Interview Stages", required: false },
        { name: "finalStages", label: "Final Hiring Stages", required: false },
      ]);
    }
  }, [onSetStepFields]);

  const toggleAvailabilityOption = (option) => {
    const nextOptions = availabilityOptions.includes(option)
      ? availabilityOptions.filter((item) => item !== option)
      : [...availabilityOptions, option];
    onChange("availabilityOptions", nextOptions);
  };

  const generateInterviewStages = () => {
    const parsedCount = Number.parseInt(interviewCountInput, 10);
    const normalizedCount = Number.isNaN(parsedCount)
      ? 0
      : Math.max(0, Math.min(parsedCount, 20));

    const stages = Array.from({ length: normalizedCount }, (_, index) => `interview-${index + 1}`);
    onChange("interviewCount", normalizedCount);
    onChange("interviewStages", stages);
    setInterviewPopupOpen(false);
  };

  const toggleFinalStage = (stage) => {
    const nextStages = finalStages.includes(stage)
      ? finalStages.filter((item) => item !== stage)
      : [...finalStages, stage];
    onChange("finalStages", nextStages);
  };

  const orderedFinalStages = ["client-interview", "hr-interview", "preboarding"].filter((stage) =>
    finalStages.includes(stage)
  );

  const hiringProcessFlow = [
    { key: "sourced", label: "Sourced", meta: "" },
    { key: "screening", label: "Screening", meta: "1 stage" },
    ...interviewStages.map((stage) => ({
      key: stage,
      label: getInterviewStageLabel(stage),
      meta: "Interview stage",
    })),
    ...orderedFinalStages.map((stage) => ({
      key: stage,
      label: getInterviewStageLabel(stage),
      meta: stage === "preboarding" ? "" : "Final stage",
    })),
  ];

  return (
    <div className="permission-step">
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
            <h3 className="permission-title">Sub Vendor</h3>
            <p className="permission-subtitle">
              Ability to use the sub vendor / partner
            </p>
          </div>
          <div className="permission-options inline">
            {["yes", "no"].map((value) => (
              <label key={value} className="permission-option">
                <input
                  type="radio"
                  name="subVendor"
                  value={value}
                  checked={subVendor === value}
                  onChange={() => onChange("subVendor", value)}
                />
                <span>{value === "yes" ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="permission-panel">
          <div className="permission-header">
            <h3 className="permission-title">Focus Location</h3>
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
                  onChange={() => onChange("focusLocationType", option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <FormField
            label="Location"
            type="multiselect"
            name="focusLocationValue"
            value={Array.isArray(formData.focusLocationValue) ? formData.focusLocationValue : []}
            onChange={onChange}
            required={false}
            options={FOCUS_LOCATION_VALUE_OPTIONS}
            placeholder="Select locations"
            formData={formData}
            disabled={focusLocationType === "any"}
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

          <div className="hiring-process-toolbar">
            <button
              type="button"
              className="hiring-process-add-btn"
              onClick={() => setInterviewPopupOpen(true)}
              aria-label="Add interview stages"
            >
              +
            </button>
            <span className="hiring-process-count-text">
              {formData.interviewCount ? `${formData.interviewCount} interview stages configured` : "No interview stages configured"}
            </span>
          </div>

          <div className="permission-options inline">
            <label className="permission-option">
              <input
                type="checkbox"
                checked={finalStages.includes("client-interview")}
                onChange={() => toggleFinalStage("client-interview")}
              />
              <span>Client Interview</span>
            </label>
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
                  <span className="hiring-flow-stage-title">{stage.label}</span>
                  {stage.meta ? <span className="hiring-flow-stage-meta">{stage.meta}</span> : null}
                </div>
              ))}
            </div>
          </div>

          {isInterviewPopupOpen ? (
            <div className="hiring-process-popup-backdrop" role="dialog" aria-modal="true">
              <div className="hiring-process-popup">
                <h4 className="hiring-process-popup-title">Set Interview Stages</h4>
                <label className="hiring-process-popup-label" htmlFor="interview-count-input">
                  Number of Interviews
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
