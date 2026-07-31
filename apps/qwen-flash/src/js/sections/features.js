/* ============================================================
   ÓRBITA — features: tilt 3D + glow spotlight seguindo o mouse
   ============================================================ */

import { reducedMotion } from '../utils.js';

export function initFeatures() {
  const cards = [...document.querySelectorAll('[data-feature]')];
  if (!cards.length) return;
  if (reducedMotion() || window.matchMedia('(hover: none)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${(-(ny - 0.5) * 10).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((nx - 0.5) * 12).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`);
    });
  });
}
