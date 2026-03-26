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

const PermissionStep = ({ formData, onChange, onSetStepFields }) => {
  const jobActivationStatus = formData.jobActivationStatus || "validity-upto";
  const subVendor = formData.subVendor || "no";
  const focusLocationType = formData.focusLocationType || "base";
  const availabilityOptions = Array.isArray(formData.availabilityOptions)
    ? formData.availabilityOptions
    : [];

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
  }, [
    formData.jobActivationStatus,
    formData.subVendor,
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
        { name: "focusLocationType", label: "Focus Location", required: false },
        { name: "focusLocationValue", label: "Focus Location Value", required: false },
        { name: "availabilityOptions", label: "Availability", required: false },
      ]);
    }
  }, [onSetStepFields]);

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
      </div>
    </div>
  );
};

export default PermissionStep;
