/* ============================================================
   ÓRBITA — configurador: cor, equalização, Pro, preço, CTA
   Estado compartilhado via store (pub/sub)
   ============================================================ */

import { mountHeadphones, setProductColors } from '../headphones.js';
import { COLORS, EQ_MODES, totalPrice, formatBRL, subscribe, setState, getState } from '../store.js';
import { countUp, reducedMotion, gatedLoop } from '../utils.js';

export function initConfigurator() {
  const visual = document.querySelector('[data-config-visual]');
  if (!visual) return;

  const product = visual.querySelector('[data-config-product]');
  // controles vivem no painel, fora do visual
  const curve = visual.querySelector('[data-config-curve]');
  const hint = visual.querySelector('[data-config-hint]');
  const priceEl = document.querySelector('[data-config-price]');
  const ctaEl = document.querySelector('[data-config-cta]');
  const swatches = [...document.querySelectorAll('[data-config-colors] [data-color]')];
  const eqs = [...document.querySelectorAll('[data-config-eqs] [data-eq]')];
  const proBtn = document.querySelector('[data-config-pro]');
  if (!product || !priceEl || !ctaEl || !proBtn) return;

  const svg = mountHeadphones(product, COLORS.grafite);
  setProductColors(svg, resolveColors());

  let displayedPrice = totalPrice();
  let priceCancel = null;

  function resolveColors() {
    const { color, eq } = getState();
    return { ...COLORS[color], ring: EQ_MODES[eq].led };
  }

  function render() {
    const { color, eq, pro } = getState();
    const colors = resolveColors();

    // cores do produto transicionam (custom props registradas)
    setProductColors(svg, colors);

    // curva do equalizador
    const path = EQ_MODES[eq].curve;
    curve.setAttribute('d', path);
    curve.style.stroke = EQ_MODES[eq].led;
    hint.textContent = `— ${EQ_MODES[eq].label} · ${eq === 'aereo' ? 'vozes claras' : eq === 'grave' ? 'sub-grave presente' : eq === 'warm' ? 'médios aveludados' : 'resposta plana'}`;

    // swatches
    swatches.forEach((s) => {
      const on = s.dataset.color === color;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-checked', String(on));
    });

    // eqs
    eqs.forEach((e) => {
      const on = e.dataset.eq === eq;
      e.classList.toggle('is-active', on);
      e.setAttribute('aria-checked', String(on));
    });

    // pro
    proBtn.setAttribute('aria-checked', String(pro));

    // preço com count-up (cancela o anterior: sem corrida de rAFs)
    const target = totalPrice();
    if (target !== displayedPrice) {
      if (priceCancel) priceCancel();
      const from = displayedPrice;
      priceCancel = countUp({
        from,
        to: target,
        duration: reducedMotion() ? 0 : 520,
        onUpdate: (v) => {
          displayedPrice = v;
          priceEl.textContent = `R$ ${formatBRL(v)}`;
        },
      });
    }

    // CTA reflete o estado
    const cor = COLORS[color].label;
    const som = EQ_MODES[eq].label;
    ctaEl.innerHTML = `Comprar ÓRBITA — ${cor} · ${som}`;
    if (pro) ctaEl.innerHTML += ' · Pro';
  }

  // navegação por setas nos radiogroups (padrão ARIA radiogroup)
  function wireRadioGroup(buttons) {
    buttons.forEach((btn, i) => {
      btn.addEventListener('keydown', (e) => {
        let next = null;
        const n = buttons.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = buttons[(i + 1) % n];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = buttons[(i - 1 + n) % n];
        else if (e.key === 'Home') next = buttons[0];
        else if (e.key === 'End') next = buttons[n - 1];
        if (next) {
          e.preventDefault();
          next.focus();
          next.click();
        }
      });
    });
  }

  // interações
  swatches.forEach((s) => {
    s.addEventListener('click', () => {
      if (getState().color === s.dataset.color) return;
      setState({ color: s.dataset.color });
      // transição animada do produto: tilt + pulso
      product.classList.remove('is-swapping');
      void product.offsetWidth; // restart da animação
      product.classList.add('is-swapping');
    });
  });
  wireRadioGroup(swatches);

  eqs.forEach((e) => {
    e.addEventListener('click', () => {
      if (getState().eq === e.dataset.eq) return;
      setState({ eq: e.dataset.eq });
    });
  });
  wireRadioGroup(eqs);

  proBtn.addEventListener('click', () => {
    setState({ pro: !getState().pro });
  });

  subscribe(render);
  render();

  // paralaxe sutil do produto no visual (desktop, com gate de visibilidade)
  if (!reducedMotion() && window.matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    visual.addEventListener('mousemove', (e) => {
      const r = visual.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    visual.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    gatedLoop(() => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      product.style.transform = `rotateY(${(cx * 8).toFixed(2)}deg) rotateX(${(-cy * 6).toFixed(2)}deg)`;
    }, visual, 1.2);
  }
}
