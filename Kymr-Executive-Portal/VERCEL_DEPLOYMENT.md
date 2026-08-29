# KymrStudio Vercel Deployment Guide

This document outlines the final production architecture, build process, and manual setup required to deploy KymrStudio on Vercel.

## Vercel Architecture

- **Public Frontend**: Create React App (CRA) output to `/`.
- **Admin Portal**: Vite output to `/admin/`.
- **Backend API**: Express serverless function exported from `server.ts` through `api/index.ts`.
- **Output Directory**: Both frontends are merged into `.vercel-output` by the custom build script.
- **Routing**: Handled by `vercel.json` rewrites.

## Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `.vercel-output`
- **Install Command**: `npm install`
- **Node Version**: 18.x or 20.x

## Firebase Configuration

- **Project ID**: `gen-lang-client-0467065981`
- **Firestore Database ID**: `(default)`

### Firebase Authentication Setup
1. Go to Firebase Console -> Authentication -> Settings -> Authorized domains.
2. Add your Vercel preview domains and the production domain (`kymrstudio.com`).

### Owner Provisioning
To authorize the initial owner `armn@kymrstudio.com` and admin `media@kymrstudio.com`:
1. Ensure both accounts have logged into the portal at least once (this creates their Firebase Auth records).
2. Go to Firebase Console -> Firestore Database -> `users` collection.
3. Locate the document matching their Firebase UID.
4. Set the `role` field to `"OWNER"` for `armn@kymrstudio.com` and `"ADMIN"` for `media@kymrstudio.com`.

## Environment Variables

Configure these strictly in the Vercel Dashboard (Settings > Environment Variables). **Never commit values to code.**

| NAME | CLIENT/SERVER | SECRET | DEV | PREVIEW | PROD | PURPOSE |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Server | YES | YES | YES | YES | Secure stringified JSON object for the Firebase Admin SDK. |
| `CALCOM_WEBHOOK_SECRET` | Server | YES | YES | YES | YES | Secret key for verifying Cal.com webhook signatures. |
| `PUBLIC_WEBSITE_URL` | Server | NO | YES | YES | YES | The base URL used for CORS validation (`https://kymrstudio.com`). |

## Backend Strategies

- **Rate Limiting**: Uses a serverless-safe Firestore `rate_limits` collection. Allows 5 requests per minute per IP.
- **Idempotency**: Uses a Firestore `idempotency_keys` collection with atomic `create()` behavior to prevent race conditions during concurrent webhook deliveries.

## External Provider Setup

### Cal.com
- **Webhook URL**: `https://<VERCEL_DOMAIN>/api/webhooks/calcom`
- **Secret**: Configure in Cal.com UI and set `CALCOM_WEBHOOK_SECRET` in Vercel.

### Google Workspace (OAuth)
1. Go to Google Cloud Console > APIs & Services > Credentials.
2. Under OAuth 2.0 Client IDs, add your Vercel domains (e.g. `https://kymrstudio.com`) to the **Authorized JavaScript origins**.

## Deployment Steps

### 1. Preview Deployment
1. Connect the GitHub repository to a new Vercel Project.
2. Ensure the "Build Command" and "Output Directory" are correctly detected or manually override them to `npm run build` and `.vercel-output`.
3. Enter all required Environment Variables for the Preview environment.
4. Trigger the deployment. Vercel will generate a preview URL.

### 2. Production Cutover
1. Add `kymrstudio.com` to the Vercel Domains list.
2. Ensure environment variables for Production are strictly correct.
3. Update Cal.com to point to the production domain webhook URL.
4. Verify OAuth origins and Firebase Authorized domains include the production domain.
5. Deploy to Production.

## Keyless Firebase Authentication (Workload Identity Federation)

Due to Google Cloud organizational policies (`iam.managed.disableServiceAccountKeyCreation`), long-lived Service Account JSON keys cannot be generated for this project.

Instead, the backend uses **Vercel OIDC + Google Cloud Workload Identity Federation (WIF)**.
This securely exchanges short-lived Vercel deployment tokens for Google Cloud credentials without storing private keys in environment variables.

### Google Cloud Setup

1. **Service Account**: 
   Create a dedicated runtime service account (e.g., `kymr-vercel-backend@gen-lang-client-0467065981.iam.gserviceaccount.com`).
   Grant it `roles/datastore.user` (Cloud Datastore User).
   
2. **Workload Identity Pool & Provider**:
   - Create a WIF Pool named `vercel-pool`.
   - Add an OIDC Provider named `vercel-oidc` with Issuer: `https://oidc.vercel.com`.
   - **Attribute Mapping**: `google.subject` = `assertion.sub`.
   - **Attribute Condition**: `assertion.sub.contains("project:YOUR_VERCEL_PROJECT_ID")` to restrict access strictly to this specific Vercel project.

3. **Service Account Impersonation**:
   Grant the Workload Identity Principal (`principalSet://iam.googleapis.com/projects/[PROJECT_NUMBER]/locations/global/workloadIdentityPools/vercel-pool/*`) the role `roles/iam.workloadIdentityUser` on your dedicated service account.

### Vercel Environment Variables

Set these in your Vercel Project (Production, Preview, and Development):
- `GCP_PROJECT_NUMBER`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `GCP_WORKLOAD_IDENTITY_POOL_ID` (e.g., `vercel-pool`)
- `GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID` (e.g., `vercel-oidc`)

### Local Development Authentication

Locally, you should use Google Application Default Credentials via `gcloud` instead of downloading keys.
Run:
`gcloud auth application-default login`
Then set `export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json` before starting the backend.
