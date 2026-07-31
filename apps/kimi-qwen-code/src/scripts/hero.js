// hero.js — paralaxe de mouse por camadas + ripple dos botões
import { lerp, reducedMotion, isCoarsePointer, rafLoop } from './motion.js';

const hero = document.querySelector('.hero');

if (hero && !reducedMotion() && !isCoarsePointer()) {
  const layers = hero.querySelectorAll('[data-depth]');
  let tx = 0, ty = 0;   // alvo (-1..1)
  let cx = 0, cy = 0;   // atual (lerp)

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  rafLoop(() => {
    cx = lerp(cx, tx, 0.055);
    cy = lerp(cy, ty, 0.055);
    layers.forEach((el) => {
      const d = Number(el.dataset.depth) || 0;
      el.style.transform = `translate3d(${(-cx * d).toFixed(2)}px, ${(-cy * d).toFixed(2)}px, 0)`;
    });
  });
}
