import { useEffect, useState } from "react";

// Used to pick ONE responsive variant to actually render. CSS `hidden` still
// leaves the inactive variant in the document, which duplicated every Archive
// control in the accessibility tree; conditional rendering removes it.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
