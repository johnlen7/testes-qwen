/** CTA final · produto na cor escolhida (estado compartilhado) + feedback de compra. */

import { productStore, formatBRL, type ProductState } from "../lib/store";
import { applyProductColor } from "./configurator";

export function initCta(): void {
  const product = document.querySelector<HTMLElement>(".finale-product");
  const colorEl = document.querySelector<HTMLElement>("[data-finale-color]");
  const priceEl = document.querySelector<HTMLElement>("[data-finale-price]");

  const render = (state: ProductState) => {
    if (product) applyProductColor(product, state.color);
    if (colorEl) colorEl.textContent = state.colorName;
    if (priceEl) priceEl.textContent = `R$ ${formatBRL(state.price)}`;
  };

  if (product) render(productStore.state);
  productStore.subscribe(render);

  // micro-feedback nos botões de compra (simulação)
  document.querySelectorAll<HTMLButtonElement>("[data-buy]").forEach((btn) => {
    const label = btn.querySelector<HTMLElement>("[data-buy-label]");
    btn.addEventListener("click", () => {
      if (!label || btn.dataset.busy) return;
      const original = label.textContent;
      btn.dataset.busy = "1";
      label.textContent = "Reservado ✓";
      window.setTimeout(() => {
        label.textContent = original;
        delete btn.dataset.busy;
      }, 1600);
    });
  });
}
