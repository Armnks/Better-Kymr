// ============================================================
// SCOPE — ONE SHARED STATE FOR THE WHOLE CONVERSION FLOW
//
// The configurator, the contact steps and /start all read and write this.
// There is deliberately no second copy of the option lists or the market
// pricing: two estimators that drift apart is the failure this replaces.
//
// ---- WHAT IS APPROVED, AND WHAT IS NOT ----
//
// APPROVED starting prices, given directly by the owner:
//     India          from  Rs 15,000 negotiable
//     International  from  US$ 500 negotiable
// These are INDEPENDENT market floors, not a currency conversion of one
// another, and they are floors - not a rate card.
//
// NOT approved, and therefore not expressed anywhere in this file:
//     what the floor includes, whether it is per project or per month,
//     any upper bound, volume pricing, creative-mix multipliers,
//     expedited-delivery multipliers.
//
// So this module exposes a starting price and NOTHING that multiplies it.
// There is no price function. Changing the slider changes the SCOPE that
// gets sent to the studio; it does not compute a number, and the UI must
// not imply that it does.
//
// The legacy RATES table in pages/Start.jsx (IGNITION/MOMENTUM/SCALE with
// USD and INR bands) is NOT reproduced here. It predates the approved
// floors and contradicts them - its INR floor is Rs 40,000 against the
// approved Rs 15,000 negotiable. It stays untouched in Start.jsx pending a decision;
// nothing in the new flow reads it.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const MARKETS = [
  { id: "india", label: "India", price: "₹15,000 negotiable", aria: "India, starting from 15,000 rupees negotiable" },
  { id: "intl", label: "International", price: "US$500 negotiable", aria: "International, starting from 500 US dollars negotiable" },
];

// Volume milestones read off the reference board. The numbers are scope
// descriptions, not price bands.
export const VOLUME = { min: 5, max: 100, step: 5, default: 20 };
export const MILESTONES = [
  { at: 5, label: "5 ads" },
  { at: 20, label: "20 ads" },
  { at: 50, label: "50 ads" },
  { at: 100, label: "100+" },
];

// `id` values match the existing option ids in pages/Start.jsx so the
// submitted payload keeps the same shape. Only the labels follow the
// reference board.
export const MIXES = [
  { id: "motion", label: "100% Video" },
  { id: "static", label: "100% Static" },
  { id: "hybrid", label: "Hybrid mix" },
];

// The reference board shows TWO cadences. pages/Start.jsx defines three;
// the third (`weekly`, "Weekly drops") is intentionally not surfaced here
// and is reported as an open decision rather than deleted from the data.
export const CADENCES = [
  { id: "standard", label: "Standard delivery", note: "48 hours" },
  { id: "sprint", label: "Expedited sprint", note: "24-48h" },
];

export const DEFAULT_SCOPE = {
  // `touched` is false until the visitor moves a control. The defaults
  // below are a starting position for the estimator, NOT a configuration
  // anybody chose - so the contact panel must not report them back as
  // "your configured scope" to someone who never opened the estimator.
  touched: false,
  market: "india",
  volume: VOLUME.default,
  mix: "hybrid",
  cadence: "standard",
};

const STORE = "kymr-scope";

const read = () => {
  try {
    return { ...DEFAULT_SCOPE, ...JSON.parse(sessionStorage.getItem(STORE) || "{}") };
  } catch {
    return { ...DEFAULT_SCOPE };
  }
};

const ScopeContext = createContext(null);

export function ScopeProvider({ children }) {
  const [scope, setScope] = useState(read);
  // Which estimator dialog is open: "none" | "ads" | "web". Held here so a
  // CTA in the hero, the nav or the closing section can all open the same
  // dialog without prop-drilling through every scene.
  const [dialog, setDialog] = useState("none");

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(scope));
    } catch {
      /* a browser refusing storage must not break the configurator */
    }
  }, [scope]);

  // Any change made through the estimator marks the scope as chosen.
  const set = useCallback((patch) => setScope((s) => ({ ...s, ...patch, touched: true })), []);

  const value = useMemo(() => ({ scope, set, dialog, setDialog }), [scope, set, dialog]);
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

export function useScope() {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error("useScope must be used inside <ScopeProvider>");
  return ctx;
}

export const marketOf = (id) => MARKETS.find((m) => m.id === id) || MARKETS[0];
export const mixOf = (id) => MIXES.find((m) => m.id === id) || MIXES[2];
export const cadenceOf = (id) => CADENCES.find((c) => c.id === id) || CADENCES[0];

/** One line describing the selection, for the contact summary and the payload. */
export const scopeLine = (s) =>
  `${s.volume} ads / mo · ${mixOf(s.mix).label} · ${cadenceOf(s.cadence).label}`;

/**
 * Send the visitor to the inline configurator.
 *
 * Every "start a project" / "get a quote" CTA on the homepage routes here
 * rather than to /start. The old wizard is no longer the destination for
 * anything on the main flow; /start still resolves, through the same
 * shared state, for links that already exist in the wild.
 */
export function goToScope() {
  // The estimator is a dialog now, not a section. Any CTA can ask for it
  // by event, which keeps the scenes free of a shared import cycle.
  window.dispatchEvent(new CustomEvent("kymr:open-scope", { detail: "ads" }));
}

export function goToWebScope() {
  window.dispatchEvent(new CustomEvent("kymr:open-scope", { detail: "web" }));
}
