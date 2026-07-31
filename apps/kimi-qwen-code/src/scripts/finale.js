// finale.js — CTA final: estado do configurador + botão magnético
import {
  store, fmtBRL, paintProduct,
  lerp, reducedMotion, isCoarsePointer, rafLoop,
} from './motion.js';

const finale = document.querySelector('.finale');

if (finale) {
  const svg = finale.querySelector('.orbita-svg');
  const label = finale.querySelector('[data-finale-label]');
  const cta = finale.querySelector('[data-finale-cta]');

  function render() {
    const s = store.snapshot();
    paintProduct(svg, s.cor);
    label.textContent = `Comprar ÓRBITA — ${s.corNome} · ${fmtBRL.format(s.preco)}`;
  }
  render();
  addEventListener('orbita:config', render);

  // ---- botão magnético: o botão é atraído pelo cursor num raio curto ----
  if (!reducedMotion() && !isCoarsePointer()) {
    const inner = cta.querySelector('span');
    let tx = 0, ty = 0, cx = 0, cy = 0;

    finale.addEventListener('pointermove', (e) => {
      const r = cta.getBoundingClientRect();
      const bx = r.left + r.width / 2;
      const by = r.top + r.height / 2;
      const dx = e.clientX - bx;
      const dy = e.clientY - by;
      const dist = Math.hypot(dx, dy);
      const raio = 140;
      if (dist < raio) {
        const forca = (1 - dist / raio) * 14;
        tx = (dx / dist) * forca;
        ty = (dy / dist) * forca;
      } else {
        tx = 0; ty = 0;
      }
    });
    finale.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

    rafLoop(() => {
      cx = lerp(cx, tx, 0.12);
      cy = lerp(cy, ty, 0.12);
      cta.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      inner.style.transform = `translate(${(cx * 0.35).toFixed(2)}px, ${(cy * 0.35).toFixed(2)}px)`;
    });
  }
}
