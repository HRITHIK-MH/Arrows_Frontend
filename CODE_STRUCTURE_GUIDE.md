# Code Structure Guide: Job Openings & Candidates Forms

## 📁 Project Architecture Overview

### Directory Structure
```
frontend/src/
├── components/
│   └── forms/
│       ├── formConfigs.js      # Central configuration for all forms
│       ├── ReusableForm.jsx    # Generic form component
│       └── DataTable.jsx       # Reusable data table component
│
├── pages/
│   └── job-openings/
│       ├── JobOpenings.jsx          # Job Openings page component
│       ├── Candidates.jsx           # Candidates page component
│       └── JobOpenings.module.scss  # Shared styles (used by both)
│
└── utils/
    ├── debounce.js           # Performance utility for search
    └── formValidation.js     # Validation utilities
```

---

## 🎯 Key Architecture Principles

### 1. **Separation of Concerns**
- **Configuration**: Form structure in `formConfigs.js`
- **Logic**: Business logic in component files (`.jsx`)
- **Presentation**: Styles in SCSS modules (`.module.scss`)

### 2. **Component Reusability**
- `ReusableForm` renders any form based on config
- `DataTable` displays any data with custom columns
- Both JobOpenings and Candidates share the same components

### 3. **Performance Optimization**
- React.memo() for filter components
- useMemo() for expensive calculations
- useCallback() for stable function references
- Debounced search (300ms delay)

---

## 🔧 How Components Work Together

### Form Configuration System

**File: `formConfigs.js`**
```javascript
export const jobOpeningConfig = {
  title: "Create Job Opening",
  itemName: "Job Openings",
  steps: [/* multi-step form structure */],
  validationRules: {/* custom validation */},
  columns: [/* table column definitions */]
};

export const candidateConfig = {
  title: "Add Candidate",
  itemName: "Candidates",
  steps: [/* multi-step form structure */],
  validationRules: {/* custom validation */},
  columns: [/* table column definitions */]
};
```

**Key Concept**: One config object controls:
- Form fields and layout
- Validation rules
- Table column display

---

## 📝 Page Components Breakdown

### JobOpenings.jsx Structure

```jsx
export default function JobOpenings() {
  // 1. STATE MANAGEMENT
  const [showJobOpeningForm, setShowJobOpeningForm] = useState(false);
  const [submittedData, setSubmittedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // 2. PERFORMANCE OPTIMIZATIONS
  const debouncedSearch = useMemo(() => debounce(...), []);
  const filteredData = useMemo(() => /* filter logic */, [deps]);
  const uniqueValues = useMemo(() => /* unique filter options */, [data]);

  // 3. EVENT HANDLERS (useCallback for stability)
  const handleCreate = useCallback(() => {...}, []);
  const handleSubmit = useCallback((data) => {...}, []);

  // 4. RENDER
  return (
    <div className={styles.page}>
      {/* Info header with create button */}
      {/* Form (conditional) */}
      {/* FilterBar (memoized component) */}
      {/* DataTable */}
    </div>
  );
}
```

### Candidates.jsx Structure
**Same pattern as JobOpenings.jsx but with:**
- Different form config (`candidateConfig`)
- Different filter fields
- Currently uses **inline styles** instead of module classes

---

## 🎨 CSS/SCSS Module System

### Current Situation

**JobOpenings.jsx** ✅
```jsx
import styles from "./JobOpenings.module.scss";
<div className={styles.page}>
  <button className={styles.createButton}>
```

**Candidates.jsx** ⚠️
```jsx
import styles from "./JobOpenings.module.scss"; // Uses same file!
<div className={styles.card}> // Limited usage
<div style={{ padding: '12px' }}> // Mostly inline styles
```

### SCSS Module Features

**JobOpenings.module.scss** contains:
```scss
.page            // Page container
.jobCard         // Card wrapper
.infoRow         // Header row with description
.createButton    // Styled create button
.filtersBar      // Filter container
.searchField     // Search input styling
.selectField     // Filter dropdown styling
.tableWrap       // Table container
.statusPill      // Status badges
.pipelineCard    // Recruitment pipeline styles
```

---

## 🔄 Data Flow Diagram

```
User Interaction
     ↓
Event Handler (useCallback)
     ↓
State Update (useState)
     ↓
Memoized Calculations (useMemo)
     ↓
Re-render (React.memo components)
     ↓
Updated UI
```

### Example: Search Flow
```
User types → debouncedSearch → setSearchTerm (300ms later)
                                      ↓
                            filteredData (useMemo recalculates)
                                      ↓
                            DataTable re-renders with filtered data
```

---

## 🎯 Current Problem: Candidates Styling

### Issue
Candidates.jsx uses:
1. **Shared SCSS file** (JobOpenings.module.scss)
2. **Inline styles** for most elements
3. **Inconsistent styling** patterns

### Solution Needed
Create `Candidates.module.scss` with:
- Consistent class names
- Proper SCSS variables
- Responsive design
- Matching visual design to JobOpenings

---

## 🚀 Form Workflow

### Creating a New Job Opening/Candidate

1. **User clicks "Create" button**
   ```jsx
   onClick={handleCreateJobOpening}
   ```

2. **State updates to show form**
   ```jsx
   setShowJobOpeningForm(true);
   setShowDataTable(false);
   ```

3. **ReusableForm renders with config**
   ```jsx
   <ReusableForm
     config={jobOpeningConfig}
     onSubmit={handleJobOpeningSubmit}
   />
   ```

4. **User fills and submits form**
   - Real-time validation runs
   - Field-level error messages display
   - Submit button enables when valid

5. **Submit handler processes data**
   ```jsx
   const handleJobOpeningSubmit = (data) => {
     setSubmittedData(prev => [...prev, data]);
     setShowJobOpeningForm(false);
     setShowDataTable(true);
     setShowSuccessMessage(true);
     // API call would go here
   };
   ```

6. **UI updates**
   - Form hides
   - Table shows with new row
   - Success message displays (auto-hide after 3s)

---

## 🔍 Filtering System

### Filter Components (Memoized)

**JobOpenings**: `FilterBar` component
**Candidates**: `CandidateFilterBar` component

### Filter Logic (Memoized)

```jsx
const filteredData = useMemo(() =>
  normalizedData.filter(item => {
    const matchesSearch = /* check all fields */;
    const matchesFilter1 = /* check specific field */;
    const matchesFilter2 = /* check specific field */;
    
    return matchesSearch && matchesFilter1 && matchesFilter2;
  }),
  [normalizedData, searchTerm, filter1, filter2]
);
```

**Performance Benefit**: Only recalculates when dependencies change, not on every render.

---

## 📊 DataTable Integration

### Column Configuration

```javascript
const tableColumns = [
  { key: 'openingJobId', label: 'Opening Job Id' },
  { key: 'postingTitle', label: 'Posting Title' },
  {
    key: 'jobOpeningStatus',
    label: 'Job Opening Status',
    render: (value) => (
      <span className={`${styles.statusPill} ${getStatusClass(value)}`}>
        {value}
      </span>
    )
  }
];
```

### Actions

```jsx
<DataTable 
  data={filteredData} 
  columns={tableColumns}
  onView={handleViewJobOpening}
  onEdit={handleEditJobOpening}
  onDelete={handleDeleteJobOpening}
/>
```

---

## 🎓 Teaching Your Team Member

### Step-by-Step Walkthrough

1. **Start with formConfigs.js**
   - "This is our single source of truth for form structure"
   - Show how one config controls everything

2. **Explain ReusableForm**
   - "This reads the config and builds the form automatically"
   - "We don't hard-code forms - we configure them"

3. **Walk through JobOpenings.jsx**
   - "State at the top, handlers in the middle, render at the bottom"
   - Point out useMemo and useCallback
   - Explain why we optimize

4. **Show the styling system**
   - "SCSS modules prevent style conflicts"
   - "Each component imports its own styles"
   - "Classes are locally scoped"

5. **Demonstrate the data flow**
   - Create a job opening together
   - Watch the state change
   - See the table update

---

## 🛠️ Next Steps: Duplicating to Candidates

### What Needs to be Done

1. **Create Candidates.module.scss**
   - Copy JobOpenings.module.scss
   - Adapt class names if needed
   - Maintain same structure

2. **Update Candidates.jsx**
   - Replace inline styles with module classes
   - Match the structure of JobOpenings.jsx
   - Use consistent patterns

3. **Test thoroughly**
   - Verify all styles apply correctly
   - Check responsive behavior
   - Test filters and search

---

## 📚 Key Concepts to Remember

### React Performance Hooks

| Hook | Purpose | When to Use |
|------|---------|-------------|
| `useMemo` | Cache expensive calculations | Filter logic, unique values |
| `useCallback` | Stable function references | Event handlers passed to children |
| `React.memo` | Prevent unnecessary re-renders | Pure components like FilterBar |

### CSS Modules Benefits

- ✅ No global namespace pollution
- ✅ Automatic class name scoping
- ✅ Co-located with components
- ✅ Type-safe with TypeScript
- ✅ Better code splitting

### Form Configuration Pattern

**Advantages**:
- One place to modify form structure
- Easy to add/remove fields
- Validation rules co-located
- Table columns defined together
- Reduces duplication

---

## 🐛 Common Issues & Solutions

### Issue: Styles not applying
**Solution**: Check if className uses `styles.` prefix
```jsx
// ❌ Wrong
<div className="createButton">

// ✅ Correct
<div className={styles.createButton}>
```

### Issue: Filter not working
**Solution**: Check dependencies in useMemo
```jsx
// Ensure all state used inside is listed
useMemo(() => { /* filter logic */ }, [
  data, 
  searchTerm, 
  filter1, 
  filter2  // Don't forget any!
]);
```

### Issue: Performance lag
**Solution**: Add debouncing and memoization
```jsx
const debouncedSearch = useMemo(
  () => debounce((term) => setSearchTerm(term), 300),
  []
);
```

---

## 🎯 Summary for Team Discussion

### Architecture Highlights
1. **Config-driven forms** = Less code, more flexibility
2. **SCSS modules** = Clean, scoped styling
3. **Performance hooks** = Fast, responsive UI
4. **Reusable components** = DRY principle

### Current Task
- Duplicate JobOpenings styling to Candidates
- Replace inline styles with SCSS module classes
- Maintain visual consistency
- Ensure responsive design

### Success Criteria
- ✅ Candidates looks identical to JobOpenings
- ✅ No inline styles remain
- ✅ All filters work correctly
- ✅ Responsive on mobile/tablet/desktop
- ✅ Code follows same patterns
