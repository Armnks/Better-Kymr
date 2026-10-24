import { Link } from "react-router-dom";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useCanonical from "@/hooks/useCanonical";
import { LEGAL_PAGES, LEGAL_CONTACT, NEEDS_OWNER } from "@/data/legal";

// ============================================================
// THE LEGAL PAGES
//
// One component, two documents, content entirely in data/legal.js so a
// wording change never touches layout.
//
// Deliberately NOT the homepage's environment. No shader, no signal
// field, no scroll reel, no entry sequence: someone reading a privacy
// policy is looking for a specific paragraph, and a chapter that has to
// be scrolled through to reveal itself is the wrong instrument. What
// they get is a quiet document on the studio's ground, a contents list
// that jumps, and type set for reading rather than for effect.
//
// It is still recognisably this site - same palette, same wordmark, same
// vermilion - because a policy that looks like it came from somewhere
// else reads as one that was pasted in from somewhere else.
// ============================================================

/** Renders the owner placeholder as something impossible to miss. */
function Body({ text }) {
  if (!text.includes(NEEDS_OWNER)) return <p className="k-legal-p">{text}</p>;
  const parts = text.split(NEEDS_OWNER);
  return (
    <p className="k-legal-p">
      {parts.map((part, i) => (
        <span key={`${part}-${i}`}>
          {part}
          {i < parts.length - 1 && (
            <mark className="k-legal-todo" title="KymrStudio still has to supply this">
              {NEEDS_OWNER}
            </mark>
          )}
        </span>
      ))}
    </p>
  );
}

export default function Legal({ which }) {
  const doc = LEGAL_PAGES[which];

  useDocumentTitle(`${doc.title} — KymrStudio`);
  useCanonical(`/${doc.slug}`);

  const other = which === "privacy" ? LEGAL_PAGES.terms : LEGAL_PAGES.privacy;

  return (
    <div data-testid={`legal-${doc.slug}`} className="k-legal">
      <header className="k-legal-bar">
        <Link to="/" data-testid="legal-home" className="k-legal-mark font-cinzel">
          KymrStudio<span className="text-signal">.</span>
        </Link>
        <Link to="/" className="k-link k-legal-back">
          <span aria-hidden="true" className="k-link-arrow">&larr;</span>
          Back to the site
        </Link>
      </header>

      <main id="main" className="k-legal-inner">
        <p className="t-data k-legal-eyebrow">Legal</p>
        <h1 className="k-legal-h">{doc.title}</h1>
        <p className="k-legal-standfirst">{doc.standfirst}</p>
        <p className="k-legal-updated">Last updated {doc.updated}</p>

        {/* A contents list, because nobody reads these top to bottom -
            they arrive looking for one answer. */}
        <nav aria-label="Contents" className="k-legal-toc">
          <p className="k-legal-toc-h">Contents</p>
          <ol>
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="t-data k-legal-toc-n">{String(i + 1).padStart(2, "0")}</span>
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((s, i) => (
          <section key={s.id} id={s.id} className="k-legal-sec">
            <h2 className="k-legal-sh">
              <span aria-hidden="true" className="t-data k-legal-sn">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.h}
            </h2>
            {(s.body || []).map((t) => (
              <Body key={t.slice(0, 40)} text={t} />
            ))}
            {(s.lists || []).map((l) => (
              <div key={l.h} className="k-legal-list">
                <p className="k-legal-list-h">{l.h}</p>
                <ul>
                  {l.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
            {(s.after || []).map((t) => (
              <Body key={t.slice(0, 40)} text={t} />
            ))}
          </section>
        ))}

        <footer className="k-legal-foot">
          <p className="k-legal-p">
            Questions about any of this go to{" "}
            <a href={`mailto:${LEGAL_CONTACT}`} className="k-legal-mail">
              {LEGAL_CONTACT}
            </a>
            .
          </p>
          <p className="k-legal-cross">
            <Link to={`/${other.slug}`} className="k-link">
              {other.title}
              <span aria-hidden="true" className="k-link-arrow">&rarr;</span>
            </Link>
          </p>
          <p className="k-legal-copy">&copy; 2026 KymrStudio</p>
        </footer>
      </main>

      <div className="grain" aria-hidden="true" />
    </div>
  );
}
