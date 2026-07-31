/**
 * Configurador · cor + modo de som + preço com count-up.
 * Publica o estado no productStore; reflete no CTA daqui e no CTA final.
 */

import {
  COLORS,
  productStore,
  formatBRL,
  type ColorId,
  type ModeId,
  type ProductState,
} from "../lib/store";
import { easeOutExpo, prefersReducedMotion } from "../lib/motion";

/** Aplica as CSS vars de um acabamento em qualquer contêiner do produto. */
export function applyProductColor(el: HTMLElement, color: ColorId): void {
  const vars = COLORS[color].vars;
  for (const [k, v] of Object.entries(vars)) {
    el.style.setProperty(k, v);
  }
}

/* ---- count-up dos dígitos ---- */
let countRaf = 0;
function countUp(el: HTMLElement, to: number): void {
  const from = parseInt(el.dataset.value || "0", 10) || to;
  if (prefersReducedMotion() || from === to) {
    el.textContent = formatBRL(to);
    el.dataset.value = String(to);
    return;
  }
  cancelAnimationFrame(countRaf);
  const start = performance.now();
  const dur = 620;

  const tick = (now: number) => {
    const t = Math.min((now - start) / dur, 1);
    const value = Math.round(from + (to - from) * easeOutExpo(t));
    el.textContent = formatBRL(value);
    if (t < 1) {
      countRaf = requestAnimationFrame(tick);
    } else {
      el.dataset.value = String(to);
    }
  };
  countRaf = requestAnimationFrame(tick);
}

export function initConfigurator(): void {
  const stage = document.querySelector<HTMLElement>(".configurator-product");
  const digits = document.querySelector<HTMLElement>("[data-digits]");
  const colorGroup = document.querySelector<HTMLElement>("[data-config-color]");
  const modeGroup = document.querySelector<HTMLElement>("[data-config-mode]");
  if (!stage || !digits || !colorGroup || !modeGroup) return;

  // estado inicial
  applyProductColor(stage, productStore.state.color);

  colorGroup.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".swatch");
    if (!btn) return;
    productStore.setColor(btn.dataset.color as ColorId);
  });

  modeGroup.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
      ".segmented-btn"
    );
    if (!btn) return;
    productStore.setMode(btn.dataset.mode as ModeId);
  });

  const render = (state: ProductState) => {
    // cor do produto + modo (afeta as órbitas)
    applyProductColor(stage, state.color);
    stage.dataset.mode = state.mode;

    // swatches ativos
    colorGroup.querySelectorAll<HTMLButtonElement>(".swatch").forEach((b) => {
      const active = b.dataset.color === state.color;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", String(active));
    });

    // segmented ativo
    modeGroup
      .querySelectorAll<HTMLButtonElement>(".segmented-btn")
      .forEach((b) => {
        const active = b.dataset.mode === state.mode;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-checked", String(active));
      });

    // preço + CTAs
    countUp(digits, state.price);
    const label = `Comprar ÓRBITA — ${state.colorName}, R$ ${formatBRL(state.price)}`;
    document
      .querySelectorAll<HTMLElement>("[data-buy-label]")
      .forEach((el) => {
        el.textContent = label;
      });
  };

  render(productStore.state);
  productStore.subscribe(render);
}
