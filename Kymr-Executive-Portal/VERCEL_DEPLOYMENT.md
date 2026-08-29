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
