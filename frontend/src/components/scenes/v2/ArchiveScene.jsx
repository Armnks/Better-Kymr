import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { range } from "@/utils/seed";

gsap.registerPlugin(ScrollTrigger);

const LINES = ["THE ARCHIVE", "IS JUST", "BEGINNING."];

export default function ArchiveScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const frames = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        top: range(8, 62),
        left: range(3, 78),
        w: range(13, 22),
        h: range(15, 26),
        r: range(-7, 7),
        label: `FRAME 00${i + 1} — UNWRITTEN`,
      })),
    []
  );

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=280%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "08 — ARCHIVE" })),
        },
      });
      tl.fromTo(".ar-line", { yPercent: 115 }, { yPercent: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" })
        .fromTo(
          ".ar-frame",
          { autoAlpha: 0, y: "26vh", rotation: (i) => frames[i].r * 2.5 },
          { autoAlpha: 1, y: 0, rotation: (i) => frames[i].r, stagger: 0.1, duration: 1, ease: "power3.out" },
          "+=0.2"
        )
        .fromTo(".ar-serif", { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.6 }, "<0.5")
        .to(".ar-frame", {
          y: "-125vh",
          rotation: (i) => (i % 2 ? 14 : -14),
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.9,
          ease: "power3.in",
        }, "+=0.5")
        .fromTo(
          ".ar-dark",
          { clipPath: "circle(0% at 50% 115%)" },
          { clipPath: "circle(140% at 50% 115%)", duration: 1.4, ease: "power3.inOut" },
          "+=0.2"
        )
        .fromTo(
          ".ar-teaser",
          { autoAlpha: 0, letterSpacing: "0.8em" },
          { autoAlpha: 1, letterSpacing: "0.35em", duration: 0.8 },
          "-=0.5"
        )
        .to({}, { duration: 0.3 });
    }, ref);
    return () => ctx.revert();
  }, [reduced, frames]);

  if (reduced) {
    return (
      <section data-testid="archive-scene" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 bg-[#EAE6DF] px-6 py-24 text-center">
        <h2 className="font-display text-[10vw] font-black leading-none text-[#050505]">
          THE ARCHIVE IS JUST BEGINNING.
        </h2>
        <p className="font-serif text-xl italic text-[#050505]/60">no borrowed glory. no invented clients.</p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      data-testid="archive-scene"
      className="relative z-10 h-screen overflow-hidden bg-[#EAE6DF] text-[#050505]"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {LINES.map((line, i) => (
          <div key={line} className="overflow-hidden">
            <div
              data-testid={i === 0 ? "archive-headline" : undefined}
              className={`ar-line select-none whitespace-nowrap font-display text-[13vw] font-black leading-[0.9] tracking-[-0.04em] md:text-[10vw] ${
                i === 1 ? "text-ember" : "text-[#050505]"
              }`}
            >
              {line}
            </div>
          </div>
        ))}
        <p className="ar-serif mt-10 font-serif text-lg italic text-[#050505]/60 opacity-0 md:text-xl">
          no borrowed glory. no invented clients.
        </p>
      </div>

      {frames.map((f, i) => (
        <div
          key={i}
          className="ar-frame absolute border border-[#050505]/25 opacity-0"
          style={{ top: `${f.top}%`, left: `${f.left}%`, width: `${f.w}vw`, height: `${f.h}vh` }}
        >
          <span className="absolute left-2 top-2 font-mono text-[8px] tracking-[0.25em] text-[#050505]/50">
            {f.label}
          </span>
        </div>
      ))}

      <div
        className="ar-dark absolute inset-0 flex items-center justify-center bg-[#050505]"
        style={{ clipPath: "circle(0% at 50% 115%)" }}
      >
        <span className="ar-teaser font-mono text-[10px] tracking-[0.35em] text-white/50 opacity-0">
          NEXT — EVERYTHING MOVES SIDEWAYS
        </span>
      </div>
    </section>
  );
}
