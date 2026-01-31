import React, { useEffect, useMemo } from "react";
import FormField from "./FormField";

const CandidateBasicInfoStep = ({
  formData,
  onChange,
  fields = [],
  onSetStepFields,
  validationErrors = {},
}) => {
  useEffect(() => {
    if (!onSetStepFields) return;
    onSetStepFields(
      fields.map((field) => ({
        name: field.name,
        label: field.label,
        required: Boolean(field.required),
      }))
    );
  }, [fields, onSetStepFields]);

  const fieldMap = useMemo(() => {
    const map = {};
    fields.forEach((field) => {
      map[field.name] = field;
    });
    return map;
  }, [fields]);

  const renderField = (name, extraClass = "") => {
    const field = fieldMap[name];
    if (!field) return null;
    const value =
      formData[field.name] || (field.type === "multiselect" ? [] : "");

    return (
      <div className={`candidate-cell${extraClass ? ` ${extraClass}` : ""}`}>
        <FormField
          key={field.name}
          label={field.label}
          type={field.type}
          name={field.name}
          value={value}
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
        />
      </div>
    );
  };

  return (
    <div className="candidate-step">
      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Basic Info</h3>
          <div className="candidate-section-divider" />
        </div>
        <div className="candidate-grid">
          {renderField("candidateId")}
          {renderField("firstName")}
          {renderField("lastName")}
          {renderField("primaryEmail")}
          {renderField("secondaryEmail")}
          {renderField("phoneNumber")}
          {renderField("gender")}
          {renderField("yearsExperience")}
          {renderField("offersInHand")}
          {renderField("comments", "candidate-span-2")}
        </div>
      </div>

      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Current Company Info</h3>
          <div className="candidate-section-divider" />
        </div>
        <div className="candidate-grid">
          {renderField("currentCompanyName")}
          {renderField("jobTitleRole")}
          {renderField("employmentType")}
          {renderField("noticePeriod")}
          {renderField("currentCtc")}
          {renderField("expectedCtc")}
        </div>
      </div>

      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Source Info</h3>
          <div className="candidate-section-divider" />
        </div>
        <div className="candidate-grid">
          {renderField("sourceId")}
          {renderField("recruiterId")}
          {renderField("sourceName")}
          {renderField("sourcedDate")}
        </div>
      </div>
    </div>
  );
};

export default CandidateBasicInfoStep;
