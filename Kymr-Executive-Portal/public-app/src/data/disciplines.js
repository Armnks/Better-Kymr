// ============================================================
// THE FIVE DISCIPLINES
//
// The capability data, lifted verbatim out of the old Capabilities
// scene so the System chapter can render it once and nothing else
// has to hold a second copy. This is the source of truth for what
// KymrStudio does; nothing here is invented, and no promise, result
// or turnaround appears that was not already in the codebase.
//
//   purpose   the plain-language explanation of the discipline
//   output    what it produces, used as the one-line summary that
//             makes the service readable without any interaction
//   detail    what the client actually receives
//   hands     what it carries to the discipline after it
// ============================================================
export const DISCIPLINES = [
  {
    n: 1,
    key: "strategy",
    name: "Strategy",
    purpose: "Find the angle the category cannot argue with",
    input: "A commercial goal and a category",
    output: "A position and a testing direction",
    hands: "The angle",
    detail: [
      "Creative research",
      "Messaging architecture",
      "Concept directions",
      "Hook development",
      "Testing roadmap",
    ],
  },
  {
    n: 2,
    key: "creative",
    name: "Creative",
    purpose: "Turn the angle into something shootable",
    input: "A position and a testing direction",
    output: "Scripts, storyboards and a visual system",
    hands: "The world",
    detail: ["Campaign concepts", "Scripts", "Storyboards", "Art direction", "Format planning"],
  },
  {
    n: 3,
    key: "production",
    name: "Production",
    purpose: "Capture the world without losing the angle",
    input: "Scripts, storyboards and a visual system",
    output: "A variation-ready asset bank",
    hands: "The material",
    detail: [
      "Pre-production",
      "Directing",
      "Product and lifestyle capture",
      "Creator-led footage",
      "Asset banks",
    ],
  },
  {
    n: 4,
    key: "editing",
    name: "Editing",
    purpose: "Build every version the platforms actually need",
    input: "A variation-ready asset bank",
    output: "Cuts, ratios and hook variants",
    hands: "The outputs",
    detail: [
      "Performance edits",
      "Motion design",
      "Cutdowns",
      "Resizing and formatting",
      "Hook and CTA variants",
    ],
  },
  {
    n: 5,
    key: "iteration",
    name: "Iteration",
    purpose: "Turn what ran into the next brief",
    input: "Cuts, ratios and hook variants",
    output: "Learnings, which re-enter at Strategy",
    hands: "The learning",
    detail: [
      "Testing plans",
      "Creative review",
      "Learning documentation",
      "Iteration planning",
      "Next-round recommendations",
    ],
  },
];

export const N_DISCIPLINES = DISCIPLINES.length;
