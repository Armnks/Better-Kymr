import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", big: "48H", label: "TURNAROUND", desc: "Brief to final delivery in two days. Speed is a creative advantage.", outline: false },
  { n: "02", big: "3S", label: "HOOK WINDOW", desc: "The scroll decides in three seconds. We design for the first frame.", outline: true },
  { n: "03", big: "100%", label: "ASSET REVIEW", desc: "Every frame inspected before it ships. Nothing leaves unchecked.", outline: false },
  { n: "04", big: "10+", label: "ITERATIONS / SPRINT", desc: "Refined until it moves people. Then refined once more.", outline: true },
];

export default function ProcessScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=420%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      STEPS.forEach((_, i) => {
        tl.fromTo(
          `.proc-step-${i}`,
          { autoAlpha: 0, yPercent: 18, scale: 0.92 },
          { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1, ease: "power2.out" }
        ).fromTo(
          `.proc-ghost-${i}`,
          { autoAlpha: 0 },
          { autoAlpha: 0.4, duration: 1, ease: "power1.in" },
          "<"
        );
        if (i < STEPS.length - 1) {
          tl.to(`.proc-step-${i}`, {
            autoAlpha: 0,
            yPercent: -18,
            scale: 1.06,
            duration: 0.7,
            ease: "power2.in",
          }, "+=0.55").to(`.proc-ghost-${i}`, { autoAlpha: 0, duration: 0.5 }, "<");
        }
      });
      tl.fromTo(".proc-bar", { scaleX: 0 }, { scaleX: 1, duration: tl.duration(), ease: "none" }, 0);
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const stepClass = (i) =>
    reduced
      ? "relative flex flex-col items-center justify-center px-6 py-24 text-center"
      : `proc-step proc-step-${i} absolute inset-0 flex flex-col items-center justify-center px-6 text-center`;

  return (
    <section
      ref={ref}
      id="process"
      data-testid="process-scene"
      className={`relative z-10 overflow-hidden ${reduced ? "" : "h-screen"}`}
    >
      <div className="absolute inset-x-6 bottom-10 top-24 border border-white/10 md:inset-x-10">
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/5" />
      </div>
      <span className="absolute left-8 top-28 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-12">
        STATE 03 — PROCESS
      </span>
      <span className="absolute right-3 top-1/2 hidden origin-right -translate-y-1/2 rotate-90 font-mono text-[10px] tracking-[0.5em] text-white/30 md:block">
        HOW WE WORK
      </span>

      {!reduced &&
        STEPS.map((s, i) => (
          <div
            key={`ghost-${s.n}`}
            className={`proc-ghost-${i} pointer-events-none absolute inset-0 flex items-center justify-center opacity-0`}
          >
            <span className="text-outline-faint select-none font-display text-[60vw] font-black leading-none md:text-[40vw]">
              {s.n}
            </span>
          </div>
        ))}

      {STEPS.map((s, i) => (
        <div key={s.n} className={stepClass(i)}>
          <span className="font-mono text-[10px] tracking-[0.5em] text-ember md:text-xs">
            STEP {s.n}
          </span>
          <div
            data-testid={`process-step-${s.n}`}
            className={`select-none font-display text-[26vw] font-black leading-[0.85] tracking-[-0.05em] md:text-[19vw] ${
              s.outline ? "text-outline" : "text-bone"
            }`}
          >
            {s.big}
          </div>
          <span className="mt-2 font-mono text-xs tracking-[0.4em] text-white/70 md:text-sm">
            {s.label}
          </span>
          <p className="mt-6 max-w-md font-serif text-base italic text-white/50 md:text-lg">
            {s.desc}
          </p>
        </div>
      ))}

      {!reduced && (
        <div className="absolute inset-x-6 bottom-10 h-px bg-white/10 md:inset-x-10">
          <div className="proc-bar h-full w-full origin-left scale-x-0 bg-ember" />
        </div>
      )}
    </section>
  );
}
