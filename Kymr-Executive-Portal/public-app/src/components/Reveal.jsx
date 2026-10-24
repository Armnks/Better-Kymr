import { motion, useReducedMotion } from "framer-motion";

// ============================================================
// REVEAL - the site's one entrance grammar, on framer-motion.
//
// Keeps the previous prop API (`as`, `delay`, `wipe`) so every
// chapter kept working through the swap off IntersectionObserver.
//
// `amount: 0` matters: a wipe starts clipped to a sliver, and any
// fractional threshold would mean an element the viewport jumped
// clean past could never satisfy it and would stay closed. Paired
// with `once`, so reverse scrolling never re-plays anything.
// ============================================================
const TAGS = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  li: motion.li,
  ul: motion.ul,
  ol: motion.ol,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  section: motion.section,
  figure: motion.figure,
};

const EASE = [0.22, 1, 0.36, 1];

export default function Reveal({
  as = "div",
  delay = 0,
  wipe = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as] ?? motion.div;

  // Under reduced motion the composition is simply complete: no
  // opacity ramp, no wipe, nothing to wait for.
  if (reduce) {
    return (
      <Tag className={className} style={style} {...rest}>
        {children}
      </Tag>
    );
  }

  const closed = wipe ? { clipPath: "inset(0 100% 0 0)" } : { opacity: 0, y: 12 };
  const open = wipe ? { clipPath: "inset(0 0% 0 0)" } : { opacity: 1, y: 0 };

  return (
    <Tag
      className={className}
      style={style}
      initial={closed}
      whileInView={open}
      viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.72, delay: delay / 1000, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
