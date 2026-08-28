import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { triggerRipple } from "@/components/Ripple";
import { scrollToId } from "@/App";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "media@kymrstudio.com";

const SOCIALS = [
  { label: "INSTAGRAM", href: "https://instagram.com/kymrstudio" },
  { label: "TIKTOK", href: "https://tiktok.com/@kymrstudio" },
  { label: "LINKEDIN", href: "https://linkedin.com/company/kymrstudio" },
];

export default function ContactScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "+=240%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            self.isActive &&
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "11 — CONTACT" })),
          onUpdate: () =>
            window.dispatchEvent(new CustomEvent("kymr:state", { detail: "11 — CONTACT" })),
        },
      });
      tl.fromTo(".ct-serif", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" })
        .to(".ct-serif", { y: "-16vh", scale: 0.7, autoAlpha: 0.5, duration: 0.9, ease: "power3.inOut" }, "+=0.6")
        .fromTo(".ct-email", { yPercent: 120 }, { yPercent: 0, duration: 1.1, ease: "power3.out" }, "<0.2")
        .fromTo(".ct-inquire", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "+=0.35")
        .fromTo(".ct-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, "+=0.35")
        .fromTo(".ct-foot", { autoAlpha: 0 }, { autoAlpha: 0.55, duration: 0.7 }, "<0.2")
        .to({}, { duration: 0.7 });
      gsap.to(".ct-email-inner", { scale: 1.012, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const emailBlock = (
    <div className="overflow-hidden">
      <a
        data-testid="contact-email-link"
        data-magnetic
        data-cursor="SAY HELLO"
        href={`mailto:${EMAIL}`}
        aria-label={`Email KymrStudio at ${EMAIL}`}
        className="ct-email block"
      >
        <span className="ct-email-inner block select-none font-display text-[7.2vw] font-black leading-none tracking-[-0.03em] text-bone transition-colors duration-500 hover:text-ember md:text-[5.2vw]">
          {EMAIL}
        </span>
      </a>
    </div>
  );

  const inquireBlock = (
    <button
      type="button"
      data-testid="contact-inquire"
      data-magnetic
      data-cursor="BEGIN"
      onClick={(e) => triggerRipple(e.clientX, e.clientY)}
      className="ct-inquire group relative mt-14 inline-block opacity-0"
    >
      <span className="absolute inset-0 origin-left scale-x-0 bg-ember transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      <span className="relative block border border-white/25 px-12 py-5 font-mono text-[11px] tracking-[0.5em] text-bone transition-colors duration-500 group-hover:border-ember group-hover:text-void group-focus-visible:border-ember group-focus-visible:text-void">
        INQUIRE ↗
      </span>
    </button>
  );

  const footerBlock = (
    <div className="ct-foot absolute inset-x-6 bottom-8 opacity-0 md:inset-x-10">
      <div className="ct-rule mb-6 h-px w-full origin-left bg-white/10" />
      <div className="flex flex-col items-center justify-between gap-4 font-mono text-[9px] tracking-[0.3em] text-white/35 md:flex-row">
        <span>© 2026 KYMRSTUDIO</span>
        <div className="flex gap-8">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              data-testid={`social-${s.label.toLowerCase()}`}
              data-hover
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-300 hover:text-white"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
        <button
          type="button"
          data-testid="back-to-top"
          data-hover
          data-cursor="REWIND"
          onClick={() => scrollToId("top")}
          className="transition-colors duration-300 hover:text-white"
        >
          BACK TO TOP ↑
        </button>
      </div>
    </div>
  );

  if (reduced) {
    return (
      <section id="contact" data-testid="contact-scene" className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-32 text-center">
        <p className="font-serif text-2xl italic text-white/60 md:text-4xl">you made it to the last frame.</p>
        <a data-testid="contact-email-link" href={`mailto:${EMAIL}`} className="font-display text-[7vw] font-black text-bone md:text-[5vw]">
          {EMAIL}
        </a>
        <a data-testid="contact-inquire" href="/start" onClick={(e) => { e.preventDefault(); triggerRipple(e.clientX, e.clientY); }} className="border border-white/25 px-12 py-5 font-mono text-[11px] tracking-[0.5em] text-bone">
          INQUIRE ↗
        </a>
        <div className="flex items-center gap-8 font-mono text-[9px] tracking-[0.3em] text-white/35">
          <p>© 2026 KYMRSTUDIO</p>
          <button
            type="button"
            data-testid="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
            className="transition-colors duration-300 hover:text-white"
          >
            BACK TO TOP ↑
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="contact"
      data-testid="contact-scene"
      className="relative z-10 h-screen overflow-hidden px-6 md:px-10"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p data-testid="contact-serif" className="ct-serif absolute font-serif text-2xl italic text-white/60 opacity-0 md:text-4xl">
          you made it to the last frame.
        </p>
        {emailBlock}
        {inquireBlock}
      </div>
      {footerBlock}
    </section>
  );
}
