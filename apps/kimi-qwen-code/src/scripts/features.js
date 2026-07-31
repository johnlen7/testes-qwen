// features.js — tilt 3D + glow que segue o cursor (rAF, sem layout)
import { lerp, reducedMotion, isCoarsePointer } from './motion.js';

const cards = document.querySelectorAll('.features__card');

if (cards.length && !reducedMotion() && !isCoarsePointer()) {
  cards.forEach((card) => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let hovering = false;
    let rafId = null;

    const tick = () => {
      cx = lerp(cx, tx, 0.14);
      cy = lerp(cy, ty, 0.14);
      card.style.transform =
        `perspective(800px) rotateX(${(-cy * 5).toFixed(2)}deg) rotateY(${(cx * 7).toFixed(2)}deg) translateY(-4px)`;
      if (hovering || Math.abs(cx) > 0.002 || Math.abs(cy) > 0.002) {
        rafId = requestAnimationFrame(tick);
      } else {
        card.style.transform = '';
        rafId = null;
      }
    };

    card.addEventListener('pointerenter', () => {
      hovering = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      card.style.setProperty('--gx', `${e.clientX - r.left}px`);
      card.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
    card.addEventListener('pointerleave', () => {
      hovering = false;
      tx = 0; ty = 0;
    });
  });
}
