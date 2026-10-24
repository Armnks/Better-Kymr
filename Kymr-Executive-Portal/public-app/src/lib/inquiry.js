// ============================================================
// INQUIRY — the shape of what a visitor tells us, and the rules
// that decide whether it is sendable.
//
// Kept apart from the component so validation and normalisation can be
// reasoned about (and tested) without rendering anything, and so the
// same rules can be mirrored server-side. Nothing here touches storage.
// ============================================================
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors functions/validate.js, which in turn is bounded by the CRM's
// own schema. If the browser accepted more than the server does, the
// visitor would only find out after typing it. See functions/crm.js.
export const LIMITS = { name: 100, email: 150, company: 100, message: 2000, text: 2000 };

/** Question order for the guided brief. Only 1 and 3 are required. */
export const QUESTIONS = [
  { key: "name", n: 1, label: "Your name", required: true, kind: "text",
    autoComplete: "name", max: LIMITS.name },
  { key: "company", n: 2, label: "Brand or company", required: false, kind: "text",
    autoComplete: "organization", max: LIMITS.company,
    help: "Optional. Independent clients and individuals are welcome." },
  { key: "email", n: 3, label: "Email address", required: true, kind: "email",
    autoComplete: "email", max: LIMITS.email },
  { key: "budget", n: 4, label: "Monthly advertising budget", required: false, kind: "range",
    help: "Your monthly media spend, not our creative or production fee.",
    na: "Not sure / Not applicable" },
  { key: "lookingFor", n: 5, label: "What are you looking for?", required: false, kind: "long",
    max: LIMITS.text,
    help: "Campaign films, product content, social advertising, editing and versioning." },
  { key: "roas", n: 6, label: "Current ROAS", required: false, kind: "roas",
    help: "Return on ad spend. For example, 2.5 means 2.5 times your advertising spend.",
    na: "Not sure / Not applicable" },
  { key: "targetRevenue", n: 7, label: "Target monthly revenue in the next 3 to 6 months",
    required: false, kind: "amount",
    help: "Your own target. Not a projection or a promise from KymrStudio.",
    na: "Not sure / Not applicable" },
  { key: "brandNote", n: 8, label: "Tell us about your brand", required: false, kind: "long",
    max: LIMITS.text, help: "A line or two about your product, audience and goals." },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

/**
 * Read a number a person actually typed. Accepts "2.5x", "1,200", " 40 ".
 * Returns null for anything empty or not a finite non-negative number, so
 * an unanswered field can never be mistaken for a zero.
 */
export function toNumber(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().replace(/,/g, "").replace(/[xX]$/, "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

/** A multiplier reads back the way people write it: 2.5x, 3x, 1.75x. */
export const formatRoas = (n) =>
  n === null || Number.isNaN(n) ? "" : `${Number(n.toFixed(2))}x`;

export const formatAmount = (n) =>
  n === null || Number.isNaN(n) ? "" : `$${n.toLocaleString("en-US")}`;

/** Per-question validation. Returns an error string, or null when fine. */
export function validateQuestion(key, draft) {
  const v = draft[key];
  if (key === "name") return String(v || "").trim() ? null : "Your name is required.";
  if (key === "email") {
    const e = String(v || "").trim();
    if (!e) return "An email address is required.";
    if (e.length > LIMITS.email) return "That email address is too long.";
    return EMAIL_RE.test(e) ? null : "Enter a valid email address.";
  }
  if (key === "budget") {
    if (draft.budgetNA) return null;
    const lo = toNumber(draft.budgetMin);
    const hi = toNumber(draft.budgetMax);
    if (Number.isNaN(lo) || Number.isNaN(hi)) return "Enter amounts as numbers, or mark it not applicable.";
    if (lo !== null && hi !== null && lo > hi) return "The minimum is higher than the maximum.";
    return null;
  }
  if (key === "roas") {
    if (draft.roasNA) return null;
    const r = toNumber(draft.roas);
    return Number.isNaN(r) ? "Enter a number like 2.5, or mark it not applicable." : null;
  }
  if (key === "targetRevenue") {
    if (draft.targetRevenueNA) return null;
    const t = toNumber(draft.targetRevenue);
    return Number.isNaN(t) ? "Enter an amount as a number, or mark it not applicable." : null;
  }
  const max = QUESTIONS.find((q) => q.key === key)?.max;
  if (max && String(v || "").length > max) return `Please keep this under ${max} characters.`;
  return null;
}

export function validateGeneral(draft) {
  const e = {};
  const nameErr = validateQuestion("name", draft);
  if (nameErr) e.name = nameErr;
  const emailErr = validateQuestion("email", draft);
  if (emailErr) e.email = emailErr;
  const msg = String(draft.message || "").trim();
  if (!msg) e.message = "Please tell us how we can help.";
  else if (msg.length < 10) e.message = "A little more detail would help.";
  else if (msg.length > LIMITS.message) e.message = `Please keep this under ${LIMITS.message} characters.`;
  return e;
}

export function validateProject(draft) {
  const e = {};
  for (const q of QUESTIONS) {
    const err = validateQuestion(q.key, draft);
    if (err) e[q.key] = err;
  }
  return e;
}

const trimmed = (v, max) => String(v || "").trim().slice(0, max);

/**
 * Build what actually gets sent. Optional numbers that were never answered
 * are OMITTED rather than sent as 0, and an explicit "not applicable" is
 * omitted too - the two are indistinguishable to us, and both mean "no
 * figure", which is different from a figure of zero.
 */
/**
 * `scope` is the visitor's configuration from the inline estimator, if
 * they came through it. It travels as free text on `looking_for` so it
 * reaches the studio with the inquiry, without inventing a new stored
 * field the CRM's schema does not have. No price is included, because no
 * price has been calculated.
 */
export function buildPayload(mode, draft, scope) {
  const base = {
    type: mode === "project" ? "project" : "general",
    name: trimmed(draft.name, LIMITS.name),
    email: trimmed(draft.email, LIMITS.email),
    company: trimmed(draft.company, LIMITS.company),
    website_url: draft.website_url || "",
    started_at: draft.started_at || null,
  };
  if (scope && scope.line) {
    base.scope_line = trimmed(`${scope.market} · ${scope.line}`, LIMITS.text);
  }
  if (mode !== "project") {
    base.message = trimmed(draft.message, LIMITS.message);
    return base;
  }
  const put = (k, v) => {
    if (v !== null && v !== undefined && !Number.isNaN(v) && v !== "") base[k] = v;
  };
  if (!draft.budgetNA) {
    put("budget_min", toNumber(draft.budgetMin));
    put("budget_max", toNumber(draft.budgetMax));
  }
  if (!draft.roasNA) put("roas", toNumber(draft.roas));
  if (!draft.targetRevenueNA) put("target_monthly_revenue", toNumber(draft.targetRevenue));
  put("looking_for", trimmed(draft.lookingFor, LIMITS.text));
  put("brand_note", trimmed(draft.brandNote, LIMITS.text));
  return base;
}

/** How an answer reads back on the review screen. "" means unanswered. */
export function reviewValue(key, draft) {
  if (key === "budget") {
    if (draft.budgetNA) return "Not sure / not applicable";
    const lo = toNumber(draft.budgetMin);
    const hi = toNumber(draft.budgetMax);
    if (lo === null && hi === null) return "";
    if (lo !== null && hi !== null) return `${formatAmount(lo)} to ${formatAmount(hi)} a month`;
    return lo !== null ? `From ${formatAmount(lo)} a month` : `Up to ${formatAmount(hi)} a month`;
  }
  if (key === "roas") {
    if (draft.roasNA) return "Not sure / not applicable";
    const r = toNumber(draft.roas);
    return r === null ? "" : formatRoas(r);
  }
  if (key === "targetRevenue") {
    if (draft.targetRevenueNA) return "Not sure / not applicable";
    const t = toNumber(draft.targetRevenue);
    return t === null ? "" : `${formatAmount(t)} a month`;
  }
  return String(draft[key] || "").trim();
}

/** Shared identity carried between the two modes without overwriting. */
export const SHARED_KEYS = ["name", "email", "company"];

export const hasContent = (draft) =>
  [...SHARED_KEYS, "message", "lookingFor", "brandNote", "budgetMin", "budgetMax", "roas", "targetRevenue"]
    .some((k) => String(draft[k] || "").trim() !== "") ||
  Boolean(draft.budgetNA || draft.roasNA || draft.targetRevenueNA);
