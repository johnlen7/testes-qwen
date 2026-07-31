/**
 * ÓRBITA — CTA final + footer.
 * Fone reflete o store, botão magnético e checkout simulado.
 */

import './cta.css';
import { qs, on } from '../lib/dom';
import { lerp, prefersReducedMotion, onFrame, tween, ease } from '../lib/motion';
import { reveal } from '../lib/scroll';
import { createHeadphone, updateHeadphone } from '../product/headphone';
import { store, formatPrice } from '../lib/store';

const MAGNETIC_RADIUS = 140;
const MAX_SHIFT = 10;
const CHECKOUT_DURATION = 2400;

export function mountCta(): void {
  const section = qs<HTMLElement>('.final');
  const slot = qs<HTMLElement>('[data-headphone-slot="final"]');
  const summary = qs<HTMLElement>('[data-final-summary]');
  const cta = qs<HTMLButtonElement>('[data-final-cta]');

  const headphone = createHeadphone(store.get());
  slot.appendChild(headphone);

  const unsubscribe = store.subscribe((cfg) => {
    updateHeadphone(headphone, { color: cfg.color, shell: cfg.shell });
    summary.textContent = `ÓRBITA · ${cfg.color === 'grafite' ? 'Grafite' : cfg.color === 'lunar' ? 'Lunar' : cfg.color === 'cobre' ? 'Cobre' : 'Aurora'} · Concha ${cfg.shell === 'compact' ? 'Compacta' : cfg.shell === 'max' ? 'Max' : 'Padrão'} — R$ ${formatPrice(cfg.price)}`;
    if (!cta.disabled) {
      cta.innerHTML = `Comprar ÓRBITA — ${capitalize(cfg.color)}, R$ ${formatPrice(cfg.price)}`;
    }
  });

  initMagnetic(section, cta);
  initCheckout(cta);
  initReveal(section);

  // Cleanup mínimo para evitar leaks se o módulo fosse desmontado.
  window.addEventListener('beforeunload', () => unsubscribe());
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ---------- botão magnético ---------- */
function initMagnetic(section: HTMLElement, button: HTMLButtonElement): void {
  const isFine = window.matchMedia('(pointer: fine)').matches;
  if (!isFine || prefersReducedMotion()) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let mode: 'idle' | 'attract' | 'return' = 'idle';
  let returnTween: (() => void) | null = null;
  let frameCleanup: (() => void) | null = null;

  function applyTransform(): void {
    button.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
  }

  function startLoop(): void {
    if (frameCleanup) return;
    frameCleanup = onFrame(() => {
      if (mode === 'attract') {
        currentX = lerp(currentX, targetX, 0.18);
        currentY = lerp(currentY, targetY, 0.18);
        applyTransform();
      }
    });
  }

  function stopLoop(): void {
    if (frameCleanup) {
      frameCleanup();
      frameCleanup = null;
    }
  }

  function goBack(): void {
    if (mode === 'return') return;
    mode = 'return';
    targetX = 0;
    targetY = 0;

    const startX = currentX;
    const startY = currentY;
    if (returnTween) returnTween();
    returnTween = tween({
      from: 0,
      to: 1,
      duration: 500,
      ease: ease.outBack,
      onUpdate: (t) => {
        currentX = lerp(startX, 0, t);
        currentY = lerp(startY, 0, t);
        applyTransform();
      },
      onComplete: () => {
        currentX = 0;
        currentY = 0;
        applyTransform();
        mode = 'idle';
        stopLoop();
      },
    });
  }

  on(section, 'pointermove', (ev) => {
    const pe = ev as PointerEvent;
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = pe.clientX - cx;
    const dy = pe.clientY - cy;
    const distance = Math.hypot(dx, dy);

    if (distance < MAGNETIC_RADIUS) {
      const factor = Math.min(distance, MAGNETIC_RADIUS) / MAGNETIC_RADIUS;
      const nx = dx / (distance || 1);
      const ny = dy / (distance || 1);
      targetX = nx * factor * MAX_SHIFT;
      targetY = ny * factor * MAX_SHIFT;
      mode = 'attract';
      if (returnTween) {
        returnTween();
        returnTween = null;
      }
      startLoop();
    } else if (mode === 'attract') {
      goBack();
    }
  });

  on(section, 'pointerleave', () => {
    if (mode === 'attract' || mode === 'return') {
      goBack();
    }
  });
}

/* ---------- checkout simulado + ripple ---------- */
function initCheckout(button: HTMLButtonElement): void {
  on(button, 'click', (ev) => {
    if (button.disabled) return;

    const me = ev as MouseEvent;
    createRipple(button, me.clientX, me.clientY);

    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<svg class="btn__icon" aria-hidden="true"><use href="#i-check" /></svg>Reservado ✓ — até logo`;

    window.setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalHTML;
    }, CHECKOUT_DURATION);
  });
}

function createRipple(button: HTMLButtonElement, clientX: number, clientY: number): void {
  const rect = button.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const size = Math.max(rect.width, rect.height) * 2.2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.marginLeft = ripple.style.marginTop = `${-size / 2}px`;

  button.appendChild(ripple);

  const anim = ripple.animate(
    [
      { transform: 'scale(0)', opacity: 0.55 },
      { transform: 'scale(1)', opacity: 0 },
    ],
    { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
  );

  anim.onfinish = () => ripple.remove();
}

/* ---------- entrada da seção ---------- */
function initReveal(section: HTMLElement): void {
  const targets = qsaFrom(section, '.final__stage, .eyebrow, h2, .final__summary, [data-magnetic], .final__note');
  reveal(targets, { threshold: 0.2, stagger: 120 });
}

function qsaFrom(root: HTMLElement, selector: string): Element[] {
  return Array.from(root.querySelectorAll(selector));
}
