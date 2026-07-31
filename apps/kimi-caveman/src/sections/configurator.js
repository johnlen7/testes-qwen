import './configurator.css';
import { renderProduct, PRODUCT_COLORS } from '../lib/product.js';
import {
  COLOR_MAP,
  COLOR_NAMES,
  SIZE_NAMES,
  get as getState,
  set as setState,
  subscribe,
  priceOf,
  labelOf,
  formatBRL
} from '../lib/store.js';
import { reducedMotion } from '../lib/motion.js';
import { observeReveal } from '../lib/reveal.js';

const SPECS = {
  p: '248 g · driver 40 mm',
  m: '254 g · driver 42 mm',
  g: '266 g · driver 45 mm'
};

const SIZE_KEYS = ['p', 'm', 'g'];
const COLOR_KEYS = Object.keys(COLOR_MAP);

function sizeScale(size) {
  return size === 'p' ? 0.9 : size === 'g' ? 1.12 : 1;
}

function setProductColorVars(wrap, color) {
  const hex = COLOR_MAP[color];
  wrap.style.setProperty('--product-shell', hex);
  wrap.style.setProperty('--product-shade', PRODUCT_COLORS.shade(hex));
  wrap.style.setProperty('--product-highlight', PRODUCT_COLORS.highlight(hex));
}

function setCupScale(wrap, size) {
  wrap.style.setProperty('--cfg-cup-scale', String(sizeScale(size)));
}

function renderDigits(price) {
  const formatted = price.toLocaleString('pt-BR');
  return formatted
    .split('')
    .map((char) => {
      if (char === '.' || char === ',') {
        return `<span class="cfg-digit-sep" aria-hidden="true">${char}</span>`;
      }
      return `<div class="cfg-digit-col" aria-hidden="true" style="--digit:${char}">
          ${Array.from({ length: 10 }, (_, i) => `<span class="cfg-digit">${i}</span>`).join('')}
        </div>`;
    })
    .join('');
}

function updateDigits(digitsEl, price) {
  const cols = digitsEl.querySelectorAll('.cfg-digit-col');
  const chars = String(price).replace(/\D/g, '').split('');
  cols.forEach((col, i) => {
    col.style.setProperty('--digit', chars[i] ?? '0');
  });
}

function animateTextChange(el, nextText) {
  if (el.textContent === nextText) return;
  if (reducedMotion()) {
    el.textContent = nextText;
    return;
  }
  el.classList.add('is-changing');
  const anim = el.animate(
    [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-6px)', offset: 0.45 },
      { opacity: 0, transform: 'translateY(6px)', offset: 0.55 },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    { duration: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  );
  anim.onfinish = () => {
    el.textContent = nextText;
    el.classList.remove('is-changing');
  };
}

function createRipple(button, event) {
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const ripple = document.createElement('span');
  ripple.className = 'cfg-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  button.appendChild(ripple);

  const anim = ripple.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.45 },
      { transform: 'translate(-50%, -50%) scale(2.6)', opacity: 0 }
    ],
    { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  );
  anim.onfinish = () => ripple.remove();
}

export function initConfigurator(el) {
  if (!el) return;

  el.innerHTML = `
    <div class="container cfg-layout">
      <header class="cfg-header" data-reveal="0">
        <span class="mono cfg-eyebrow">SYS.02 — CONFIGURADOR</span>
        <h2 id="cfg-title" class="cfg-title">Monte o seu ÓRBITA</h2>
        <p class="cfg-lead">Escolha o acabamento e o tamanho da concha. O preço recalcula em tempo real.</p>
      </header>

      <div class="cfg-visual" data-reveal="1">
        <div class="cfg-rings" aria-hidden="true">
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="cfg-rings-svg">
            <circle class="cfg-ring cfg-ring--1" cx="200" cy="200" r="160" />
            <circle class="cfg-ring cfg-ring--2" cx="200" cy="200" r="130" />
            <circle class="cfg-ring cfg-ring--3" cx="200" cy="200" r="100" />
          </svg>
        </div>
        <div class="cfg-product-wrap" id="cfg-product-wrap" role="img" aria-label="Fone de ouvido ÓRBITA renderizado no configurador"></div>
      </div>

      <div class="cfg-controls" data-reveal="2">
        <div class="cfg-field">
          <span class="cfg-label mono" id="cfg-color-label">Cor do acabamento</span>
          <div class="cfg-swatches" role="group" aria-labelledby="cfg-color-label">
            ${COLOR_KEYS.map(
              (key) => `
                <button
                  type="button"
                  class="cfg-swatch"
                  data-color="${key}"
                  aria-pressed="false"
                  aria-label="${COLOR_NAMES[key]}"
                  style="background-color: ${COLOR_MAP[key]}"
                >
                  <span class="visually-hidden">${COLOR_NAMES[key]}</span>
                </button>
              `
            ).join('')}
          </div>
        </div>

        <div class="cfg-field">
          <span class="cfg-label mono" id="cfg-size-label">Tamanho da concha</span>
          <div class="cfg-segmented" role="radiogroup" aria-labelledby="cfg-size-label">
            ${SIZE_KEYS.map(
              (key) => `
                <button
                  type="button"
                  class="cfg-segment"
                  data-size="${key}"
                  role="radio"
                  aria-checked="false"
                >
                  ${SIZE_NAMES[key].replace('Concha ', '')}
                </button>
              `
            ).join('')}
          </div>
        </div>

        <div class="cfg-readout" aria-live="polite">
          <span class="mono cfg-specs" id="cfg-specs"></span>
        </div>

        <div class="cfg-price" aria-live="polite">
          <span class="cfg-currency mono">R$</span>
          <div class="cfg-digits" id="cfg-digits" aria-label="Preço atual"></div>
        </div>

        <button type="button" class="cfg-cta" id="cfg-cta">
          <span class="cfg-cta-text" id="cfg-cta-text"></span>
        </button>
      </div>
    </div>

    <div class="cfg-toast" id="cfg-toast" role="status" aria-live="polite">
      Produto fictício — desafio frontend
    </div>
  `;

  const wrap = el.querySelector('#cfg-product-wrap');
  const digitsEl = el.querySelector('#cfg-digits');
  const specsEl = el.querySelector('#cfg-specs');
  const cta = el.querySelector('#cfg-cta');
  const ctaText = el.querySelector('#cfg-cta-text');
  const toast = el.querySelector('#cfg-toast');

  wrap.innerHTML = renderProduct({ color: getState().color, size: 'm', id: 'cfg' });
  digitsEl.innerHTML = renderDigits(priceOf(getState()));

  function updateUI(state) {
    setProductColorVars(wrap, state.color);
    setCupScale(wrap, state.size);

    el.querySelectorAll('.cfg-swatch').forEach((btn) => {
      const active = btn.dataset.color === state.color;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('is-selected', active);
    });

    el.querySelectorAll('.cfg-segment').forEach((btn) => {
      const active = btn.dataset.size === state.size;
      btn.setAttribute('aria-checked', String(active));
      btn.classList.toggle('is-selected', active);
      btn.tabIndex = active ? 0 : -1;
    });

    specsEl.textContent = SPECS[state.size];
    updateDigits(digitsEl, priceOf(state));

    animateTextChange(ctaText, `Comprar ÓRBITA — ${labelOf(state)}, ${formatBRL(priceOf(state))}`);
  }

  const unsubscribe = subscribe(updateUI);

  el.querySelector('.cfg-swatches').addEventListener('click', (e) => {
    const btn = e.target.closest('.cfg-swatch');
    if (!btn) return;
    setState({ color: btn.dataset.color });
  });

  const segmented = el.querySelector('.cfg-segmented');
  segmented.addEventListener('click', (e) => {
    const btn = e.target.closest('.cfg-segment');
    if (!btn) return;
    setState({ size: btn.dataset.size });
  });

  segmented.addEventListener('keydown', (e) => {
    const current = segmented.querySelector('[aria-checked="true"]');
    if (!current) return;
    let idx = SIZE_KEYS.indexOf(current.dataset.size);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      idx = (idx + 1) % SIZE_KEYS.length;
      setState({ size: SIZE_KEYS[idx] });
      segmented.querySelector(`[data-size="${SIZE_KEYS[idx]}"]`).focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      idx = (idx - 1 + SIZE_KEYS.length) % SIZE_KEYS.length;
      setState({ size: SIZE_KEYS[idx] });
      segmented.querySelector(`[data-size="${SIZE_KEYS[idx]}"]`).focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setState({ size: SIZE_KEYS[0] });
      segmented.querySelector(`[data-size="${SIZE_KEYS[0]}"]`).focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setState({ size: SIZE_KEYS[SIZE_KEYS.length - 1] });
      segmented.querySelector(`[data-size="${SIZE_KEYS[SIZE_KEYS.length - 1]}"]`).focus();
    }
  });

  cta.addEventListener('click', (e) => {
    createRipple(cta, e);
    toast.classList.add('is-visible');
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  });

  observeReveal(el);

  return () => {
    unsubscribe();
    window.clearTimeout(toast._hideTimer);
  };
}
