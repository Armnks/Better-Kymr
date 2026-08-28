import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Experience from "@/pages/Experience";
import Start from "@/pages/Start";
import RippleHost from "@/components/Ripple";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export const isReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const scrollToId = (id) => {
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target === null) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { duration: 2 });
  } else if (target === 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
};

function App() {
  useEffect(() => {
    if (isReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Experience />} />
        <Route path="/start" element={<Start />} />
      </Routes>
      <RippleHost />
    </BrowserRouter>
  );
}

export default App;
