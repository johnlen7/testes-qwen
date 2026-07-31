/**
 * ÓRBITA — Configurador (fatia 4.3)
 * Personaliza cor, concha e preço; mantém o fone e o store sincronizados.
 */

import './configurator.css';
import { qs, qsa, on } from '../lib/dom';
import { prefersReducedMotion } from '../lib/motion';
import { reveal } from '../lib/scroll';
import { COLORS, formatPrice, store, type ColorId, type ShellId } from '../lib/store';
import { createHeadphone, updateHeadphone } from '../product/headphone';

const SHELL_PILL_CLASS = 'shell-pill';
const ACTIVE_CLASS = 'is-active';
const HIDDEN_CLASS = 'visually-hidden';

export function mountConfigurator(): void {
  const section = qs<HTMLElement>('[data-configurator]');
  const slot = qs<HTMLElement>('[data-headphone-slot="config"]');
  const colorButtons = qsa<HTMLButtonElement>('[data-color]', section);
  const shellButtons = qsa<HTMLButtonElement>('[data-shell]', section);
  const priceEl = qs<HTMLElement>('[data-price]', section);
  const cta = qs<HTMLButtonElement>('[data-config-cta]', section);

  // 1. Fone no palco, sincronizado com o store.
  const hp = createHeadphone({ color: store.get().color, shell: store.get().shell });
  slot.appendChild(hp);

  // 2. Swatches de cor (radiogroup com roving tabindex).
  colorButtons.forEach((btn) => {
    btn.setAttribute('tabindex', btn.classList.contains(ACTIVE_CLASS) ? '0' : '-1');
    on(btn, 'click', () => store.set({ color: btn.dataset.color as ColorId }));
  });

  on(qs<HTMLElement>('.config__swatches', section), 'keydown', (ev) => {
    const key = (ev as KeyboardEvent).key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp') return;
    (ev as KeyboardEvent).preventDefault();

    const current = colorButtons.find((b) => b.classList.contains(ACTIVE_CLASS));
    if (!current) return;

    const dir = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
    const idx = colorButtons.indexOf(current);
    const next = colorButtons[(idx + dir + colorButtons.length) % colorButtons.length];
    store.set({ color: next.dataset.color as ColorId });
    next.focus();
  });

  // 3. Conchas (radiogroup + pill deslizante).
  const shellGroup = qs<HTMLElement>('.config__shells', section);
  const shellPill = document.createElement('span');
  shellPill.className = SHELL_PILL_CLASS;
  shellPill.setAttribute('aria-hidden', 'true');
  shellGroup.insertBefore(shellPill, shellGroup.firstChild);

  shellButtons.forEach((btn) => {
    btn.setAttribute('tabindex', btn.classList.contains(ACTIVE_CLASS) ? '0' : '-1');
    on(btn, 'click', () => store.set({ shell: btn.dataset.shell as ShellId }));
  });

  on(shellGroup, 'keydown', (ev) => {
    const key = (ev as KeyboardEvent).key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
    (ev as KeyboardEvent).preventDefault();

    const current = shellButtons.find((b) => b.classList.contains(ACTIVE_CLASS));
    if (!current) return;

    const dir = key === 'ArrowRight' ? 1 : -1;
    const idx = shellButtons.indexOf(current);
    const next = shellButtons[(idx + dir + shellButtons.length) % shellButtons.length];
    store.set({ shell: next.dataset.shell as ShellId });
    next.focus();
  });

  const repositionShellPill = (): void => {
    const active = shellButtons.find((b) => b.classList.contains(ACTIVE_CLASS));
    if (!active) return;
    const groupRect = shellGroup.getBoundingClientRect();
    const btnRect = active.getBoundingClientRect();
    shellPill.style.transform = `translateX(${btnRect.left - groupRect.left}px)`;
    shellPill.style.width = `${btnRect.width}px`;
  };

  on(window, 'resize', repositionShellPill);

  // 4. Odômetro de preço.
  const priceDigits: HTMLSpanElement[] = [];
  const buildOdometer = (): void => {
    priceDigits.length = 0;
    const initial = formatPrice(store.get().price);
    priceEl.innerHTML = '';

    const live = document.createElement('span');
    live.className = HIDDEN_CLASS;
    live.textContent = `Preço: R$ ${initial}`;
    priceEl.appendChild(live);

    for (const char of initial) {
      if (char === '.') {
        const sep = document.createElement('span');
        sep.className = 'odo__sep';
        sep.textContent = '.';
        sep.setAttribute('aria-hidden', 'true');
        priceEl.appendChild(sep);
        continue;
      }
      const col = document.createElement('span');
      col.className = 'odo';
      col.setAttribute('aria-hidden', 'true');
      const reel = document.createElement('span');
      reel.className = 'odo__reel';
      reel.innerHTML = Array.from({ length: 10 }, (_, i) => i).join('<br>');
      col.appendChild(reel);
      priceEl.appendChild(col);
      priceDigits.push(col);
      setDigit(col, parseInt(char, 10), true);
    }
  };

  const setDigit = (col: HTMLSpanElement, value: number, immediate = false): void => {
    const reel = col.querySelector<HTMLSpanElement>('.odo__reel');
    if (!reel) return;
    reel.style.transition = immediate ? 'none' : '';
    reel.style.transform = `translateY(-${value}em)`;
    if (immediate) {
      // Força reflow para garantir que a transição não se aplique ao valor inicial.
      void reel.offsetHeight;
      reel.style.transition = '';
    }
  };

  const updatePrice = (price: number): void => {
    const formatted = formatPrice(price);
    const live = priceEl.querySelector<HTMLSpanElement>(`.${HIDDEN_CLASS}`);
    if (live) live.textContent = `Preço: R$ ${formatted}`;

    const chars = formatted.split('');
    let digitIndex = 0;
    for (const char of chars) {
      if (char === '.') continue;
      const col = priceDigits[digitIndex];
      if (col) {
        const current = parseInt(char, 10);
        const previousReel = col.querySelector<HTMLSpanElement>('.odo__reel');
        const previous = previousReel
          ? Math.round(parseFloat(previousReel.style.transform.replace('translateY(-', '').replace('em)', '')) || 0)
          : 0;
        if (current !== previous) setDigit(col, current);
      }
      digitIndex++;
    }
  };

  // 5. CTA — label dinâmica, ripple e estado reservado.
  const updateCtaLabel = (cfg: { color: ColorId; shell: ShellId; price: number }): void => {
    const colorName = COLORS.find((c) => c.id === cfg.color)?.name ?? cfg.color;
    cta.textContent = `Comprar ÓRBITA — ${colorName}, R$ ${formatPrice(cfg.price)}`;
  };

  let reservedTimer: ReturnType<typeof setTimeout> | null = null;

  on(cta, 'click', (ev) => {
    if (cta.disabled) return;

    const originalText = cta.textContent ?? '';

    // Ripple autoral.
    if (!prefersReducedMotion()) {
      const rect = cta.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const x = (ev as MouseEvent).clientX - rect.left;
      const y = (ev as MouseEvent).clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.8;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = ripple.style.height = `${size}px`;
      cta.appendChild(ripple);

      const anim = ripple.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.55 },
          { transform: 'translate(-50%, -50%) scale(2.6)', opacity: 0 },
        ],
        { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
      );
      anim.onfinish = () => ripple.remove();
    }

    // Estado reservado.
    cta.disabled = true;
    cta.innerHTML = `Reservado <svg aria-hidden="true" width="20" height="20"><use href="#i-check" /></svg>`;

    if (reservedTimer) clearTimeout(reservedTimer);
    reservedTimer = setTimeout(() => {
      cta.disabled = false;
      cta.textContent = originalText;
      reservedTimer = null;
    }, 2400);
  });

  // 6. Entrada por scroll.
  reveal([...qsa<HTMLElement>('.config__group', section), ...qsa<HTMLElement>('.config__buy', section), section.querySelector<HTMLElement>('.config__stage')!].filter(Boolean));

  // ---------- helpers de UI ----------

  function syncColorUI(color: ColorId): void {
    colorButtons.forEach((btn) => {
      const isActive = btn.dataset.color === color;
      btn.classList.toggle(ACTIVE_CLASS, isActive);
      btn.setAttribute('aria-checked', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function syncShellUI(shell: ShellId): void {
    shellButtons.forEach((btn) => {
      const isActive = btn.dataset.shell === shell;
      btn.classList.toggle(ACTIVE_CLASS, isActive);
      btn.setAttribute('aria-checked', String(isActive));
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    repositionShellPill();
  }

  function updateStageGlow(color: ColorId): void {
    const def = COLORS.find((c) => c.id === color);
    if (!def) return;
    section.style.setProperty('--config-glow', `radial-gradient(circle at 50% 50%, ${def.hi}33 0%, ${def.body}18 50%, transparent 72%)`);
  }

  // Inicialização.
  buildOdometer();
  updateStageGlow(store.get().color);
  repositionShellPill();

  // Assinatura por último: subscribe dispara imediatamente com o estado atual
  // e cuida do sync inicial da UI (precisa dos helpers acima já definidos).
  store.subscribe((cfg) => {
    updateHeadphone(hp, { color: cfg.color, shell: cfg.shell });
    syncColorUI(cfg.color);
    syncShellUI(cfg.shell);
    updatePrice(cfg.price);
    updateCtaLabel(cfg);
    updateStageGlow(cfg.color);
  });
}
