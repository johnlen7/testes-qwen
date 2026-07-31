import './configurator.css';
import {
  COLORS,
  MODES,
  getColor,
  getMode,
  getPrice,
  getCtaLabel,
  productState,
  type ProductState,
} from '../state/productState';
import { createHeadphoneSVG } from '../svg/headphone';
import { createRovingTabindex } from '../lib/roving-tabindex';
import { countUp, formatBRL } from '../lib/count-up';
import { reducedMotion } from '../lib/reduced-motion';
import { easingCSS } from '../lib/easing';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface ElOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
}

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, opts: ElOptions = {}): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) {
    for (const [key, value] of Object.entries(opts.attrs)) node.setAttribute(key, value);
  }
  return node;
}

function createSwatchCheck(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'configurator__swatch-check');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M5 12.5 10 17.5 19 7');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);
  return svg;
}

/** Troca o texto de `el` com um fade curto (respeitando reduced-motion). */
function fadeSwapText(el: HTMLElement, text: string): void {
  if (el.textContent === text) return;
  if (reducedMotion.get()) {
    el.textContent = text;
    return;
  }
  const out = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: easingCSS.inQuad });
  out.onfinish = () => {
    el.textContent = text;
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: easingCSS.outQuint });
  };
}

export function mount(container: HTMLElement): void {
  const section = createEl('section', {
    className: 'configurator',
    attrs: { id: 'configurador', 'aria-labelledby': 'configurador-heading' },
  });

  const inner = createEl('div', { className: 'container configurator__inner' });

  // ---- lado visual: SVG do fone ----
  const visual = createEl('div', { className: 'configurator__visual' });
  const svg = createHeadphoneSVG('Fone ÓRBITA na cor selecionada');
  svg.classList.add('configurator__svg');
  visual.appendChild(svg);

  // ---- painel de controles ----
  const panel = createEl('div', { className: 'configurator__panel' });

  const eyebrow = createEl('span', { className: 'eyebrow', text: 'Configurador' });
  const heading = createEl('h2', {
    className: 'configurator__heading',
    text: 'Monte o seu ÓRBITA',
    attrs: { id: 'configurador-heading' },
  });
  const intro = createEl('p', {
    className: 'configurator__intro',
    text: 'Escolha o acabamento e o modo de som — o preço e o botão de compra se atualizam na hora.',
  });

  panel.append(eyebrow, heading, intro);

  // ---- grupo: cor ----
  const colorGroup = createEl('div', { className: 'configurator__group' });
  const colorLabel = createEl('span', { className: 'configurator__label', text: 'Cor' });
  const swatches = createEl('div', {
    className: 'configurator__swatches',
    attrs: { role: 'radiogroup', 'aria-label': 'Cor do fone' },
  });

  COLORS.forEach((color) => {
    const swatch = createEl('button', {
      className: 'configurator__swatch',
      attrs: {
        type: 'button',
        role: 'radio',
        'aria-checked': 'false',
        'aria-label': color.name,
        'data-color-id': color.id,
      },
    });
    swatch.style.setProperty('--swatch-color', color.shell);
    swatch.appendChild(createSwatchCheck());
    swatches.appendChild(swatch);
  });

  colorGroup.append(colorLabel, swatches);

  // ---- grupo: modo de som ----
  const modeGroup = createEl('div', { className: 'configurator__group' });
  const modeLabel = createEl('span', { className: 'configurator__label', text: 'Modo de som' });
  const modes = createEl('div', {
    className: 'configurator__modes',
    attrs: { role: 'radiogroup', 'aria-label': 'Modo de som' },
  });

  MODES.forEach((mode) => {
    const btn = createEl('button', {
      className: 'configurator__mode',
      attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', 'data-mode-id': mode.id },
    });
    btn.appendChild(createEl('span', { className: 'configurator__mode-name', text: mode.name }));
    if (mode.priceDelta > 0) {
      btn.appendChild(
        createEl('span', { className: 'configurator__mode-delta', text: `+${formatBRL(mode.priceDelta)}` })
      );
    }
    modes.appendChild(btn);
  });

  const modeDescription = createEl('p', { className: 'configurator__mode-description' });
  modeGroup.append(modeLabel, modes, modeDescription);

  // ---- preço ----
  const priceGroup = createEl('div', { className: 'configurator__price-row' });
  const priceLabel = createEl('span', { className: 'configurator__label', text: 'Preço' });
  const priceDigits = createEl('div', {
    className: 'configurator__price-digits',
    attrs: { 'aria-hidden': 'true' },
  });
  priceGroup.append(priceLabel, priceDigits);

  // região viva — anuncia cor/modo/preço a cada mudança, sem duplicar o count-up visual
  const liveRegion = createEl('p', {
    className: 'visually-hidden',
    attrs: { role: 'status', 'aria-live': 'polite' },
  });

  // ---- CTA ----
  const cta = createEl('button', { className: 'configurator__cta', attrs: { type: 'button' } });
  cta.addEventListener('click', () => {
    if (reducedMotion.get()) return;
    cta.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.97)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: easingCSS.spring }
    );
  });

  panel.append(colorGroup, modeGroup, priceGroup, liveRegion, cta);
  inner.append(visual, panel);
  section.appendChild(inner);
  container.appendChild(section);

  // ---- interatividade: roving tabindex nos dois radiogroups ----
  const initialState = productState.get();

  createRovingTabindex({
    container: swatches,
    itemSelector: '.configurator__swatch',
    orientation: 'horizontal',
    initialIndex: Math.max(0, COLORS.findIndex((c) => c.id === initialState.colorId)),
    onSelect: (index) => {
      const color = COLORS[index];
      if (!color) return;
      productState.update((s) => ({ ...s, colorId: color.id }));
    },
  });

  createRovingTabindex({
    container: modes,
    itemSelector: '.configurator__mode',
    orientation: 'horizontal',
    initialIndex: Math.max(0, MODES.findIndex((m) => m.id === initialState.modeId)),
    onSelect: (index) => {
      const mode = MODES[index];
      if (!mode) return;
      productState.update((s) => ({ ...s, modeId: mode.id }));
    },
  });

  // ---- preço: digit-roll via WAAPI, span por caractere ----
  let digitSpans: HTMLSpanElement[] = [];

  function setPriceDigits(formatted: string): void {
    const chars = formatted.split('');
    if (chars.length !== digitSpans.length) {
      priceDigits.textContent = '';
      digitSpans = chars.map((ch) => {
        const span = document.createElement('span');
        span.className = 'configurator__digit';
        span.textContent = ch === ' ' ? ' ' : ch;
        priceDigits.appendChild(span);
        return span;
      });
      return;
    }
    chars.forEach((ch, i) => {
      const span = digitSpans[i];
      const value = ch === ' ' ? ' ' : ch;
      if (!span || span.textContent === value) return;
      span.textContent = value;
      if (!reducedMotion.get()) {
        span.animate(
          [
            { transform: 'translateY(-45%)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
          ],
          { duration: 220, easing: easingCSS.outBack }
        );
      }
    });
  }

  // ---- estado -> DOM: preço (count-up), descrição do modo, CTA, live region ----
  let previousPrice: number | null = null;
  let previousModeId: string | null = null;

  productState.subscribe((state: ProductState) => {
    const price = getPrice(state);
    const color = getColor(state.colorId);
    const mode = getMode(state.modeId);

    if (previousPrice === null) {
      setPriceDigits(formatBRL(price));
    } else if (price !== previousPrice) {
      const from = previousPrice;
      countUp({ from, to: price, onUpdate: (v) => setPriceDigits(formatBRL(Math.round(v))) });
    }
    previousPrice = price;

    if (state.modeId !== previousModeId) {
      previousModeId = state.modeId;
      fadeSwapText(modeDescription, mode.description);
    }

    swatches.querySelectorAll<HTMLButtonElement>('.configurator__swatch').forEach((el) => {
      el.classList.toggle('is-selected', el.dataset.colorId === state.colorId);
    });
    modes.querySelectorAll<HTMLButtonElement>('.configurator__mode').forEach((el) => {
      el.classList.toggle('is-selected', el.dataset.modeId === state.modeId);
    });

    cta.textContent = getCtaLabel(state);
    liveRegion.textContent = `Cor ${color.name}, modo ${mode.name}, preço ${formatBRL(price)}.`;
  });
}
