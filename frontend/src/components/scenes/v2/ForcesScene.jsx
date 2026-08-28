import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const CutWord = ({ w, cls, testid }) => (
  <div className={`fc-word absolute inset-0 flex items-center justify-center ${cls}`}>
    <div className="relative select-none whitespace-nowrap leading-none">
      <span
        data-testid={testid}
        className="fc-half fc-half-t block font-display text-[13vw] font-black tracking-[-0.04em] text-bone"
        style={{ clipPath: "inset(0 0 50% 0)" }}
      >
        {w}
      </span>
      <span
        className="fc-half fc-half-b absolute inset-0 block font-display text-[13vw] font-black tracking-[-0.04em] text-bone"
        style={{ clipPath: "inset(50% 0 0 0)" }}
        aria-hidden="true"
      >
        {w}
      </span>
    </div>
  </div>
);

export default function ForcesScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=440%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "05 — FORCES" })),
        },
      });
      tl.to(".fc-dot", { scale: 0.2, autoAlpha: 0, duration: 0.4, ease: "power2.in" })
        .fromTo(".fc-strategy", { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" }, "<0.1")
        .fromTo(".fc-creative", { x: "120vw" }, { x: 0, duration: 0.7, ease: "power4.in" }, "+=0.25")
        .to(".fc-strategy", { x: "-16vw", scaleX: 0.6, rotation: -5, autoAlpha: 0.45, duration: 0.6, ease: "power3.out" }, "<0.25")
        .fromTo(".fc-production", { y: "-115vh", rotation: 90 }, { y: 0, rotation: 0, duration: 0.85, ease: "power3.in" }, "+=0.25")
        .to(".fc-strategy", { x: "-30vw", y: "-26vh", scale: 0.5, scaleX: 1, rotation: 0, autoAlpha: 0.9, duration: 0.7, ease: "power3.inOut" }, "+=0.2")
        .to(".fc-creative", { x: "26vw", y: "24vh", scale: 0.55, duration: 0.7, ease: "power3.inOut" }, "<")
        .to(".fc-production", { y: "-2vh", scale: 1.05, duration: 0.7, ease: "power3.inOut" }, "<")
        .fromTo(".fc-slice", { x: "-60vw", autoAlpha: 1 }, { x: "60vw", duration: 0.8, ease: "power3.inOut" }, "+=0.35")
        .to(".fc-half-t", { x: "-6vw", duration: 0.5, ease: "power2.out" }, "<0.3")
        .to(".fc-half-b", { x: "6vw", duration: 0.5, ease: "power2.out" }, "<")
        .to(".fc-slice", { autoAlpha: 0, duration: 0.2 })
        .to(".fc-half-t", { y: "-70vh", autoAlpha: 0, duration: 0.7, ease: "power3.in" }, "+=0.25")
        .to(".fc-half-b", { y: "70vh", autoAlpha: 0, duration: 0.7, ease: "power3.in" }, "<")
        .fromTo(".fc-performance", { autoAlpha: 0, scale: 0.25 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power4.out" }, "<0.2")
        .fromTo(".fc-performance-word", { letterSpacing: "-0.05em" }, { letterSpacing: "0.1em", scale: 1.3, duration: 1.1, ease: "power2.inOut" }, "+=0.2")
        .to(".fc-performance", { autoAlpha: 0, scale: 2.4, duration: 0.8, ease: "power3.in" }, "+=0.4")
        .fromTo(".fc-seed", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, "<0.45")
        .to({}, { duration: 0.3 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section id="capabilities" data-testid="forces-scene" className="relative z-10 flex min-h-screen flex-col justify-center gap-8 px-6 py-24">
        {["STRATEGY", "CREATIVE", "PRODUCTION", "EDITING", "PERFORMANCE"].map((w, i) => (
          <h3 key={w} className={`font-display text-[11vw] font-black leading-none ${i % 2 ? "text-outline" : "text-bone"}`}>
            {w}
          </h3>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} id="capabilities" data-testid="forces-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="absolute left-6 top-24 z-10 font-mono text-[10px] tracking-[0.35em] text-white/40 md:left-10">
        STATE 05 — FORCES
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="fc-dot h-2 w-2 rounded-full bg-ember" />
      </div>

      <CutWord w="STRATEGY" cls="fc-strategy opacity-0" testid="force-strategy" />
      <CutWord w="CREATIVE" cls="fc-creative" testid="force-creative" />
      <CutWord w="PRODUCTION" cls="fc-production" testid="force-production" />

      <div className="fc-slice absolute left-1/2 top-1/2 h-[130vh] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-ember opacity-0" />

      <div className="fc-performance absolute inset-0 flex items-center justify-center opacity-0">
        <h3 data-testid="force-performance" className="fc-performance-word select-none whitespace-nowrap font-display text-[12vw] font-black leading-none tracking-[-0.05em] text-ember">
          PERFORMANCE
        </h3>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="fc-seed h-1.5 w-1.5 scale-0 rounded-full bg-bone" />
      </div>
    </section>
  );
}
