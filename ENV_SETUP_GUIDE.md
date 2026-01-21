# Environment Configuration Guide

## Setup Instructions

### 1. Create Environment File

Create a new file in the `frontend/` directory:

```bash
touch .env.local
```

### 2. Add Configuration

Copy the following into `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Optional: Debug mode
VITE_DEBUG=false
```

### 3. Configuration Variables Explained

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` | ✅ Yes |
| `VITE_DEBUG` | Enable debug logging | `true` or `false` | ❌ No |

---

## Environment-Specific Setup

### Development Environment

**.env.local** (local development)
```env
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
```

### Staging Environment

**.env.staging** (staging server)
```env
VITE_API_URL=https://staging-api.yourcompany.com/api
VITE_DEBUG=false
```

### Production Environment

**.env.production** (production)
```env
VITE_API_URL=https://api.yourcompany.com/api
VITE_DEBUG=false
```

---

## Updating Environment Files

### Development
```bash
npm run dev
# Uses .env.local or .env
```

### Build for Production
```bash
npm run build
# Uses .env.production or .env
```

### Build for Staging
```bash
VITE_ENV=staging npm run build
# Uses .env.staging
```

---

## How Variables Are Accessed in Code

```javascript
// In any file:
const apiUrl = import.meta.env.VITE_API_URL;
const debugMode = import.meta.env.VITE_DEBUG === 'true';

// Example usage in axiosConfig.js:
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});
```

---

## Vite Environment Variables

Vite exposes environment variables prefixed with `VITE_` to the client-side code.

### Available Vite Variables

| Variable | Access | Scope |
|----------|--------|-------|
| `VITE_*` | `import.meta.env.VITE_*` | Client-side only |
| `VITE_API_URL` | `import.meta.env.VITE_API_URL` | Everywhere in client |
| `VITE_DEBUG` | `import.meta.env.VITE_DEBUG` | Everywhere in client |

### Built-in Vite Variables

```javascript
// Available in all environments
import.meta.env.MODE        // 'development' or 'production'
import.meta.env.DEV         // true in development
import.meta.env.PROD        // true in production
import.meta.env.SSR         // server-side rendering flag
```

---

## Backend Integration

### Expected Backend Setup

Your backend should:

1. **Be running on configured URL**
   ```
   http://localhost:3000/api
   ```

2. **Accept JSON requests**
   ```
   Content-Type: application/json
   ```

3. **Implement CORS** (if frontend on different domain)
   ```javascript
   // Example Express CORS setup
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

4. **Support these endpoints** (as used in constants.js)
   ```
   GET    /api/job-openings
   POST   /api/job-openings
   PUT    /api/job-openings/:id
   DELETE /api/job-openings/:id

   GET    /api/candidates
   POST   /api/candidates
   PUT    /api/candidates/:id
   DELETE /api/candidates/:id

   GET    /api/interviews
   POST   /api/interviews

   GET    /api/hr-staff
   POST   /api/hr-staff
   ```

5. **Return data in format**
   ```json
   {
     "data": {},
     "success": true,
     "message": "Success"
   }
   ```

---

## Testing API Connection

### Using Browser DevTools

1. Open **DevTools** → **Network** tab
2. Make a request in the app (e.g., load candidates)
3. Look for network request to your API
4. Check:
   - ✅ Status: 200
   - ✅ Response: JSON data
   - ✅ Headers: Include Authorization if needed

### Using cURL

```bash
curl -X GET http://localhost:3000/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Console Logs

```javascript
// Open browser console (F12)
// API calls will show in Network tab
// Errors will show in Console tab
// Performance metrics logged on page load
```

---

## .gitignore Setup

**Make sure these files are in .gitignore:**

```
# Environment files
.env
.env.local
.env.staging
.env.production
.env.*.local

# Node modules
node_modules/
package-lock.json

# Build outputs
dist/
build/

# Development
.DS_Store
*.swp
*.log
```

---

## Common Issues & Solutions

### Issue: "Failed to fetch" in browser

**Cause:** API URL not set or backend not running

**Solution:**
1. Check `.env.local` has correct `VITE_API_URL`
2. Verify backend is running on that URL
3. Check CORS settings on backend

### Issue: 401 Unauthorized errors

**Cause:** Authentication token missing or expired

**Solution:**
1. Login first to get token
2. Token stored in localStorage by API interceptor
3. Check Network tab to see Authorization header

### Issue: CORS errors

**Cause:** Frontend and backend on different domains

**Solution:**
1. Update backend CORS settings
2. Allow frontend origin
3. Include credentials in requests

---

## Advanced Configuration

### Custom API Headers

Edit `src/api/axiosConfig.js`:

```javascript
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value', // Add custom header
  },
});
```

### Request/Response Interceptors

Already configured in `axiosConfig.js`:
- **Request:** Adds authorization token
- **Response:** Handles 401, 403, 500 errors
- **Auto-redirect:** Redirects to login on 401

---

## Deployment Checklist

- [ ] `.env.production` created with correct backend URL
- [ ] Backend API is deployed and running
- [ ] CORS is configured on backend
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Database migrations run on backend
- [ ] API endpoints tested and working
- [ ] Authentication flow verified
- [ ] Environment variables NOT committed to git

---

## Reference

- [Vite Env Variables Documentation](https://vitejs.dev/guide/env-and-modes)
- [Axios Configuration](https://axios-http.com/docs/config_defaults)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

