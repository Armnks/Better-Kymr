// ============================================================
// INQUIRY TRANSPORT
//
// One seam between the form and storage. Two ways across it:
//
//   callable  a Firebase callable Cloud Function (submitInquiry). Preferred:
//             App Check travels with the request automatically and errors
//             come back typed. Used when the Firebase web config is present.
//   http      a plain POST to REACT_APP_INQUIRY_ENDPOINT. The fallback for
//             any other server-side handler.
//
// The Firebase SDK is imported dynamically, only when someone actually
// submits. It never enters the main bundle, so the homepage weighs the
// same for the many visitors who never open this form.
//
// Nothing secret lives here. The Firebase web config is public by design
// (it identifies the project, it does not authorise anything): the
// authority is the Cloud Function, App Check, and firestore.rules, which
// denies every client read and write to the inquiry collection.
//
// submit() resolves only on a confirmed server acceptance. There is no
// path through this file that reports success without one.
// ============================================================
const env = process.env;

const FIREBASE_CONFIG = {
  apiKey: env.REACT_APP_FIREBASE_API_KEY,
  authDomain: env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: env.REACT_APP_FIREBASE_APP_ID,
  storageBucket: env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
};

export const ENDPOINT = env.REACT_APP_INQUIRY_ENDPOINT || "/api/public/inquiries";
// Must match setGlobalOptions() in functions/index.js. The function is
// deployed in asia-southeast1 because that is where this project's only
// Firestore database lives; calling the wrong region fails to resolve.
const REGION = env.REACT_APP_FIREBASE_REGION || "asia-southeast1";
const APPCHECK_KEY = env.REACT_APP_FIREBASE_APPCHECK_KEY || "";
const EMULATOR = env.REACT_APP_FIREBASE_EMULATOR || ""; // "host:port"

export const hasFirebase = () => Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
export const isConfigured = () => hasFirebase() || Boolean(ENDPOINT);
export const transport = () => (hasFirebase() ? "callable" : ENDPOINT ? "http" : "none");

export class InquiryError extends Error {
  constructor(message, reason) {
    super(message);
    this.name = "InquiryError";
    this.reason = reason;
  }
}

let callablePromise = null;

/** Build the callable once per page, on first use. */
function getCallable() {
  if (callablePromise) return callablePromise;
  callablePromise = (async () => {
    const [{ initializeApp, getApps }, { getFunctions, httpsCallable, connectFunctionsEmulator }] =
      await Promise.all([import("firebase/app"), import("firebase/functions")]);

    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);

    // App Check attests that the request came from this app. It is not a
    // substitute for the validation and rate limiting the function does,
    // and it never asks the visitor to sign in.
    if (APPCHECK_KEY) {
      try {
        const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import("firebase/app-check");
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(APPCHECK_KEY),
          isTokenAutoRefreshEnabled: true,
        });
      } catch (err) {
        // A failed App Check init must not take the form down; the
        // function decides whether to accept an unattested request.
        if (process.env.NODE_ENV !== "production") console.warn("App Check unavailable", err);
      }
    }

    const fns = getFunctions(app, REGION);
    if (EMULATOR) {
      const [host, port] = EMULATOR.split(":");
      connectFunctionsEmulator(fns, host || "127.0.0.1", Number(port) || 5001);
    }
    return httpsCallable(fns, "submitInquiry");
  })().catch((err) => {
    callablePromise = null;
    throw err;
  });
  return callablePromise;
}

const reasonFromCallable = (code) => {
  if (code === "functions/invalid-argument") return "rejected";
  if (code === "functions/resource-exhausted") return "rate-limited";
  if (code === "functions/unauthenticated" || code === "functions/permission-denied") return "blocked";
  if (code === "functions/unavailable" || code === "functions/deadline-exceeded") return "network";
  return "server";
};

/**
 * Send one inquiry. Resolves only when the server confirms it stored it.
 *
 * @param {object} payload  built by buildPayload(), including submission_id
 * @param {AbortSignal} [signal]
 */
export async function submitInquiry(payload, signal) {
  if (!isConfigured()) {
    throw new InquiryError("No inquiry destination is configured for this build.", "unconfigured");
  }

  if (hasFirebase()) {
    let call;
    try {
      call = await getCallable();
    } catch {
      throw new InquiryError("The inquiry service could not be reached.", "network");
    }
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const res = await call(payload);
      if (!res?.data?.ok) throw new InquiryError("The inquiry was not stored.", "server");
      return res.data;
    } catch (err) {
      if (err instanceof InquiryError) throw err;
      const code = err?.code || "";
      throw new InquiryError(
        code === "functions/resource-exhausted"
          ? "Too many inquiries from here just now."
          : "The inquiry could not be sent.",
        reasonFromCallable(code)
      );
    }
  }

  // ---- plain HTTP fallback ----
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new InquiryError("The request could not reach the server.", "network");
  }
  if (!res.ok) {
    throw new InquiryError(
      `The server rejected the inquiry (${res.status}).`,
      res.status === 429 ? "rate-limited" : res.status >= 500 ? "server" : "rejected"
    );
  }
  try {
    return await res.json();
  } catch {
    return {};
  }
}
