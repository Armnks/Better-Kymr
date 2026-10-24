// ============================================================
// MEDIA MANIFEST
//
// Every image on the site resolves through this file. No layout
// component holds a file path, so replacing artwork is a one-line
// edit here and never a layout change.
//
// A slot declares:
//   name    stable filename the final asset must be given
//   src     what renders today
//   ratio   the aspect box the composition reserves. The well holds
//           this before the file loads, so a swap cannot move the
//           page (CLS stays at 0)
//   focal   object-position. Replacement art whose subject sits
//           elsewhere is corrected here alone
//   w / h   intrinsic attributes for the <img>
//   widths  responsive width set used to build srcset once real
//           assets exist at those sizes
//
// TEMPORARY: every src below points at the legacy /ads library and
// `isPlaceholder` stays true until real files land in /public/campaign.
// Nothing in this repository claims the asset pass is finished while
// that flag is set on any slot.
// ============================================================

// Widths that actually exist on disk for each stand-in, written by
// scripts/build-standins.mjs. Generated - do not hand-edit.
import STANDINS from "./standins.json";
// Slots that now have real delivered artwork, written by
// scripts/deliver-campaign.mjs. Generated - do not hand-edit.
import DELIVERED from "./delivered.json";

export const UPLOAD_DIR = "/campaign";

/** Responsive width sets, by the role a slot plays in the layout. */
const WIDTHS = {
  hero: [640, 960, 1280, 1600],
  master: [640, 960, 1280],
  support: [768, 1200, 1600],
};

// A slot resolves to real artwork the moment scripts/deliver-campaign.mjs
// has produced files for it; until then it keeps its stand-in. Nothing
// here is hand-maintained: delivered.json is generated, so a slot cannot
// claim to be finished artwork that does not exist on disk.
//
// When a slot IS delivered it also stops describing the stand-in: the
// ratio and intrinsic w/h come from the real pixels. The archive masters
// used to declare 4/3 while every component that renders them overrode it
// (3:4 in the orbit, 1:1 in Make and Craft), so the declared ratio was
// both unused and wrong.
const slot = ({ name, standIn, ratio, focal, w, h, widths, label }) => {
  const real = DELIVERED[name];
  return {
    name,
    file: `${name}.webp`,
    path: `${UPLOAD_DIR}/${name}.webp`,
    src: real ? `${UPLOAD_DIR}/${name}.webp` : standIn,
    standIn,
    ratio: real ? `${real.w} / ${real.h}` : ratio,
    focal,
    w: real ? real.w : w,
    h: real ? real.h : h,
    widths: real ? real.widths : widths,
    label,
    isPlaceholder: !real,
  };
};

// ---- THE SIGNAL: three states of one campaign ----
export const HERO_MEDIA = {
  idea: slot({
    name: "hero-idea",
    standIn: "/ads/fragrance.webp",
    ratio: "16 / 9",
    focal: "50% 42%",
    w: 1920,
    h: 1080,
    widths: WIDTHS.hero,
    label: "The idea",
  }),
  making: slot({
    name: "hero-making",
    standIn: "/ads/automotive.webp",
    ratio: "1 / 1",
    focal: "50% 50%",
    w: 1200,
    h: 1200,
    widths: WIDTHS.master,
    label: "The making",
  }),
  system: slot({
    name: "hero-system",
    standIn: "/ads/beverage.webp",
    ratio: "1 / 1",
    focal: "50% 45%",
    w: 1200,
    h: 1200,
    widths: WIDTHS.master,
    label: "The system",
  }),
};

// ---- THE ARCHIVE: one master per concept, keyed by concept id ----
// One photograph per concept, chosen to match the brief that concept
// answers. Eight of the twelve are the newer supplied frames; the four
// that kept their original stand-in did so because nothing in the new
// set fits their category.
const ARCHIVE_STAND_INS = [
  "/ads/fragrance.webp",        // 01 The Hour Before
  "/ads/audio.webp",            // 02 Nothing Gets In
  "/ads/home-lowlight.jpg",     // 03 Low Light Hours
  "/ads/food-dal.jpg",          // 04 Made Slowly, On Purpose
  "/ads/tech.webp",             // 05 One Clean Signal
  "/ads/beverage-cold.jpg",     // 06 Cold Open
  "/ads/watch-wrist.jpg",       // 07 Kept, Not Bought
  "/ads/automotive.webp",       // 08 Held Line
  "/ads/beauty-lip.jpg",        // 09 Evidence, Not Promises
  "/ads/eyewear-daylight.jpg",  // 10 Worn In Daylight
  "/ads/haircare-routine.jpg",  // 11 The Quiet Routine
  "/ads/fashion-denim.jpg",     // 12 Second Season
];

// Focal points, so a portrait frame cropped into a 4:3 well or a 3:4
// plane still holds its subject.
const ARCHIVE_FOCALS = [
  "50% 45%", "50% 45%", "50% 58%", "50% 50%", "50% 45%", "50% 50%",
  "50% 42%", "50% 45%", "50% 55%", "50% 40%", "55% 40%", "50% 45%",
];

// A genuine second frame, only where one exists. The support slots used
// to be built from the same array as the masters, so every "second
// frame" in a dossier was the identical photograph shown twice. Three
// concepts now have a real one; the rest correctly have none.
const ARCHIVE_SECONDS = {
  1: { src: "/ads/jewellery-chains.jpg", focal: "50% 55%" }, // The Hour Before
  3: { src: "/ads/home-armchair.jpg", focal: "50% 50%" },    // Low Light Hours
  4: { src: "/ads/food-croissant.jpg", focal: "50% 50%" },   // Made Slowly
};

const pad = (n) => String(n).padStart(2, "0");

export const ARCHIVE_MASTERS = ARCHIVE_STAND_INS.map((standIn, i) =>
  slot({
    name: `archive-${pad(i + 1)}-master`,
    standIn,
    ratio: "4 / 3",
    focal: ARCHIVE_FOCALS[i],
    w: 1600,
    h: 1200,
    widths: WIDTHS.master,
    label: `Concept ${pad(i + 1)}`,
  })
);

export const ARCHIVE_SUPPORT = Object.fromEntries(
  Object.entries(ARCHIVE_SECONDS).map(([id, { src, focal }]) => [
    id,
    slot({
      name: `archive-${pad(Number(id))}-support`,
      standIn: src,
      ratio: "4 / 3",
      focal,
      w: 1600,
      h: 1200,
      widths: WIDTHS.support,
      label: `Concept ${pad(Number(id))}, second frame`,
    }),
  ])
);

// ---- THE CLOSE: five frames the page has not already shown ----
//
// The final procession used to be built from archive masters, so the
// last thing a visitor saw was five photographs they had scrolled past
// twice already. These five appear here and nowhere else.
export const CLOSE_MEDIA = [
  { src: "/ads/jewellery-ring.jpg", focal: "50% 55%", label: "Signet, on stone" },
  { src: "/ads/leather-tote.jpg", focal: "50% 50%", label: "Leather, in daylight" },
  { src: "/ads/jewellery-hoops.jpg", focal: "55% 55%", label: "Gold, worn" },
  { src: "/ads/footwear-sneaker.jpg", focal: "50% 55%", label: "Leather, on wet ground" },
  { src: "/ads/textile-knit.jpg", focal: "50% 50%", label: "Knit, on linen" },
].map((m, i) =>
  slot({
    name: `close-${pad(i + 1)}`,
    standIn: m.src,
    ratio: "3 / 4",
    focal: m.focal,
    w: 1200,
    h: 1600,
    widths: WIDTHS.master,
    label: m.label,
  })
);

// ---- THE PIPELINE: one campaign, five stages ----
//
// These slots have NO stand-in, deliberately. A photograph standing in
// for a pencil storyboard would misrepresent what exists; the section
// simply omits an asset it does not have. capabilityMedia() returns null
// until scripts/deliver-campaign.mjs has actually produced the files.
const CAPABILITY_SHAPE = {
  "cap-strategy": { ratio: "3 / 4", widths: WIDTHS.master },
  "cap-creative": { ratio: "3 / 4", widths: WIDTHS.master },
  "cap-production": { ratio: "4 / 3", widths: WIDTHS.support },
  "cap-iteration": { ratio: "4 / 3", widths: WIDTHS.support },
  "cap-edit-1": { ratio: "16 / 9", widths: WIDTHS.master },
  "cap-edit-2": { ratio: "16 / 9", widths: WIDTHS.master },
  "cap-edit-3": { ratio: "16 / 9", widths: WIDTHS.master },
  "cap-edit-4": { ratio: "16 / 9", widths: WIDTHS.master },
  "cap-edit-5": { ratio: "16 / 9", widths: WIDTHS.master },
};

/** A pipeline asset, or null if it has not been delivered yet. */
export const capabilityMedia = (name) => {
  const real = DELIVERED[name];
  if (!real) return null;
  const shape = CAPABILITY_SHAPE[name] || { ratio: "4 / 3", widths: WIDTHS.master };
  return slot({
    name,
    standIn: `${UPLOAD_DIR}/${name}.webp`,
    ratio: shape.ratio,
    focal: "50% 50%",
    w: real.w,
    h: real.h,
    widths: shape.widths,
    label: name,
  });
};

/** Master frame for a concept id (1-based). Never returns undefined. */
export const masterFor = (id) => ARCHIVE_MASTERS[(id - 1) % ARCHIVE_MASTERS.length];

/** Support frame for a concept id, or null where that concept has none. */
export const supportFor = (id) => ARCHIVE_SUPPORT[id] ?? null;

/**
 * Build a srcset for a slot.
 *
 * A real slot advertises the widths its artwork was delivered at.
 *
 * A stand-in used to advertise nothing, and the reasoning was sound at
 * the time: a stand-in existed at exactly ONE size, so naming widths it
 * did not have would make the browser fetch the same full-size file and
 * believe it had got something smaller. The cost of that was a phone
 * downloading byte-for-byte the same imagery as a 1440px desktop.
 *
 * scripts/build-standins.mjs now renders each stand-in down to the
 * widths the layout actually asks for and records exactly which ones it
 * produced in standins.json. So a stand-in can be given a srcset that is
 * true: every width named below is a file that exists on disk.
 *
 * This does not make the asset pass finished. isPlaceholder stays true
 * on every slot and PENDING_SLOTS is unchanged - these are smaller
 * copies of stand-ins, not artwork.
 */
const STANDIN_DIR = "/ads/r";

export const srcSetFor = (media) => {
  if (!media.isPlaceholder) {
    return media.widths.map((w) => `${UPLOAD_DIR}/${media.name}-${w}.webp ${w}w`).join(", ");
  }
  const built = STANDINS[media.src];
  if (!built || !built.widths.length) return undefined;
  return built.widths.map((w) => `${STANDIN_DIR}/${built.base}-${w}.webp ${w}w`).join(", ");
};

/** Every slot the studio still has to supply. */
export const PENDING_SLOTS = [
  ...Object.values(HERO_MEDIA),
  ...ARCHIVE_MASTERS,
  ...Object.values(ARCHIVE_SUPPORT),
  ...CLOSE_MEDIA,
].filter((s) => s.isPlaceholder);
