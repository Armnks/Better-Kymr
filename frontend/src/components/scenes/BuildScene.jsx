import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CHIPS = [
  { t: "LAT 51.5072° N", pos: "left-6 top-24 md:left-10" },
  { t: "LON 000.1276° W", pos: "right-6 top-24 md:right-10" },
  { t: "STATE 06 — TENSION", pos: "bottom-10 left-6 md:left-10" },
  { t: "SIGNAL: LIVE", pos: "bottom-10 right-6 md:right-10" },
];

export default function BuildScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.from(".build-chip", {
        x: (i, el) => {
          const r = el.getBoundingClientRect();
          return window.innerWidth / 2 - (r.left + r.width / 2);
        },
        y: (i, el) => {
          const r = el.getBoundingClientRect();
          return window.innerHeight / 2 - (r.top + r.height / 2);
        },
        autoAlpha: 0,
        scale: 1.7,
        rotation: (i) => (i % 2 === 0 ? -8 : 8),
        duration: 0.9,
        stagger: 0.14,
        ease: "power4.out",
      })
        .fromTo(
          ".build-line",
          { yPercent: 120 },
          { yPercent: 0, duration: 1.1, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".build-sub",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .to({}, { duration: 0.6 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      data-testid="build-scene"
      className="relative z-10 h-screen overflow-hidden"
    >
      {CHIPS.map((c, i) => (
        <div
          key={c.t}
          className={`build-chip absolute ${c.pos} border border-white/10 px-3 py-2 font-mono text-[10px] tracking-[0.3em] text-white/50`}
        >
          {c.t}
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6">
        <div className="flex items-center gap-3">
          <span className="pulse-dot h-2 w-2 rounded-full bg-ember" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-white/60">
            SYSTEM LIVE
          </span>
        </div>
        <div className="overflow-hidden">
          <h2
            data-testid="build-headline"
            className="build-line text-center font-display text-[11vw] font-black leading-[0.85] tracking-[-0.04em] text-bone md:text-[7vw]"
          >
            BUILDING
            <br />
            IN PUBLIC
          </h2>
        </div>
        <p className="build-sub font-serif text-lg italic text-white/50 md:text-xl">
          no case studies yet — only standards worth copying
        </p>
      </div>
    </section>
  );
}
