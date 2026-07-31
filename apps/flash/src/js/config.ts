/* ============================================================
   config — configurador: cor, modo, count-up de preço, CTA
   ============================================================ */

import { animateValue } from './motion';
import {
  getState,
  getPrice,
  setColorway,
  setMode,
  subscribe,
  fmtPrice,
  fmtInstallment,
  COLORWAY_INFO,
  MODE_INFO,
  type Colorway,
  type Mode
} from './store';
import type { HPInstance } from './headphone';
import { showToast } from './toast';

export function initConfig(hp: HPInstance) {
  const swatches = [...document.querySelectorAll<HTMLButtonElement>('.swatch')];
  const modes = [...document.querySelectorAll<HTMLButtonElement>('.mode')];
  const hint = document.getElementById('color-hint')!;
  const tagName = document.getElementById('ctag-name')!;
  const tagMode = document.getElementById('ctag-mode')!;
  const priceEl = document.getElementById('price-num')!;
  const instEl = document.getElementById('price-installment')!;
  const ctaLabel = document.getElementById('config-cta-label')!;
  const cta = document.getElementById('config-cta')!;
  const panel = document.querySelector<HTMLElement>('.config-panel')!;

  let dispPrice = getPrice(); // já começa no valor correto, sem animar no load
  let animToken = 0;

  const animatePrice = (to: number) => {
    if (Math.abs(dispPrice - to) < 1) {
      dispPrice = to;
      priceEl.textContent = fmtPrice(to);
      instEl.textContent = `ou 12× de ${fmtInstallment(to / 12)}`;
      return;
    }
    const token = ++animToken; // invalida animações anteriores
    const from = dispPrice;
    animateValue(from, to, 620, (v) => {
      if (token !== animToken) return;
      dispPrice = v;
      priceEl.textContent = fmtPrice(v);
      instEl.textContent = `ou 12× de ${fmtInstallment(v / 12)}`;
    }).then(() => {
      if (token === animToken) dispPrice = to;
    });
  };

  let lastColor: Colorway | null = null;

  const render = () => {
    const { colorway, mode } = getState();
    const cw = COLORWAY_INFO[colorway];
    const md = MODE_INFO[mode];

    // fone (pop só quando a cor realmente muda)
    hp.setColorway(colorway, lastColor !== null && lastColor !== colorway);
    lastColor = colorway;
    hp.setMode(mode);

    // controles
    swatches.forEach((s) => {
      const on = s.dataset.color === colorway;
      s.setAttribute('aria-pressed', String(on));
    });
    modes.forEach((m) => {
      const on = m.dataset.mode === mode;
      m.setAttribute('aria-pressed', String(on));
    });
    hint.textContent = cw.hint;
    tagName.textContent = cw.name;
    tagMode.textContent = `· ${md.name}`;

    // preço + CTA
    animatePrice(getPrice());
    ctaLabel.textContent = `Comprar ÓRBITA — ${cw.name} · ${md.name}`;
  };

  swatches.forEach((s) => {
    s.addEventListener('click', () => setColorway(s.dataset.color as Colorway));
  });
  modes.forEach((m) => {
    m.addEventListener('click', () => setMode(m.dataset.mode as Mode));
  });
  cta.addEventListener('click', () => {
    showToast('Pré-pedido registrado — avisamos você em outubro.');
  });

  subscribe(render);
  render();

  // primeira contagem quando o usuário chega na seção
  let counted = false;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !counted) {
        counted = true;
        dispPrice = 0;
        animatePrice(getPrice());
      }
    },
    { threshold: 0.25 }
  );
  io.observe(panel);
}
