import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

// SHOT SYSTEM — one hero at a time, never a pile.
// HERO: fragrance → passes through viewport. MEMORY: food, masked band. FINAL: home, distant.
const HERO = { img: "/ads/fragrance.webp", id: "FR.001" };
const TRAVELER = { img: "/ads/audio.webp" };
const MEMORY = { img: "/ads/food.webp", id: "FR.002" };
const FINAL = { img: "/ads/home.webp", id: "FR.003" };

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
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=800%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onToggle: (self) => self.isActive && announce(),
          },
        });

        // initial geometry
        tl.set(".ax-hero", { scale: 0.16, clipPath: "inset(28% 38%)" }, 0);
        tl.set(".ax-t1", { y: "62vh" }, 0);

        // depth planes running the whole sequence
        tl.fromTo(".ax-ghost", { x: "4vw" }, { x: "-8vw", duration: 14, ease: "none" }, 0);
        tl.fromTo(".ax-rail", { yPercent: 14 }, { yPercent: -14, duration: 14, ease: "none" }, 0);

        // SHOT 01 — SILENCE
        tl.fromTo(".ax-meta", { autoAlpha: 0, y: 12 }, { autoAlpha: 0.9, y: 0, duration: 0.6 }, 0.25)
          .fromTo(".ax-hero", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.8 }, 0.35);

        // SHOT 02 — APPROACH
        tl.to(".ax-hero", { scale: 0.42, duration: 1.9, ease: "power2.inOut" }, 1.2)
          .to(".ax-hero", { clipPath: "inset(12% 24%)", duration: 1.9, ease: "power2.inOut" }, 1.2)
          .fromTo(
            ".ax-bg2",
            { x: "-48vw", autoAlpha: 0 },
            { x: "112vw", autoAlpha: 0.35, duration: 2.4, ease: "none" },
            1.2
          )
          .fromTo(".ax-t1", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.5, ease: "power3.out" }, 1.9)
          .to(".ax-t1", { y: "16vh", duration: 1.5, ease: "power3.out" }, 1.9);

        // SHOT 03 — FRAME TAKEOVER
        tl.to(".ax-hero", { scale: 1, duration: 2.1, ease: "power3.inOut" }, 3.4)
          .to(".ax-hero", { clipPath: "inset(0% 0%)", duration: 2.1, ease: "power3.inOut" }, 3.4)
          .fromTo(".ax-hero-img", { yPercent: -7 }, { yPercent: 7, duration: 2.5, ease: "none" }, 3.3)
          .to(".ax-t1", { autoAlpha: 0.08, y: "-30vh", duration: 1.6, ease: "power2.inOut" }, 3.8);

        // SHOT 04 — PASS THROUGH
        tl.to(".ax-hero", { x: "-140vw", scale: 1.14, duration: 1.7, ease: "power2.in" }, 6.0)
          .to(".ax-hero", { autoAlpha: 0, duration: 0.25 }, 7.5)
          .to(".ax-t1", { autoAlpha: 1, y: "0vh", scale: 1.1, duration: 1.5, ease: "power2.out" }, 6.2);

        // SHOT 05 — SECOND MEMORY
        tl.to(".ax-t1", { autoAlpha: 0.1, duration: 0.7 }, 7.8)
          .fromTo(
            ".ax-mem",
            { x: "62vw", clipPath: "inset(4% 46%)", autoAlpha: 1 },
            { x: "-16vw", duration: 2.0, ease: "none" },
            7.8
          )
          .to(".ax-mem", { clipPath: "inset(0% 14%)", duration: 1.0, ease: "power2.inOut" }, 8.0)
          .to(".ax-mem", { clipPath: "inset(4% 46%)", duration: 1.0, ease: "power2.inOut" }, 9.0)
          .fromTo(".ax-mem-img", { xPercent: -9 }, { xPercent: 9, duration: 2.0, ease: "none" }, 7.8)
          .to(".ax-mem", { autoAlpha: 0, duration: 0.35 }, 9.7);

        // SHOT 06 — TYPOGRAPHIC EVENT
        tl.to(".ax-t1", { autoAlpha: 1, scale: 0.6, y: "-25vh", x: "-17vw", duration: 1.3, ease: "power3.inOut" }, 10.0)
          .fromTo(".ax-t2", { x: "58vw", autoAlpha: 0 }, { x: "9vw", autoAlpha: 1, duration: 1.2, ease: "power3.out" }, 10.7)
          .fromTo(".ax-t3", { y: "46vh", autoAlpha: 0 }, { y: "25vh", x: "-9vw", autoAlpha: 1, duration: 1.2, ease: "power3.out" }, 11.4);

        // SHOT 07 — FINAL FRAME (hold)
        tl.fromTo(".ax-final", { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 0.55, scale: 1, duration: 1.0, ease: "power2.out" }, 12.0)
          .fromTo(".ax-foot", { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.8 }, 12.4)
          .to({}, { duration: 1.0 });

        // EXIT — circle wipe into the dark transit
        tl.to([".ax-t1", ".ax-t2", ".ax-t3", ".ax-final", ".ax-foot", ".ax-meta", ".ax-rail"], { autoAlpha: 0, duration: 0.5 }, 13.6)
          .fromTo(
            ".ax-dark",
            { clipPath: "circle(0% at 50% 115%)" },
            { clipPath: "circle(140% at 50% 115%)", duration: 1.2, ease: "power3.inOut" },
            13.7
          );
      });

      // ─────────────────────────── MOBILE ───────────────────────────
      mm.add("(max-width: 767px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=520%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onToggle: (self) => self.isActive && announce(),
          },
        });

        tl.set(".ax-hero", { scale: 0.24, clipPath: "inset(30% 32%)" }, 0);
        tl.set(".ax-t1", { y: "58vh" }, 0);

        // SHOT 01 — silence
        tl.fromTo(".ax-meta", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.5 }, 0.2)
          .fromTo(".ax-hero", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.6 }, 0.3);

        // SHOT 02+03 — approach + takeover (vertical crop)
        tl.to(".ax-hero", { scale: 0.62, clipPath: "inset(12% 18%)", duration: 1.2, ease: "power2.inOut" }, 1.0)
          .to(".ax-hero", { scale: 1, clipPath: "inset(0% 0%)", duration: 1.6, ease: "power3.inOut" }, 2.3)
          .fromTo(".ax-hero-img", { yPercent: -6 }, { yPercent: 6, duration: 1.8, ease: "none" }, 2.2);

        // SHOT 04 — vertical pass-through
        tl.to(".ax-hero", { y: "-150vh", duration: 1.2, ease: "power2.in" }, 4.1)
          .fromTo(".ax-t1", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.0, ease: "power2.out" }, 4.4)
          .to(".ax-t1", { y: "0vh", duration: 1.0, ease: "power2.out" }, 4.4);

        // SHOT 05 — memory band (horizontal mask, vertical travel)
        tl.to(".ax-t1", { autoAlpha: 0.12, duration: 0.5 }, 5.4)
          .fromTo(
            ".ax-mem",
            { y: "70vh", clipPath: "inset(46% 4%)", autoAlpha: 1 },
            { y: "-20vh", duration: 1.4, ease: "none" },
            5.4
          )
          .to(".ax-mem", { clipPath: "inset(12% 0%)", duration: 0.7, ease: "power2.inOut" }, 5.6)
          .to(".ax-mem", { clipPath: "inset(46% 4%)", duration: 0.7, ease: "power2.inOut" }, 6.3)
          .to(".ax-mem", { autoAlpha: 0, duration: 0.3 }, 6.8);

        // SHOT 06+07 — typographic event, then quiet
        tl.to(".ax-t1", { autoAlpha: 1, scale: 0.72, y: "-27vh", duration: 0.9, ease: "power3.inOut" }, 7.0)
          .fromTo(".ax-t2", { autoAlpha: 0, y: "8vh" }, { autoAlpha: 1, y: "0vh", duration: 0.9, ease: "power3.out" }, 7.6)
          .fromTo(".ax-t3", { autoAlpha: 0, y: "20vh" }, { autoAlpha: 1, y: "25vh", duration: 0.9, ease: "power3.out" }, 8.2)
          .fromTo(".ax-final", { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.7 }, 8.5)
          .fromTo(".ax-foot", { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.6 }, 8.8)
          .to({}, { duration: 0.7 });

        // EXIT
        tl.to([".ax-t1", ".ax-t2", ".ax-t3", ".ax-final", ".ax-foot", ".ax-meta"], { autoAlpha: 0, duration: 0.4 }, 9.6)
          .fromTo(
            ".ax-dark",
            { clipPath: "circle(0% at 50% 115%)" },
            { clipPath: "circle(140% at 50% 115%)", duration: 1.0, ease: "power3.inOut" },
            9.7
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
        <p className="font-mono text-[10px] tracking-[0.35em] text-[#050505]/60">
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
      {/* BACKGROUND PLANE — slow ghost type */}
      <div className="ax-ghost pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.05]">
        <span className="whitespace-nowrap font-display text-[30vw] font-black leading-none tracking-[-0.05em]">
          ARCHIVE ARCHIVE
        </span>
      </div>

      {/* FOREGROUND PLANE — fast editorial rail */}
      <div className="ax-rail pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 opacity-50 md:flex">
        <span className="h-24 w-px bg-[#050505]/30" />
        <span className="font-mono text-[9px] tracking-[0.4em] text-[#050505]/60 [writing-mode:vertical-rl]">
          SEQ. 07 — 24 FPS
        </span>
        <span className="h-24 w-px bg-[#050505]/30" />
      </div>

      {/* SHOT 01 metadata */}
      <div data-testid="archive-meta" className="ax-meta pointer-events-none absolute left-6 top-20 opacity-0 md:left-10 md:top-24">
        <p className="font-mono text-[9px] tracking-[0.42em] text-[#050505]/70">
          KYMRSTUDIO / ARCHIVE / 001
        </p>
        <p className="mt-2 font-mono text-[8px] tracking-[0.3em] text-[#050505]/40">
          UNFINISHED REEL — HANDLE WITH EYES
        </p>
      </div>

      {/* SHOT 02 background traveler */}
      <div className="ax-bg2 pointer-events-none absolute left-0 top-[30vh] h-[34vh] w-[24vw] overflow-hidden opacity-0">
        <img src={TRAVELER.img} alt="" loading="lazy" decoding="async" className="h-full w-full max-w-none object-cover" />
      </div>

      {/* HERO FRAME — shots 01–04 */}
      <div data-testid="archive-hero" className="ax-hero absolute left-[8vw] top-[17vh] h-[56vh] w-[92vw] opacity-0 md:h-[66vh] md:w-[84vw]">
        <img
          src={HERO.img}
          alt={`${HERO.id} — spec concept, fragrance`}
          loading="lazy"
          decoding="async"
          className="ax-hero-img absolute -top-[9%] left-0 h-[118%] w-full max-w-none object-cover"
        />
        <span className="absolute bottom-3 left-3 bg-[#050505]/60 px-2 py-1 font-mono text-[8px] tracking-[0.3em] text-white/85">
          {HERO.id} — SPEC CONCEPT
        </span>
      </div>

      {/* MEMORY FRAME — shot 05 */}
      <div data-testid="archive-memory" className="ax-mem absolute left-[4vw] top-[32vh] h-[36vh] w-[92vw] opacity-0 md:left-[21vw] md:top-[28vh] md:h-[44vh] md:w-[58vw]">
        <img
          src={MEMORY.img}
          alt={`${MEMORY.id} — spec concept, food`}
          loading="lazy"
          decoding="async"
          className="ax-mem-img absolute -left-[6%] top-0 h-full w-[112%] max-w-none object-cover"
        />
        <span className="absolute bottom-3 left-3 bg-[#050505]/60 px-2 py-1 font-mono text-[8px] tracking-[0.3em] text-white/85">
          {MEMORY.id} — SPEC CONCEPT
        </span>
      </div>

      {/* TYPOGRAPHY PLANE — shots 02/04/06/07 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <h2
          data-testid="archive-headline"
          className="ax-t1 absolute select-none whitespace-nowrap font-display text-[16vw] font-black leading-none tracking-[-0.04em] text-[#050505] opacity-0 md:text-[13vw]"
        >
          THE ARCHIVE
        </h2>
        <p className="ax-t2 absolute select-none whitespace-nowrap font-display text-[14vw] font-black leading-none tracking-[-0.04em] text-ember opacity-0 md:text-[11vw]">
          IS JUST
        </p>
        <p className="ax-t3 text-outline-dark absolute select-none whitespace-nowrap font-display text-[15vw] font-black leading-none tracking-[-0.04em] opacity-0 md:text-[12vw]">
          BEGINNING.
        </p>
      </div>

      {/* FINAL distant image — shot 07 */}
      <div data-testid="archive-final" className="ax-final absolute bottom-[12vh] left-[8vw] h-[15vh] w-[26vw] overflow-hidden opacity-0 md:left-[10vw] md:w-[10vw]">
        <img src={FINAL.img} alt={`${FINAL.id} — spec concept, home`} loading="lazy" decoding="async" className="h-full w-full max-w-none object-cover" />
        <span className="absolute left-2 top-2 bg-[#050505]/60 px-1.5 py-0.5 font-mono text-[7px] tracking-[0.25em] text-white/85">
          {FINAL.id}
        </span>
      </div>

      {/* FINAL copy — shot 07 */}
      <div data-testid="archive-foot" className="ax-foot pointer-events-none absolute inset-x-0 bottom-[6vh] text-center opacity-0">
        <p className="font-mono text-[9px] tracking-[0.42em] text-[#050505]/60">
          NO BORROWED GLORY. NO INVENTED CLIENTS.
        </p>
      </div>

      {/* EXIT wipe into transit */}
      <div className="ax-dark pointer-events-none absolute inset-0 bg-[#050505]" style={{ clipPath: "circle(0% at 50% 115%)" }} />
    </section>
  );
}
