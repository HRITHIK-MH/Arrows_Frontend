import React, { useEffect, useMemo } from "react";
import FormField from "./FormField";

const EmployeeBasicInfoStep = ({
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
    const value = formData[field.name] || "";

    return (
      <div className={`employee-cell${extraClass ? ` ${extraClass}` : ""}`}>
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
          prefix={field.prefix}
          formData={formData}
          disabled={field.disabled}
        />
      </div>
    );
  };

  return (
    <div className="employee-step">
      <div className="employee-grid">
        {renderField("consultantName")}
        {renderField("joiningDate")}
        {renderField("entity")}
        {renderField("workLocation")}
        {renderField("mode")}
        {renderField("cost")}
        {renderField("customer")}
        {renderField("billingType")}
      </div>
    </div>
  );
};

export default EmployeeBasicInfoStep;
