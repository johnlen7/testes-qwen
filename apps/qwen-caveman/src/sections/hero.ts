/** Hero · paralaxe suave que reage ao mouse (desktop). */

import { hasFinePointer, prefersReducedMotion, rafLoop, lerp } from "../lib/motion";

export function initHero(): void {
  const stage = document.querySelector<HTMLElement>("[data-parallax]");
  const glow = document.querySelector<HTMLElement>(".hero-glow");
  if (!stage || !hasFinePointer() || prefersReducedMotion()) return;

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  window.addEventListener("pointermove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    tx = nx * 26;
    ty = ny * 20;
  });

  rafLoop((dt) => {
    const t = 1 - Math.pow(0.86, dt); // suavização independente de fps
    cx = lerp(cx, tx, t);
    cy = lerp(cy, ty, t);
    stage.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (glow) {
      glow.style.transform = `translate3d(${cx * -0.6}px, ${cy * -0.6}px, 0)`;
    }
  });
}
