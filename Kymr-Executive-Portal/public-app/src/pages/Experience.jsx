import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "@/components/Nav";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useCanonical from "@/hooks/useCanonical";
import { conceptBySlug } from "@/data/concepts";
import SignalField, { setFieldMode, setFieldPointer } from "@/components/env/SignalField";
import EntrySequence, { hasEntered, clearEntered } from "@/components/EntrySequence";
import { setShaderMode, setShaderPointer, pingShader } from "@/components/ui/shader-lines";
import HeroScene from "@/components/scenes/v2/HeroScene";
import MakeScene from "@/components/scenes/v2/MakeScene";
import BuildScene from "@/components/scenes/v2/BuildScene";
import CapabilitiesScene from "@/components/scenes/v2/CapabilitiesScene";
import ScopeDialog from "@/components/ScopeDialog";
import WebEstimator from "@/components/WebEstimator";
import { useScope } from "@/lib/scope";
import InquiryScene from "@/components/scenes/v2/InquiryScene";
import ArchiveScene from "@/components/scenes/v2/ArchiveScene";

// The one offset every chapter entrance uses: the real height of the
// fixed header plus a little air. A larger generic offset leaves the
// previous chapter showing above the heading you asked for.
export const NAV_OFFSET = 84;

// The homepage chapters were renamed when the work moved to the front.
// Old destinations still resolve, and they resolve by pointing at the
// section that replaced them rather than by planting a second id on it.
export const SECTION_ALIAS = {
  // The estimator is a dialog now. These legacy paths land on the
  // closing section, whose "Start a Project" opens it.
  start: "decision",
  scope: "decision",
  // /capabilities used to answer on #make, because there was no such
  // section. There is now: "One idea. Every discipline." takes the name.
  capabilities: "capabilities",
  fracture: "make",
  system: "make",
  // "Who you actually work with" was replaced by "Beyond the ad" on
  // 2026-09-08. Both destinations that named the old chapter still
  // resolve, and they resolve onto the section that took its place
  // rather than onto nothing.
  process: "build",
  craft: "build",
  studio: "build",
  "contact-form": "inquiry",
  inquiry: "inquiry",
  work: "work",
  decision: "decision",
};
export const resolveSection = (id) => SECTION_ALIAS[id] ?? id;

// What each chapter is called in a browser tab and a history entry.
// The homepage keeps the document's own title.
const CHAPTER_TITLE = {
  work: "Work",
  capabilities: "Capabilities",
  make: "Services",
  build: "Websites & ecommerce",
  inquiry: "Contact",
  decision: "Contact",
};

// Two environments, one identity. The hero owns the shader field and
// keeps it; every chapter after it stands on the persistent signal
// field, which is mounted once, fixed, and never remounts. Sections
// declare `data-shader-mode`; whichever one owns the upper band of the
// viewport sets both, so the ground grades from chapter to chapter as
// one continuous environment rather than five separate backdrops.
/**
 * Both estimator dialogs, mounted once outside the page flow. They are
 * opened by event from any CTA and closed to nothing, so removing the
 * old #scope section cost the site no functionality.
 */
function ScopeDialogs() {
  const { dialog, setDialog } = useScope();
  const toInquiry = useCallback((line) => {
    setDialog("none");
    if (line) window.dispatchEvent(new CustomEvent("kymr:web-scope", { detail: line }));
    window.setTimeout(() => {
      const el = document.getElementById("inquiry");
      if (!el) return;
      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -84 });
      else el.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => {
        const h = el.querySelector("h2");
        if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
      }, 700);
    }, 40);
  }, [setDialog]);

  useEffect(() => {
    const on = (e) => setDialog(e.detail === "web" ? "web" : "ads");
    window.addEventListener("kymr:open-scope", on);
    return () => window.removeEventListener("kymr:open-scope", on);
  }, [setDialog]);

  return (
    <>
      <ScopeDialog open={dialog === "ads"} onClose={() => setDialog("none")}
        onContact={() => toInquiry(null)} />
      <WebEstimator open={dialog === "web"} onClose={() => setDialog("none")}
        onContact={(line) => toInquiry(line)} />
    </>
  );
}

export default function Experience({ focus }) {
  // A dossier is a route, so the chapter this deep link belongs to and
  // the concept it opens are both readable here.
  const { conceptSlug } = useParams();
  const routedConcept = conceptSlug ? conceptBySlug(conceptSlug) : null;
  // Read by the deep-link effect without being one of its dependencies:
  // closing a dossier changes the slug but not the chapter, and re-running
  // the effect there would pull focus off the control the viewer just
  // handed it back to.
  const slugRef = useRef(conceptSlug);
  slugRef.current = conceptSlug;
  useDocumentTitle(
    routedConcept
      ? `${routedConcept.title} \u2014 KymrStudio`
      : CHAPTER_TITLE[resolveSection(focus)]
        ? `${CHAPTER_TITLE[resolveSection(focus)]} \u2014 KymrStudio`
        : null
  );

  // Every chapter route renders this same homepage, so they all point at
  // "/" rather than competing with it. A dossier is a genuinely separate
  // document and is its own canonical.
  useCanonical(routedConcept ? `/work/${conceptSlug}` : "/");

  const [intro, setIntro] = useState(() => !hasEntered());
  const [ready, setReady] = useState(() => hasEntered());
  const rootRef = useRef(null);
  // whether the post-hero field is on screen. A ref, not state: it is
  // read by the field's own render loop and must not re-render a page
  // of scroll-gated scenes every time the hero leaves the viewport.
  const fieldActive = useRef(false);

  const onIntroDone = useCallback(() => {
    setIntro(false);
    setReady(true);
  }, []);

  // no reload: the sequence remounts and the hero re-enters
  const replayEntry = useCallback(() => {
    clearEntered();
    setReady(false);
    setIntro(true);
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, []);

  // A deep link lands on its chapter once the page has laid out, with
  // the header offset applied so the heading is never underneath it.
  useEffect(() => {
    if (!focus) return undefined;
    const t = window.setTimeout(() => {
      const el = document.getElementById(resolveSection(focus));
      if (!el) return;
      // measured against the document, not the offsetParent: the
      // chapter anchors are now acts inside a positioned section, so
      // offsetTop would be relative to that section and land short
      const y = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      // A dossier is an aria-modal dialog and owns focus while it is
      // open. Moving focus to the chapter behind it left the modal
      // with focus outside itself and no working trap, so the chapter
      // is still scrolled into place but focus is left alone.
      if (slugRef.current || document.querySelector('[data-testid="concept-viewer"]')) return;
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }, 260);
    return () => window.clearTimeout(t);
  }, [focus]);

  // section -> shader mode
  useEffect(() => {
    const els = [...document.querySelectorAll("[data-shader-mode]")];
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const mode = e.target.dataset.shaderMode;
          setShaderMode(mode);
          setFieldMode(mode);
        });
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // pointer displacement, capped in the shader at ~8px perceived
  useEffect(() => {
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const onMove = (e) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = -((e.clientY / window.innerHeight) * 2 - 1);
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          setShaderPointer(nx, ny);
          setFieldPointer(nx, ny);
        });
      }
    };
    const fine = window.matchMedia("(pointer: fine)");
    if (fine.matches) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // The field belongs to the page after the hero. It fades in as the
  // hero leaves and its render loop is switched off entirely whenever
  // it is not on screen, so nothing animates behind a chapter nobody
  // is looking at.
  useEffect(() => {
    const el = document.getElementById("top");
    if (!el) return undefined;
    let shown = null;
    const apply = () => {
      const on = window.scrollY > el.offsetHeight * 0.55;
      if (on === shown) return;
      shown = on;
      fieldActive.current = on;
      document.documentElement.classList.toggle("field-on", on);
      window.dispatchEvent(new CustomEvent("kymr:field-active", { detail: on }));
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      document.documentElement.classList.remove("field-on");
    };
  }, []);

  // one short signal ripple, only on empty ground
  const onGroundClick = useCallback((e) => {
    if (e.target.closest("a, button, input, textarea, select, [role='dialog'], h1, h2, h3, p, li")) {
      return;
    }
    pingShader((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  }, []);

  return (
    <div
      ref={rootRef}
      data-testid="kymr-experience"
      className="relative bg-carbon text-frost"
      onClick={onGroundClick}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {intro && <EntrySequence onDone={onIntroDone} />}
      {!intro && <SignalField activeRef={fieldActive} />}
      {!intro && <Nav />}
      <main id="main" className="relative">
        <HeroScene ready={ready} />
        <ArchiveScene />
        <MakeScene />
        <BuildScene />
        <CapabilitiesScene />
        <InquiryScene />
      </main>
      <ScopeDialogs />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
