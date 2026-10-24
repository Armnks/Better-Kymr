import { useEffect } from "react";

/**
 * Give a route its own name in the browser tab and the history entry,
 * and hand the previous one back when the route unmounts. Passing null
 * leaves the document's own title alone, which is what the homepage
 * wants.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
