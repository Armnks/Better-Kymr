// ============================================================
// WEBSITE / ECOMMERCE SCOPE — CONFIG AND PRICING, IN ONE PLACE
//
// Every constant this feature uses lives here. Nothing is scattered
// through the UI, so a rate change is a change to this file only.
//
// ---- WHAT IS APPROVED ----
// Website and Ecommerce are confirmed KymrStudio offerings (owner, this
// session). NOTE: data/services.js still lists four advertising services
// and states in its header that there is "no web build" - that comment is
// now out of date and is flagged for the owner rather than edited here,
// because the four SERVICES entries drive the services section and must
// not change as a side effect of adding an estimator.
//
// Approved market floors (owner):
//     India          from  ₹15,000 negotiable
//     International  from  US$500 negotiable
// These are GENERAL minimums for engaging the studio. They are NOT a
// quote for any particular website or ecommerce scope, and they are not
// currency conversions of one another.
//
// ---- WHO CHOSE THE NUMBERS ----
// The owner approved the two ANCHORS (₹15,000 negotiable and US$500 negotiable) and then asked
// the assistant to scale the rest from them. So: the two base-website
// figures are the owner's; every other figure in RATES is a proposal made
// on 2026-09-07 and is AWAITING SIGN-OFF. It is a coherent ladder, not a
// costed production rate card.
//
// Setting PRICING.rates back to null reverts the dialog to scope-only with
// "Custom quote required for this scope", with no other change needed.
// ============================================================

export const PROJECT_TYPES = [
  {
    id: "website",
    label: "Website",
    blurb: "A marketing or brand site: pages, content, contact.",
  },
  {
    id: "ecommerce",
    label: "Ecommerce",
    blurb: "A store: products, cart, checkout and order handling.",
  },
];

export const LEVELS = [
  {
    id: "standard",
    label: "Standard",
    blurb: "Our layouts, adapted to your brand and content.",
  },
  {
    id: "premium",
    label: "Premium",
    blurb: "Designed from scratch for you, with custom motion and art direction.",
  },
];

// Each option says what it actually means. No unexplained "expanded".
// This estimator covers BUILDS only. Advertising creative - image and
// video campaigns, the studio's primary offering - is scoped by the
// advertising estimator on "Start a Project", which measures it the way
// that work is actually bought: monthly volume, creative mix and
// production cadence. Offering it in both places would mean two ad
// journeys with two different pricing models.
export const isAdProject = () => false;

export const FEATURES = [
  { id: "cms", label: "Content editing", blurb: "You can edit pages and copy yourself." },
  { id: "blog", label: "Blog or journal", blurb: "Article listing, individual posts, categories." },
  { id: "booking", label: "Bookings or enquiry forms", blurb: "Structured forms that reach your inbox." },
  { id: "payments", label: "Payments", blurb: "Card checkout and order confirmation." },
  { id: "multilingual", label: "More than one language", blurb: "Parallel content per language." },
  { id: "integrations", label: "Third-party integrations", blurb: "CRM, analytics, email or inventory tools." },
];

// Traffic is a SCOPE input, not a price input. It only ever affects a
// quote through an explicit infrastructure rule, and no such rule has
// been approved - so today it changes nothing but what we are told.
export const TRAFFIC = { min: 1000, max: 250000, step: 1000, default: 10000 };

export const MARKET_FLOORS = {
  india: { label: "India", currency: "INR", floor: "₹15,000 negotiable" },
  intl: { label: "International", currency: "USD", floor: "US$500 negotiable" },
};

/**
 * THE RATE MODEL.
 *
 * PROVENANCE, so nobody has to guess later:
 *   - The two BASE WEBSITE figures are the owner's approved market
 *     minimums: India ₹15,000 negotiable, International US$500 negotiable.
 *   - EVERY OTHER NUMBER below was proposed by the assistant on
 *     2026-09-07, at the owner's explicit instruction to scale from those
 *     anchors. They are a coherent ladder, not quoted production costs,
 *     and they are awaiting the owner's sign-off.
 *
 * The two markets are priced INDEPENDENTLY. The international column is
 * not a conversion of the Indian one - at the anchor, ₹15,000 negotiable and US$500 negotiable
 * are not the same money, and the ladders above them diverge on purpose.
 *
 * Shape: base(type) + level + sum(features). Standard level adds nothing
 * because it is what the base buys; Premium is the only level uplift.
 */
export const RATES = {
  india: {
    currency: "INR",
    base: { website: 15000, ecommerce: 35000 },
    level: { standard: 0, premium: 25000 },
    features: {
      cms: 8000, blog: 6000, booking: 5000, payments: 12000, multilingual: 10000, integrations: 9000,
    },
  },
  intl: {
    currency: "USD",
    base: { website: 500, ecommerce: 1200 },
    level: { standard: 0, premium: 850 },
    features: {
      cms: 280, blog: 200, booking: 170, payments: 400, multilingual: 340, integrations: 300,
    },
  },
};

/**
 * The upper bound. A quote firms up during discovery - content volume,
 * revisions, edge cases - so the figure is shown as a range rather than a
 * single number that would read as a fixed price. Also assistant-proposed.
 */
export const RANGE_HIGH = 1.4;

/** What the estimate does and does not cover. Shown in the dialog. */
export const ASSUMPTIONS = [
  "Design, build, testing and launch of the scope selected above.",
  "One round of content loading from material you supply.",
];
export const EXCLUSIONS = [
  "Copywriting, photography and video production.",
  "Domain, hosting and third-party subscription fees.",
  "Ongoing maintenance and support after launch.",
];

export const PRICING = { rates: RATES };

/** Indian grouping for INR, standard grouping for USD. */
export const money = (n, currency) =>
  currency === "INR"
    ? `₹${Math.round(n).toLocaleString("en-IN")}`
    : `US$${Math.round(n).toLocaleString("en-US")}`;

export const hasRateModel = () => {
  const r = PRICING.rates;
  if (!r) return false;
  return Object.values(r).every(
    (m) =>
      m &&
      Object.values(m.base).every((v) => typeof v === "number") &&
      Object.values(m.level).every((v) => typeof v === "number") &&
      Object.values(m.features).every((v) => typeof v === "number")
  );
};

export const DEFAULT_WEB_SCOPE = {
  market: "india",
  type: "website",
  level: "standard",
  features: [],
  traffic: TRAFFIC.default,
};

/**
 * Returns a formatted range, or null when no approved rate model exists.
 * There is deliberately no fallback arithmetic: without rates this
 * returns null and the UI says a custom quote is required.
 */
export function estimateFor(scope) {
  if (!hasRateModel()) return null;
  const m = PRICING.rates[scope.market];
  const low =
    m.base[scope.type] +
    m.level[scope.level] +
    scope.features.reduce((sum, f) => sum + (m.features[f] || 0), 0);
  // rounded so the upper bound reads as an estimate, not a computed exact
  const step = m.currency === "INR" ? 1000 : 50;
  const high = Math.ceil((low * RANGE_HIGH) / step) * step;
  return {
    low,
    high,
    currency: m.currency,
    text: `${money(low, m.currency)} - ${money(high, m.currency)}`,
  };
}

export const typeOf = (id) => PROJECT_TYPES.find((t) => t.id === id) || PROJECT_TYPES[0];
export const levelOf = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0];
export const featuresFor = () => FEATURES;
export const featureLabels = (ids, type) =>
  featuresFor(type).filter((f) => ids.includes(f.id)).map((f) => f.label);

/** One line for the inquiry summary and the submitted payload. */
export const webScopeLine = (s) => {
  const feats = featureLabels(s.features, s.type);
  const parts = [MARKET_FLOORS[s.market].label, typeOf(s.type).label];
  parts.push(isAdProject(s.type) ? `${levelOf(s.level).label} direction` : `${levelOf(s.level).label} build`);
  // traffic describes a site's load and means nothing for an ad project
  if (!isAdProject(s.type)) parts.push(`~${s.traffic.toLocaleString("en-US")} visits / mo`);
  parts.push(feats.length ? feats.join(", ") : "no extras");
  return parts.join(" · ");
};
