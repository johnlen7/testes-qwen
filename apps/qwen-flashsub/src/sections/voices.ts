import { createMarquee } from "../components/marquee";

let initialized = false;

export function initVoices(): void {
  if (initialized) return;

  const viewport = document.getElementById("voices-marquee");
  if (!viewport) return;

  initialized = true;

  createMarquee(viewport);
}
