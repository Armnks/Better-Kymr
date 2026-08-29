import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

// THE ARCHIVE — a scroll-scrubbed title sequence.
// Planes: z-1 distant (monumental letterforms) / z-10 camera (hero, aperture, slit)
// z-20 mid (metadata, rails, crop marks) / z-30 typography front / z-40 splice / z-50 exit.
// Images: FR.001 fragrance (hero dolly) · FR.002 home (aperture projection) · FR.003 skincare (slit).
const HERO = { img: "/ads/fragrance.webp", id: "FRAME 001" };
const PROJ = { img: "/ads/home.webp", id: "FRAME 002" };
const REEL = [
  { img: "/ads/food.webp", id: "FRAME 003" },
  { img: "/ads/tech.webp", id: "FRAME 004" },
  { img: "/ads/beverage.webp", id: "FRAME 005" },
  { img: "/ads/watch.webp", id: "FRAME 006" },
  { img: "/ads/automotive.webp", id: "FRAME 007" },
  { img: "/ads/beauty.webp", id: "FRAME 008" },
  { img: "/ads/eyewear.webp", id: "FRAME 009" },
];
const SLIT = { img: "/ads/skincare.webp", id: "FRAME 010" };
const TRAV = { img: "/ads/audio.webp" };
const TRAV2 = { img: "/ads/fashion.webp" };

export default function ArchiveScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const announce = () =>
        window.dispatchEvent(new CustomEvent("kymr:state", { detail: "08 — ARCHIVE" }));

      const mm = gsap.matchMedia();

      // ─────────────────────────── DESKTOP ───────────────────────────
      // total: 30.7 units. beats: A silence 0-1.2 · B dolly 1.2-3.6 · C takeover 3.6-6.2
      // D pass 6.2-7.4 · E letterform travel 7.4-10.9 · F splice 11.0-11.9 · G aperture 11.8-14.15
      // G2 reel 14.3-21.3 (7 projections) · H orange impact 21.7-22.45 · I poster 22.9-24.75
      // J silence+foot lines 24.7-27.8 · exit wipe 27.9-28.8
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=1400%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onToggle: (self) => self.isActive && announce(),
          },
        });

        // ── initial geometry
        tl.set(".ax-hero", { scale: 0.5, clipPath: "inset(40% 42%)" }, 0);
        tl.set(".ax-giant", { xPercent: -50, yPercent: -50, x: "125vw" }, 0);
        tl.set(".ax-ap", { clipPath: "inset(49.6% 0%)" }, 0);
        REEL.forEach((_, i) => tl.set(`.ax-r${i}`, { clipPath: "inset(49.6% 0%)" }, 0));
        tl.set(".ax-slit", { clipPath: "inset(0% 50%)" }, 0);
        tl.set(".ax-the", { xPercent: -50, yPercent: -50, x: "-32vw", y: "-34vh" }, 0);
        tl.set(".ax-arch2", { xPercent: -50, yPercent: -50, x: "-10vw", y: "-11vh" }, 0);
        tl.set(".ax-beg", { xPercent: -50, yPercent: -50, x: "-8vw", y: "38vh" }, 0);

        // foreground rail drifts the whole sequence (fast plane)
        tl.fromTo(".ax-rail", { yPercent: 18 }, { yPercent: -18, duration: 28.8, ease: "none" }, 0);

        // ── BEAT A · SILENCE (0–1.2)
        tl.fromTo(".ax-meta", { autoAlpha: 0, y: 10 }, { autoAlpha: 0.9, y: 0, duration: 0.6 }, 0.25)
          .fromTo(".ax-hero", { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.8 }, 0.35)
          .fromTo(".ax-crops", { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.6 }, 0.5)
          .fromTo(".ax-giant", { autoAlpha: 0 }, { autoAlpha: 0.05, duration: 1.0 }, 0.4);

        // ── BEAT B · DOLLY APPROACH (1.2–3.6)
        tl.to(".ax-hero", { scale: 0.72, clipPath: "inset(31% 24%)", duration: 2.4, ease: "power1.inOut" }, 1.2)
          .fromTo(".ax-hero-img", { yPercent: -7 }, { yPercent: 0, duration: 2.4, ease: "none" }, 1.2)
          .fromTo(".ax-arch", { xPercent: -50, yPercent: -50, autoAlpha: 0, y: "42vh" }, { autoAlpha: 1, y: "12vh", duration: 1.4, ease: "power3.out" }, 2.2)
          .to(".ax-crops", { autoAlpha: 0, duration: 0.4 }, 3.2);

        // supporting frame crossing at its own velocity
        tl.fromTo(".ax-trav", { x: "-45vw", autoAlpha: 0 }, { x: "112vw", autoAlpha: 0.3, duration: 3.4, ease: "none" }, 1.4)
          .to(".ax-trav", { autoAlpha: 0, duration: 0.4 }, 5.0);

        // ── BEAT C · TAKEOVER — 21:9 → full bleed (3.6–6.2)
        tl.to(".ax-hero", { scale: 1, clipPath: "inset(27% 0%)", duration: 1.4, ease: "power2.inOut" }, 3.6)
          .to(".ax-hero", { clipPath: "inset(0% 0%)", duration: 1.2, ease: "power3.inOut" }, 5.0)
          .to(".ax-hero-img", { yPercent: 8, scale: 1.16, duration: 2.6, ease: "none" }, 3.6)
          .to(".ax-arch", { autoAlpha: 0, duration: 0.6 }, 5.6)
          .to(".ax-meta", { autoAlpha: 0, duration: 0.5 }, 5.7);

        // ── BEAT D · PASS BEYOND (6.2–7.4)
        tl.to(".ax-hero", { scale: 1.7, duration: 1.0, ease: "power2.in" }, 6.2)
          .to(".ax-hero", { autoAlpha: 0, duration: 0.35 }, 7.05);

        // ── BEAT E · LETTERFORM TRAVEL (7.4–10.9) — payoff visible 10.55–11.0
        tl.to(".ax-giant", { autoAlpha: 0.95, duration: 0.4 }, 7.4)
          .to(".ax-giant", { x: "-125vw", duration: 2.4, ease: "none" }, 7.6)
          .to(".ax-giant", { x: "0vw", scale: 0.12, y: "-20vh", duration: 0.9, ease: "power3.inOut" }, 10.0)
          .fromTo(".ax-the-s", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.3 }, 10.25)
          .fromTo(".ax-trav2", { x: "115vw", autoAlpha: 0 }, { x: "-50vw", autoAlpha: 0.25, duration: 2.6, ease: "none" }, 7.8)
          .to(".ax-trav2", { autoAlpha: 0, duration: 0.3 }, 10.3);

        // ── BEAT F · HARD CUT — the splice (11.0–11.9)
        tl.to(".ax-black", { autoAlpha: 1, duration: 0.12 }, 11.0)
          .fromTo(".ax-black-meta", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 11.15)
          .to({}, { duration: 0.45 }, 11.45);

        // ── BEAT G · APERTURE PROJECTION (11.8–14.3)
        tl.fromTo(".ax-ap", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 11.8)
          .to(".ax-ap", { clipPath: "inset(30% 0%)", duration: 0.8, ease: "power2.inOut" }, 11.8)
          .to(".ax-ap", { clipPath: "inset(10% 0%)", duration: 0.6, ease: "power2.inOut" }, 12.6)
          .to(".ax-ap", { clipPath: "inset(0% 0%)", duration: 0.5, ease: "power3.in" }, 13.2)
          .fromTo(".ax-ap-img", { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1, duration: 2.2, ease: "none" }, 11.8)
          .to(".ax-black-meta", { autoAlpha: 0, duration: 0.3 }, 12.8)
          .to([".ax-giant", ".ax-the-s"], { autoAlpha: 0, duration: 0.3 }, 13.5)
          .to(".ax-ap", { clipPath: "inset(49.8% 0%)", duration: 0.5, ease: "power3.in" }, 13.7)
          .to(".ax-ap", { autoAlpha: 0, duration: 0.15 }, 14.15);

        // ── BEAT G2 · THE REEL (14.3–21.3) — seven rapid projections, one frame at a time
        REEL.forEach((_, i) => {
          const t0 = 14.3 + i * 1.0;
          tl.fromTo(`.ax-r${i}`, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, t0)
            .to(`.ax-r${i}`, { clipPath: "inset(0% 0%)", duration: 0.5, ease: "power3.inOut" }, t0)
            .fromTo(`.ax-r${i} img`, { yPercent: 5, scale: 1.08 }, { yPercent: -5, scale: 1, duration: 0.9, ease: "none" }, t0)
            .to(`.ax-r${i}`, { clipPath: "inset(49.8% 0%)", duration: 0.35, ease: "power3.in" }, t0 + 0.68)
            .to(`.ax-r${i}`, { autoAlpha: 0, duration: 0.12 }, t0 + 0.98);
        });
        tl.to(".ax-black", { autoAlpha: 0, duration: 0.4 }, 21.2);

        // ── BEAT H · IS JUST — orange impact (14.3–15.55)
        tl.fromTo(".ax-just", { xPercent: -50, yPercent: -50, autoAlpha: 1, y: "108vh" }, { y: "-4vh", duration: 0.7, ease: "power4.out" }, 21.7)
          .to({}, { duration: 0.35 }, 22.4)
          .to(".ax-just", { scale: 0.26, x: "18vw", y: "17vh", duration: 0.5, ease: "power3.inOut" }, 22.45);

        // ── BEAT I · THE POSTER FRAME (15.5–17.35) — hold
        tl.set(".ax-slit", { autoAlpha: 1 }, 22.9)
          .fromTo(".ax-the", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 22.95)
          .fromTo(".ax-arch2", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 23.05)
          .to(".ax-slit", { clipPath: "inset(0% 0%)", duration: 0.6, ease: "power3.inOut" }, 22.95)
          .fromTo(".ax-slit-img", { xPercent: -8 }, { xPercent: 8, duration: 1.6, ease: "none" }, 22.95)
          .fromTo(".ax-beg", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.9, ease: "power1.in" }, 23.1)
          .to({}, { duration: 0.75 }, 24);

        // ── BEAT J · SILENCE → FINAL REVEAL (17.3–22.6)
        tl.to([".ax-the", ".ax-arch2", ".ax-just", ".ax-beg", ".ax-slit"], { autoAlpha: 0, duration: 0.4 }, 24.7)
          .to({}, { duration: 0.7 }, 25.1)
          .fromTo(".ax-foot1", { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.35 }, 25.8)
          .to({}, { duration: 0.3 }, 26.15)
          .fromTo(".ax-foot2", { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.35 }, 26.45)
          .to({}, { duration: 0.3 }, 26.8)
          .to([".ax-foot1", ".ax-foot2"], { autoAlpha: 0, duration: 0.3 }, 27.1)
          .to({}, { duration: 0.4 }, 27.4);

        // ── EXIT · circle wipe into transit (22.2–23.3)
        tl.to([".ax-rail"], { autoAlpha: 0, duration: 0.4 }, 27.8)
          .fromTo(
            ".ax-dark",
            { clipPath: "circle(0% at 50% 115%)" },
            { clipPath: "circle(140% at 50% 115%)", duration: 0.9, ease: "power3.inOut" },
            27.9
          );
      });

      // ─────────────────────────── MOBILE — vertical trailer ───────────────────────────
      mm.add("(max-width: 767px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=980%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onToggle: (self) => self.isActive && announce(),
          },
        });

        tl.set(".ax-hero", { scale: 0.6, clipPath: "inset(38% 32%)" }, 0);
        tl.set(".ax-ap", { clipPath: "inset(48% 4%)" }, 0);
        REEL.forEach((_, i) => tl.set(`.ax-r${i}`, { clipPath: "inset(48% 4%)" }, 0));
        tl.set(".ax-the", { xPercent: -50, yPercent: -50, x: "-16vw", y: "-30vh" }, 0);
        tl.set(".ax-arch2", { xPercent: -50, yPercent: -50, x: "0vw", y: "0vh" }, 0);
        tl.set(".ax-beg", { xPercent: -50, yPercent: -50, x: "0vw", y: "0vh" }, 0);

        // tiny frame → near full-screen
        tl.fromTo(".ax-meta", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.4 }, 0.2)
          .fromTo(".ax-hero", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.5 }, 0.3)
          .to(".ax-hero", { scale: 1, clipPath: "inset(17% 0%)", duration: 1.6, ease: "power2.inOut" }, 1.0)
          .fromTo(".ax-hero-img", { yPercent: -6 }, { yPercent: 6, duration: 1.6, ease: "none" }, 1.0)
          .to(".ax-meta", { autoAlpha: 0, duration: 0.3 }, 2.5)
          .to(".ax-hero", { scale: 1.25, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 2.7);

        // THE → ARCHIVE (huge, clipped)
        tl.fromTo(".ax-the", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 3.4)
          .fromTo(".ax-arch2", { autoAlpha: 0, x: "30vw" }, { autoAlpha: 1, x: "0vw", duration: 0.8, ease: "power3.out" }, 3.8)
          .to([".ax-the", ".ax-arch2"], { autoAlpha: 0, duration: 0.4 }, 4.8);

        // splice
        tl.to(".ax-black", { autoAlpha: 1, duration: 0.1 }, 4.9)
          .fromTo(".ax-black-meta", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 5.0)
          .to({}, { duration: 0.35 }, 5.25);

        // aperture slit (vertical mask travel)
        tl.set(".ax-ap", { autoAlpha: 1 }, 5.5)
          .to(".ax-ap", { clipPath: "inset(10% 0%)", duration: 0.8, ease: "power2.inOut" }, 5.5)
          .fromTo(".ax-ap-img", { yPercent: -6 }, { yPercent: 6, duration: 1.2, ease: "none" }, 5.5)
          .to(".ax-black-meta", { autoAlpha: 0, duration: 0.25 }, 6.0)
          .to(".ax-ap", { clipPath: "inset(48% 4%)", duration: 0.5, ease: "power3.in" }, 6.4)
          .to(".ax-ap", { autoAlpha: 0, duration: 0.15 }, 6.85);

        // the reel — seven rapid projections
        REEL.forEach((_, i) => {
          const t0 = 6.9 + i * 0.95;
          tl.set(`.ax-r${i}`, { autoAlpha: 1 }, t0)
            .to(`.ax-r${i}`, { clipPath: "inset(12% 0%)", duration: 0.55, ease: "power2.inOut" }, t0)
            .fromTo(`.ax-r${i} img`, { yPercent: 4 }, { yPercent: -4, duration: 0.85, ease: "none" }, t0)
            .to(`.ax-r${i}`, { clipPath: "inset(48% 4%)", duration: 0.4, ease: "power3.in" }, t0 + 0.6)
            .set(`.ax-r${i}`, { autoAlpha: 0 }, t0 + 0.92);
        });
        tl.to(".ax-black", { autoAlpha: 0, duration: 0.35 }, 13.5);

        // IS JUST — orange, from the opposite axis
        tl.fromTo(".ax-just", { xPercent: -50, yPercent: -50, autoAlpha: 1, x: "105vw" }, { x: "0vw", duration: 0.7, ease: "power4.out" }, 13.5)
          .to({}, { duration: 0.3 }, 14.2)
          .to(".ax-just", { autoAlpha: 0, duration: 0.3 }, 14.5);

        // BEGINNING. outline, then silence
        tl.fromTo(".ax-beg", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.7, ease: "power1.in" }, 14.7)
          .to(".ax-beg", { autoAlpha: 0, duration: 0.3 }, 15.5)
          .to({}, { duration: 0.8 }, 15.8);

        // foot lines, then the resolve
        tl.fromTo(".ax-foot1", { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.3 }, 16.2)
          .fromTo(".ax-foot2", { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.3 }, 16.6)
          .to([".ax-foot1", ".ax-foot2"], { autoAlpha: 0, duration: 0.25 }, 16.95)
          .to({}, { duration: 0.35 }, 17.25);

        // exit
        tl.fromTo(
          ".ax-dark",
            { clipPath: "circle(0% at 50% 115%)" },
            { clipPath: "circle(172% at 50% 115%)", duration: 0.9, ease: "power3.inOut" },
            17.7
          );
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section data-testid="archive-scene" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 bg-[#EAE6DF] px-6 py-24 text-center">
        <h2 className="font-display text-[10vw] font-black leading-none text-[#050505]">
          THE ARCHIVE IS JUST BEGINNING.
        </h2>
        <p className="font-mono text-xs md:text-sm tracking-[0.35em] text-[#050505]/60">
          NO BORROWED GLORY. NO INVENTED CLIENTS.
        </p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      data-testid="archive-scene"
      className="relative z-10 h-screen overflow-hidden bg-[#EAE6DF] text-[#050505]"
    >
      {/* DISTANT PLANE — the monumental word the camera travels through */}
      <div className="ax-giant pointer-events-none absolute left-1/2 top-1/2 z-[1] hidden select-none whitespace-nowrap font-display text-[135vh] font-black leading-none tracking-[-0.05em] text-[#050505] opacity-0 md:block">
        ARCHIVE
      </div>

      {/* MID PLANE — editorial metadata */}
      <div data-testid="archive-meta" className="ax-meta pointer-events-none absolute left-6 top-20 z-[20] opacity-0 md:left-10 md:top-24">
        <p className="font-mono text-[9px] tracking-[0.42em] text-[#050505]/70">
          KYMR / ARCHIVE — FRAME 001
        </p>
        <p className="mt-2 font-mono text-[8px] tracking-[0.3em] text-[#050505]/40">
          SPEC REEL — 35MM — TC 00:00:00:00
        </p>
      </div>

      {/* crop marks */}
      <div className="ax-crops pointer-events-none absolute inset-0 z-[20] hidden items-center justify-center opacity-0 md:flex">
        <div className="relative h-[52vh] w-[42vw]">
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-[#050505]/50" />
          <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-[#050505]/50" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#050505]/50" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#050505]/50" />
        </div>
      </div>

      {/* FOREGROUND rail — fast plane */}
      <div className="ax-rail pointer-events-none absolute right-6 top-1/2 z-[20] hidden -translate-y-1/2 flex-col items-center gap-4 opacity-50 md:flex">
        <span className="h-24 w-px bg-[#050505]/30" />
        <span className="font-mono text-[9px] tracking-[0.4em] text-[#050505]/60 [writing-mode:vertical-rl]">
          SEQ. 07 — 24 FPS
        </span>
        <span className="h-24 w-px bg-[#050505]/30" />
      </div>

      {/* CAMERA PLANE — hero frame (dolly → 21:9 → full bleed → beyond) */}
      <div data-testid="archive-hero" className="ax-hero absolute inset-0 z-[10] opacity-0">
        <img
          src={HERO.img}
          alt={`${HERO.id} — spec concept, fragrance`}
          loading="lazy"
          decoding="async"
          className="ax-hero-img absolute -top-[9%] left-0 h-[118%] w-full max-w-none object-cover"
        />
        <span className="absolute bottom-8 left-8 bg-[#050505]/60 px-2 py-1 font-mono text-[8px] tracking-[0.3em] text-white/85">
          {HERO.id} — SPEC CONCEPT
        </span>
      </div>

      {/* BACKGROUND TRAVELER — one supporting frame during the approach */}
      <div className="ax-trav pointer-events-none absolute left-0 top-[32vh] z-[6] hidden h-[30vh] w-[20vw] overflow-hidden opacity-0 md:block">
        <img
          src={TRAV.img}
          alt="Spec concept, audio"
          loading="lazy"
          decoding="async"
          className="h-full w-full max-w-none object-cover"
        />
      </div>

      {/* SECOND TRAVELER — a frame gliding through the letterforms */}
      <div className="ax-trav2 pointer-events-none absolute left-0 top-[14vh] z-[6] hidden h-[24vh] w-[16vw] overflow-hidden opacity-0 md:block">
        <img
          src={TRAV2.img}
          alt="Spec concept, fashion"
          loading="lazy"
          decoding="async"
          className="h-full w-full max-w-none object-cover"
        />
      </div>

      {/* approach-era headline (behind the hero plane) */}<h2 className="ax-arch pointer-events-none absolute left-1/2 top-1/2 z-[5] hidden -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[9vw] font-black leading-none tracking-[-0.04em] text-[#050505] opacity-0 md:block">
        THE ARCHIVE
      </h2>

      {/* THE — small, above the resolved monumental word */}
      <p className="ax-the-s pointer-events-none absolute left-1/2 top-1/2 z-[5] hidden -translate-x-1/2 select-none whitespace-nowrap font-display text-[3.5vw] font-black tracking-[0.3em] text-[#050505] opacity-0 md:block" style={{ marginTop: "-42vh" }}>
        THE
      </p>

      {/* THE SPLICE — black frame */}
      <div className="ax-black absolute inset-0 z-[40] flex items-center justify-center bg-[#050505] opacity-0">
        <div className="ax-black-meta text-center opacity-0">
          <p className="font-cinzel text-sm font-bold tracking-[0.5em] text-white/90">KYMRSTUDIO</p>
          <p className="mt-4 font-mono text-[9px] tracking-[0.42em] text-white/50">
            ARCHIVE / FRAME 002
          </p>
          <p className="mt-2 font-mono text-[8px] tracking-[0.3em] text-white/30">
            TC 00:00:04:16 — SPEC CONCEPT
          </p>
        </div>
      </div>

      {/* APERTURE — the mask moves, not the image */}
      <div data-testid="archive-aperture" className="ax-ap absolute inset-0 z-[45] opacity-0">
        <img
          src={PROJ.img}
          alt={`${PROJ.id} — spec concept, home`}
          loading="lazy"
          decoding="async"
          className="ax-ap-img absolute -top-[9%] left-0 h-[118%] w-full max-w-none object-cover"
        />
        <span className="absolute bottom-[8%] right-[6%] bg-[#050505]/60 px-2 py-1 font-mono text-[8px] tracking-[0.3em] text-white/85">
          {PROJ.id} — SPEC CONCEPT
        </span>
      </div>

      {/* THE REEL — seven projections, one frame at a time */}
      {REEL.map((p, i) => (
        <div key={p.id} data-testid={`archive-reel-${i}`} className={`ax-r${i} absolute inset-0 z-[45] opacity-0`}>
          <img
            src={p.img}
            alt={`${p.id} — spec concept`}
            loading="lazy"
            decoding="async"
            className="absolute -top-[9%] left-0 h-[118%] w-full max-w-none object-cover"
          />
          <span className={`absolute bottom-[8%] ${i % 2 ? "left-[6%]" : "right-[6%]"} bg-[#050505]/60 px-2 py-1 font-mono text-[8px] tracking-[0.3em] text-white/85`}>
            {p.id} — SPEC CONCEPT
          </span>
        </div>
      ))}

      {/* POSTER FRAME typography */}
      <p className="ax-the pointer-events-none absolute left-1/2 top-1/2 z-[30] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[9vw] font-black leading-none tracking-[-0.02em] text-[#050505] opacity-0 md:text-[6vw]">
        THE
      </p>
      <p data-testid="archive-headline" className="ax-arch2 pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[30vw] font-black leading-none tracking-[-0.04em] text-[#050505] opacity-0 md:text-[15vw]">
        ARCHIVE
      </p>
      <p className="ax-just pointer-events-none absolute left-1/2 top-1/2 z-[30] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[26vw] font-black leading-none tracking-[-0.04em] text-ember opacity-0 md:text-[34vw]">
        IS JUST
      </p>
      <p className="ax-beg pointer-events-none absolute left-1/2 top-1/2 z-[30] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[18vw] font-black leading-none tracking-[-0.04em] opacity-0 md:text-[15vw]">
        <span className="text-outline-dark block">BEGINNING.</span>
      </p>

      {/* the slit — one thin image crossing the poster frame */}
      <div data-testid="archive-slit" className="ax-slit absolute left-0 top-[61%] z-[10] hidden h-[13vh] w-full overflow-hidden opacity-0 md:block">
        <img
          src={SLIT.img}
          alt={`${SLIT.id} — spec concept, skincare`}
          loading="lazy"
          decoding="async"
          className="ax-slit-img absolute -left-[6%] top-0 h-full w-[112%] max-w-none object-cover"
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-[#050505]/60 px-2 py-1 font-mono text-[8px] tracking-[0.3em] text-white/85">
          {SLIT.id} — SPEC CONCEPT
        </span>
      </div>


      {/* quiet foot lines */}
      <p className="ax-foot1 pointer-events-none absolute left-1/2 top-[46%] z-[30] -translate-x-1/2 select-none whitespace-nowrap font-mono text-xs md:text-sm tracking-[0.42em] text-[#050505]/60 opacity-0">
        NO BORROWED GLORY.
      </p>
      <p className="ax-foot2 pointer-events-none absolute left-1/2 top-[53%] z-[30] -translate-x-1/2 select-none whitespace-nowrap font-mono text-xs md:text-sm tracking-[0.42em] text-[#050505]/60 opacity-0">
        NO INVENTED CLIENTS.
      </p>

      {/* EXIT wipe into transit */}
      <div className="ax-dark pointer-events-none absolute inset-0 z-[50] bg-[#050505]" style={{ clipPath: "circle(0% at 50% 115%)" }} />
    </section>
  );
}
