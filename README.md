# Arrows Frontend

Frontend application for MethodHub recruitment workflows (Dashboard, Job Openings, Candidates, Interviews, Clients, Calendar, Reports, User Roles).

## Repo Structure

- `frontend/` – React + Vite application
- `.env.example` – repo-level environment pointer

## Current Cleanup Baseline

- Node artifacts are excluded (`node_modules`, `dist`, lock files per current policy).
- Environment setup is mode-based:
  - `frontend/.env.dev`
  - `frontend/.env.prod`
- Styling approach:
  - one global stylesheet entry: `frontend/src/styles/globals.scss`
  - page/component-level styles in local `*.module.scss` / component CSS files.
- Icon approach:
  - standardized on React icon components (Feather/Lucide-style via `react-icons`).
- Images:
  - app images live under `frontend/src/assets/` (and minimal static files under `frontend/public/` only when needed).

## Start Frontend

```bash
cd frontend
npm install
npm run dev
```
