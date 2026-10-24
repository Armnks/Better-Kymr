// ============================================================
// ONE IDEA. EVERY DISCIPLINE.
//
// Five stages of the studio's own pipeline, shown by following ONE
// campaign through all of them rather than describing them in the
// abstract. The campaign is concept 02, "Nothing Gets In".
//
// Every line of body copy below is read straight off that concept's
// dossier in concepts.js - its objective, audience, premise, hook,
// direction, deliverables and system. Nothing here is a new claim about
// the studio, because the stage a piece of work passed through is not
// something this repository can evidence; what it CAN evidence is what
// the brief said, and that is what is shown.
//
// The short stage lines ("Give the idea its rhythm.") are labels for the
// stage itself, not assertions about outcomes.
//
// The assets each stage displays are the ones the site did not have
// until now: a handwritten idea note, a storyboard sheet, a production
// still, a five-frame cut, and a variants sheet. See media.js.
// ============================================================
import { CONCEPTS } from "@/data/concepts";

/** Audio — "Nothing Gets In". The reference board uses this campaign too. */
export const SUBJECT = CONCEPTS[1];

export const STAGES = [
  {
    key: "strategy",
    name: "Strategy",
    line: "Decide what the campaign is actually arguing.",
    body: SUBJECT.objective,
    note: SUBJECT.audience,
    slot: "cap-strategy",
    caption: "The first note",
  },
  {
    key: "creative",
    name: "Creative",
    line: "Find the frame that makes the argument.",
    body: SUBJECT.premise,
    note: SUBJECT.hook,
    slot: "cap-creative",
    caption: "Storyboard, working",
  },
  {
    key: "production",
    name: "Production",
    line: "Light it so the idea survives the shoot.",
    body: SUBJECT.direction,
    note: SUBJECT.motif,
    slot: "cap-production",
    caption: "On set",
  },
  {
    key: "editing",
    name: "Editing",
    line: "Give the idea its rhythm.",
    body: "The cut is where the silence in the brief becomes timing a viewer can feel.",
    note: SUBJECT.tone,
    slot: "cap-production",
    strip: ["cap-edit-1", "cap-edit-2", "cap-edit-3", "cap-edit-4", "cap-edit-5"],
    deliverables: SUBJECT.deliverables,
    caption: "The cut",
  },
  {
    key: "iteration",
    name: "Iteration",
    line: "Re-cut it for everywhere it has to run.",
    body: SUBJECT.system,
    note: "One grade, one sound bed, every placement.",
    slot: "cap-iteration",
    caption: "Platform variants",
  },
];

export const STAGE_COUNT = STAGES.length;
