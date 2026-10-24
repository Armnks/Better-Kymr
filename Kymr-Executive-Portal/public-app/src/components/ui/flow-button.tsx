'use client';
import type { ComponentPropsWithoutRef } from 'react';
import { ArrowRight } from 'lucide-react';

// ============================================================
// FLOW BUTTON
//
// The supplied component with TWO changes, both of which are what it
// takes to mount it on a real page rather than in a preview. Every
// class string below - the geometry, the durations, the cubic-beziers,
// the arrow sweep, the expanding circle - is the original, untouched.
//
//   1. IT TAKES THE REST OF A BUTTON'S PROPS.
//      As supplied it accepts `text` and nothing else, so it can be
//      looked at but not used: every button on this site carries an
//      onClick, a type, and a data-testid, and several carry `disabled`
//      and `aria-busy`. Without the spread the component cannot replace
//      a single one of them.
//
//   2. IT TAKES A className, APPENDED.
//      Appended, never replacing: the original string still wins on
//      everything it sets, and the site adds its variant class after
//      it. That is how the two variants are themed - from index.css,
//      under `.k-flow--primary` / `.k-flow--ghost`, rather than by
//      editing the colours in here. The file ships light-mode
//      (`text-[#111111]` on a transparent ground); this site is carbon,
//      so the label would otherwise be invisible.
//
// The colours are NOT changed in this file. See "THE FLOW BUTTON" in
// index.css for what the site paints over them and why.
// ============================================================

export function FlowButton({
  text = "Modern Button",
  className = "",
  ...props
}: { text?: string } & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      {...props}
      className={`group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#333333]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95] ${className}`}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] stroke-[#111111] fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight
        className="absolute w-4 h-4 right-4 stroke-[#111111] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />
    </button>
  );
}
