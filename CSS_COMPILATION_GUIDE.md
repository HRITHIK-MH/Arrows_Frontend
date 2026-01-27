# CSS/SCSS Compilation Guide

## 🎨 Overview: CSS Modules in React + Vite

This project uses **SCSS Modules** for styling, which are automatically compiled by Vite during development and build.

---

## 📦 How CSS Compilation Works

### 1. **Development Process**

```
SCSS Module File (.module.scss)
        ↓
   Vite Dev Server (watches for changes)
        ↓
   SCSS Preprocessor (compiles SCSS → CSS)
        ↓
   CSS Modules Plugin (generates unique class names)
        ↓
   Hot Module Replacement (HMR - instant updates)
        ↓
   Browser (styles applied)
```

### 2. **Build Process**

```
SCSS Module Files
        ↓
   Vite Build Command
        ↓
   SCSS Compilation
        ↓
   CSS Modules Processing
        ↓
   CSS Minification & Optimization
        ↓
   dist/assets/*.css (production files)
```

---

## 🔧 Project Setup

### Dependencies

Check your `package.json`:

```json
{
  "devDependencies": {
    "sass": "^1.x.x",           // SCSS compiler
    "vite": "^5.x.x"             // Build tool with CSS Modules support
  }
}
```

### Vite Configuration

In `vite.config.js`:

```javascript
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Additional SCSS options can go here
      }
    },
    modules: {
      // CSS Modules are enabled by default for .module.scss files
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  }
});
```

---

## 📁 File Naming Convention

### ✅ Correct Patterns

```
Component.jsx         → Component.module.scss
JobOpenings.jsx       → JobOpenings.module.scss
Candidates.jsx        → Candidates.module.scss
Dashboard.jsx         → Dashboard.module.scss
```

### ❌ Incorrect (Won't be processed as modules)

```
styles.scss           // Global, not scoped
Component.css         // Regular CSS, not SCSS
styles.module.css     // CSS, but we prefer SCSS
```

---

## 🔄 Import and Usage

### In Your Component

```jsx
// 1. Import the SCSS module
import styles from "./Candidates.module.scss";

// 2. Use the imported styles object
export default function Candidates() {
  return (
    <div className={styles.page}>           {/* ✅ Scoped class */}
      <button className={styles.addButton}> {/* ✅ Scoped class */}
        Add Candidate
      </button>
    </div>
  );
}
```

### What Happens During Compilation

**Your SCSS:**
```scss
.page {
  display: flex;
}

.addButton {
  background: #3f90f6;
}
```

**Compiled to:**
```css
.Candidates__page__Xy8z1 {
  display: flex;
}

.Candidates__addButton__Ab3c4 {
  background: #3f90f6;
}
```

**JavaScript import object:**
```javascript
styles = {
  page: "Candidates__page__Xy8z1",
  addButton: "Candidates__addButton__Ab3c4"
}
```

---

## 🚀 Running the Development Server

### Start Development Mode

```bash
cd frontend
npm run dev
```

**What happens:**
1. Vite starts on `http://localhost:5173`
2. Watches `.module.scss` files for changes
3. Automatically recompiles on save
4. Hot reloads the browser (HMR)

### Check Compilation

Open browser DevTools → Elements tab:

```html
<div class="Candidates__page__Xy8z1">
  <button class="Candidates__addButton__Ab3c4">
    Add Candidate
  </button>
</div>
```

✅ If you see hashed class names → Compilation is working!

---

## 🏗️ Building for Production

### Build Command

```bash
npm run build
```

**Output:**
```
dist/
├── assets/
│   ├── Candidates.abc123.css     (minified)
│   ├── JobOpenings.def456.css    (minified)
│   └── ...
└── index.html
```

### Preview Production Build

```bash
npm run preview
```

This serves the `dist/` folder locally to test production build.

---

## 🔍 Troubleshooting CSS Issues

### Issue 1: Styles Not Applying

**Symptom:**
```jsx
<div className={styles.page}>  // No styles applied
```

**Check:**
1. ✅ File named correctly? `.module.scss`
2. ✅ Import path correct?
   ```jsx
   import styles from "./Candidates.module.scss";
   ```
3. ✅ Class name exists in SCSS file?
4. ✅ Dev server running? (`npm run dev`)

**Debug:**
```jsx
console.log(styles);  // Should show object with class names
```

---

### Issue 2: Class Name Not Found

**Symptom:**
```javascript
console.log(styles.addButton);  // undefined
```

**Fix:**
Check your SCSS file:
```scss
// ❌ Wrong
.add-button {  // Kebab-case
}

// ✅ Correct
.addButton {   // camelCase (or use styles['add-button'])
}
```

---

### Issue 3: Global Styles Leaking

**Problem:** Styles affecting other components

**Fix:**
Ensure you're using `.module.scss` extension:

```scss
// ❌ This is global
.button {
  color: red;
}

// ✅ This is scoped (in .module.scss)
.button {
  color: red;
}

// ✅ Or use :global() for intentional global styles
:global(.truly-global-class) {
  color: red;
}
```

---

### Issue 4: SCSS Syntax Errors

**Symptom:** Build fails with SCSS error

**Common mistakes:**
```scss
// ❌ Missing semicolon
.button {
  color: red
  background: blue;
}

// ❌ Invalid nesting
.button
  .icon {
    color: red;
  }
}

// ✅ Correct
.button {
  color: red;
  background: blue;
  
  .icon {
    color: red;
  }
}
```

---

## 🎓 Best Practices

### 1. Use SCSS Features

```scss
// Variables
$primary-color: #3f90f6;
$spacing: 16px;

.button {
  background: $primary-color;
  padding: $spacing;
}

// Nesting
.card {
  padding: 20px;
  
  .title {
    font-size: 20px;
  }
  
  .description {
    color: #666;
  }
}

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  @include flex-center;
}

// Parent selector
.button {
  background: blue;
  
  &:hover {
    background: darkblue;
  }
  
  &.disabled {
    opacity: 0.5;
  }
}
```

### 2. Organize Your SCSS

```scss
// 1. Variables at the top
$border-color: #e2e8f0;
$border-radius: 8px;

// 2. Main component styles
.page {
  display: flex;
}

.card {
  border: 1px solid $border-color;
  border-radius: $border-radius;
}

// 3. Child elements
.title {
  font-size: 20px;
}

.description {
  color: #666;
}

// 4. Modifiers/states
.button {
  background: blue;
  
  &:hover {
    background: darkblue;
  }
  
  &:disabled {
    opacity: 0.5;
  }
}

// 5. Responsive styles at the end
@media (max-width: 768px) {
  .card {
    padding: 12px;
  }
}
```

### 3. Consistent Naming

```scss
// BEM-inspired naming in CSS Modules
.filterBar { }         // Component
.filterBar__item { }   // Element
.filterBar--active { } // Modifier

// Or simpler camelCase
.filterBar { }
.filterBarItem { }
.filterBarActive { }
```

---

## 📊 Performance Tips

### 1. Avoid Deep Nesting

```scss
// ❌ Too deep (harder to maintain, larger CSS)
.page {
  .card {
    .header {
      .title {
        .icon {
          color: red;
        }
      }
    }
  }
}

// ✅ Flatter structure
.pageCard { }
.cardHeader { }
.cardTitle { }
.titleIcon {
  color: red;
}
```

### 2. Reuse Common Styles

```scss
// Create a shared SCSS file
// styles/_variables.scss
$primary-color: #3f90f6;
$border-radius: 8px;

// Import in your module
@import '../styles/variables';

.button {
  background: $primary-color;
  border-radius: $border-radius;
}
```

### 3. Use CSS Custom Properties for Themes

```scss
.page {
  --primary-color: #3f90f6;
  --spacing: 16px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}
```

---

## 🔗 Integration with JobOpenings & Candidates

### Before (Candidates.jsx - inline styles)

```jsx
<div style={{
  padding: '12px 16px',
  backgroundColor: '#d4edda',
  color: '#155724'
}}>
  Success!
</div>
```

### After (Candidates.jsx - CSS Modules)

```jsx
// Component
<div className={styles.successMessage}>
  Success!
</div>

// SCSS
.successMessage {
  padding: 12px 16px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 8px;
  animation: slideDown 0.3s ease-out;
}
```

**Benefits:**
- ✅ Reusable across components
- ✅ Easier to maintain
- ✅ Can add animations, hover states
- ✅ Better performance
- ✅ Responsive styles

---

## 📝 Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean install (if issues)
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Verification Checklist

After making changes:

- [ ] Dev server running (`npm run dev`)
- [ ] Browser shows updated styles (check DevTools)
- [ ] No console errors
- [ ] Scoped class names visible in DOM
- [ ] Responsive design works (test mobile view)
- [ ] Production build successful (`npm run build`)
- [ ] No SCSS compilation errors

---

## 🔄 Complete Workflow Example

### 1. Create SCSS Module

**File:** `Candidates.module.scss`
```scss
.page {
  display: flex;
  flex-direction: column;
}

.addButton {
  background: #3f90f6;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  
  &:hover {
    background: #2f7be0;
  }
}
```

### 2. Import in Component

**File:** `Candidates.jsx`
```jsx
import styles from "./Candidates.module.scss";

export default function Candidates() {
  return (
    <div className={styles.page}>
      <button className={styles.addButton}>
        Add Candidate
      </button>
    </div>
  );
}
```

### 3. Run Dev Server

```bash
npm run dev
```

### 4. Check Browser

Open `http://localhost:5173` and inspect element:

```html
<div class="Candidates__page__Xy8z1">
  <button class="Candidates__addButton__Ab3c4">
    Add Candidate
  </button>
</div>
```

✅ **Success!** Styles are compiled and applied.

---

## 🎉 Summary

| Aspect | Details |
|--------|---------|
| **Tool** | Vite with built-in SCSS & CSS Modules support |
| **File Extension** | `.module.scss` |
| **Compilation** | Automatic during `npm run dev` and `npm run build` |
| **Class Naming** | Automatically scoped with hashes |
| **HMR** | Yes - instant updates without refresh |
| **Import** | `import styles from "./File.module.scss"` |
| **Usage** | `className={styles.className}` |
| **Build Output** | Minified CSS in `dist/assets/` |

---

Your CSS compilation is now properly set up! The Candidates page should now have consistent, maintainable styles that match the JobOpenings page design. 🎨✨
