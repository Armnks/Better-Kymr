import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { range } from "@/utils/seed";

gsap.registerPlugin(ScrollTrigger);

export default function Background() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const fields = useMemo(
    () => [
      {
        cls: "bf-1",
        style: {
          top: `${range(-25, -10)}%`,
          left: `${range(5, 20)}%`,
          background: "radial-gradient(circle, rgba(25,35,60,0.5), transparent 70%)",
        },
        size: "h-[60vh] w-[60vw] opacity-60 blur-[140px]",
        dur: range(12, 16),
        parallax: -25,
      },
      {
        cls: "bf-2",
        style: {
          bottom: `${range(-15, -5)}%`,
          right: `${range(2, 12)}%`,
          background: "radial-gradient(circle, rgba(255,42,0,0.09), transparent 70%)",
        },
        size: "h-[50vh] w-[50vw] opacity-40 blur-[160px]",
        dur: range(16, 20),
        parallax: 18,
      },
      {
        cls: "bf-3",
        style: {
          top: `${range(25, 40)}%`,
          left: `${range(35, 50)}%`,
          background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)",
        },
        size: "h-[40vh] w-[30vw] opacity-25 blur-[120px]",
        dur: range(8, 11),
        parallax: -12,
      },
    ],
    []
  );

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      fields.forEach((f, i) => {
        gsap.to(`.${f.cls}`, {
          x: i % 2 ? -100 : 120,
          y: i % 2 ? 100 : -80,
          opacity: "+=0.2",
          duration: f.dur,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        gsap.to(`.${f.cls}`, {
          yPercent: f.parallax,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 2.5 },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced, fields]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="atmo pointer-events-none fixed inset-0 z-0 origin-center overflow-hidden"
    >
      {fields.map((f) => (
        <div key={f.cls} className={`${f.cls} absolute rounded-full ${f.size}`} style={f.style} />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
