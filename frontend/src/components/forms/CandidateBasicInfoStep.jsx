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
          <div className="candidate-cell">
            <div className="name-prefix-group">
              <label className="name-prefix-label">
                First Name <span className="required-star">*</span>
              </label>
              <div className="name-prefix-row">
                <div className="name-prefix-select">
                  {fieldMap.namePrefix && (
                    <FormField
                      key={fieldMap.namePrefix.name}
                      label={fieldMap.namePrefix.label}
                      type={fieldMap.namePrefix.type}
                      name={fieldMap.namePrefix.name}
                      value={formData[fieldMap.namePrefix.name] || ""}
                      onChange={onChange}
                      required={fieldMap.namePrefix.required}
                      options={fieldMap.namePrefix.options}
                      validate={fieldMap.namePrefix.validate}
                      error={null}
                      onValidation={fieldMap.namePrefix.onValidation}
                      placeholder={fieldMap.namePrefix.placeholder}
                      hideLabel={fieldMap.namePrefix.hideLabel}
                      accept={fieldMap.namePrefix.accept}
                      multiple={fieldMap.namePrefix.multiple}
                      prefix={fieldMap.namePrefix.prefix}
                      formData={formData}
                      suppressError
                    />
                  )}
                </div>
                <div className="name-prefix-input">
                  {fieldMap.firstName && (
                    <FormField
                      key={fieldMap.firstName.name}
                      label={fieldMap.firstName.label}
                      type={fieldMap.firstName.type}
                      name={fieldMap.firstName.name}
                      value={formData[fieldMap.firstName.name] || ""}
                      onChange={onChange}
                      required={fieldMap.firstName.required}
                      options={fieldMap.firstName.options}
                      validate={fieldMap.firstName.validate}
                      error={null}
                      onValidation={fieldMap.firstName.onValidation}
                      placeholder={fieldMap.firstName.placeholder}
                      hideLabel={fieldMap.firstName.hideLabel}
                      accept={fieldMap.firstName.accept}
                      multiple={fieldMap.firstName.multiple}
                      prefix={fieldMap.firstName.prefix}
                      formData={formData}
                      suppressError
                    />
                  )}
                </div>
              </div>
              {(validationErrors.namePrefix || validationErrors.firstName) && (
                <div className="error-message">
                  {validationErrors.namePrefix && (
                    <div>{validationErrors.namePrefix}</div>
                  )}
                  {validationErrors.firstName && (
                    <div>{validationErrors.firstName}</div>
                  )}
                </div>
              )}
            </div>
          </div>
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
