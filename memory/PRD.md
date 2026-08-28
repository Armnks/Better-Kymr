# KYMR STUDIO — The Living Organism

## Original Problem Statement
Build an ORIGINAL digital experience for KYMR STUDIO that feels ALIVE — a living, breathing visual organism, not a conventional website. One continuous evolving composition of states (not header/hero/sections/footer), scroll-linked transformations, alive typography and background, cursor influence, no fake portfolio (absence is part of the story), 7+ major transformations, cinematic finale resolving into KYMR + contact. GSAP/ScrollTrigger + Lenis, no WebGL, performant, responsive, reduced-motion support.

## v2 Escalation (2026-08-28)
User demanded a different category: a LIVING DIGITAL WORLD. Visual STATES not sections; elements physically transform into the next scene; 4-layer motion system (atmosphere / scroll response / scene transformation / cursor micro-interaction); film pacing (tension→transformation→release→quiet); 10 distinct "holy shit" moments; seeded daily variation; interaction depth (scroll, cursor, hover, pause, direction); depth layers; no overdesign; mobile gets intentional lighter interpretation. Full rebuild of the front experience (backend + contact + admin vault unchanged).

## User Personas
- Prospective client evaluating Kymr's craft through the experience itself
- Creative talent/collaborators assessing ambition
- Kymr admin reading inbound enquiries in the Vault

## Architecture
- Frontend: React 19 + GSAP 3 ScrollTrigger (pinned scrubbed timelines) + Lenis + Tailwind. Fonts: Cabinet Grotesk / Cormorant Garamond / JetBrains Mono. Zero images — kinetic typography, SVG grain, CSS light fields only.
- Backend (unchanged): FastAPI + MongoDB. POST /api/enquiries (public), GET /api/enquiries (X-Admin-Key header).
- Routes: `/` = the world, `/admin` = the Vault.

## The 9 States (v2, implemented 2026-08-28)
1. 01 ORIGIN — breathing ember dot, idle SCROLL hint → dot stretches into hairline → aperture frame opens → KYMR identity with cursor-repelled letters
2. 02 EXPANSION — KYMR letters scale beyond viewport asymmetrically; the R counter opens as a clip-path circular window revealing the next layer
3. 03 SIGNAL — WE MAKE / THINGS / PEOPLE collide in, WATCH. slams down, words scatter to corners as echoes, WATCH. slices into 3 bands, realigns as outline, serif release line
4. 04 PROTOCOL — architectural frame; 48H glitch-counts in ember; its baseline extends into 3 blinds for 3S (outline); blinds rotate 90° into columns for 100% with ember fill-bar; 10+ spawns 5 layered iteration echoes; all collapses into a dot
5. 05 FORCES — dot pops into STRATEGY; CREATIVE rushes in and shoves it; PRODUCTION drops rotating and reorganizes the trio; EDITING ember slice-line cuts every word into offset halves; halves blow out; PERFORMANCE takes over with widening tracking, then dissipates beyond viewport into the seed
6. 06 SILENCE — near-empty void, tiny serif "still here?", ring grows VERY slowly (long dwell), KEEP SCROLLING microcopy
7. 07 INVERSION — ring accelerates beyond viewport; bone fill circle consumes the screen; world flips dark→light; "and then — everything changes."
8. 08 ARCHIVE — on the light world: THE ARCHIVE / IS JUST / BEGINNING. with 6 seeded empty UNWRITTEN frame outlines (anti-portfolio); frames fly off; dark circle rises from below collapsing the world back to void; "09 — THE LAST FRAME"
9. 09 KYMR — letters fly in from 4 corners and lock with impact shake; perpetual 4s breathing; serif "the next frame is yours." → contact scene (mailto hello@kymr.studio + working enquiry form)

## Global Systems
- L1 atmosphere: 3 seeded drifting light fields with scroll parallax (different depths), SVG grain, vignette
- L2 scroll response: velocity stirs atmosphere scale + grain opacity (felt before noticed)
- L4 cursor: dot + trailing ring (mix-blend exclusion), contextual labels (SAY HELLO / TRANSMIT / PROTOCOL / FORCES / CONTACT), magnetic elements, letter repulsion in Origin
- Morphing nav: state label mask-swaps per scene (kymr:state events), ember progress hairline
- Seeded daily variation (mulberry32 on day): light field positions/timings, archive frame scatter, repel strength
- prefers-reduced-motion: all pins/timelines skipped, static readable layouts per scene

## Verified (v2)
- DOM geometry: 9 sequential pin regions, no overlaps (37951px journey)
- Screenshots desktop: all states incl. letter-window, glitch count, blinds→columns, echoes, forces cut, void ring, inversion, archive, finale lock, contact
- Mobile (390×844): opening dot + protocol 10+ state render intentionally
- Contact form e2e (from v1): submit → DB → admin vault; 401 guard intact (unchanged code paths)

## Credentials
See /app/memory/test_credentials.md. Admin key: kymr-vault-7f3a-2026. Contact email placeholder: hello@kymr.studio; social URLs placeholders.

## Backlog
- P1: Replace placeholder email/socials with real ones (user input needed)
- P1: Resend email notification on new enquiry
- P2: Horizontal-travel scene (v1 had it; v2 uses other mechanisms — candidate re-add between Archive and Finale)
- P2: Ambient sound toggle; scroll-velocity letterspacing on display type
- P2: Real archive entries system when client work exists
- P2: Admin vault: delete/archive enquiries

## Sample Data Note
DB contains 2 test enquiries ("Test Sender", "Ava Reyes") — safe to ignore or delete.
