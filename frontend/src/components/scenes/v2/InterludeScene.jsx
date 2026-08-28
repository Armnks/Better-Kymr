import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function InterludeScene() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const getDist = () => track.scrollWidth - window.innerWidth + window.innerWidth * 0.12;
      const skewTo = gsap.quickTo(".tr-item", "skewX", { duration: 0.5, ease: "power3" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: () => `+=${getDist() * 1.05}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "09 — TRANSIT" })),
          onUpdate: (self) =>
            skewTo(gsap.utils.clamp(-7, 7, self.getVelocity() / -300)),
          onScrubComplete: () => skewTo(0),
        },
      });
      tl.fromTo(
        track,
        { x: () => window.innerWidth * 0.12 },
        { x: () => -getDist(), ease: "none", duration: 10 }
      )
        .fromTo(".tr-back", { xPercent: -22 }, { xPercent: 4, ease: "none", duration: 10 }, 0)
        .fromTo(".tr-serif", { autoAlpha: 0 }, { autoAlpha: 0.7, duration: 1 }, 6.5)
        .fromTo(".tr-line", { scaleX: 0 }, { scaleX: 0.6, duration: 1.4, ease: "power2.inOut" }, 8.4)
        .to({}, { duration: 0.8 });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const Frame = ({ n, img, label }) => (
    <div
      className="tr-item relative h-[42vh] w-[34vw] shrink-0 overflow-hidden border border-white/20 md:w-[26vw]"
      data-cursor={img ? "SPEC" : "UNWRITTEN"}
      data-testid={`transit-frame-${n}`}
    >
      {img && (
        <img
          src={img}
          alt={label}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span
        className={`absolute left-3 top-3 z-10 font-mono text-[9px] tracking-[0.3em] ${
          img ? "bg-[#050505]/60 px-1.5 py-0.5 text-white/85" : "text-white/40"
        }`}
      >
        {label}
      </span>
      <span className="absolute bottom-3 right-3 z-10 font-mono text-[9px] tracking-[0.3em] text-white/25">
        KYMRSTUDIO
      </span>
    </div>
  );

  if (reduced) {
    return (
      <section data-testid="transit-scene" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-24">
        <h2 className="font-display text-[12vw] font-black text-bone">THE NEXT FRAME IS YOURS.</h2>
        <p className="font-serif text-xl italic text-white/50">we saved you a seat in the archive.</p>
      </section>
    );
  }

  return (
    <section ref={ref} data-testid="transit-scene" className="relative z-10 h-screen overflow-hidden">
      <div className="absolute bottom-8 right-6 z-10 font-mono text-[10px] tracking-[0.35em] text-white/40 md:right-10">
        SCROLL ↓ = TRAVEL →
      </div>

      <div className="tr-back absolute top-[8vh] whitespace-nowrap opacity-60">
        <span className="text-outline-faint select-none font-display text-[13vw] font-black leading-none">
          KYMRSTUDIO — KYMRSTUDIO — KYMRSTUDIO — KYMRSTUDIO — KYMRSTUDIO — KYMRSTUDIO —{" "}
        </span>
      </div>

      <div
        ref={trackRef}
        className="absolute top-1/2 flex -translate-y-1/2 items-center gap-[12vw] will-change-transform"
      >
        <h3 className="tr-item shrink-0 select-none whitespace-nowrap font-display text-[15vw] font-black leading-none tracking-[-0.05em] text-bone" data-testid="transit-the-next">
          THE NEXT
        </h3>
        <Frame n={7} img="/ads/beverage.jpg" label="SPEC CONCEPT — BEVERAGE" />
        <h3 className="tr-item shrink-0 select-none whitespace-nowrap font-display text-[16vw] font-black leading-none tracking-[-0.05em] text-ember" data-testid="transit-frame-word">
          FRAME
        </h3>
        <Frame n={8} img="/ads/fashion.jpg" label="SPEC CONCEPT — FASHION" />
        <h3 className="tr-item text-outline shrink-0 select-none whitespace-nowrap font-display text-[15vw] font-black leading-none tracking-[-0.05em]" data-testid="transit-is-yours">
          IS YOURS.
        </h3>
      </div>

      <div className="absolute inset-x-0 bottom-[22vh] flex justify-center">
        <p className="tr-serif font-serif text-lg italic text-white/50 opacity-0 md:text-xl">
          we saved you a seat in the archive.
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="tr-line h-px w-screen origin-center scale-x-0 bg-ember" />
      </div>
    </section>
  );
}
