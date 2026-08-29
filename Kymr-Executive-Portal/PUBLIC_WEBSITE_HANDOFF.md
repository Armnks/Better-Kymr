# KYMRSTUDIO — PUBLIC WEBSITE INTEGRATION HANDOFF SPEC

This document serves as the exact integration contract for connecting the KymrStudio Public Website (front door) to the KymrStudio Executive Portal (internal CRM/office).

**DO NOT DEPLOY THE PUBLIC WEBSITE TO THE SAME DOMAIN AS THE ADMIN PORTAL.**
- Public Website: `https://kymrstudio.com`
- Executive Portal: `https://admin.kymrstudio.com`

---

## 1. Firebase Project Configuration

The public website MUST connect to the same Firebase project as the Executive Portal.
You will initialize the standard Firebase Web SDK on the public site using the shared environment configuration:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## 2. Firestore Security Rules & Permissions

Public submissions operate under strict least-privilege rules. The public website has permission to `create` documents in the `inquiries` collection **IF AND ONLY IF** the payload strictly matches the permitted schema.

- **Read Access**: DENIED
- **Update Access**: DENIED
- **Delete Access**: DENIED
- **Create Access**: ALLOWED (with strict validation)

You CANNOT submit internal fields like `priority`, `ownerId`, `notes`, or `convertedClientId`. Attempting to do so will result in a Firestore `permission-denied` error.

---

## 3. Creating an Inquiry (API Contract)

To submit an inquiry from the public website, write a document to the `inquiries` collection:

### Endpoint / Action
```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // your firebase init

await addDoc(collection(db, "inquiries"), payload);
```

### Required Fields
- `name` (string, max 100 chars)
- `status` (MUST be exactly `"NEW"`)
- `createdAt` (MUST be `serverTimestamp()`)
- `updatedAt` (MUST be `serverTimestamp()`)

### Allowed Optional Fields
- `email` (string, max 150 chars)
- `phone` (string, max 30 chars)
- `company` (string, max 100 chars)
- `website` (string, max 200 chars)
- `serviceInterest` (string, max 100 chars)
- `message` (string, max 2000 chars)
- `budgetRange` (string, max 50 chars)
- `source` (string, max 50 chars) — **RECOMMENDED: Set to `"WEBSITE"`**
- `submissionType` (string, max 50 chars) — **RECOMMENDED: `"GENERAL_INQUIRY"`, `"CONFIGURED_SCOPE"`, or `"BOOKING"`**
- `externalBookingId` (string, max 100 chars)

### Structured Scope Configuration (Optional, Highly Recommended)
If the user uses the public Scope Estimator, pass the configuration as a Map in the `scopeRequest` field. This enables 1-click Quote generation in the Executive Portal.

```typescript
scopeRequest: {
  serviceId?: string;       // Optional ID mapping to catalog
  serviceName?: string;     // The name of the service/tier requested
  estimatedBudget?: string; // The price/budget shown to the user
  timeline?: string;        // Timeline expectation
  deliverables?: string[];  // Array of specific selected deliverables/add-ons
  notes?: string;           // Any extra configuration details
}
```

---

## 4. Example Payload (Configured Scope)

```typescript
const payload = {
  name: "Jane Doe",
  email: "jane@example.com",
  company: "Acme Corp",
  status: "NEW", // MUST BE "NEW"
  source: "WEBSITE",
  submissionType: "CONFIGURED_SCOPE",
  scopeRequest: {
    serviceName: "Brand Identity + Web",
    estimatedBudget: "$12,000",
    timeline: "6-8 weeks",
    deliverables: ["Logo Design", "Brand Guidelines", "5-Page Website"]
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

try {
  await addDoc(collection(db, "inquiries"), payload);
  // Show success state on public site
} catch (error) {
  // Handle validation or rate limit errors
}
```

---

## 5. Booking Integrations

If the public website uses an external booking provider (e.g., Calendly, Cal.com):
1. Use the provider's standard embed/redirect.
2. Upon successful booking confirmation (via frontend callback or webhook), if you capture the booking details, you may submit an Inquiry with `submissionType: "BOOKING"` and include the `externalBookingId`.
3. The backend will handle de-duplication if necessary.

---

## 6. Success & Error Handling

- **SUCCESS**: Return a clean success state to the visitor. Do not poll Firestore for updates.
- **FAILURE (permission-denied)**: Indicates the payload violated the strict schema (e.g., trying to set `status: "WON"`, including internal fields, or omitting `createdAt`). Ensure your payload perfectly matches the schema above.
