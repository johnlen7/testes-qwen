import { prefersReducedMotion } from "../lib/motion";

export interface TiltCards {
  destroy(): void;
}

const TILT_RANGE = 12; // graus de amplitude total do tilt (máx ~6°)

export function createTiltCards(container: HTMLElement): TiltCards {
  const cards = Array.from(
    container.querySelectorAll<HTMLElement>(".feature-card")
  );
  if (cards.length === 0) return { destroy() {} };

  // sem tilt em reduced-motion nem em telas de toque
  if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) {
    return { destroy() {} };
  }

  const onPointerMove = (e: PointerEvent) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${(0.5 - relY) * TILT_RANGE}deg`);
    card.style.setProperty("--ry", `${(relX - 0.5) * TILT_RANGE}deg`);
    card.style.setProperty("--mx", `${relX * 100}%`);
    card.style.setProperty("--my", `${relY * 100}%`);
  };

  const onPointerLeave = (e: PointerEvent) => {
    const card = e.currentTarget as HTMLElement;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  for (const card of cards) {
    card.addEventListener("pointermove", onPointerMove, { passive: true });
    card.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  return {
    destroy() {
      for (const card of cards) {
        card.removeEventListener("pointermove", onPointerMove);
        card.removeEventListener("pointerleave", onPointerLeave);
      }
    },
  };
}
