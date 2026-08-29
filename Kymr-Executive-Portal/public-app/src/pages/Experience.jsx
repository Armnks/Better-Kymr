import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Background from "@/components/Background";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import OpeningScene from "@/components/scenes/v2/OpeningScene";
import StatementScene from "@/components/scenes/v2/StatementScene";
import ProtocolScene from "@/components/scenes/v2/ProtocolScene";
import ForcesScene from "@/components/scenes/v2/ForcesScene";
import VoidScene from "@/components/scenes/v2/VoidScene";
import ArchiveScene from "@/components/scenes/v2/ArchiveScene";
import InterludeScene from "@/components/scenes/v2/InterludeScene";
import FinalScene from "@/components/scenes/v2/FinalScene";
import ContactScene from "@/components/scenes/v2/ContactScene";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 700);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);

  const handleLoaded = () => {
    document.body.style.overflow = "";
    setLoaded(true);
    window.__lenis?.start();
    ScrollTrigger.refresh();
  };

  useEffect(() => {
    if (reduced) return undefined;
    const stirTo = gsap.quickTo(".atmo", "scale", { duration: 1.2, ease: "power2.out" });
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity());
        stirTo(1 + Math.min(v / 3000, 0.08));
        document.documentElement.style.setProperty(
          "--grain-o",
          (0.04 + Math.min(v / 9000, 0.05)).toFixed(3)
        );
      },
    });
    return () => st.kill();
  }, [reduced]);

  return (
    <div data-testid="kymr-experience" className="relative bg-void text-bone">
      {!loaded && <Preloader onDone={handleLoaded} />}
      <Background />
      <Cursor />
      <Nav />
      <main className="relative">
        <OpeningScene />
        <StatementScene />
        <ProtocolScene />
        <ForcesScene />
        <VoidScene />
        <ArchiveScene />
        <InterludeScene />
        <FinalScene />
        <ContactScene />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
