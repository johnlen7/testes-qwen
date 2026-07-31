/* ============================================================
   ÓRBITA · CTA final (#comprar)
   Produto renderizado na cor escolhida no configurador
   (subscribe na store). Botão magnético: integrador de mola
   (spring) em direção ao cursor, só pointer:fine. Ripple
   autoral em clip-path: circle() a partir do ponto de clique
   via WAAPI.
   ============================================================ */

import { prefersReducedMotion, hasFinePointer, rafLoop } from './motion.js';
import { renderProduct } from './product.js';
import { subscribe, getState, getColor, ctaLabel } from './store.js';

export function initCta() {
  const root = document.getElementById('comprar');
  if (!root) return;

  const productWrap = document.getElementById('cta-product');
  const btn = document.getElementById('cta-buy');
  const label = btn ? btn.querySelector('.cta-buy-label') : null;

  if (productWrap) productWrap.innerHTML = renderProduct();

  // Reflete o estado do configurador (cor + preço)
  function render(state) {
    const color = getColor(state.cor);
    if (productWrap) {
      productWrap.style.setProperty('--product-shell', color.shell);
      productWrap.style.setProperty('--product-shell-dark', color.shellDark);
      productWrap.style.setProperty('--product-band', color.band);
      productWrap.style.setProperty('--product-cushion', color.cushion);
      productWrap.style.setProperty('--product-hair', color.hair);
    }
    if (label) label.textContent = ctaLabel(state);
  }

  subscribe(render);
  render(getState()); // estado inicial, mesmo sem interação

  if (!btn) return;

  // --- Magnético: integrador de mola (overshoot natural no release) ---
  if (hasFinePointer() && !prefersReducedMotion()) {
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    const STIFFNESS = 0.14;
    const DAMPING = 0.72;
    const PULL_X = 0.35;
    const PULL_Y = 0.45;

    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      targetX = (e.clientX - (rect.left + rect.width / 2)) * PULL_X;
      targetY = (e.clientY - (rect.top + rect.height / 2)) * PULL_Y;
    });
    btn.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });

    rafLoop(() => {
      vx = (vx + (targetX - x) * STIFFNESS) * DAMPING;
      vy = (vy + (targetY - y) * STIFFNESS) * DAMPING;
      x += vx;
      y += vy;
      if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05 && targetX === 0 && targetY === 0) {
        if (btn.style.transform !== '') btn.style.transform = '';
        return;
      }
      btn.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });
  }

  // --- Ripple em clip-path a partir do ponto de clique ---
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const radius = Math.hypot(
      Math.max(px, rect.width - px),
      Math.max(py, rect.height - py)
    );

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.setAttribute('aria-hidden', 'true');
    btn.appendChild(ripple);

    const anim = ripple.animate(
      [
        { clipPath: `circle(0px at ${px}px ${py}px)`, opacity: 0.35 },
        { clipPath: `circle(${radius}px at ${px}px ${py}px)`, opacity: 0 }
      ],
      { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }
    );
    anim.onfinish = () => ripple.remove();
  });
}
