# KYMR STUDIO — The Living Organism

## Original Problem Statement
Build an ORIGINAL digital experience for KYMR STUDIO that feels ALIVE — a living, breathing visual organism, not a conventional website. One continuous evolving composition of states (not header/hero/sections/footer), scroll-linked transformations, alive typography and background, cursor influence, no fake portfolio (absence is part of the story: "Kymr is building. The next frame is yours."), at least 7 major transformations, cinematic finale resolving into KYMR + contact. GSAP/ScrollTrigger + Lenis, no WebGL, performant, responsive, reduced-motion support.

## User Personas
- Prospective client (brand/marketing lead) evaluating Kymr's craft through the experience itself
- Creative talent/collaborators assessing the studio's ambition
- Kymr admin reading inbound enquiries in the Vault

## Architecture
- Frontend: React 19 + GSAP 3 (ScrollTrigger pins/scrub) + Lenis smooth scroll + Tailwind. Fonts: Cabinet Grotesk (Fontshare), Cormorant Garamond + JetBrains Mono (Google Fonts). No images anywhere — pure kinetic typography, SVG grain, CSS light fields.
- Backend: FastAPI + MongoDB (Motor). POST /api/enquiries (public), GET /api/enquiries (X-Admin-Key header).
- Routes: `/` = the experience, `/admin` = the Vault.

## The 7 States (implemented 2026-08-28)
1. STATE 01 — INITIATE: quiet "SCROLL TO INITIATE" → KYMR scales from 0.03 to full viewport (pinned, scrubbed)
2. STATE 02 — THE MASK: KYMR bursts past screen; kinetic marquee field (5 counter-scrolling rows, solid/outline/ember) opens via clip-path
3. STATE 03 — PROCESS: architectural grid frame; 48H / 3S / 100% / 10+ morph through the center with ghost indices + ember progress bar (pinned 420%)
4. STATE 04 — CAPABILITIES: vertical scroll → horizontal travel; STRATEGY→CREATIVE→PRODUCTION→EDITING→PERFORMANCE at 13vw with velocity-based skew
5. STATE 05 — THE VOID: sudden emptiness; serif italic "Kymr is building. The next frame is yours." over drifting 42vw outline "SOON"
6. STATE 06 — TENSION: mono coordinate chips fracture from center to corners; pulsing SYSTEM LIVE dot; BUILDING IN PUBLIC
7. STATE 07 — FINAL FRAME: white flash reset → KYMR locks center; contact scene: hello@kymr.studio mailto, socials, working enquiry form

## Global Systems (implemented)
- Living background: 3 breathing light fields (GSAP yoyo, 9–18s), animated SVG grain overlay, vignette
- Custom cursor: 8px dot, 4x scale on interactive elements, mix-blend exclusion, desktop only
- Lenis momentum scroll wired to ScrollTrigger; prefers-reduced-motion disables pins/timelines with static readable fallbacks
- Nav: mix-blend-difference, smooth scrollTo state anchors

## Verified
- curl: POST /api/enquiries 200, GET without key 401, GET with key returns list
- Browser e2e: form submitted (Ava Reyes) → success state → appears in /admin vault
- Screenshots: all 7 states desktop + mobile hero scaling

## Credentials
See /app/memory/test_credentials.md. Admin key: kymr-vault-7f3a-2026. Contact email placeholder: hello@kymr.studio. Social URLs are placeholders (instagram.com/kymr.studio etc).

## Backlog
- P1: Replace placeholder email/socials with real ones (user input needed)
- P1: Resend email notification on new enquiry
- P2: Scroll-velocity tracking distortion on hero KYMR; sound-design toggle (ambient hum)
- P2: Case-study system when real client work exists (currently deliberately absent)
- P2: Admin vault: delete/archive enquiries, CSV export

## Sample Data Note
DB contains 2 test enquiries ("Test Sender", "Ava Reyes") — safe to ignore or delete.
