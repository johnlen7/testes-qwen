/* ============================================================
   ÓRBITA — CTA final: produto na cor escolhida + botão magnético
   + ripple + feedback de compra simulado
   ============================================================ */

import { mountHeadphones, setProductColors } from '../headphones.js';
import { COLORS, EQ_MODES, totalPrice, formatBRL, subscribe, getState } from '../store.js';
import { reducedMotion, lerp, gatedLoop } from '../utils.js';

export function initCta() {
  const visual = document.querySelector('[data-cta-visual]');
  if (!visual) return;

  const product = visual.querySelector('[data-cta-product]');
  const halo = visual.querySelector('[data-cta-halo]');
  // botão e live region vivem no bloco de copy, fora do visual
  const buy = document.querySelector('[data-cta-buy]');
  const label = document.querySelector('[data-cta-buy-label]');
  const status = document.querySelector('[data-cta-status]');
  if (!product || !buy || !label) return;

  const svg = mountHeadphones(product, COLORS.grafite);

  let simTimer = 0;

  function render() {
    // qualquer feedback simulado em curso é cancelado quando o estado muda
    clearTimeout(simTimer);
    const { color, eq, pro } = getState();
    const colors = { ...COLORS[color], ring: EQ_MODES[eq].led };
    setProductColors(svg, colors);
    const total = totalPrice();
    label.textContent = `Comprar agora — R$ ${formatBRL(total)}${pro ? ' · Pro' : ''}`;
  }

  subscribe(render);
  render();

  /* ---- botão magnético: segue o cursor com mola ---- */
  if (!reducedMotion() && window.matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;

    buy.addEventListener('mousemove', (e) => {
      const r = buy.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
      tx = nx * 10;
      ty = ny * 8;
    });

    buy.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
    });

    gatedLoop(() => {
      cx = lerp(cx, tx, 0.12);
      cy = lerp(cy, ty, 0.12);
      if (Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
        buy.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      } else {
        buy.style.transform = 'none';
      }
    }, buy, 1.2);
  }

  /* ---- ripple no clique + compra simulada ---- */
  buy.addEventListener('click', (e) => {
    const r = buy.getBoundingClientRect();
    buy.style.setProperty('--ripple-x', `${e.clientX - r.left}px`);
    buy.style.setProperty('--ripple-y', `${e.clientY - r.top}px`);
    buy.classList.remove('is-rippling');
    void buy.offsetWidth;
    buy.classList.add('is-rippling');
    setTimeout(() => buy.classList.remove('is-rippling'), 700);

    // anúncio em live region dedicada (não no próprio botão)
    if (status) status.textContent = 'Pedido simulado com sucesso. Obrigado!';
    clearTimeout(simTimer);
    label.textContent = '✓ Pedido simulado — obrigado!';
    simTimer = setTimeout(() => {
      if (status) status.textContent = '';
      render();
    }, 2200);
  });

  /* ---- halo acompanha o produto com leve deriva ---- */
  if (!reducedMotion()) {
    let t = 0;
    gatedLoop(() => {
      t += 0.004;
      halo.style.transform = `translate3d(${Math.sin(t * 1.3) * 10}px, ${Math.cos(t * 1.1) * 8}px, 0)`;
    }, visual, 1.5);
  }
}
