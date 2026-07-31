import { createTiltCards } from "../components/tilt-card";

let initialized = false;

export function initFeatures(): void {
  if (initialized) return;

  const grid = document.querySelector<HTMLElement>(".features__grid");
  if (!grid) return;

  const cards = Array.from(
    grid.querySelectorAll<HTMLElement>(".feature-card[data-reveal]")
  );

  initialized = true;

  createTiltCards(grid);

  for (const [index, card] of cards.entries()) {
    card.dataset.revealDelay = String(index * 80);
  }
}
