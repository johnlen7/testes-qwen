/* ============================================================
   cta — fechamento: estado compartilhado + botão magnético
   ============================================================ */

import { addFrame, animateValue, easeOutExpo, clamp, RM, FINE_POINTER } from './motion';
import { getState, getPrice, subscribe, fmtPrice, fmtInstallment, COLORWAY_INFO, MODE_INFO } from './store';
import type { HPInstance } from './headphone';
import { showToast } from './toast';

export function initCta(hp: HPInstance) {
  const label = document.getElementById('finale-cta-label')!;
  const price = document.getElementById('finale-price')!;
  const inst = document.getElementById('finale-installment')!;
  const btn = document.getElementById('finale-cta') as HTMLButtonElement | null;

  const render = () => {
    const { colorway, mode } = getState();
    hp.setColorway(colorway, false);
    hp.setMode(mode);
    label.textContent = `Garantir o meu — ${COLORWAY_INFO[colorway].name} · ${MODE_INFO[mode].name}`;
    animateValue(0, getPrice(), 500, (v) => {
      price.textContent = fmtPrice(v);
      inst.textContent = fmtInstallment(v / 12);
    }, easeOutExpo);
  };
  subscribe(render);
  render();

  // ---------- botão magnético ----------
  if (btn && !RM && FINE_POINTER) {
    const rect = () => btn.getBoundingClientRect();
    let tx = 0, ty = 0, cx = 0, cy = 0;
    btn.addEventListener('pointermove', (e) => {
      const r = rect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.16, -13, 13);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.24, -9, 9);
    });
    btn.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
    });
    addFrame(() => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      if (Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        btn.style.transform = '';
        return;
      }
      btn.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
    });
  }

  btn?.addEventListener('click', () => {
    showToast('Pré-pedido registrado — te avisamos em outubro.');
  });
}
