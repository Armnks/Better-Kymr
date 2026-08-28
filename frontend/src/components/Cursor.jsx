import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dotRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const dot = dotRef.current;
    gsap.set(dot, { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3" });
    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e) => {
      const t = e.target.closest("a, button, input, textarea, [data-hover]");
      gsap.to(dot, {
        scale: t ? 4 : 1,
        opacity: t ? 0.85 : 1,
        duration: 0.45,
        ease: "power3.out",
      });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  if (
    typeof window !== "undefined" &&
    !window.matchMedia("(pointer: fine)").matches
  ) {
    return null;
  }

  return (
    <div
      ref={dotRef}
      data-testid="custom-cursor"
      className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-white mix-blend-exclusion"
    />
  );
}
