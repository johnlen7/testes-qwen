/** Features · tilt 3D + glow que segue o cursor + entrada por scroll. */

import {
  hasFinePointer,
  observeReveal,
  prefersReducedMotion,
} from "../lib/motion";

export function initFeatures(): void {
  const cards = Array.from(
    document.querySelectorAll<HTMLElement>(".feature-card")
  );

  // entrada por scroll
  cards.forEach((c) => c.classList.add("io-reveal"));
  if (prefersReducedMotion()) {
    cards.forEach((c) => c.classList.add("is-in"));
  } else {
    observeReveal(cards);
  }

  // tilt só em ponteiro fino e com movimento permitido
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const MAX = 8; // graus

  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * MAX * 2;
      const ry = (px - 0.5) * MAX * 2;
      card.style.transform = `perspective(700px) rotateX(${rx.toFixed(
        2
      )}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}
