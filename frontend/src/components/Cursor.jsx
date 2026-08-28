import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.16, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.16, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    const move = (e) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e) => {
      const ctx = e.target.closest("[data-cursor]");
      const inter = e.target.closest("a, button, input, textarea, [data-hover]");
      if (ctx) {
        label.textContent = ctx.dataset.cursor;
        gsap.to(ring, { scale: 2.4, duration: 0.4, ease: "power3.out" });
        gsap.to(label, { autoAlpha: 1, duration: 0.3 });
        gsap.to(dot, { autoAlpha: 0, duration: 0.2 });
      } else if (inter) {
        gsap.to(ring, { scale: 1.7, duration: 0.4, ease: "power3.out" });
        gsap.to(label, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { autoAlpha: 1, duration: 0.2 });
      } else {
        gsap.to(ring, { scale: 1, duration: 0.4, ease: "power3.out" });
        gsap.to(label, { autoAlpha: 0, duration: 0.2 });
        gsap.to(dot, { autoAlpha: 1, duration: 0.2 });
      }
    };

    const cleanups = [];
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      const mm = (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.3);
        my((e.clientY - (r.top + r.height / 2)) * 0.3);
      };
      const ml = () => {
        mx(0);
        my(0);
      };
      el.addEventListener("mousemove", mm);
      el.addEventListener("mouseleave", ml);
      cleanups.push(() => {
        el.removeEventListener("mousemove", mm);
        el.removeEventListener("mouseleave", ml);
      });
    });

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  if (
    typeof window !== "undefined" &&
    !window.matchMedia("(pointer: fine)").matches
  ) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        data-testid="custom-cursor"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-white mix-blend-exclusion"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-white/60 mix-blend-exclusion"
      >
        <span
          ref={labelRef}
          data-testid="cursor-label"
          className="font-mono text-[7px] tracking-[0.2em] text-white opacity-0"
        />
      </div>
    </>
  );
}
