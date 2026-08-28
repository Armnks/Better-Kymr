import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function Background() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.to(".bf-1", {
        x: 120,
        y: -80,
        opacity: 0.85,
        duration: 14,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".bf-2", {
        x: -100,
        y: 100,
        opacity: 0.55,
        duration: 18,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".bf-3", {
        opacity: 0.4,
        scale: 1.25,
        duration: 9,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="bf-1 absolute -top-[20%] left-[10%] h-[60vh] w-[60vw] rounded-full opacity-60 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(25,35,60,0.5), transparent 70%)",
        }}
      />
      <div
        className="bf-2 absolute -bottom-[10%] right-[5%] h-[50vh] w-[50vw] rounded-full opacity-40 blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,42,0,0.08), transparent 70%)",
        }}
      />
      <div
        className="bf-3 absolute left-[40%] top-[30%] h-[40vh] w-[30vw] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
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
