import React, { useEffect, useMemo } from "react";
import FormField from "./FormField";

const CandidateBasicInfoStep = ({
  formData,
  onChange,
  fields = [],
  onSetStepFields,
  validationErrors = {},
}) => {
  const isFresher = formData.candidateType === "fresher";


  const fieldMap = useMemo(() => {
    const map = {};
    fields.forEach((field) => {
      map[field.name] = field;
    });
    return map;
  }, [fields]);

  useEffect(() => {
    if (!onSetStepFields) return;

    const hiddenForFresher = [
      "currentCompanyName",
      "jobTitleRole",
      "employmentType",
      "noticePeriod",
      "currentCtc",
      "expectedCtc",
    ];

    onSetStepFields(
      fields
        .filter((field) => !(isFresher && hiddenForFresher.includes(field.name)))
        .map((field) => ({
          name: field.name,
          label: field.label,
          required: Boolean(field.required),
        }))
    );
  }, [fields, isFresher, onSetStepFields]);

  useEffect(() => {
    const sourceIdOptions = Array.isArray(fieldMap.sourceId?.options)
      ? fieldMap.sourceId.options
      : [];
    const sourceNameOptions = Array.isArray(fieldMap.sourceName?.options)
      ? fieldMap.sourceName.options
      : [];

    if (formData.sourceId) {
      const matchedSource = sourceIdOptions.find(
        (option) => String(option.value) === String(formData.sourceId)
      );

      if (matchedSource?.sourceName && matchedSource.sourceName !== formData.sourceName) {
        onChange("sourceName", matchedSource.sourceName);
      }
      return;
    }

    if (formData.sourceName) {
      const matchedSource = sourceNameOptions.find(
        (option) => String(option.value) === String(formData.sourceName)
      );

      if (matchedSource?.sourceId && matchedSource.sourceId !== formData.sourceId) {
        onChange("sourceId", matchedSource.sourceId);
      }
    }
  }, [fieldMap, formData.sourceId, formData.sourceName, onChange]);

  const renderField = (name, extraClass = "", overrides = {}) => {
    const field = fieldMap[name];
    if (!field) return null;
    const value =
      formData[field.name] || (field.type === "multiselect" ? [] : "");
    const fieldProps = { ...field, ...overrides };

    return (
      <div className={`candidate-cell${extraClass ? ` ${extraClass}` : ""}`}>
        <FormField
          key={fieldProps.name}
          label={fieldProps.label}
          type={fieldProps.type}
          name={fieldProps.name}
          value={value}
          onChange={onChange}
          required={fieldProps.required}
          options={fieldProps.options}
          validate={fieldProps.validate}
          error={validationErrors[fieldProps.name]}
          onValidation={fieldProps.onValidation}
          placeholder={fieldProps.placeholder}
          hideLabel={fieldProps.hideLabel}
          accept={fieldProps.accept}
          multiple={fieldProps.multiple}
          prefix={fieldProps.prefix}
          formData={formData}
        />
      </div>
    );
  };

  const skills = formData.skills || [
    { primarySkill: "", skillExperienceLevel: "", skillLastUsed: "" }
  ];

  const handleAddField = () => {
    const newSkills = [...skills, { primarySkill: "", skillExperienceLevel: "", skillLastUsed: "" }];
    onChange("skills", newSkills);
  };

  const handleRemoveField = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange("skills", newSkills);
  };

  const handleSkillChange = (index, fieldName, value) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [fieldName]: value };
    onChange("skills", newSkills);
  };

  const isAddButtonDisabled = skills.some(
    skill => !skill.primarySkill || !skill.skillExperienceLevel || !skill.skillLastUsed
  );

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
                      error={validationErrors.namePrefix}
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
                      error={validationErrors.firstName}
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
        <div className="candidate-type-toggle">
          <label className={`candidate-type-option${isFresher ? " active" : ""}`}>
            <input
              type="radio"
              name="candidateType"
              value="fresher"
              checked={isFresher}
              onChange={() => onChange("candidateType", "fresher")}
            />
            Fresher
          </label>
          <label className={`candidate-type-option${!isFresher ? " active" : ""}`}>
            <input
              type="radio"
              name="candidateType"
              value="experienced"
              checked={!isFresher}
              onChange={() => onChange("candidateType", "experienced")}
            />
            Experienced
          </label>
        </div>
        {!isFresher && (
          <div className="candidate-grid">
            {renderField("currentCompanyName")}
            {renderField("jobTitleRole")}
            {renderField("employmentType")}
            {renderField("noticePeriod")}
            {renderField("currentCtc")}
            {renderField("expectedCtc")}
          </div>
        )}
      </div>

      <div className="candidate-section">
        <div className="candidate-section-header">
          <h3 className="candidate-section-title">Add Skill set</h3>
          <div className="candidate-section-divider" />
        </div>

        {skills.map((skill, index) => (
          <div key={index} className="skill-row-container">
            <div className="candidate-grid">
              <div className="candidate-cell">
                <FormField
                  {...fieldMap.primarySkill}
                  value={skill.primarySkill}
                  onChange={(_, value) => handleSkillChange(index, "primarySkill", value)}
                  formData={formData}
                  hideLabel={index > 0}
                />
              </div>
              <div className="candidate-cell">
                <FormField
                  {...fieldMap.skillExperienceLevel}
                  value={skill.skillExperienceLevel}
                  onChange={(_, value) => handleSkillChange(index, "skillExperienceLevel", value)}
                  formData={formData}
                  hideLabel={index > 0}
                />
              </div>
              <div className="candidate-cell skill-last-used-cell">
                <FormField
                  {...fieldMap.skillLastUsed}
                  value={skill.skillLastUsed}
                  onChange={(_, value) => handleSkillChange(index, "skillLastUsed", value)}
                  formData={formData}
                  hideLabel={index > 0}
                />
                {skills.length > 1 && (
                  <button
                    type="button"
                    className="remove-skill-button"
                    onClick={() => handleRemoveField(index)}
                    title="Remove Skill"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="candidate-section-actions">
          <button
            type="button"
            className={`add-skill-button ${isAddButtonDisabled ? 'disabled' : ''}`}
            onClick={handleAddField}
            disabled={isAddButtonDisabled}
          >
            Add Primary Skill
          </button>
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
