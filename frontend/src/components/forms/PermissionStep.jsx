import React, { useEffect } from "react";

const JOB_ACTIVATION_OPTIONS = [
  { value: "validity-upto", label: "Validity Upto" },
  { value: "hold-after-month", label: "Hold after 1 Month" },
  { value: "hold", label: "Hold" },
  { value: "inactive", label: "In Active" },
  { value: "closed", label: "Closed" },
  { value: "target-date", label: "Target date" },
];

const RESUME_SUBMISSION_OPTIONS = [
  { value: "max10", label: "Max 10" },
  { value: "max20", label: "Max 20" },
  { value: "others", label: "Others" },
];

const FOCUS_LOCATION_OPTIONS = [
  { value: "base", label: "Base" },
  { value: "any", label: "Any" },
  { value: "others", label: "Others" },
];

const AVAILABILITY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "1week", label: "1 week" },
  { value: "2week", label: "2 week" },
  { value: "1month", label: "1 month" },
  { value: "2month", label: "2 month" },
  { value: "3month", label: "3 month" },
];

const JOB_POSTING_CHANNELS = [
  { value: "website", label: "Website" },
  { value: "linkedin", label: "LinkedIn" },
];

const PermissionStep = ({ formData, onChange, onSetStepFields }) => {
  const jobActivationStatus =
    formData.jobActivationStatus || "validity-upto";
  const subVendor = formData.subVendor || "yes";
  const jobPostingChannels = Array.isArray(formData.jobPostingChannels)
    ? formData.jobPostingChannels
    : [];
  const resumeSubmissionLimit =
    formData.resumeSubmissionLimit || "max10";
  const focusLocationType = formData.focusLocationType || "base";
  const availabilityOptions = Array.isArray(formData.availabilityOptions)
    ? formData.availabilityOptions
    : [];

  useEffect(() => {
    if (formData.jobActivationStatus === undefined) {
      onChange("jobActivationStatus", "validity-upto");
    }
    if (formData.subVendor === undefined) {
      onChange("subVendor", "yes");
    }
    if (formData.jobPostingChannels === undefined) {
      onChange("jobPostingChannels", ["website", "linkedin"]);
    }
    if (formData.resumeSubmissionLimit === undefined) {
      onChange("resumeSubmissionLimit", "max10");
    }
    if (formData.focusLocationType === undefined) {
      onChange("focusLocationType", "base");
    }
    if (formData.focusLocationValue === undefined) {
      onChange("focusLocationValue", "Chennai");
    }
    if (formData.availabilityOptions === undefined) {
      onChange("availabilityOptions", ["immediate", "1month"]);
    }
  }, [
    formData.jobActivationStatus,
    formData.subVendor,
    formData.jobPostingChannels,
    formData.resumeSubmissionLimit,
    formData.focusLocationType,
    formData.focusLocationValue,
    formData.availabilityOptions,
    onChange,
  ]);

  useEffect(() => {
    if (onSetStepFields) {
      onSetStepFields([
        { name: "jobActivationStatus", label: "Job Activation", required: false },
        { name: "jobActivationDate", label: "Job Activation Date", required: false },
        { name: "subVendor", label: "Sub Vendor", required: false },
        { name: "jobPostingChannels", label: "Job Posting", required: false },
        { name: "websiteUrl", label: "Website URL", required: false },
        { name: "linkedinId", label: "LinkedIn ID", required: false },
        { name: "resumeSubmissionLimit", label: "Resume Submission", required: false },
        { name: "focusLocationType", label: "Focus Location", required: false },
        { name: "focusLocationValue", label: "Focus Location Value", required: false },
        { name: "availabilityOptions", label: "Availability", required: false },
      ]);
    }
  }, [onSetStepFields]);

  const toggleJobPostingChannel = (channel) => {
    const nextChannels = jobPostingChannels.includes(channel)
      ? jobPostingChannels.filter((item) => item !== channel)
      : [...jobPostingChannels, channel];
    onChange("jobPostingChannels", nextChannels);
  };

  const toggleAvailabilityOption = (option) => {
    const nextOptions = availabilityOptions.includes(option)
      ? availabilityOptions.filter((item) => item !== option)
      : [...availabilityOptions, option];
    onChange("availabilityOptions", nextOptions);
  };

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
            onChange={(e) => onChange("jobActivationDate", e.target.value)}
            placeholder="DD-MM-YYYY"
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
            <h3 className="permission-title">Job Posting</h3>
            <p className="permission-subtitle">Post job in channels</p>
          </div>
          <div className="permission-options inline">
            {JOB_POSTING_CHANNELS.map((channel) => (
              <label key={channel.value} className="permission-option">
                <input
                  type="checkbox"
                  checked={jobPostingChannels.includes(channel.value)}
                  onChange={() => toggleJobPostingChannel(channel.value)}
                />
                <span>{channel.label}</span>
              </label>
            ))}
          </div>
          <div className="permission-field">
            <input
              type="text"
              className="permission-input"
              placeholder="Website URL"
              value={formData.websiteUrl || ""}
              onChange={(e) => onChange("websiteUrl", e.target.value)}
              disabled={!jobPostingChannels.includes("website")}
            />
          </div>
          <div className="permission-field">
            <input
              type="text"
              className="permission-input"
              placeholder="LinkedIn ID"
              value={formData.linkedinId || ""}
              onChange={(e) => onChange("linkedinId", e.target.value)}
              disabled={!jobPostingChannels.includes("linkedin")}
            />
          </div>
        </section>

        <section className="permission-panel">
          <div className="permission-header">
            <h3 className="permission-title">Resume Submission</h3>
            <p className="permission-subtitle">
              Ability to submit resumes to the relevant JD
            </p>
          </div>
          <div className="permission-options inline">
            {RESUME_SUBMISSION_OPTIONS.map((option) => (
              <label key={option.value} className="permission-option">
                <input
                  type="radio"
                  name="resumeSubmissionLimit"
                  value={option.value}
                  checked={resumeSubmissionLimit === option.value}
                  onChange={() =>
                    onChange("resumeSubmissionLimit", option.value)
                  }
                />
                <span>{option.label}</span>
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
          <input
            type="text"
            className="permission-input"
            placeholder="Location"
            value={formData.focusLocationValue || ""}
            onChange={(e) => onChange("focusLocationValue", e.target.value)}
            disabled={focusLocationType === "any"}
          />
        </section>

        <section className="permission-panel">
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
      </div>
    </div>
  );
};

export default PermissionStep;
