// ============================================================
// WHAT KYMRSTUDIO MAKES
//
// Four offerings, and every one of them is read off the work rather
// than asserted. The twelve dossiers in concepts.js carry 48
// deliverables between them, and those 48 fall into exactly these
// four groups. The `evidence` field on each service names the
// concepts the deliverables were taken from, so any claim here can
// be traced back to a brief that was actually written.
//
// Nothing appears here that the codebase does not already support.
// There is no paid-media management, no web build, no brand identity
// work and no influencer management anywhere in the project data, so
// none of it is offered.
// ============================================================
export const SERVICES = [
  {
    key: "films",
    name: "Campaign films",
    // "Feature films" (One Clean Signal), "Hero film" (Held Line),
    // "Anchor film" + "Long-form cut" (Kept, Not Bought),
    // "Documentary cut" (Second Season), "Macro process films"
    // (Made Slowly, On Purpose)
    line: "The anchor piece a campaign is built around, cut to hold attention on its own.",
    deliverables: ["Hero and anchor films", "Long-form cuts", "Documentary cuts", "Macro process films"],
    concept: 12, // Second Season, Fashion
    evidence: "Held Line, One Clean Signal, Kept Not Bought, Second Season",
  },
  {
    key: "product",
    name: "Product content",
    // "Launch key art" (One Clean Signal), "Static key art" (The Hour
    // Before), "Detail stills" (Kept Not Bought, Second Season),
    // "Texture macros" + "Ingredient stills" (Evidence, Not Promises),
    // "Packaging-matched stills" (Made Slowly), "Retail-ready stills"
    // (Low Light Hours), "Contour stills" (Held Line)
    line: "The product photographed so it reads at a glance, in the places it has to sell.",
    deliverables: ["Launch and static key art", "Detail and contour stills", "Texture macros", "Retail-ready stills"],
    concept: 7, // Kept, Not Bought, Watch
    evidence: "Evidence Not Promises, One Clean Signal, Held Line, Low Light Hours",
  },
  {
    key: "social",
    name: "Social advertising",
    // "6s and 15s paid social" (The Hour Before), "9:16 hooks" (One
    // Clean Signal, Held Line, Second Season), "6s hooks" (Made
    // Slowly), "High-speed hooks" (Cold Open), "Sound-off first
    // frames" + "Sound-off cuts" (Nothing Gets In, Cold Open),
    // "Story formats" (Nothing Gets In, Worn In Daylight),
    // "15s explainers" (Evidence, Not Promises)
    line: "Built for the first three seconds, and built to work with the sound off.",
    deliverables: ["6s and 15s paid social", "9:16 and high-speed hooks", "Sound-off first frames", "Story formats"],
    concept: 6, // Cold Open, Beverage
    evidence: "Cold Open, Nothing Gets In, The Hour Before, Worn In Daylight",
  },
  {
    key: "editing",
    name: "Editing and versioning",
    // "9:16 and 1:1 masters" (The Hour Before), "4:5 and 9:16" (Low
    // Light Hours), "1:1 and 4:5" (Kept Not Bought), "15s and 30s
    // edits" (Nothing Gets In), "Product-only cutdowns" (Nothing Gets
    // In), "Recipe cutdowns" (Made Slowly), "Seasonal recuts" (Low
    // Light Hours, Worn In Daylight), "Always-on library" (Second
    // Season), "Email crops" (The Quiet Routine)
    line: "Every ratio, cutdown and variant a platform asks for, from one shoot.",
    deliverables: ["9:16, 4:5 and 1:1 masters", "15s and 30s edits", "Product-only cutdowns", "Seasonal recuts and always-on libraries"],
    concept: 4, // Made Slowly, On Purpose, Food
    evidence: "Second Season, The Hour Before, Nothing Gets In, Low Light Hours",
  },
];

// The disciplines that sit behind all four. Stated once, as a closing
// line, rather than rebuilt as five separate stations.
export const SUPPORT_LINE =
  "Strategy, creative development, production, editing and iteration sit behind all four.";
