import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const BANDS = [
  { clip: "inset(0 0 66.6% 0)", x: "-6vw" },
  { clip: "inset(33.3% 0 33.3% 0)", x: "4.5vw" },
  { clip: "inset(66.6% 0 0 0)", x: "-3vw" },
];

// ONE WE MAKE. The same letters develop from outline to solid ivory —
// a darkroom materialization: pre-exposure glow leads, the solid layer is
// revealed through a directional mask, the instrument ring tracks the edge.
export default function StatementScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=520%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "03 — SIGNAL" })),
        },
      });

      // ── the materialization system (all layers behave as ONE object)
      tl.set(".wm-solid", { clipPath: "inset(0% 100% 0% 0%)" }, 0)
        .set(".wm-pre", { clipPath: "inset(0% 100% 0% 0%)" }, 0)
        .set(".wm-sweep", { left: "0%" }, 0)
        .set(".wm-orb", { xPercent: -50, left: "0%" }, 0);

      // 0–0.5 — the outline simply exists (the idea, unmoved)
      tl.to({}, { duration: 0.5 }, 0);

      // 0.5–1.4 — illumination wakes: ambient luminance + the instrument appears
      tl.fromTo(".wm-glow", { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.9, ease: "power1.in" }, 0.5)
        .fromTo(".wm-orb", { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.4 }, 0.6)
        .fromTo(".wm-sweep", { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 0.4 }, 0.7);

      // 1.0–2.9 — matter forms: pre-exposure leads, solid follows through the mask
      tl.to(".wm-pre", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "none" }, 0.85)
        .to(".wm-solid", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "none" }, 1.0)
        .to(".wm-sweep", { left: "100%", duration: 1.9, ease: "none" }, 1.0)
        .to(".wm-orb", { left: "100%", rotation: 180, duration: 1.9, ease: "none" }, 1.0)
        .fromTo(".wm-group", { skewX: 0.4 }, { skewX: 0, duration: 1.9, ease: "none" }, 1.0);

      // 2.9–3.3 — the instrument retires, the light settles
      tl.to(".wm-orb", { autoAlpha: 0, duration: 0.4 }, 2.9)
        .to(".wm-sweep", { autoAlpha: 0, duration: 0.25 }, 2.9)
        .to(".wm-glow", { autoAlpha: 0, duration: 0.5 }, 2.9);

      // 3.3–3.8 — HOLD the completed WE MAKE
      tl.to({}, { duration: 0.5 }, 3.3);

      // ── the statement continues — same object, no reset
      tl.fromTo(".st-w2", { x: "110vw" }, { x: 0, duration: 1, ease: "power3.out" }, 4.05)
        .to(".wm-group", { x: "-9vw", y: "-13vh", scale: 0.82, duration: 0.7, ease: "power2.inOut" }, "<0.35")
        .fromTo(".st-w3", { y: "110vh", rotation: 10 }, { y: 0, rotation: -2, duration: 1, ease: "power3.out" }, "+=0.2")
        .to(".st-w2", { x: "7vw", y: "-10vh", scale: 0.8, duration: 0.7 }, "<0.3")
        .fromTo(".st-watch", { scale: 3.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "power4.in" }, "+=0.25")
        .to(".wm-group", { scale: 0.14, x: "-38vw", y: "-36vh", autoAlpha: 0.3, duration: 0.9, ease: "power3.inOut" }, "+=0.2")
        .to(".st-w2", { scale: 0.14, x: "36vw", y: "-38vh", autoAlpha: 0.3, duration: 0.9, ease: "power3.inOut" }, "<")
        .to(".st-w3", { scale: 0.14, x: "-36vw", y: "38vh", rotation: 0, autoAlpha: 0.3, duration: 0.9, ease: "power3.inOut" }, "<")
        .to(".st-w4-solid", { autoAlpha: 0, duration: 0.08 }, "+=0.4")
        .to(".st-band", { autoAlpha: 1, duration: 0.08 }, "<")
        .to(".st-band", { x: (i) => BANDS[i].x, duration: 0.5, ease: "power2.out" }, "<0.05")
        .to(".st-band", { x: 0, duration: 0.6, ease: "power3.inOut" }, "+=0.3")
        .to(".st-band", { autoAlpha: 0, duration: 0.08 })
        .to(".st-w4-outline", { autoAlpha: 1, duration: 0.3 }, "<")
        .to([".wm-group", ".st-w2", ".st-w3"], { autoAlpha: 0, duration: 0.6, ease: "power2.in" }, "<0.1")
        .to(".st-watch", { scale: 0.5, y: "-18vh", duration: 0.9, ease: "power3.inOut" }, "+=0.2")
        .fromTo(
          ".st-release",
          { autoAlpha: 0, y: 34, letterSpacing: "0.4em" },
          { autoAlpha: 1, y: 0, letterSpacing: "0.06em", duration: 1.2, ease: "power3.out" },
          "<0.3"
        )
        .to({}, { duration: 0.4 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const wordCls =
    "absolute inset-0 flex items-center justify-center select-none font-display font-black leading-[0.9] tracking-[-0.04em] whitespace-nowrap";

  if (reduced) {
    return (
      <section data-testid="statement-scene" className="relative z-10 flex h-screen flex-col items-center justify-center gap-6 px-6">
        <h2 className="font-display text-[11vw] font-black text-bone">WE MAKE THINGS PEOPLE WATCH.</h2>
        <p className="font-serif text-xl italic text-white/50">we make things people watch.</p>
      </section>
    );
  }

  return (
    <section ref={ref} data-testid="statement-scene" className="relative z-10 h-screen overflow-hidden">
      {/* ambient luminance that wakes before the material */}
      <div
        className="wm-glow pointer-events-none absolute inset-0 opacity-0"
        style={{ background: "radial-gradient(58% 38% at 50% 50%, rgba(245,245,240,0.08), transparent 70%)" }}
      />

      {/* ONE WE MAKE — outline + pre-exposure + solid are the same letters */}
      <div className="wm-group absolute inset-0 flex items-center justify-center" data-testid="statement-we-make">
        <div className="relative select-none whitespace-nowrap font-display text-[17vw] font-black leading-[0.9] tracking-[-0.04em] md:text-[12vw]">
          <span className="wm-outline text-outline block">WE MAKE</span>
          <span className="wm-pre absolute inset-0 block text-bone opacity-25" aria-hidden="true">
            WE MAKE
          </span>
          <span className="wm-solid absolute inset-0 block text-bone" aria-hidden="true">
            WE MAKE
          </span>
          <span className="wm-sweep absolute bottom-[-6%] top-[-6%] w-px bg-white/60 opacity-0" aria-hidden="true" />
          <span className="wm-orb absolute top-1/2 -mt-5 block h-10 w-10 opacity-0" aria-hidden="true">
            <span className="block h-full w-full rounded-full border border-white/40" />
            <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-ember" />
          </span>
        </div>
      </div>

      <div className={`st-w2 ${wordCls} text-[13vw] text-outline`}>THINGS</div>
      <div className={`st-w3 ${wordCls} text-[12vw] text-bone`}>PEOPLE</div>

      <div className="st-watch absolute inset-0 flex items-center justify-center opacity-0" data-cursor="WATCH">
        <div className="relative select-none whitespace-nowrap font-display text-[16vw] font-black leading-none tracking-[-0.04em]">
          <span className="st-w4-solid block text-ember" data-testid="statement-watch">WATCH.</span>
          <span className="st-w4-outline text-outline absolute inset-0 block opacity-0" aria-hidden="true">
            WATCH.
          </span>
          {BANDS.map((b, i) => (
            <span
              key={i}
              className="st-band absolute inset-0 block text-bone opacity-0"
              style={{ clipPath: b.clip }}
              aria-hidden="true"
            >
              WATCH.
            </span>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-[18vh]">
        <p data-testid="statement-release" className="st-release font-serif text-2xl italic text-white/60 opacity-0 md:text-4xl">
          we make things people watch.
        </p>
      </div>
    </section>
  );
}
