# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a two-package repo for an iHOMIS (hospital information system) add-on. The two packages are developed and deployed independently:

- `ihomis_forms/` — Vite + React 18 + TypeScript frontend (the actual app). **This is where almost all work happens.**
- `backend_ihomis_forms/` — Express 5 + MySQL backend (CommonJS, Node 18+) that reads the legacy iHOMIS clinical database and proxies Supabase lab-PDF storage.
- The root `package.json` only pins `jspdf`/`html2canvas` and is not the app entry — ignore it for development.

The app is **embedded inside the host iHOMIS system**. It expects a `?uid=<userId>` query param on load and validates that user against the `VITE_TRACKING_USERS` API before granting access (see `useValidateUid` in `ihomis_forms/src/App.tsx`). With no valid `uid` and no session, it shows a login page.

## Commands

Run these from inside the respective package directory (not the repo root).

**Frontend (`ihomis_forms/`):**
- `npm run dev` — Vite dev server on port 5173. Proxies `/api/*` to `http://localhost:3000` (see `vite.config.js`), so run the backend alongside it.
- `npm run build` — `tsc -b && vite build`. The TS project build is the only type-check gate.
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm run preview` — Serve the production build.

**Backend (`backend_ihomis_forms/`):**
- `npm run dev` — nodemon on `src/server.js`, port 3000 (or `PORT`).
- `npm start` — production start.
- No test runner is configured in either package (`npm test` is a no-op).

## Three data sources

The architecture's central complexity is that data comes from three distinct backends — know which one you're touching:

1. **Legacy iHOMIS MySQL DB** (via the Express backend, `mysql2` pool in `backend_ihomis_forms/src/config/db.js`). Read-only access to real hospital tables: `henctr` (encounters), `hperson`/`hpercode` (patients), `hdocord` (document orders — also serves as the lab "orders" table), `hadmlog`, `hphicclaim`, `hnewborn`, etc. The frontend reaches this through `/api/db/*` endpoints. See `backend_ihomis_forms/README.md` for the full endpoint + table-mapping reference.
2. **Supabase** (directly from the frontend via `@supabase/supabase-js`). Holds app-owned data: `hospital_forms` (which forms are active), `form_bundles` + `bundle_items` (form bundling), tagging/tracking workflow rows, lab-result PDF storage, and form-header logos. Clients are created in `ihomis_forms/src/lib/supabaseClient.ts` and a duplicate in `src/modules/tracking/hooks/supabaseClient.ts`.
3. **External iHOMIS user API** (`VITE_TRACKING_USERS`) — user identity/validation, separate from both of the above.

## Frontend architecture

**Navigation is split between React Router and an in-component state machine.** `src/App.tsx` defines real routes (`/modules/forms`, `/modules/lab-upload`, `/tracking`, `/tagging`, `/settings/forms-validation`) but the default `/` route renders `AppShell`, which internally switches between "landing pages" (login → patient-selection → module-navigator → tracking → tagging) using a `landingPage` state value and `LANDING_PAGE` enum, **not** routes. When editing navigation flow, check both mechanisms. Each route/page guards on `currentUserId` and re-runs `useValidateUid`.

The flow is patient-centric: pick a patient → pick an encounter → enter a module. `useLabPatientPicker` (`src/modules/labUpload/hooks/`) is the shared patient/encounter picker used across all modules, including the Forms and Tracking flows.

**Modules** live under `src/modules/`:
- `forms/` — the medical form library (~80 form components, one `.tsx` + `.css`/`.module.css` each).
- `labUpload/` — diagnostic/lab PDF upload with workflow tracking (`hooks/`, `components/`, `api/`).
- `tracking/` — CHART tracking table + the `Tagging` workflow (assigning users to record steps; access controlled via Supabase, see `hooks/useTagAccess.ts`, `useTaggingSession.ts`).
- `validation/` — checks whether required forms already exist for a patient/encounter.

### The form rendering & printing system

This is the most non-obvious subsystem. Do not assume forms are exported with jsPDF — they use **native browser print**:

- `src/lib/formRegistry.ts` auto-discovers every form component via `import.meta.glob("../modules/forms/!(*Forms*|Modal|Sidebar).{js,jsx,ts,tsx}")` and builds `FORM_COMPONENT_MAP` keyed by the file's component name. A form selected in Supabase (`hospital_forms.component_name`) is resolved through this map.
- `COMPONENT_ALIASES` fixes filename/DB-name mismatches (e.g. `BloodTransfusionSheet` → `BloodtransfusionSheet`). `MULTI_PAGE_COMPONENTS` flags forms that need a fluid (non-A4-clamped) print container. Update these sets when adding or renaming a multi-page form.
- `src/lib/printController.tsx` + `PrintRegistry.tsx` mount the selected forms into a hidden `#print-registry-container`, wait for fonts/images/layout (note the deliberate ~1s delay for Supabase logos), call `window.print()`, then unmount. A4 page CSS lives in `printController`'s `GLOBAL_PRINT_STYLES`.
- Bundles (`src/lib/formBundleQueries.ts`) let one click select many forms; `useFormBundles` merges bundle form IDs into the existing checkbox selection `Set`.

When adding a new form: create `src/modules/forms/<Name>.tsx` (default export), add its display name to `formCatalog.ts`, register the row in Supabase `hospital_forms`, and — if multi-page — add it to `MULTI_PAGE_COMPONENTS`.

### TypeScript note

`tsconfig.json` has `strict: false` and unused-checks off. Many `.tsx` files (e.g. `App.tsx`) contain untyped/plain-JS function params and `any` casts. Match the loose style of the surrounding file rather than introducing strict typing piecemeal; the build only fails on hard type errors.

## Backend architecture

Standard layered Express: `server.js` → `app.js` (CORS, json, morgan, mounts routers) → `routes/` → `controllers/` → `utils/` (query/mapping helpers like `chartTrackingHelpers.js`, `babyFormHelpers.js`). MySQL access is a shared pool; Supabase admin access (service role) is in `config/supabase.js` for lab-PDF storage.

Endpoints are almost all read-only `GET`s under `/api/db`, `/api/health`, `/api/validation`. **Route ordering matters** in `routes/dbRoutes.js`: the more specific `/patients/:hpercode/encounters` is registered before `/patients/history/:hpercode` to avoid Express matching the wrong handler — preserve such ordering when adding routes.

CORS in `app.js` allows all origins when `NODE_ENV !== 'production'`; in production it checks `CLIENT_ORIGIN` + a localhost allowlist.

## Environment configuration

Both packages use `.env` files (copy from each package's `.env.example`); the backend loads via `dotenv`, the frontend via Vite's `import.meta.env` (all frontend vars must be prefixed `VITE_`).

- **Backend:** `MYSQL_HOST/PORT/USER/PASSWORD/DATABASE`, `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_LAB_BUCKET`, `CLIENT_ORIGIN`.
- **Frontend (`VITE_` prefixed):** `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, `VITE_TRACKING_USERS` (user-validation API), `VITE_CHART_TRACKING`, `VITE_VALIDATION_API[_URL]`, `VITE_API_URL` + lab-specific `VITE_LAB_*` URLs, `VITE_SUPABASE_DEPTCODE_FOR_TRACKING` (gates Chart Tracker access by department), and `VITE_SUPABASE_*_LOGO_*` for the printed form header. Grep `import.meta.env` for the authoritative list before assuming a var exists.

## Deployment

The backend ships with a `Dockerfile` (port 3000) and is also Nixpacks/Coolify-ready (`npm install` / `npm start`); health check is `GET /api/health`. Details in `backend_ihomis_forms/README.md`.
