# Reusable Multi-Step Form System

This system allows you to create complex multi-step forms with AJAX validation that can be easily reused across different pages.

## Components

### 1. `ReusableForm` - Main component
The core component that handles form logic, validation, and data display.

### 2. `FormField` - Input component
Handles different input types with built-in validation and error display.

### 3. `MultiStepForm` - Form flow manager
Manages step navigation and form submission.

### 4. `DataTable` - Data display
Shows submitted form data in a table format.

## How to Use

### Step 1: Create a Form Configuration

```javascript
const myFormConfig = {
  title: "My Custom Form",
  itemName: "Submissions", // What to call the submitted items
  steps: [
    {
      title: "Personal Information",
      fields: [
        {
          name: "firstName",
          label: "First Name",
          type: "text",
          required: true
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          required: true
        }
      ]
    },
    {
      title: "Additional Details",
      fields: [
        {
          name: "experience",
          label: "Years of Experience",
          type: "number",
          required: true,
          validationRule: "experience" // Reference to validation rule
        }
      ]
    }
  ],
  validationRules: {
    experience: (value, fieldName, formData) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return { isValid: false, message: "Please enter a valid experience" };
      }
      return { isValid: true };
    }
  },
  columns: [
    { key: 'firstName', label: 'First Name' },
    { key: 'email', label: 'Email' },
    { key: 'experience', label: 'Experience' }
  ]
};
```

### Step 2: Use in Your Component

```jsx
import ReusableForm from '../components/forms/ReusableForm';

const MyPage = () => {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
    // Handle form submission (API call, etc.)
  };

  return (
    <ReusableForm
      config={myFormConfig}
      onSubmit={handleSubmit}
    />
  );
};
```

## Field Types Supported

- `text` - Regular text input
- `email` - Email input with validation
- `number` - Number input
- `tel` - Telephone input
- `textarea` - Multi-line text input
- `select` - Dropdown selection (requires `options` array)

## Validation Rules

Validation rules are functions that return:
- `{ isValid: true }` for valid input
- `{ isValid: false, message: "Error message" }` for invalid input

Rules receive three parameters:
- `value` - The current field value
- `fieldName` - The name of the field being validated
- `formData` - All current form data (for cross-field validation)

## Examples

See `src/components/forms/formConfigs.js` for complete examples:
- Job Application Form
- Contact Form

## Navigation

Add to your routes and sidebar navigation as needed. The system is completely self-contained and reusable.