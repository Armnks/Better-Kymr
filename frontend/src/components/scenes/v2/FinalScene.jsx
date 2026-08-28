import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const FROM = [
  { x: "-58vw", y: "-46vh", r: -14 },
  { x: "54vw", y: "-52vh", r: 10 },
  { x: "-62vw", y: "48vh", r: 8 },
  { x: "58vw", y: "44vh", r: -10 },
];

export default function FinalScene() {
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
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "09 — KYMR" })),
        },
      });
      gsap.utils.toArray(".fn-l").forEach((el, i) => {
        tl.fromTo(
          el,
          { x: FROM[i].x, y: FROM[i].y, rotation: FROM[i].r, scale: 2.6, autoAlpha: 0 },
          { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1.3, ease: "power3.inOut" },
          i * 0.07
        );
      });
      tl.to(".fn-stage", { y: 6, duration: 0.06 })
        .to(".fn-stage", { y: -3, duration: 0.06 })
        .to(".fn-stage", { y: 0, duration: 0.08 })
        .fromTo(".fn-serif", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "+=0.25")
        .fromTo(".fn-meta", { autoAlpha: 0 }, { autoAlpha: 0.6, duration: 0.6 }, "<0.3")
        .to({}, { duration: 0.5 });
      gsap.to(".fn-word", { scale: 1.02, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section id="finale" data-testid="final-scene" className="relative z-10 flex h-screen flex-col items-center justify-center gap-8">
        <h2 className="font-display text-[19vw] font-black leading-none tracking-[-0.06em] text-bone">KYMR</h2>
        <p className="font-serif text-xl italic text-white/50">the next frame is yours.</p>
      </section>
    );
  }

  return (
    <section ref={ref} id="finale" data-testid="final-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="fn-stage absolute inset-0 flex items-center justify-center">
        <h2
          data-testid="final-word"
          className="fn-word flex select-none font-display text-[19vw] font-black leading-none tracking-[-0.06em] text-bone"
        >
          {["K", "Y", "M", "R"].map((l, i) => (
            <span key={i} className="fn-l inline-block will-change-transform">
              {l}
            </span>
          ))}
        </h2>
      </div>
      <div className="absolute inset-0 flex items-end justify-center pb-[22vh]">
        <p data-testid="final-serif" className="fn-serif font-serif text-xl italic text-white/50 opacity-0 md:text-2xl">
          the next frame is yours.
        </p>
      </div>
      <div className="fn-meta absolute inset-x-0 bottom-10 flex justify-center opacity-0">
        <span className="font-mono text-[10px] tracking-[0.5em] text-white/40">END OF TRANSMISSION — SCROLL FOR CONTACT</span>
      </div>
    </section>
  );
}
