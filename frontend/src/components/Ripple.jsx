import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { isReducedMotion } from "@/App";

export const triggerRipple = (x, y) => {
  window.dispatchEvent(
    new CustomEvent("kymr:ripple", {
      detail: {
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
      },
    })
  );
};

export default function RippleHost() {
  const [rip, setRip] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onRip = (e) => {
      if (isReducedMotion()) {
        navigate("/start");
        return;
      }
      setRip((prev) => prev || { x: e.detail.x, y: e.detail.y });
    };
    window.addEventListener("kymr:ripple", onRip);
    return () => window.removeEventListener("kymr:ripple", onRip);
  }, [navigate]);

  useEffect(() => {
    if (!rip) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.set(".rp-ring", {
        x: rip.x,
        y: rip.y,
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0.9,
      })
        .fromTo(
          ".rp-blur",
          { backdropFilter: "blur(0px) brightness(1)" },
          { backdropFilter: "blur(18px) brightness(1.2)", duration: 0.85, ease: "power2.inOut" },
          0.12
        )
        .to(".rp-ring.r1", { scale: 95, opacity: 0, duration: 1.0, ease: "power2.out" }, 0.12)
        .to(".rp-ring.r2", { scale: 75, opacity: 0, duration: 1.0, ease: "power2.out" }, 0.26)
        .to(".rp-ring.r3", { scale: 55, opacity: 0, duration: 1.0, ease: "power2.out" }, 0.4)
        .to(".rp-veil", { opacity: 1, duration: 0.5, ease: "power1.in" }, 0.55)
        .add(() => {
          sessionStorage.setItem("kymr-ripple", "1");
          navigate("/start");
        }, 1.0)
        .to(".rp-veil", { opacity: 0, duration: 0.6, delay: 0.2 })
        .to(".rp-blur", { backdropFilter: "blur(0px) brightness(1)", duration: 0.6 }, "<")
        .add(() => setRip(null));
    });
    return () => ctx.revert();
  }, [rip, navigate]);

  if (!rip) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[300]" data-testid="ripple-overlay">
      <div className="rp-blur absolute inset-0" />
      <div className="rp-ring r1 absolute h-[3vmax] w-[3vmax] rounded-full border border-white/60" />
      <div className="rp-ring r2 absolute h-[3vmax] w-[3vmax] rounded-full border border-ember/70" />
      <div className="rp-ring r3 absolute h-[3vmax] w-[3vmax] rounded-full border border-white/30" />
      <div className="rp-veil absolute inset-0 bg-[#050505] opacity-0" />
    </div>
  );
}
