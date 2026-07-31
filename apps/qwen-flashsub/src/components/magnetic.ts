import { tick, lerp } from "../lib/raf";
import { prefersReducedMotion } from "../lib/motion";

export interface MagneticButton {
  destroy(): void;
}

const RADIUS = 150; // px — alcance magnético a partir do centro do botão
const STRENGTH = 0.3; // fração da distância aplicada no deslocamento
const RETURN_FACTOR = 0.12; // lerp da mola de volta ao centro
const RIPPLE_DURATION = 600; // ms
const RIPPLE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)"; // --ease-out

export function createMagneticButton(el: HTMLElement): MagneticButton {
  if (prefersReducedMotion()) return { destroy() {} };

  let tx = 0; // deslocamento suavizado atual (px)
  let ty = 0;
  let targetX = 0;
  let targetY = 0;

  const onPointerMove = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.hypot(dx, dy) > RADIUS) {
      targetX = 0;
      targetY = 0;
      return;
    }
    targetX = dx * STRENGTH;
    targetY = dy * STRENGTH;
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
  };

  const cancelTick = tick(() => {
    tx = lerp(tx, targetX, RETURN_FACTOR);
    ty = lerp(ty, targetY, RETURN_FACTOR);
    el.style.setProperty("--mag-x", `${tx.toFixed(2)}px`);
    el.style.setProperty("--mag-y", `${ty.toFixed(2)}px`);
  });

  const onClick = (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    el.appendChild(ripple);
    const anim = ripple.animate(
      [
        { transform: "scale(0)", opacity: 0.4 },
        { transform: "scale(4)", opacity: 0 },
      ],
      { duration: RIPPLE_DURATION, easing: RIPPLE_EASE, fill: "forwards" }
    );
    anim.onfinish = () => ripple.remove();
  };

  // listener no window para capturar o ponteiro se aproximando do raio
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  el.addEventListener("pointerleave", onPointerLeave, { passive: true });
  el.addEventListener("click", onClick);

  return {
    destroy() {
      cancelTick();
      window.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("click", onClick);
    },
  };
}
