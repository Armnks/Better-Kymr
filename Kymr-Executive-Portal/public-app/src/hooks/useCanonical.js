import { useEffect } from "react";

// ============================================================
// CANONICAL URL
//
// Eight routes render the same homepage: /, /work, /services, /studio,
// /inquiry, and the three legacy aliases /capabilities, /process and
// /contact. That is deliberate - every chapter has a real destination
// that lands on its own section rather than duplicating the page at a
// second URL - but to a crawler it is one document served at eight
// addresses, which splits its ranking signals eight ways.
//
// A canonical link says which address is the real one. Chapter routes
// point at "/", because that is the document they are. A dossier is
// genuinely its own page and is its own canonical.
//
// The origin is fixed rather than read from window.location so that a
// preview or staging deployment cannot declare itself canonical and
// invite a crawler to index it in place of production. Override with
// REACT_APP_SITE_URL if the production domain ever changes.
// ============================================================
export const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://kymrstudio.com").replace(/\/$/, "");

/**
 * @param {string|null} path  Path this page should be indexed as, e.g. "/"
 *                            or "/work/the-hour-before". Pass null to
 *                            publish no canonical at all.
 * @param {boolean}     noindex  Ask crawlers to leave this page out. A SPA
 *                            answers unknown URLs with 200 and a rendered
 *                            page, so the 404 needs to say so in a tag.
 */
export default function useCanonical(path, { noindex = false } = {}) {
  useEffect(() => {
    let link = null;
    if (path) {
      link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", SITE_URL + path);
    }

    let robots = null;
    if (noindex) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      robots.setAttribute("content", "noindex, follow");
      document.head.appendChild(robots);
    }

    return () => {
      if (link) link.remove();
      if (robots) robots.remove();
    };
  }, [path, noindex]);
}
