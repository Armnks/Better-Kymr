import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function VoidScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      let current = "06 — SILENCE";
      const announce = (s) => {
        if (s !== current) {
          current = s;
          window.dispatchEvent(new CustomEvent("kymr:state", { detail: s }));
        }
      };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) => self.isActive && announce(self.progress > 0.72 ? "07 — INVERSION" : "06 — SILENCE"),
          onUpdate: (self) => announce(self.progress > 0.72 ? "07 — INVERSION" : "06 — SILENCE"),
        },
      });
      tl.fromTo(".vd-note", { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.8 }, 0.3)
        .to(".vd-seed", { autoAlpha: 0, duration: 0.3 }, "+=0.3")
        .fromTo(".vd-ring", { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.6, ease: "power2.out" }, "<")
        .to(".vd-ring", { scale: 9, duration: 2.8, ease: "none" })
        .fromTo(".vd-hint", { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.5 }, "<0.5")
        .to(".vd-hint", { autoAlpha: 0, duration: 0.3 })
        .to(".vd-note", { autoAlpha: 0, duration: 0.3 }, "<")
        .to(".vd-ring", { scale: 70, duration: 1, ease: "power3.in" })
        .fromTo(".vd-fill", { scale: 0 }, { scale: 80, duration: 1.1, ease: "power3.in" }, "-=0.6")
        .fromTo(".vd-after", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.25")
        .to({}, { duration: 0.5 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section data-testid="void-scene" className="relative z-10 flex h-screen items-center justify-center bg-[#EAE6DF]">
        <p className="font-mono text-[10px] tracking-[0.5em] text-[#050505]/60">EVERYTHING IS ABOUT TO CHANGE</p>
      </section>
    );
  }

  return (
    <section ref={ref} data-testid="void-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="vd-seed pulse-dot h-1.5 w-1.5 rounded-full bg-ember" />
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-[24vh]">
        <p data-testid="void-note" className="vd-note font-serif text-lg italic text-white/60 opacity-0 md:text-xl">
          still here?
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center" data-cursor="WAIT">
        <div className="vd-ring h-16 w-16 rounded-full border border-bone/70 opacity-0" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <p className="vd-hint font-mono text-[9px] tracking-[0.6em] text-white/40 opacity-0">KEEP SCROLLING</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="vd-fill h-[4vw] w-[4vw] scale-0 rounded-full bg-[#EAE6DF]" />
      </div>

      <div className="vd-after absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-0">
        <p data-testid="void-after" className="px-6 text-center font-serif text-2xl italic text-[#050505] md:text-4xl">
          and then — everything changes.
        </p>
      </div>
    </section>
  );
}
