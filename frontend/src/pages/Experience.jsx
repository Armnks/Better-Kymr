import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Background from "@/components/Background";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import OriginScene from "@/components/scenes/v2/OriginScene";
import ExpansionScene from "@/components/scenes/v2/ExpansionScene";
import StatementScene from "@/components/scenes/v2/StatementScene";
import ProtocolScene from "@/components/scenes/v2/ProtocolScene";
import ForcesScene from "@/components/scenes/v2/ForcesScene";
import VoidScene from "@/components/scenes/v2/VoidScene";
import ArchiveScene from "@/components/scenes/v2/ArchiveScene";
import FinalScene from "@/components/scenes/v2/FinalScene";
import ContactScene from "@/components/scenes/ContactScene";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const reduced = useReducedMotion();

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
      <Background />
      <Cursor />
      <Nav />
      <main className="relative">
        <OriginScene />
        <ExpansionScene />
        <StatementScene />
        <ProtocolScene />
        <ForcesScene />
        <VoidScene />
        <ArchiveScene />
        <FinalScene />
        <ContactScene />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
