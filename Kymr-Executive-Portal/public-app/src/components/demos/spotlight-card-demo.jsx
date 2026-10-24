import { GlowCard } from "@/components/ui/spotlight-card";
import { Radar, Waves, Orbit } from "lucide-react";

// ============================================================
// SPOTLIGHT CARD - DEMO
//
// Three panels sharing one light source. The gradient behind each
// card is background-attachment: fixed, so the highlight is anchored
// to the viewport rather than to the card: moving the pointer across
// the row lights them in sequence, as one surface rather than three
// independent hovers.
//
// Each card carries a real image, an icon and a label, because an
// empty GlowCard shows the effect but not what the component is for.
// ============================================================
const CARDS = [
  {
    icon: Radar,
    glowColor: "blue",
    title: "Signal",
    body: "What the work has to beat, stated before anything is made.",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    alt: "A network of light traced across a dark globe.",
  },
  {
    icon: Waves,
    glowColor: "orange",
    title: "System",
    body: "One idea, developed into every cut the platforms ask for.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    alt: "A circuit board photographed close, in shallow focus.",
  },
  {
    icon: Orbit,
    glowColor: "purple",
    title: "Return",
    body: "What ran, what held attention, and what the next brief owes it.",
    img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    alt: "Low fog moving through a stand of dark pines.",
  },
];

export function SpotlightCardDemo() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-neutral-950 px-6 py-16 md:flex-row">
      {CARDS.map(({ icon: Icon, glowColor, title, body, img, alt }) => (
        <GlowCard key={title} glowColor={glowColor} size="lg">
          {/* the image fills the upper row of the card's 1fr/auto grid */}
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={img}
              alt={alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            />
            <Icon
              aria-hidden="true"
              strokeWidth={1.5}
              className="absolute left-3 top-3 h-5 w-5 text-white/90"
            />
          </div>

          <div>
            <h3 className="m-0 text-base font-semibold tracking-tight text-white">{title}</h3>
            <p className="m-0 mt-1 text-sm leading-relaxed text-neutral-400">{body}</p>
          </div>
        </GlowCard>
      ))}
    </div>
  );
}

export default SpotlightCardDemo;
