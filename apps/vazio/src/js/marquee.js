/* ============================================================
   ÓRBITA · marquee de depoimentos
   rAF autoral: trilha duplicada (largura medida uma vez +
   resize), velocidade constante, wrap por módulo — loop sem
   salto. Pausa em hover E focus-within. Drag por pointer
   events: ao soltar, a velocidade vira inércia que decai por
   lerp de volta ao drift. Reduced-motion: trilha estática com
   overflow-x nativo (CSS).
   ============================================================ */

import { prefersReducedMotion, lerp, rafLoop } from './motion.js';

const DRIFT_SPEED = 42; // px/s

export function initMarquee() {
  const root = document.getElementById('marquee');
  const track = document.getElementById('marquee-track');
  if (!root || !track) return;

  // Reduced-motion: CSS cuida (overflow-x: auto, sem clones)
  if (prefersReducedMotion()) return;

  // Trilha duplicada para o loop modular
  const originals = Array.from(track.children);
  originals.forEach((node) => {
    const clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let half = 0;
  const measure = () => {
    half = track.scrollWidth / 2;
  };
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure).catch(() => {});
  }

  let pos = 0;
  let vel = DRIFT_SPEED;
  let paused = false;
  let dragging = false;
  let lastX = 0;
  let lastT = 0;

  root.addEventListener('pointerenter', () => { if (!dragging) paused = true; });
  root.addEventListener('pointerleave', () => { paused = false; });
  root.addEventListener('focusin', () => { paused = true; });
  root.addEventListener('focusout', () => { paused = false; });

  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    paused = false;
    lastX = e.clientX;
    lastT = performance.now();
    track.setPointerCapture(e.pointerId);
    root.classList.add('is-dragging');
  });

  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max(1, now - lastT);
    pos -= dx;
    vel = (-dx / dt) * 1000; // px/s com sinal; vira inércia ao soltar
    lastX = e.clientX;
    lastT = now;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  let prev = performance.now();
  rafLoop((t) => {
    const dt = Math.min(0.05, (t - prev) / 1000);
    prev = t;
    if (!dragging) {
      vel = lerp(vel, DRIFT_SPEED, 0.04); // inércia → drift
      if (!paused) pos += vel * dt;
    }
    if (half > 0) {
      pos = ((pos % half) + half) % half; // wrap por módulo, sem salto
    }
    track.style.transform = `translate3d(${(-pos).toFixed(2)}px, 0, 0)`;
  });
}
