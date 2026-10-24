# KymrStudio Design System

Living document. It describes the system the site is actually built on.
When the site changes, this changes with it.

Last revised: 2026-09-02, at the Campaign Genome rebuild.

---

## 1. Thesis

**The Campaign Genome.** KymrStudio finds the strategic signal inside a
brand, turns it into a campaign concept, and develops that concept into a
living system of production, cuts, variations and learnings.

    BRIEF -> SIGNAL -> IDEA -> WORLD -> OUTPUT -> LEARNING

This is the spatial and motion logic of the site, never a flowchart
drawn on the page.

## 2. The Strand

The one device the whole system hangs on, and the reason this design
could not be lifted onto another studio's site.

A vermilion strand runs the height of the page. It is never decoration:
in every chapter it **does the work the chapter is claiming**.

| Chapter | What the strand does |
|---|---|
| The Signal | Threads the three states of one campaign: idea, making, system |
| The Fracture | Breaks into offset segments that dim as they separate |
| The Engine | Becomes the handover chain between five disciplines |
| The Archive | Becomes the double-strand index holding twelve concepts |
| The Operating System | Becomes the rail a project descends |
| The Decision | Converges back to a single lit point |

Rule: if a strand segment cannot be described as carrying, breaking,
handing over, holding or converging, it does not get drawn.

## 3. Ground and light

One continuous environment. Never pure black, never a light section.

| Token | Value | Role |
|---|---|---|
| `--carbon` | `#0B0B0E` | The ground |
| `--carbon-lift` | `#111218` | One step toward the light |
| `--graphite` | `#15161B` | Material surfaces, image wells |
| `--smoke` | `#21232B` | Structural rules and borders |
| `--frost` | `#F1F3F2` | Primary reading white, cold |
| `--silver` | `#A9AFB8` | Secondary |
| `--silver-dim` | `#7C838D` | Tertiary. Still clears 4.5:1 on carbon |
| `--signal` | `#FF3B14` | The single signal colour |

`--signal` behaves like light, not paint. It marks what is live, what is
being handed over, and what to press. It never fills a large area and it
never appears twice in one composition for two different reasons.

Chapters are lit directionally via `.plate` and its `--kl-x` / `--kl-y`
custom properties, so depth changes underfoot while the ground stays one
continuous surface.

## 4. Type

**Satoshi** variable grotesk for everything that carries meaning.
**Cinzel Decorative** for the wordmark only. **IBM Plex Mono** only for
genuinely functional data: frame numbers, counts, ratios.

Scale is capped deliberately. Emphasis comes from position, weight and
the signal colour, not from size. Nothing on the page is set larger than
`--k-t-4xl`, and only the hero uses it.

Uppercase wide-tracked labels are rationed to **six per page**. They were
the most templated thing in the previous system.

## 5. Layers

Every `z-index` on the site resolves from these tokens. No arbitrary
values anywhere.

    --z-plate    1   chapter grounds and key lights
    --z-strand   5   the strand, behind content, above ground
    --z-content 10   everything readable
    --z-nav     40   header
    --z-overlay 60   dossier, mobile menu (portalled to body)
    --z-grain   80   material pass, pointer-events: none

## 6. Motion

One grammar: **the signal resolves**. Content is uncovered by light
travelling in the reading direction, and settles a few pixels into place.

Rules, all enforced in review:

- `transform`, `opacity` and `clip-path` only
- never `transition: all`
- no raw `window` scroll listener driving animation
- reveals run on `IntersectionObserver`, not on a scroll timeline, so no
  two systems write the same property
- every observer and timeline is cleaned up on unmount
- interruptible: end states are plain classes, so an element scrolled
  past mid-transition simply lands finished
- reverse scrolling is correct because reveals only ever promote
- `prefers-reduced-motion` yields a **complete** composition, not a
  degraded one: nothing is hidden, nothing is clipped, and page height is
  identical

Motion tokens: `--k-dur-cut` 160ms, `--k-dur-ui` 220ms, `--k-dur-comp`
420ms, `--k-dur-scene` 720ms.

## 7. Media

Every image resolves through `src/data/media.js`. No component holds a
file path.

Each slot declares ratio, focal point, intrinsic width and height, and a
responsive width set. Wells reserve their aspect box before the file
loads, so replacing artwork cannot move the page. A slot that fails to
load degrades to the graphite well plus its label rather than a broken
icon.

## 8. Retired patterns

Do not reintroduce: centered agency hero; text-left / image-right split
hero; huge white type on empty black; alternating dark and ivory
chapters; bento grids; three equal cards; rounded SaaS cards; pill
labels; uppercase metadata used as texture; section-number eyebrows;
decorative status dots; crosshair grids; fake dashboards or terminals;
glassmorphism; long lists with a hairline under every row; infinite
marquees; custom cursors; scroll cues; intro animations that gate the
offer; parallax applied indiscriminately; scroll-jacking; pinned
sections that create dead scroll; full-screen chapters carrying one
sentence.

Visible copy contains **no em dashes and no en dashes**.

## 9. Pacing

5.5 to 7 desktop viewports. 7 to 9 mobile viewports. Every viewport must
deliver a new idea, a capability, a proof point, a concept, a meaningful
interaction, a conversion opportunity or a visual transformation. No two
consecutive chapters share a layout family.

## 10. Honesty

Speculative work is labelled **Spec Concept** wherever it appears. The
site claims no clients, testimonials, awards, campaign results, revenue
or team size. The only figures shown are the studio's own operating
commitments, already recorded in this repository.
