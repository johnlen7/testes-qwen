/* ============================================================
   ÓRBITA · configurador (#personalizar)
   Produto recolorido via CSS vars (transição de fill/stroke
   300ms já definida no CSS), swatches radiogroup, tamanho de
   concha M/G com escala do SVG, preço com count-up rAF +
   easing spring, CTA refletindo o estado da store.
   ============================================================ */

import { clamp, easeSpring } from './motion.js';
import { renderProduct } from './product.js';
import {
  COLORS,
  SIZES,
  getColor,
  getSize,
  getState,
  setCor,
  setConcha,
  subscribe,
  formatPrice,
  ctaLabel
} from './store.js';

const COUNTUP_MS = 600;

export function initConfigurator() {
  const root = document.getElementById('personalizar');
  if (!root) return;

  const productWrap = document.getElementById('config-product');
  const swatchGroup = document.getElementById('config-swatches');
  const sizeGroup = document.getElementById('config-sizes');
  const colorName = document.getElementById('config-color-name');
  const sizeSpec = document.getElementById('config-size-spec');
  const priceEl = document.getElementById('config-price');
  const cta = document.getElementById('config-cta');
  if (!productWrap || !swatchGroup || !sizeGroup) return;

  productWrap.innerHTML = renderProduct();

  // --- Swatches de cor (radiogroup) ---
  COLORS.forEach((color) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', `Cor ${color.name}`);
    btn.dataset.cor = color.id;
    btn.style.setProperty('--sw', color.shell);
    btn.addEventListener('click', () => setCor(color.id));
    swatchGroup.appendChild(btn);
  });

  // --- Tamanho de concha (radiogroup) ---
  SIZES.forEach((size) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size-pill';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', size.spec);
    btn.dataset.size = size.id;
    btn.textContent = size.name;
    btn.addEventListener('click', () => setConcha(size.id));
    sizeGroup.appendChild(btn);
  });

  // Setas ← → navegam entre as opções de um radiogroup
  [swatchGroup, sizeGroup].forEach((group) => {
    group.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const options = Array.from(group.querySelectorAll('[role="radio"]'));
      const current = options.indexOf(document.activeElement);
      if (current === -1) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = options[(current + dir + options.length) % options.length];
      next.focus();
      next.click();
    });
  });

  // --- Count-up do preço (rAF + easing spring, com overshoot) ---
  let displayed = getState().preco;
  let rafId = 0;

  function animatePrice(target) {
    cancelAnimationFrame(rafId);
    const from = displayed;
    if (from === target) {
      priceEl.textContent = formatPrice(target);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / COUNTUP_MS, 0, 1);
      displayed = Math.round(from + (target - from) * easeSpring(t));
      priceEl.textContent = formatPrice(displayed);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        displayed = target;
        priceEl.textContent = formatPrice(target);
      }
    };
    rafId = requestAnimationFrame(tick);
  }

  // --- Render reativo ao estado da store ---
  function render(state) {
    const color = getColor(state.cor);
    const size = getSize(state.concha);

    productWrap.style.setProperty('--product-shell', color.shell);
    productWrap.style.setProperty('--product-shell-dark', color.shellDark);
    productWrap.style.setProperty('--product-band', color.band);
    productWrap.style.setProperty('--product-cushion', color.cushion);
    productWrap.style.setProperty('--product-hair', color.hair);
    productWrap.style.transform = `scale(${size.scale})`;

    if (colorName) colorName.textContent = color.name;
    if (sizeSpec) sizeSpec.textContent = size.spec;

    swatchGroup.querySelectorAll('.swatch').forEach((btn) => {
      btn.setAttribute('aria-checked', String(btn.dataset.cor === state.cor));
    });
    sizeGroup.querySelectorAll('.size-pill').forEach((btn) => {
      btn.setAttribute('aria-checked', String(btn.dataset.size === state.concha));
    });

    animatePrice(state.preco);
    if (cta) cta.textContent = ctaLabel(state);
  }

  subscribe(render);
  render(getState());
}
