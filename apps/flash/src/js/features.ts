/* ============================================================
   features — tilt 3D + glow guiado pelo mouse (desktop)
   ============================================================ */

import { addFrame, RM, FINE_POINTER } from './motion';

interface TiltState {
  tx: number;
  ty: number;
  cx: number;
  cy: number;
}

export function initFeatures() {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-tilt]')];
  if (RM || !FINE_POINTER) return;

  const states = new Map<HTMLElement, TiltState>();

  cards.forEach((card) => {
    const st: TiltState = { tx: 0, ty: 0, cx: 0, cy: 0 };
    states.set(card, st);

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      st.tx = (e.clientX - rect.left) / rect.width - 0.5;
      st.ty = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--mx-px', `${e.clientX - rect.left}px`);
      card.style.setProperty('--my-px', `${e.clientY - rect.top}px`);
    });
    card.addEventListener('pointerleave', () => {
      st.tx = 0;
      st.ty = 0;
    });
  });

  addFrame(() => {
    states.forEach((st, card) => {
      st.cx += (st.tx - st.cx) * 0.12;
      st.cy += (st.ty - st.cy) * 0.12;
      card.style.setProperty('--mx', st.cx.toFixed(3));
      card.style.setProperty('--my', st.cy.toFixed(3));
    });
  });
}
