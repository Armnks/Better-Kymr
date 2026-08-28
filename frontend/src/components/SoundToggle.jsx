import { useEffect, useState } from "react";
import { startAmbient, stopAmbient, swellAmbient } from "@/utils/ambient";

export default function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("kymr-sound") !== "on") return undefined;
    const arm = () => {
      startAmbient();
      setOn(true);
    };
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  useEffect(() => {
    if (!on) return undefined;
    const onState = () => swellAmbient();
    window.addEventListener("kymr:state", onState);
    return () => window.removeEventListener("kymr:state", onState);
  }, [on]);

  const toggle = () => {
    if (on) {
      stopAmbient();
      setOn(false);
      localStorage.setItem("kymr-sound", "off");
    } else {
      startAmbient();
      setOn(true);
      localStorage.setItem("kymr-sound", "on");
    }
  };

  return (
    <button
      data-testid="sound-toggle"
      data-hover
      aria-pressed={on}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      onClick={toggle}
      className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-white/70 transition-colors duration-300 hover:text-white"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
          on ? "bg-ember" : "bg-white/30"
        }`}
      />
      <span className="hidden sm:inline">{on ? "SOUND ON" : "SOUND OFF"}</span>
    </button>
  );
}
