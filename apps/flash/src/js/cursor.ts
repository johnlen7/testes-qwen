/* ============================================================
   cursor — follower orbital (desktop, pointer:fine, RM-safe)
   Anel em atraso atrás do ponto; expande sobre interativos.
   ============================================================ */

import { addFrame, removeFrame, RM, FINE_POINTER, clamp } from './motion';

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, [data-hover]';

export function initCursor() {
  if (RM || !FINE_POINTER) return;
  const root = document.querySelector<HTMLElement>('.cursor');
  const ring = root?.querySelector<HTMLElement>('.cursor-ring');
  const dot = root?.querySelector<HTMLElement>('.cursor-dot');
  if (!root || !ring || !dot) return;

  let x = -100, y = -100;       // posição do pointer
  let rx = -100, ry = -100;     // posição atual do anel (lerp)
  let onTarget = false;
  let visible = false;

  const onMove = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
    if (!visible) {
      visible = true;
      root.classList.add('is-active');
      rx = x;
      ry = y;
    }
  };
  const onOver = (e: Event) => {
    const t = e.target as Element | null;
    onTarget = !!t?.closest(INTERACTIVE);
    root.classList.toggle('is-target', onTarget);
  };
  const onLeave = () => {
    visible = false;
    root.classList.remove('is-active', 'is-target');
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerover', onOver, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  const halfRing = ring.offsetWidth / 2;
  const onFrame = (_: number, dt: number) => {
    if (!visible) return;
    const k = clamp(dt / 90, 0, 1); // anel com atraso
    rx += (x - rx) * k * 0.55;
    ry += (y - ry) * k * 0.55;
    ring.style.transform = `translate(${rx - halfRing}px, ${ry - halfRing}px)`;
    dot.style.transform = `translate(${x - 2.5}px, ${y - 2.5}px)`;
  };
  addFrame(onFrame);

  window.addEventListener('pagehide', () => removeFrame(onFrame));
}
