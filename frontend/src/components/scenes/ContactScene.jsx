import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SOCIALS = [
  { label: "INSTAGRAM", href: "https://instagram.com/kymr.studio" },
  { label: "TIKTOK", href: "https://tiktok.com/@kymr.studio" },
  { label: "LINKEDIN", href: "https://linkedin.com/company/kymr-studio" },
];

export default function ContactScene() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-reveal",
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${API}/enquiries`, form);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      data-testid="contact-scene"
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-32 md:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="contact-reveal font-mono text-[10px] tracking-[0.5em] text-white/40">
          FINAL FRAME — TRANSMISSION
        </p>

        <h2 className="contact-reveal mt-10 font-serif text-6xl italic leading-[1.05] text-bone md:text-8xl">
          Start the
          <br />
          next frame.
        </h2>

        <a
          data-testid="contact-email-link"
          data-hover
          href="mailto:hello@kymr.studio"
          className="contact-reveal link-sweep mt-12 inline-block font-display text-[8vw] font-black leading-none tracking-[-0.04em] text-bone transition-colors duration-500 hover:text-ember md:text-[5vw]"
        >
          hello@kymr.studio
        </a>

        <div className="contact-reveal mt-8 flex flex-wrap gap-8 font-mono text-[10px] tracking-[0.35em] text-white/50">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              data-testid={`social-${s.label.toLowerCase()}`}
              data-hover
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-sweep transition-colors duration-300 hover:text-white"
            >
              {s.label} ↗
            </a>
          ))}
        </div>

        <div className="contact-reveal mt-24 grid gap-16 md:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] tracking-[0.4em] text-white/40">
              OR LEAVE A SIGNAL
            </p>
            <p className="mt-6 max-w-sm font-serif text-lg italic text-white/50">
              Tell us what you are building. We reply within 48 hours — that is
              the whole point.
            </p>
          </div>

          {status === "sent" ? (
            <div
              data-testid="contact-success"
              className="flex min-h-[240px] flex-col items-start justify-center border border-white/10 p-8"
            >
              <span className="pulse-dot h-2 w-2 rounded-full bg-ember" />
              <p className="mt-6 font-mono text-xs tracking-[0.35em] text-bone">
                RECEIVED — WE REPLY WITHIN 48H
              </p>
              <p className="mt-4 font-serif italic text-white/50">
                Your signal is in the edit suite.
              </p>
            </div>
          ) : (
            <form data-testid="contact-form" onSubmit={submit} className="space-y-2">
              <input
                data-testid="contact-name-input"
                className="input-line"
                placeholder="NAME"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                data-testid="contact-email-input"
                className="input-line"
                type="email"
                placeholder="EMAIL"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <textarea
                data-testid="contact-message-input"
                className="input-line min-h-[96px] resize-none"
                placeholder="WHAT ARE YOU BUILDING?"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="pt-6">
                <button
                  data-testid="contact-submit-button"
                  data-hover
                  type="submit"
                  disabled={status === "sending"}
                  className="group flex items-center gap-4 font-mono text-[11px] tracking-[0.4em] text-bone transition-colors duration-300 hover:text-ember disabled:opacity-40"
                >
                  <span className="h-2 w-2 rounded-full bg-ember transition-transform duration-500 group-hover:scale-[2]" />
                  {status === "sending" ? "TRANSMITTING…" : "TRANSMIT"}
                </button>
                {status === "error" && (
                  <p
                    data-testid="contact-error"
                    className="mt-4 font-mono text-[10px] tracking-[0.3em] text-ember"
                  >
                    SIGNAL LOST — TRY AGAIN OR EMAIL DIRECTLY
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="contact-reveal mt-32 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 font-mono text-[10px] tracking-[0.3em] text-white/30 md:flex-row">
          <span>© 2026 KYMR STUDIO</span>
          <span>BUILT AS A LIVING SYSTEM</span>
          <a
            data-testid="admin-link"
            data-hover
            href="/admin"
            className="transition-colors duration-300 hover:text-white/70"
          >
            VAULT ↗
          </a>
        </div>
      </div>
    </section>
  );
}
