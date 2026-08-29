# KYMRSTUDIO EXECUTIVE PORTAL HANDOFF SPECIFICATION

## FRAMEWORK & RUNTIME
- Frontend Framework: React 18 / Vite
- Backend Runtime: Node.js (Express)
- Package Manager: npm (or bun/pnpm)

## COMMANDS
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Production Start: `npm run start`

## ARCHITECTURE
- **Admin Entry Point**: `/src/main.tsx` mapped to `/` in this repository. When integrated by Antigravity, this should map to `/admin` relative to the root URL.
- **Backend Entry Point**: `/server.ts`
- **SPA Fallback**: Express falls back to `dist/index.html` for all unknown routes, delegating them to the React router.

## API ROUTES
- **POST `/api/public/inquiries`**: 
  - Validates public form submissions.
  - Strips restricted internal CRM fields (e.g., status, priority, convertedClientId).
  - Verifies idempotency keys (`Idempotency-Key` header).
  - Handles basic in-memory rate limiting.
  - Persists clean records to the Firestore `inquiries` collection securely via Admin SDK.
- **POST `/api/webhooks/calcom`**:
  - Webhook receiver for Cal.com events (e.g., `BOOKING_CREATED`).
  - Verifies payload authenticity via HMAC SHA-256 against `CALCOM_WEBHOOK_SECRET` and raw request body.
  - Deduplicates events via querying Firestore `meetings` for existing `externalBookingId`.
  - Parses attendee email to link meetings to existing `clients` or recent `inquiries`.

## SECURITY & DATA
- **Firebase Boundary**: All private CRM Firestore read/write operations (e.g., clients, inquiries, quotes, projects) must remain restricted behind rigorous backend routing or strict client-side Firestore Rules evaluating custom claims or admin flags. The public frontend *cannot* write directly to Firestore CRM collections.
- **Authentication**: Firebase Authentication.
- **Authorization**: KymrStudio team roles determine data access. Unauthenticated users are redirected to login. Authorized users get the Executive Portal view. (Ensure rules/claims align with deployment environment).

## GOOGLE WORKSPACE INTEGRATIONS
Located in: `/src/lib/google.ts`
- **Gmail**: Utilized for sending portal communications (quotes, invoices).
- **Calendar & Meet**: Managed internally via OAuth to provision backing events for scheduled calls.
- **Drive & Sheets**: Configured for data exports/storage workflows.
*Note: Full end-to-end execution of these integrations is currently blocked by sandbox IAM/API limits in the dev environment. They are code-complete but require the final GCP project configuration to resolve API restriction blocks.*

## ENVIRONMENT VARIABLES
### Public (Browser-Safe):
- `VITE_KYMR_PUBLIC_API_BASE_URL` (Required only if the backend API is hosted on a different origin than the frontend).
- Standard Firebase config variables (`VITE_FIREBASE_API_KEY`, etc. if initialized on the client).

### Server-Only (Secret):
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string of the service account credential, required if not using Default Credentials).
- `CALCOM_WEBHOOK_SECRET` (HMAC secret for verifying webhook signatures).

## ANTIGRAVITY INTEGRATION NOTES
1.  **Routing Merger**: Antigravity must securely place the compiled Executive Portal at `kymrstudio.com/admin` while preserving the existing public website at `kymrstudio.com`.
2.  **API Deployment**: The Node.js Express server (`server.ts`) must be deployed in a persistent runtime (e.g., Cloud Run) to maintain in-memory rate limits and serve the `/api/*` endpoints. 
3.  **Webhook Configuration**: The Cal.com webhook URL must be updated to the final production `/api/webhooks/calcom` endpoint and the secret configured in the environment.
4.  **No Direct Writes**: Do not allow the public React app to access the Firebase config object or write directly to Firestore. All public writes must route through the `POST /api/public/inquiries` proxy endpoint.

## KNOWN ERRORS / UNTESTED ITEMS (SANDBOX LIMITATIONS)
1.  **Firestore Admin Write (Sandbox Block)**
    - *Error*: `PERMISSION_DENIED: Cloud Firestore API has not been used in project ... before or it is disabled.`
    - *Root Cause*: Environment Configuration (Sandbox GCP IAM limitation).
    - *Fix Required*: Will resolve automatically when deployed to the final Antigravity GCP/Firebase project with billing and APIs fully enabled.
2.  **Cal.com Deduplication / Inquiry Linkage Execution (Sandbox Block)**
    - *Error*: Depends on Firestore execution (same as Error 1).
    - *Root Cause*: Environment Configuration (Sandbox GCP IAM limitation).
    - *Fix Required*: Will resolve automatically upon final deployment.
