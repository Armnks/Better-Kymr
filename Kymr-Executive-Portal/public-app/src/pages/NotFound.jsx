import { Link, useNavigate } from "react-router-dom";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import useCanonical from "@/hooks/useCanonical";

export default function NotFound() {
  const navigate = useNavigate();
  useDocumentTitle("Frame not found \u2014 KymrStudio");
  // A SPA answers an unknown URL with 200 and a fully rendered page,
  // so nothing tells a crawler this is not real content. It also has
  // no canonical: a page asking not to be indexed should not be
  // nominating itself as the canonical version of anything.
  useCanonical(null, { noindex: true });
  return (
    <div data-testid="not-found-page" className="relative min-h-screen bg-void text-bone">
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10">
        <Link
          to="/"
          data-testid="not-found-logo"
          data-hover
          className="font-cinzel text-lg font-bold tracking-tight text-white"
        >
          KymrStudio<span className="text-ember">.</span>
        </Link>
      </header>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
        <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-ember" aria-hidden="true" />
        <h1 className="font-display text-[12vw] font-black leading-none tracking-tight text-bone md:text-[6vw]">
          FRAME NOT FOUND.
        </h1>
        <p className="max-w-md font-serif text-lg italic text-white/60 md:text-xl">
          this reel doesn't exist - the archive is back this way.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-10 font-mono text-[10px] tracking-[0.35em]">
          <Link
            to="/"
            data-testid="not-found-home-link"
            data-hover
            className="estimator-cta text-white/50 transition-colors duration-300 hover:text-white"
          >
            ← BACK TO THE FILM
          </Link>
          {/* This carried no handler at all: it rendered, it took hover,
              and clicking it did nothing. It goes where every other
              START on the site goes - the estimator at /start. */}
          <button
            type="button"
            data-testid="not-found-start-button"
            data-hover
            onClick={() => navigate("/start")}
            className="estimator-cta text-ember transition-colors duration-300 hover:text-white"
          >
            START ↗
          </button>
        </div>
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
