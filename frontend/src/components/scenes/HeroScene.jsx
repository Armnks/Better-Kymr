import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  { text: "CONTENT THAT MOVES — KYMR STUDIO — CONTENT THAT MOVES — KYMR STUDIO — ", cls: "text-[#F5F5F0]", dur: "20s", rev: false },
  { text: "STRATEGY CREATIVE PRODUCTION EDITING PERFORMANCE STRATEGY CREATIVE PRODUCTION EDITING PERFORMANCE ", cls: "text-outline", dur: "26s", rev: true },
  { text: "SHOT FOR THE SCROLL — BUILT FOR THE FEED — SHOT FOR THE SCROLL — BUILT FOR THE FEED — ", cls: "text-[#F5F5F0]", dur: "15s", rev: false },
  { text: "KYMR KYMR KYMR KYMR KYMR KYMR KYMR KYMR KYMR KYMR ", cls: "text-[#FF2A00]", dur: "23s", rev: true },
  { text: "MOTION SOUND COLOUR CUT RHYTHM FRAME MOTION SOUND COLOUR CUT RHYTHM FRAME ", cls: "text-outline", dur: "30s", rev: false },
];

export default function HeroScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=320%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.to(".hero-init", { autoAlpha: 0, y: -60, duration: 0.5, ease: "power2.out" })
        .fromTo(
          ".hero-kymr",
          { scale: 0.03, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 2.2, ease: "power2.inOut" },
          0.1
        )
        .to(".hero-kymr", { letterSpacing: "-0.1em", duration: 0.9, ease: "power1.inOut" }, "<")
        .to(".hero-kymr", { scale: 7.5, autoAlpha: 0, duration: 1.5, ease: "power3.in" }, "+=0.35")
        .fromTo(
          ".hero-field",
          { autoAlpha: 0, clipPath: "inset(46% 40% 46% 40%)" },
          { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power3.inOut" },
          "<0.4"
        )
        .to(".hero-field", { autoAlpha: 0, scale: 1.08, duration: 0.7, ease: "power2.in" }, "+=0.35");
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="top"
      data-testid="hero-scene"
      className="relative z-10 h-screen overflow-hidden"
    >
      <div className="absolute left-6 top-24 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
        STATE 01 — INITIATE
      </div>
      <div className="absolute bottom-8 right-6 font-mono text-[10px] tracking-[0.35em] text-white/40 md:right-10">
        01 / 07
      </div>

      {!reduced && (
        <div className="hero-init absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p
              data-testid="hero-init-text"
              className="font-mono text-[10px] tracking-[0.6em] text-white/50"
            >
              SCROLL TO INITIATE
            </p>
            <div className="mx-auto mt-6 h-px w-10 bg-white/30" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <h1
          data-testid="hero-text"
          className="hero-kymr select-none font-display text-[30vw] font-black leading-[0.8] tracking-[-0.06em] text-bone"
        >
          KYMR
        </h1>
      </div>

      {!reduced && (
        <div
          className="hero-field absolute inset-0 flex flex-col justify-center gap-[1.5vh] bg-[#07070d] opacity-0"
          style={{ clipPath: "inset(46% 40% 46% 40%)" }}
        >
          <div className="absolute left-6 top-24 z-10 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
            STATE 02 — THE MASK
          </div>
          {ROWS.map((row, i) => (
            <div key={i} className="overflow-hidden whitespace-nowrap">
              <div
                className={`marquee-track ${row.rev ? "marquee-reverse" : ""}`}
                style={{ "--marquee-dur": row.dur }}
              >
                {[0, 1].map((copy) => (
                  <span
                    key={copy}
                    className={`font-display text-[9vw] font-black leading-[0.95] tracking-[-0.04em] md:text-[7vw] ${row.cls}`}
                  >
                    {row.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
