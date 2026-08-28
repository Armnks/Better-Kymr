import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Background from "@/components/Background";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import HeroScene from "@/components/scenes/HeroScene";
import ProcessScene from "@/components/scenes/ProcessScene";
import CapabilitiesScene from "@/components/scenes/CapabilitiesScene";
import AnticipationScene from "@/components/scenes/AnticipationScene";
import BuildScene from "@/components/scenes/BuildScene";
import FinaleScene from "@/components/scenes/FinaleScene";
import ContactScene from "@/components/scenes/ContactScene";

export default function Experience() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 600);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh);
    }
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <div data-testid="kymr-experience" className="relative bg-void text-bone">
      <Background />
      <Cursor />
      <Nav />
      <main className="relative">
        <HeroScene />
        <ProcessScene />
        <CapabilitiesScene />
        <AnticipationScene />
        <BuildScene />
        <FinaleScene />
        <ContactScene />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
