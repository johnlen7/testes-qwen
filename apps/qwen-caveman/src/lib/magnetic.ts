/** Botão magnético — desloca na direção do cursor dentro de um raio. */

import { hasFinePointer, prefersReducedMotion } from "./motion";

export function initMagnetic(root: ParentNode = document): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = 0.32;

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });

    const reset = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointerleave", reset);
    el.addEventListener("blur", reset);
  });
}
