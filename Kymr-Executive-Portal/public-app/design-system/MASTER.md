# KymrStudio Design System — MASTER

Authority: **UI/UX Pro Max** for system intelligence and UX validation.
Animation: **Framer Motion 11.18** for DOM. The shader owns its own render
loop and Framer Motion never drives its frames.

Locked creative direction, not open to skill override:

    BLINKING SIGNAL -> WORDMARK -> ENTER THE WORDMARK -> SHADER WARP -> KYMR WORLD

---

## 1. Skill output: accepted

| Source | Recommendation | Status |
|---|---|---|
| design-system | Pattern **Immersive / Interactive Experience** | Accepted. It is the entry sequence. |
| design-system | "Provide skip option… Skip option for impatient users" | Accepted. Drives Skip Intro. |
| design-system | "Dark background for focus. Highlight interactive elements." | Accepted. Carbon ground, vermilion marks what is live. |
| design-system | Style **Motion-Driven** | Accepted as the motion family. |
| design-system | Typography heading **Archivo**, body **Space Grotesk** | Rejected on face, accepted in spirit. Satoshi already fills the "premium, modern, clean" mood the skill names, and the wordmark is Cinzel. Changing faces mid-identity would break the entry sequence, whose whole subject is the wordmark. |
| ux | Reduced Motion (High) | Accepted. `useReducedMotion` everywhere; intro collapses to < 900ms. |
| ux | Focus States (High) | Accepted. One `:focus-visible` system, vermilion ring. |
| ux | Keyboard Navigation (High) | Accepted. Tab order matches visual order; no traps outside the dossier. |
| ux | Excessive Motion (High): "Animate 1-2 key elements per view maximum" | Accepted as a cap on *simultaneous independent* motion. One orchestrated entrance per view is one element for this purpose. Zero infinite loops outside the shader. |
| ux | User Freedom (Medium): "Provide Skip and Back buttons. Don't force linear unskippable tour" | Accepted. Skip Intro + Replay Entry. |
| ux | Easing (Low): ease-out entering, ease-in exiting | Accepted. |
| ux | Skip Links (Medium) | Already present. |
| landing | **Funnel (3-step)**: "Each step: mini-CTA. Final: main CTA" | Accepted. Conversion at hero, Process and Decision. |
| landing | Funnel step colours red / orange / green | Rejected. Three semantic hues break the single-accent lock. |
| landing | Portfolio Grid: "Neutral background, let the work shine" | Accepted for the Archive stage only. |
| react | Focus trap in modals, return focus on close | Accepted. Dossier already does this. |
| react | `lazy()` for heavy components | Accepted for the shader. |
| react | Profile before optimizing | Accepted. |

## 2. Skill output: rejected outright

Palette `#EC4899 / #F472B6 / #06B6D4 / #FDF2F8`. Keyword-matched, not judged.
The skill's own note on that row reads "Bold primaries + artistic freedom",
which the brand palette satisfies. Also rejected per the locked direction:
SaaS styling, bento grids, equal service cards, glassmorphism, cyberpunk HUD,
dashboard chrome, generic gradient backgrounds, conventional video-first
agency heroes.

## 3. Palette

| Token | Value | Role |
|---|---|---|
| `--carbon` | `#0B0B0E` | ground, never pure black |
| `--carbon-lift` | `#111218` | one step toward light |
| `--graphite` | `#15161B` | material surfaces |
| `--smoke` | `#21232B` | structure |
| `--frost` | `#F1F3F2` | cold off-white, primary ink |
| `--silver` | `#A9AFB8` | muted silver, secondary |
| `--silver-dim` | `#7C838D` | tertiary, clears 4.5:1 on carbon |
| `--signal` | `#FF3B14` | Kymr vermilion, the only accent |

Image-derived accents (`concept.accent`) are permitted **inside the Archive
only**, to tint filaments and the plate edge. Saturation stays controlled and
they never become a second brand colour.

## 4. Typography

Satoshi throughout. Cinzel Decorative for the wordmark only. IBM Plex Mono
for functional data only: counts, frame numbers, ratios.

Scale is capped: emphasis comes from position, weight and the signal colour,
not raw size. Uppercase wide-tracked labels rationed to six per page.

## 5. Motion timing

| Token | Value | Use |
|---|---|---|
| `--k-dur-cut` | 160ms | decisive state change |
| `--k-dur-ui` | 220ms | hover, selection |
| `--k-dur-comp` | 420ms | component transition |
| `--k-dur-scene` | 720ms | chapter reveal |

Controls respond in **180-260ms** per the interaction spec. Easing
`cubic-bezier(0.22, 1, 0.36, 1)` entering.

## 6. Interaction system

Primary control: max 4px pointer attraction, vermilion directional fill,
0.98 pressed scale, strong `:focus-visible`, 180-260ms, interruptible.

Secondary link: directional underline, max 4px arrow travel, contrast lift,
no layout shift.

Banned: elastic wobble, excessive springs, `transition: all`, constant glow,
custom cursor, a different gimmick per button.

## 7. Shader modes

One persistent field behind the whole page. Modes:
`intro`, `warp`, `hero`, `fracture`, `capabilities`, `archive`, `process`,
`contact`. Section visibility drives the mode; the shader keeps its own
render loop. Pointer displacement is capped at ~8px perceived.

## 8. Accessibility floor

WCAG 2.1 AA. Contrast measured against the composited page, not the token.
Focus visible on every control. Reduced motion yields a complete
composition, never a degraded one. Intro is skippable by mouse and keyboard
and never traps scroll.
