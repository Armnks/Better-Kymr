# KYMR STUDIO — The Living Organism

## Original Problem Statement
Build an ORIGINAL digital experience for KYMR STUDIO that feels ALIVE — a living, breathing visual organism, not a conventional website. One continuous evolving composition of states (not header/hero/sections/footer), scroll-linked transformations, alive typography and background, cursor influence, no fake portfolio (absence is part of the story), 7+ major transformations, cinematic finale resolving into KYMR + contact. GSAP/ScrollTrigger + Lenis, no WebGL, performant, responsive, reduced-motion support.

## v11 Consolidated Correction + Ripple + QA Pass (2026-08-28) — commit 008a011 on main (LOCAL; push blocked on git auth — owner must use "Save to Github" or supply a fresh token)
## v12 Interactive Archive + Ripple Fix + WebP + Instagram Card (2026-08-28) — commit 5948580 on main (LOCAL; awaiting owner approval → push via "Save to Github")
## v13 Instagram Reel + Git Push Attempt (2026-08-28) — commit 5e62330 on main (LOCAL; push still blocked — no GitHub credentials in environment)
## v14 Sound Toggle Removed (2026-08-28) — commit d7b5b54 on main (LOCAL, push pending owner's Save to Github)
## v15 Indicative Pricing USD/INR (2026-08-28) — commit 165eda3 on main (LOCAL; push failed again — "correct access rights" — owner must use Save to Github)
## v16 THE ARCHIVE — Cinematic Shot System Rebuild (2026-08-28) — commit pending push (LOCAL)
## v17 THE ARCHIVE — Monumental Re-direction (2026-08-28) — commit pending push (LOCAL)
## v18 WE MAKE — Single-Scene Materialization (2026-08-28) — commit pending push (LOCAL)
## v19 Archive — More Work, Same Discipline (2026-08-28) — commit pending push (LOCAL)
## v20 Archive Final Form (2026-08-28) — commit f4952ff (LOCAL; push blocked — no GitHub creds, owner must use Save to Github)
## v21 Archive Ending Compression + Pricing Rebase (2026-08-28) — commit pending push (LOCAL)
## v22 Vault Removed Completely (2026-08-28) — commit pending push (LOCAL)
- Per owner directive, the Vault admin interface is fully gone: Admin.jsx deleted, /admin route + import removed, VAULT footer link removed, vault-only backend routes GET /api/leads + GET /api/enquiries + X-Admin-Key checks removed, dead ADMIN_KEY scrubbed from backend/.env, backend tests rewritten (8/8 pass), test_credentials.md updated (no credentials remain). PUBLIC FLOWS UNTOUCHED: POST /api/leads (inquiry), POST /api/enquiries, POST /api/webhooks/calcom, /api/health. A separate private Executive Portal is being built elsewhere — none here.
- Verified: testing_agent iteration_12 — 100% both: /admin renders empty, no VAULT string anywhere, full /start funnel works (pricing rebase live, Cal.com embed real), webhook flips leads, contact + ripple + back-to-top clean, 58k-px journey + mobile sweep clean, zero console errors.

- Owner flagged the archive's dead empty-ivory scroll: ending compressed from ~30.7 to 28.8 units (silence 0.7u, foot lines with tighter pauses, wipe completes exactly at timeline end). Fixed the rail-duration trap (drift tween held old total, silently extending totalDuration). Mobile ending compressed to 18.6 units. Mobile wipe radius raised to 172% (140% left an ivory arc on tall viewports — aspect-dependent circle math). Site-wide audit found no other scene with dead holds >1 unit.
- Pricing rebased on $500 base for 5 ads (~$100/ad): USD IGNITION $500-1500 / MOMENTUM $1600-3000 / SCALE $3100-5000; INR ₹40K-1.25L / 1.35L-2.5L / 2.6L-4.15L (new ₹K sub-lakh formatting).
- Verified: testing_agent iteration_11 (97% frontend; the 3% was the mobile wipe seam, fixed and self-verified per its protocol — full black at d=1.0). Dead space now ~428px total. Pricing probes exact on /start, currency persists. pytest 9/9, zero console errors.

- 7 more images added to the archive (total 12): fashion as second traveler through the letterform travel; the aperture became THE REEL — 7 rapid projections (food/tech/beverage/watch/automotive/beauty/eyewear, FRAME 003-009), slit renumbered FRAME 010. 4 new spec images AI-generated (watch, automotive, beauty, eyewear) via gemini-3-pro-image-preview; all 12 webp re-encoded at max native resolution q84.
- Owner corrections: poster slit moved off-center (top 61%, IS JUST rides its right end); resolve simplified to two lines — clipped 'THE ARCHIVE' re-entry REMOVED completely (0 refs), final composition = IS JUST + solid BEGINNING. (outline→fill crossfade during pull-back). Mobile exit wipe retimed to complete exactly at timeline end.
- Verified: testing_agent iteration_9 — 100%: resolve two-line clean both platforms, arch3 gone from DOM, reel one-frame-at-a-time with chips 003-009, all 12 images 200/render, reverse clean, wipe timing exact, full journey regression green, pytest 9/9, zero console errors. Earlier bugs fixed en route: multi-line exit-wipe positions missed by shift scripts (fired mid-reel).

- Owner asked for more images in the Archive without breaking the one-hero law. Added: background TRAVELER (audio.webp) crossing at its own velocity during the approach (desktop), and a SECOND APERTURE PROJECTION (food.webp, FRAME 003) — the splice now holds black through two projections (home → food) before lifting. Poster slit renumbered FRAME 004. Archive now shows 5 spec images sequentially (fragrance, audio, home, food, skincare); desktop timeline 23.3→24.9 units, mobile 13.25→14.55 (pin 680%→760%). Verified: correct projection order via DOM probes, never stacked (ap1 1/ap2 0 then ap1 0/ap2 1), reverse re-opens ap2, mobile slit renders with no overflow.

- Merged the duplicated WE MAKE (OpeningScene preview outline + StatementScene solid fly-in) into ONE continuous moment. OpeningScene's O-window now opens onto pure dark world + ember glow (op-preview removed entirely). StatementScene owns the only WE MAKE: outline → materializes to solid ivory through a layered mask system (pre-exposure layer leading 0.15u, solid via directional clip-path reveal, 1px luminance edge line, instrument ring tracking the fill edge with 180° rotation, ambient luminance wake, 0.4° skew whisper) → hold → statement continues (THINGS/PEOPLE/WATCH.) with .wm-group as one object. Pin 340%→520%. Mobile WE MAKE 17vw. Archive explicitly untouched.
- Verified: testing_agent iteration_6 — 100% (8/8): exactly one WE MAKE object at every depth (3 layers share identical box), unbroken dolly through the inter-pin gap, orb/sweep track the fill edge to the pixel, same-object drift ≤1px, reverse ×2 + fast-scroll + refresh-near-section all clean, mobile 390/375 no overflow, Archive + opening + nav + ripple regression green, pytest 9/9, zero console errors.

- Same architecture, completely new direction per owner's 16-point brief: three depth planes (distant monumental letterforms z-1 / camera plane hero+aperture+slit z-10 / mid metadata z-20 / front type z-30 / splice z-40 / exit z-50). Desktop 23.3 units over 1150% pin; separate mobile vertical-trailer timeline (680%).
- Beats: A silence (tiny distant frame, crop marks, FRAME 001 meta) → B dolly approach (crop evolves, inner parallax) → C takeover 21:9 → full bleed 100vw, type disappears behind → D image passes beyond camera → E LETTERFORM TRAVEL through monumental 135vh ARCHIVE (letters exceed viewport, camera passes through A→E, resolves to THE ARCHIVE) → F HARD CUT black splice (KYMRSTUDIO / FRAME 002 / TC) → G aperture projection (slit mask grows to full viewport, collapses; mask moves, not the card) → H IS JUST orange impact (34vw, covers viewport) → I POSTER FRAME (THE / ARCHIVE behind image slit / IS JUST in front / BEGINNING. outline cropped below — held) → J silence hold → tiny foot lines with pauses → BEGINNING. rises cropped → camera pulls back → statement resolves → hold → circle wipe exit.
- Defects found via testing_agent iterations 4+5 and fixed: unpositioned hold tweens inflating totalDuration (all holds now positioned); beat-E payoff hidden behind splice (shifted F–J +0.6); vw-type/vh-offset resolve misorder at ≥1600px (new .ax-just2 element, aspect-safe offsets); .ax-beg reverse-scrub loss (set+to pattern, both timelines); GSAP overwriting Tailwind -translate-1/2 centering on mobile (explicit xPercent/yPercent in every set); THE/ARCHIVE payoff collision.
- Verified: iterations 4+5 (30-depth desktop sweep, 6 viewports, reverse scrub, z-order, element budget, zero console errors, pytest 9/9) + measured self-checks of every fix. Max 1 hero + 1 supporting element at any moment.

- ArchiveScene fully rewritten per owner's shot-by-shot brief: 7-shot pinned scrub sequence (desktop 800% pin, separate mobile choreography 520%). SHOT 01 silence (ivory, meta 'KYMRSTUDIO / ARCHIVE / 001', tiny distant hero) → 02 approach (crop evolves via clip-path + scale, background traveler image at different velocity, THE ARCHIVE enters) → 03 frame takeover (84vw×66vh widescreen, inner image parallax) → 04 pass-through (frame flies past left, huge title revealed) → 05 second memory (narrow mask band expands/contracts while traveling; never stacked over hero) → 06 typographic event (THE ARCHIVE restructures, IS JUST ember, BEGINNING. outline) → 07 quiet final composition + tiny distant image + 'NO BORROWED GLORY. NO INVENTED CLIENTS.' → circle-wipe exit into transit. Depth planes: slow ghost background type, medium typography, faster hero media, fast foreground editorial rail. Max 2 images visible at any point. Old collage + hover interactivity removed (brief explicitly banned piles).
- Fixes from testing_agent iteration_3: FR.002 spec chip moved into mask-safe center band (was clipped 100% by shot-05 clip-path); FR.003 final image moved bottom-right (was colliding with BEGINNING. glyph band); ~320px dead scroll window between shots 05→06 closed (t1 re-enters at 9.4 overlapping memory fade); .ax-mem given explicit hidden initial state + immediateRender:false (was rendered visible off-screen from load).
- Verified: testing_agent iteration_3 (29-depth desktop sweep, clip-path-aware visibility probes, reverse scrub, exit wipe, transit handoff, mobile one-image-at-a-time + no overflow + no scene leaks, nav anchors, ripple, USD/INR, pytest 9/9, zero console errors) + self-verified the 3 fixes with measurements (chip frac 1.0, t1 op 0.84 at d=0.68, 0px² collision). New CSS: .text-outline-dark.

- Estimator now shows honest indicative monthly ranges per tier with a USD/INR toggle (data-testids: currency-toggle, currency-usd, currency-inr, estimate-rate, result-rate). Ranges: IGNITION $1.5–3k / ₹1.25–2.5L, MOMENTUM $3–6k / ₹2.5–5L, SCALE $6–12k / ₹5–10L — always suffixed "CONFIRMED ON YOUR CALL". Currency persists in the kymr-start session store. Live-updates with the volume slider in both the aside and the tier-reveal stage. Verified: USD/INR switch + slider-driven tier/rate changes by browser test; build clean.

- Per owner request, ambient sound feature removed entirely: SoundToggle.jsx + utils/ambient.js deleted, removed from Nav and /start header. Nav is now PROCESS / CAPABILITIES / CONTACT / START only. Build clean, both headers verified by screenshot. Note: scenes still dispatch kymr:state CustomEvents (no listeners now — harmless).

- INSTAGRAM REEL: full-experience showcase video recorded programmatically (Playwright headless chromium, 1080×1920 9:16, ~45s eased cinematic scroll through the whole site) → encoded H.264/yuv420p mp4 (~1.9MB) → served at /promo-instagram-reel.mp4. Recording script at /tmp/record.js (not committed).
- GIT PUSH: attempted `git push origin main` — fails with "could not read Username for 'https://github.com'" — no token/credential helper/gh CLI in this environment. Owner must use the platform "Save to Github" feature to publish commits 008a011 → 5e62330.

- RIPPLE BUG FIXED: the double dark-veil on arrival at /start is gone — Ripple.jsx now navigates at veil opacity 1 and unmounts immediately (no fade-back); Start's arrival veil handles the reveal; total transition ~0.95s. Verified across all 4 entry paths incl. repeat triggers + keyboard; no stuck overlays, no dead clicks.
- ARCHIVE TEASER: 'the direction is about to change' had lost its ar-teaser class and bled behind "IS JUST" — reclassed, opacity-0, moved to bottom (flex items-end pb-[20vh]), fades in only after the dark circle reaches ~140%. Verified zero overlap.
- ARCHIVE INTERACTIVITY: spec frames now hover-zoom (gsap scale 1→1.1), pointer parallax (depth 5–13px, img oversized -inset-[6%]), SPEC cursor label, border brighten. Two defects found by testing_agent and fixed: headline overlay blocked pointer events (added pointer-events-none) and Tailwind preflight max-width:100% capped the oversize img causing right-edge background reveal (added max-w-none). Verified: elementFromPoint inside frame, scale 1.1 on real hover, right gaps all negative. Mobile frames get min 110px width.
- MEDIA PERF: all 8 spec ads converted to WebP 900px q76 (~392KB total vs 1.05MB, −63%); references updated in Archive + Interlude; lazy + async decoding retained.
- INSTAGRAM: promo card rendered from real brand assets at /promo.html → captured to /promo-instagram.jpg (1080×1350, 92KB, publicly downloadable). promo.html kept for future re-renders.
- Volume coercion: slider value now stored as number (was string).
- TESTING: testing_agent iteration_2.json — backend 100% (9/9 pytest), ripple/teaser/webp verified, full regression sweep clean (labels, Forces, /start incl. Cal embed, reduced-motion, mobile, console). The 2 archive defects found were fixed and self-verified per the agent's re-verify protocol. NOT tested: real Cal.com booking (would create a real meeting).

- Ripple: new components/Ripple.jsx (RippleHost mounted in App.js inside BrowserRouter). Nav START ↗ and Contact INQUIRE both trigger a full-screen water-ripple (3 expanding rings + blur + dark veil) → navigate /start; /start shows an arrival veil fade (sessionStorage kymr-ripple). Double-activation guarded; reduced-motion path navigates instantly with no overlay. INQUIRE is never a mailto (mailto stays only on the big email link).
- Internal label purge: removed "FINAL TRANSMISSION" slate (ContactScene), "03 — INCOMING TRANSMISSION" (OpeningScene), "NEXT — EVERYTHING MOVES SIDEWAYS" (Archive teaser → italic serif "the direction is about to change"), "END OF TRANSMISSION —" (FinalScene meta → "SCROLL FOR CONTACT"), "SIGNAL ACQUIRED — KYMRSTUDIO" → "SIGNAL ACQUIRED" (identity introduced exactly once).
- Typography: JetBrains Mono REMOVED — tailwind font-mono now maps to Spectral serif; index.css loads Cinzel Decorative + Cormorant Garamond + Spectral. Cinzel Decorative remains signature-only.
- Ghost-layer fix: StatementScene corner echoes (WE MAKE/THINGS/PEOPLE residues) now fade fully out before the release line — verified by screenshot.
- Media: decoding="async" added to Archive/Interlude imgs (already lazy, fixed-size frames).
- Fixes from testing_agent iteration_1: added GET /api/health; Admin.jsx vault rendering hardened with String() coercion (was full-page crash on non-string config); Start.jsx config.volume now defaults to 20 so leads always carry volume; mobile nav sound label hidden below sm (wrap/collision fix).
- TESTING: testing_agent iteration_1.json — 9/9 pytest backend pass (regression suite at /app/backend/tests/backend_test.py), all frontend flows pass (21 scroll-depth label sweep clean, Forces one-word-at-a-time, ripple mouse+keyboard+touch paths, /start full flow incl. Cal embed real event types, reduced-motion, mobile no-overflow, console clean). Report: /app/test_reports/iteration_1.json. NOT tested: completing a real Cal.com booking (would create a real meeting).
- Git: .env files remain untracked, no secrets committed.

## v10 Wordmark Font (2026-08-28)
- Brand wordmark switched from Cabinet Grotesk to Cinzel Decorative everywhere it appears: film nav logo, /start header, vault heading, and the giant opening identity reveal (now bookends with the Cinzel finale). Cinzel is caps-only so the mark renders as KYMRSTUDIO — the approved uppercase treatment. Cabinet Grotesk remains the kinetic scene typography; JetBrains Mono for utility; Cormorant for serif lines.

## v9 Spec Ad Collection (2026-08-28)
- Generated 8 original ultra-photorealistic SPEC ad concepts (Gemini 3.1 Flash Image via Emergent key): fragrance, skincare, audio, tech (4:5) + food, home (4:5) + beverage, fashion (3:2). All unbranded, no text/logos, no fake clients. Manually inspected all 8 — zero AI artifacts accepted (no hands/faces/text risks by prompt design).
- Wired into existing empty frames: Archive scene = 6 spec frames scattered behind the headline (typography crosses IN FRONT — layered editorial depth), Transit interlude = beverage + fashion frames between the giant words. Small editorial "SPEC CONCEPT — CATEGORY" chips on every image (honest labeling, no big warnings). Serif line keeps the anti-portfolio stance: "no borrowed glory. no invented clients."
- Web-optimized: resized ≤1350px, JPEG q82, total 1.1MB for all 8, lazy-loaded, object-cover in fixed frames (no layout shift).
- QA: all images 200 + naturalWidth verified, desktop + mobile (no overflow), label wrap fixed (whitespace-nowrap), build clean. Generation script persisted at /root/gen_ads.py (idempotent, re-runnable).

## v8 Final Frontend Handoff (2026-08-28) — commit 4afa823 on main
- Cal.com webhook: POST /api/webhooks/calcom handles BOOKING_CREATED → matches lead by attendee email → sets meeting.booked + startTime (verified: matched+updated ava@brandco.com; unknown email → matched:false; optional CAL_WEBHOOK_SECRET enforcement supported). OWNER ACTION: add subscriber URL https://living-studio-1.preview.emergentagent.com/api/webhooks/calcom in Cal.com → Settings → Webhooks, event "Booking Created".
- Removed all STATE 0X corner labels + "07 — INVERSION" + "11 —" prefix; nav state label now shows name only (ORIGIN/FORCES/...).
- Forces rebuilt: strictly one dominant force — STRATEGY (vertical rise) → CREATIVE (horizontal displacement) → PRODUCTION (scale emergence) → EDITING (blade cut + halves join) → PERFORMANCE (viewport takeover); no typography cloud (verified frames).
- Estimator volume is now a slider (5–50+ ads/mo, keyboard accessible, ember thumb, tier thresholds ≤15 IGNITION / ≤30 MOMENTUM / else SCALE) with live readout + aside updates; mix/cadence remain option rows.
- INQUIRE in the final frame now routes to /start (no direct mailto); email remains the big secondary link.
- Cleanup: deleted 10 dead scene/asset files (v1 scenes, OriginScene, ExpansionScene, OgCard); .env files UNTRACKED from repo per final handoff rules (still present locally).
- QA: production build clean (16s), console clean, Forces frames verified, STATE-label grep empty, webhook curl verified, slider keyboard test passed.

## v7 Commercial Journey (2026-08-28)
- /start route: CONFIGURE → ESTIMATE → INQUIRE → BOOK in the film's visual language (void bg, grain, cursor, sound toggle, progress rail 01-06). Estimator: VOLUME 10/20/40+ ads/mo, MIX Static/Motion/Hybrid, CADENCE Standard 48H/Sprint/Weekly drops; live configured-scope panel; tiers IGNITION/MOMENTUM/SCALE in Cinzel Decorative; investment shown as "custom quote on your call" (NO invented prices — owner delegated structure, no rates given).
- Inquiry: name*/work email*/company/phone, inline ember validation that clears on correction, configured-scope summary with EDIT that preserves state; sessionStorage persistence (kymr-start) survives refresh mid-flow.
- Booking: Cal.com inline embed (@calcom/embed-react, namespace "booking", calLink armaan-khasim-shaik-p9vin0, dark theme, real event types confirmed loading); bookingSuccessfulV2 → lead posted with meeting data; linkFailed → honest error + mailto fallback; "skip the call" path posts lead without booking; duplicate-submit guarded.
- Backend: POST/GET /api/leads (admin-key guarded) with full lead structure (name/email/company/phone/config/tier/meeting/message/source/created_at) — Business-OS-ready shape. Admin vault now lists CONFIGURED SCOPES + legacy signals.
- Typography: Cinzel Decorative added (Google Fonts) — used ONLY for signature moments: protocol numbers (48H/3S/100%/10+), finale wordmark, estimate tier, RECEIVED.
- Forces scene hierarchy fix: one dominant force at a time; strategy/creative collapse to corner echoes and clear before the EDITING cut.
- Nav gained START ↗ (ember) → /start; contact scene gained "CONFIGURE YOUR PRODUCTION SYSTEM →".
- QA: production build clean (23s); estimator gating/edit/refresh/validation verified; leads e2e (skip path posted Ava Reyes SCALE to vault); Cal iframe real availability; mobile /start zero overflow; protocol+finale Cinzel confirmed via computed fonts.

## v6 One-Shot Opening + GitHub (2026-08-28)
- Origin + Expansion MERGED into OpeningScene.jsx — a single pinned timeline (520%): dot → hairline → aperture → KYMRSTUDIO introduced ONCE inside the aperture → aperture dissolves outward → the same wordmark scales 2.2x → 15x beyond viewport with letter drift → O-counter window opens mid-expansion into the Statement preview (stroke strengthened for a visible handoff). No cut, no duplicate logo. Nav state flips 01 ORIGIN → 02 EXPANSION at 50% progress. Old OriginScene/ExpansionScene files unused.
- Verified: full arc screenshotted (identity-in-aperture, transition, expansion drift, window, statement handoff), reverse-scroll restores the aperture, mobile opening clean, console clean.
- GIT: pushed to github.com/Armnks/Better-Kymr (main). .env files are NOW TRACKED in the repo per explicit owner request (contains MONGO_URL, ADMIN_KEY kymr-vault-7f3a-2026 — flagged to owner; rotate ADMIN_KEY if repo is/becomes public). Owner also shared a GitHub PAT in chat — advised to rotate.

## v5 Sound + Identity Assets + Loading Ritual (2026-08-28)
- LOADING RITUAL (Preloader.jsx): ~1.3s ignition — darkness → ember dot ignites at exact center → "KYMRSTUDIO" mono caption tracking-in → dot flares and settles → overlay fades directly onto the Origin scene's breathing dot (pixel-aligned handoff). Reduced-motion: 0.4s simple fade. Never blocks: 3.5s safety timeout, body scroll + Lenis locked only during the ritual, ScrollTrigger.refresh after.
- AMBIENT SOUND (utils/ambient.js + SoundToggle.jsx): synthesized Web Audio room tone — detuned 55Hz triangle drone + 110Hz sine + looped brown-noise lowpassed at 240Hz, breathing gain LFO (0.07Hz), slow filter drift; master ~0.05 with 1.4s fade-in. OFF by default; nav-integrated "SOUND OFF/ON" button (ember dot when on); localStorage kymr-sound persists; if pref=on, audio arms on first user gesture (autoplay-safe); subtle gain swell on every scene-state change (kymr:state). Keyboard accessible (aria-pressed, focus-visible ring).
- IDENTITY ASSETS: favicon.svg (ember dot on void), favicon-32.jpg, apple-touch-icon.jpg, og-image.jpg (1200×630 frame of the site: KYMRSTUDIO display type, ember dot + hairline, mono process captions, grain + vignette) — generated by rendering a real branded frame (OgCard route, removed after capture). index.html: OG + Twitter summary_large_image + icon links + theme-color #050505.
- RITUAL SKIP MEMORY: localStorage kymr-visited set when the ritual completes; returning visitors get a ~0.55s ember blink (dot in → flare → veil lifts) instead of the full 1.3s ritual. Verified: first visit shows full ritual at 0.9s, returning visit is in the Origin scene by 1.0s.
- QA: all assets 200 with correct MIME; cold load + refresh verified (preloader clears ~2.7s, never stuck); sound OFF default / ON via keyboard Enter / persists / OFF again; mobile cold load verified; console clean; unused OgCard route + import removed post-generation.

## v4 Final Contact + QA (2026-08-28)
- CONTACT IS NOW MAILTO-ONLY per user directive (no backend in the contact flow): new pinned ContactScene (v2/ContactScene.jsx) — slate "11 — FINAL TRANSMISSION" → serif "you made it to the last frame." → giant breathing media@kymrstudio.com → INQUIRE button with ember sweep fill → understated footer (© 2026 KYMRSTUDIO / socials / VAULT). Old form scene retired (file unused: scenes/ContactScene.jsx); POST /api/enquiries + /admin vault still live for legacy enquiries.
- PRIMARY EMAIL: media@kymrstudio.com (both email link and INQUIRE use mailto:media@kymrstudio.com, INQUIRE includes subject prefill).
- Cursor contextual states added: WATCH (statement), WAIT (void ring), FINALE (final word), plus existing SAY HELLO / OPEN / TRANSMIT / UNWRITTEN / nav labels.
- Accessibility pass: :focus-visible ember outline, aria-labels on logo + email link.
- Bug found + fixed: nav state label could go stale on instant jumps (added onUpdate announce to Finale + Contact scenes). Verified on tablet (1024×768) — label correct at max scroll.
- QA this round: DOM assertions (email/href/inquire href, form removed), geometry (10 clean pinned regions, 45231px), reverse-scroll restore verified, tablet + mobile verified.

## v3 Escalation (2026-08-28)
- BRAND: renamed everywhere to KymrStudio (KYMRSTUDIO as uppercase visual treatment). Nav logo, Origin/Expansion/Finale wordmarks rebuilt around the 10-letter wordmark (letters repel cursor; whole-word beyond-viewport expansion with circular window at the O counter; 10-letter corner convergence finale), contact hello@kymrstudio.com, page title/metadata, backend root message, admin vault heading, footer.
- NEW STATE 09 — TRANSIT (InterludeScene): pinned horizontal travel between Archive and Finale. THE NEXT / FRAME / IS YOURS. with empty UNWRITTEN frames passing, counter-directional KYMRSTUDIO ghost backtrack (depth layer), velocity skew on items, ember hairline motif return drawing across the final word, serif "we saved you a seat in the archive."
- Finale state renumbered to 10 — KYMRSTUDIO. Archive teaser now foreshadows the sideways scene.
- Bug audit: console clean (only benign platform-script warning), zero horizontal overflow, title/metadata fixed (frontend restart required for public/index.html changes), all states re-screenshotted desktop + mobile (390×844 transit verified).
- DOM assertions verified: title, nav text, 10 origin letters, KYMRSTUDIO final word, mailto href.

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
See /app/memory/test_credentials.md. Admin key: kymr-vault-7f3a-2026. Contact email (real, per user): media@kymrstudio.com; social URLs placeholders.

## Backlog
- P1: Replace placeholder email/socials with real ones (user input needed)
- P1: Resend email notification on new enquiry
- P2: Horizontal-travel scene (v1 had it; v2 uses other mechanisms — candidate re-add between Archive and Finale)
- P2: Ambient sound toggle; scroll-velocity letterspacing on display type
- P2: Real archive entries system when client work exists
- P2: Admin vault: delete/archive enquiries

## Sample Data Note
DB contains 2 test enquiries ("Test Sender", "Ava Reyes") — safe to ignore or delete.
