# Campaign image drop

Every image on the site resolves through `src/data/media.js`. Drop files
here using the exact filenames below, then in that slot set
`standIn` to `/campaign/<name>.webp` and `isPlaceholder: false`. No
layout component changes.

Each well reserves its aspect box before the file loads, so replacing a
slot cannot shift the page (CLS stays at 0). If replacement art has its
subject somewhere else, correct it with the slot's `focal` value alone.

## Required files (21)

| Filename | Appears in | Ratio | Recommended px | Safe focal area | Max size |
|---|---|---|---|---|---|
| `hero-idea.webp` | The Signal, the large plate | 16:9 (3:2 crop on mobile) | 1920 x 1080 | centre, 42% from top. Keep the subject inside the middle 60% horizontally so the 3:2 phone crop still works | 260 KB |
| `hero-making.webp` | The Signal, small state 01 | 1:1 (4:3 on mobile) | 1200 x 1200 | centre | 180 KB |
| `hero-system.webp` | The Signal, small state 02 | 1:1 (4:3 on mobile) | 1200 x 1200 | centre, 45% from top | 180 KB |
| `archive-01-master.webp` … `archive-12-master.webp` | Archive focus stage and dossier | 4:3 | 1600 x 1200 | centre, 45% from top | 260 KB |
| `archive-01-support.webp` … `archive-06-support.webp` | Second frame inside dossiers 1 to 6 | 16:9 | 1600 x 900 | centre | 220 KB |

## Responsive sets (optional, recommended)

`srcSetFor()` emits a srcset only once a slot has `isPlaceholder: false`.
If you also supply width variants, name them `<slot>-<width>.webp`:

- hero slots: 640, 960, 1280, 1600
- archive masters: 640, 960, 1280
- archive support: 768, 1200, 1600

Supply the base file at minimum. Without width variants, drop the
`widths` array on that slot so no srcset is advertised.

## Concept mapping

Archive masters map to `src/data/concepts.js` by number:

| File | Concept | Category |
|---|---|---|
| archive-01 | The Hour Before | Fragrance |
| archive-02 | Nothing Gets In | Audio |
| archive-03 | Low Light Hours | Home |
| archive-04 | Made Slowly, On Purpose | Food |
| archive-05 | One Clean Signal | Technology |
| archive-06 | Cold Open | Beverage |
| archive-07 | Kept, Not Bought | Watch |
| archive-08 | Held Line | Automotive |
| archive-09 | Evidence, Not Promises | Beauty |
| archive-10 | Worn In Daylight | Eyewear |
| archive-11 | The Quiet Routine | Skincare |
| archive-12 | Second Season | Fashion |

Support frames exist for concepts 1 to 6 only.

## Fallback

A slot whose file is missing renders the graphite well plus its label
rather than a broken image, so a partial upload never breaks a page.
