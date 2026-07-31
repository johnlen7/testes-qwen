// marquee.js — carrossel infinito autoral:
// loop contínuo sem salto (wrap por módulo), pausa em hover/focus,
// drag por pointer events com inércia.
import { reducedMotion, rafLoop } from './motion.js';

const marquee = document.querySelector('[data-marquee]');

if (marquee && !reducedMotion()) {
  const track = marquee.querySelector('.marquee__track');
  const group = marquee.querySelector('.marquee__group');

  let width = group.offsetWidth;
  addEventListener('resize', () => { width = group.offsetWidth; });

  let pos = 0;
  let dragging = false;
  let hovering = false;
  let vel = 0;
  let lastX = 0;
  let lastT = 0;
  let idleAt = 0;

  const SPEED = 36; // px/s

  marquee.addEventListener('pointerenter', () => { hovering = true; });
  marquee.addEventListener('pointerleave', () => { hovering = false; });
  marquee.addEventListener('focusin', () => { hovering = true; });
  marquee.addEventListener('focusout', () => { hovering = false; });

  marquee.addEventListener('pointerdown', (e) => {
    dragging = true;
    vel = 0;
    lastX = e.clientX;
    lastT = performance.now();
    marquee.classList.add('is-dragging');
    marquee.setPointerCapture(e.pointerId);
  });

  marquee.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    pos -= dx;
    vel = (dx / Math.max(now - lastT, 1)) * 1000; // px/s
    lastX = e.clientX;
    lastT = now;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    idleAt = performance.now() + 1400; // retoma o auto-scroll depois de um respiro
    marquee.classList.remove('is-dragging');
  };
  marquee.addEventListener('pointerup', endDrag);
  marquee.addEventListener('pointercancel', endDrag);

  // impede que o drag selecione texto / arraste links
  marquee.addEventListener('dragstart', (e) => e.preventDefault());

  let prev = performance.now();
  rafLoop((now) => {
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;

    if (!dragging) {
      // inércia pós-drag
      if (Math.abs(vel) > 8) {
        pos -= vel * dt;
        vel *= Math.pow(0.06, dt); // atrito
      } else if (!hovering && now > idleAt) {
        pos += SPEED * dt;
      }
    }

    // wrap sem salto: o grupo 2 é cópia exata do grupo 1
    if (width > 0) {
      const x = -(((pos % width) + width) % width);
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    }
  });
}
