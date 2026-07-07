# Chunk Loading Error: Resolution Guide

## Issue Summary
**Error**: `TypeError: Failed to fetch dynamically imported module: https://.../assets/JobOpenings-XXX.js`

This error indicates that a lazy-loaded component chunk failed to download from the deployment server, resulting in a broken page.

## Why This Happens

1. **Missing chunks in deployment** - The build process generated chunks but they weren't uploaded to the server
2. **Stale build deployed** - An old or development build was deployed instead of a fresh production build
3. **Incorrect asset paths** - Vite's build configuration doesn't match the deployment URL structure
4. **Network/CORS issues** - The browser can't download chunks due to network blocks or CORS restrictions
5. **Server misconfiguration** - Asset serving is misconfigured (wrong content-type, missing gzip, etc.)

## How We Fixed It

### 1. Error Boundary + Auto-Retry
A new `ChunkErrorBoundary` component catches chunk loading failures and:
- Automatically retries loading up to 3 times with exponential backoff
- Shows a user-friendly error message instead of white screen
- Provides manual retry and home navigation options

### 2. Improved Error Logging
All lazy imports now use `lazyWithRetry()` helper which:
- Logs which component failed to load
- Marks errors as chunk loading errors for better debugging
- Provides component names in error messages

### 3. All Routes Protected
Routes are now wrapped with `ChunkErrorBoundary` to catch any chunk errors from any page.

## Pre-Deployment Verification

### For Developers

Before pushing code or deploying:

```bash
# 1. Build locally
npm run build

# 2. Verify chunks were created (Linux/Mac)
./verify-build.sh

# Or on Windows:
verify-build.bat

# 3. Preview locally to test chunk loading
npm run preview

# 4. Visit http://localhost:4173 and test navigation to:
# - /job-openings (uses JobOpenings chunk)
# - /candidates (uses Candidates chunk)
# - /dashboard (uses Dashboard chunk)
```

### For DevOps/Deployment Teams

Before deploying:

1. **Verify all files in dist/ are present**:
   ```bash
   # Should have all these directories:
   ls -la dist/
   # - assets/ (with .js, .css, .png files)
   # - index.html
   # - vite.svg
   
   # All JS files should be > 5KB (not empty):
   find dist/assets -name "*.js" -exec du -h {} \;
   ```

2. **Upload entire dist/ folder** (not selective files):
   - Platform: Upload ALL files from dist/
   - Don't skip *.map, *.svg, or index.html
   - Verify folder structure is preserved

3. **Check content-type headers** on the server:
   ```bash
   curl -I "https://your-app.com/assets/main-xxx.js"
   # Should return: Content-Type: application/javascript or text/javascript
   # Should return: HTTP 200 (not 404)
   ```

4. **Test in staging environment** before production:
   - Navigate to all major routes
   - Check browser console for errors
   - Look for 404s in Network tab

## Troubleshooting in Production

### Symptom: White screen with loading spinner, then error modal

**Steps**:
1. **Check browser console** (F12 → Console):
   - Look for 404 or fetch errors
   - Note the exact URL that failed

2. **Check Network tab**:
   - Look for failed requests to `/assets/*.js`
   - Click on failed request to see response
   - Should be 404 or other HTTP error

3. **Check server logs** for that time period:
   - Look for 404s for .js files
   - Check disk space (might be full)
   - Check file permissions

### Symptom: Chunk loads but different component appears or component broken

**Cause**: Build hash mismatch or corrupted chunk

**Fix**:
```bash
# Rebuild with cache cleared:
rm -rf dist
npm run build

# Verify before uploading:
ls -la dist/assets/*.js
# All files should be > 5KB
```

### Symptom: Error only on specific route (e.g., only JobOpenings fails)

**Cause**: That specific chunk file is missing

**Fix**:
```bash
# Verify chunk exists in dist:
ls dist/assets/*JobOpenings*.js

# If not found, check vite.config.js to ensure this route is lazy-loaded
# The component should use: const Component = lazy(() => import(...))
```

### Symptom: Works locally but not in deployed environment

**Causes**:
- Using development build instead of production
- Base URL mismatch
- Asset path misconfiguration

**Fix**:
```bash
# Always deploy production build:
npm run build
# NOT from node_modules or dist from old build

# Check Vite base URL config:
cat org/Arrows_Frontend/vite.config.js | grep -A5 "base:"
# Should match your deployment URL structure
```

## Key Files for This Fix

1. **ChunkErrorBoundary.jsx** - Error handling component
   - Location: `src/components/ChunkErrorBoundary.jsx`
   - Purpose: Catches chunk loading errors and shows recovery UI

2. **App.jsx** - Updated with retry logic and error boundary
   - Changes: Added `lazyWithRetry()` helper
   - All routes wrapped with `ChunkErrorBoundary`

3. **verify-build.sh / verify-build.bat** - Build verification scripts
   - Run after `npm run build` to ensure chunks exist
   - Checks for critical chunks (JobOpenings, Candidates, Dashboard)
   - Verifies file sizes are not suspiciously small

## Vite Configuration Reference

Key settings in `vite.config.js`:

```javascript
// Manual chunk splitting for better caching
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'mui-vendor': ['@mui/material', ...],
        'react-vendor': ['react', 'react-dom', ...],
        'chart-vendor': ['recharts'],
        'utils': ['axios'],
      }
    }
  },
  chunkSizeWarningLimit: 1000,
  minify: 'esbuild',
  sourcemap: false,
}
```

## Deployment Checklist

- [ ] Run `npm run build` in org/Arrows_Frontend directory
- [ ] Run `verify-build.sh` (or `.bat` on Windows) and confirm "PASSED"
- [ ] All critical chunks appear in `dist/assets/`: JobOpenings, Candidates, Dashboard, etc.
- [ ] No empty .js files (all > 5KB)
- [ ] Upload ENTIRE `dist/` folder (not selective files)
- [ ] Test in staging environment first
- [ ] Navigate through multiple routes to test chunk loading
- [ ] Check browser console - should be clean (no 404s or fetch errors)
- [ ] Monitor production logs after deployment

## Quick Recovery (If Already Deployed)

If chunk loading errors occur in production and users are affected:

1. **Immediate**: Error boundary UI shows retry button - users can retry
2. **Short-term**: Users can refresh page (F5) - will reload all chunks
3. **Fix**: 
   - Rebuild locally: `npm run build`
   - Verify chunks exist: `./verify-build.sh`
   - Re-deploy entire dist/ folder
   - Clear CDN cache if applicable

## Questions?

Common issues and solutions in this guide:
- Missing chunks → Run verify-build script
- Build verification failed → Check vite.config.js manualChunks
- 404 on deployed assets → Verify entire dist/ folder was uploaded
- Content-Type wrong → Check web server configuration
- Works locally but not deployed → Using wrong build, see "Pre-Deployment Verification"
