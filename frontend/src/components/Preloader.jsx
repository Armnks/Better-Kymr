import { useEffect, useRef } from "react";
import gsap from "gsap";
import { isReducedMotion } from "@/App";

export default function Preloader({ onDone }) {
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const returning = localStorage.getItem("kymr-visited") === "1";
    const finish = () => {
      if (done.current) return;
      done.current = true;
      localStorage.setItem("kymr-visited", "1");
      onDone();
    };
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    let ctx;
    if (isReducedMotion()) {
      ctx = gsap.context(() => {
        gsap.to(ref.current, { autoAlpha: 0, duration: 0.4, delay: 0.35, onComplete: finish });
      }, ref);
    } else if (returning) {
      ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.fromTo(
          ".pl-dot",
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.15, ease: "power2.out" },
          0.05
        )
          .to(".pl-dot", { scale: 2.2, duration: 0.15, ease: "power3.in" }, 0.2)
          .to(ref.current, { autoAlpha: 0, duration: 0.25, ease: "power1.inOut", onComplete: finish }, 0.34);
      }, ref);
    } else {
      ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.fromTo(
          ".pl-dot",
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power2.out" },
          0.15
        )
          .fromTo(
            ".pl-word",
            { autoAlpha: 0, letterSpacing: "0.9em" },
            { autoAlpha: 0.8, letterSpacing: "0.3em", duration: 0.55, ease: "power2.out" },
            0.3
          )
          .to(".pl-dot", { scale: 2.4, duration: 0.22, ease: "power3.in" }, 0.95)
          .to(".pl-dot", { scale: 1, duration: 0.18, ease: "power2.out" }, 1.17)
          .to(ref.current, { autoAlpha: 0, duration: 0.35, ease: "power1.inOut", onComplete: finish }, 1.3);
      }, ref);
    }
    const safety = setTimeout(finish, 3500);
    return () => {
      if (ctx) ctx.revert();
      clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      data-testid="preloader"
      className="fixed inset-0 z-[200] bg-[#050505]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pl-dot h-2 w-2 rounded-full bg-ember opacity-0" />
      </div>
      <div className="absolute inset-0 flex items-end justify-center pb-[42vh]">
        <p className="pl-word font-mono text-[10px] tracking-[0.3em] text-white/60 opacity-0">
          KYMRSTUDIO
        </p>
      </div>
    </div>
  );
}
