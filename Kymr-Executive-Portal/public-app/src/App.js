import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Experience, { resolveSection } from "@/pages/Experience";
import { ScopeProvider } from "@/lib/scope";
import Start from "@/pages/Start";
import NotFound from "@/pages/NotFound";
import Legal from "@/pages/Legal";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export const isReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const scrollToId = (rawId) => {
  const id = resolveSection(rawId);
  const target = id === "top" ? 0 : document.getElementById(id);
  if (target === null) return;
  if (window.__lenis) {
    // Lenis already subtracts the scrollport's scroll-padding-top, which
    // is where the header offset lives. Subtracting it a second time
    // here landed every anchor short of its own heading.
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
    // Keyboard focus (Tab into an off-screen control) triggers the browser's
    // native scrollIntoView, which moves window.scrollY without going through
    // Lenis - so ScrollTrigger's cached progress would otherwise freeze and
    // every scroll-gated scene would stay stuck in its pre-scroll state for a
    // keyboard-only visitor. Listening natively keeps it in sync regardless
    // of what caused the scroll.
    window.addEventListener("scroll", ScrollTrigger.update, { passive: true });
    // Lenis drives scroll position from its own rAF target, so a native
    // keyboard scroll is overwritten on the next frame and the page snaps
    // back. Lenis has no keyboard handling of its own, so the page keys
    // are routed through it explicitly. Without this, Home, End, Page Up
    // and Page Down silently do nothing.
    const onKeyScroll = (e) => {
      // a component that already handled the key wins: the archive index
      // uses Home and End to move its selection
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t instanceof Element &&
        t.closest("input, textarea, select, [contenteditable], [role='dialog']")
      ) {
        return;
      }
      const page = window.innerHeight * 0.9;
      let to = null;
      if (e.key === "End") to = document.documentElement.scrollHeight;
      else if (e.key === "Home") to = 0;
      else if (e.key === "PageDown") to = window.scrollY + page;
      else if (e.key === "PageUp") to = window.scrollY - page;
      else if (e.key === " ") {
        // space still activates a control when one is focused
        if (t instanceof Element && t.closest("button, a, [role='button']")) return;
        to = window.scrollY + (e.shiftKey ? -page : page);
      } else return;
      e.preventDefault();
      lenis.scrollTo(to, { duration: 0.7 });
    };
    window.addEventListener("keydown", onKeyScroll);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      window.removeEventListener("keydown", onKeyScroll);
      gsap.ticker.remove(tick);
      window.removeEventListener("scroll", ScrollTrigger.update);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <BrowserRouter>
      <ScopeProvider>
      <Routes>
        {/* Every chapter has a real destination. They render the same
            homepage and land on their own section, rather than
            duplicating the page content at another URL. */}
        <Route path="/" element={<Experience />} />
        <Route path="/work" element={<Experience focus="work" />} />
        <Route path="/work/:conceptSlug" element={<Experience focus="work" />} />
        <Route path="/services" element={<Experience focus="make" />} />
        {/* /studio kept: it was a published destination. It resolves
            through SECTION_ALIAS onto the chapter that replaced the
            studio chapter, rather than 404ing. */}
        <Route path="/studio" element={<Experience focus="craft" />} />
        <Route path="/websites" element={<Experience focus="build" />} />
        <Route path="/inquiry" element={<Experience focus="inquiry" />} />
        {/* the routes those two chapters used to answer on */}
        {/* /capabilities now has a section of its own rather than
            answering on #make */}
        <Route path="/capabilities" element={<Experience focus="capabilities" />} />
        <Route path="/process" element={<Experience focus="craft" />} />
        <Route path="/contact" element={<Experience focus="decision" />} />
        <Route path="/start" element={<Start />} />
        {/* Real pages, not modals: a policy has to be linkable, quotable
            and reachable without JavaScript having to open something. */}
        <Route path="/privacy" element={<Legal which="privacy" />} />
        <Route path="/terms" element={<Legal which="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ScopeProvider>
    </BrowserRouter>
  );
}

export default App;
