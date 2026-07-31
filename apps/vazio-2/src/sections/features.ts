/**
 * ÓRBITA — Features (§4.4)
 * Hidrata o grid de recursos: reveal por scroll, glow radial que segue o cursor,
 * tilt 3D sutil via rAF e estados de hover/focus.
 */

import './features.css';
import { qsa, on } from '../lib/dom';
import { reveal } from '../lib/scroll';
import { onFrame, lerp, clamp, prefersReducedMotion } from '../lib/motion';

const TILT_MAX_DEG = 5;
const LERP_FACTOR = 0.12;
const STOP_THRESHOLD = 0.02;

export function mountFeatures(): void {
  const cards = qsa<HTMLElement>('[data-feature]');
  if (cards.length === 0) return;

  // 1. Entrada por scroll com stagger.
  reveal(cards, { stagger: 80 });

  // 2. Efeitos de cursor só em dispositivos com ponteiro fino e sem reduced-motion.
  const finePointer = window.matchMedia('(pointer: fine)');
  if (!finePointer.matches || prefersReducedMotion()) return;

  cards.forEach((card) => {
    let targetRx = 0;
    let targetRy = 0;
    let currentRx = 0;
    let currentRy = 0;
    let hovering = false;

    const updateGlow = (x: number, y: number): void => {
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    };

    const handlePointerMove = (ev: PointerEvent): void => {
      const rect = card.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      updateGlow(x, y);

      // Normaliza a posição do cursor para o intervalo [-1, 1].
      const nx = (x / rect.width) * 2 - 1;
      const ny = (y / rect.height) * 2 - 1;

      // Inclinação invertida no eixo X para sensação natural de perspectiva.
      targetRy = clamp(nx * TILT_MAX_DEG, -TILT_MAX_DEG, TILT_MAX_DEG);
      targetRx = clamp(-ny * TILT_MAX_DEG, -TILT_MAX_DEG, TILT_MAX_DEG);
      hovering = true;
    };

    const handlePointerLeave = (): void => {
      targetRx = 0;
      targetRy = 0;
      hovering = false;
    };

    on(card, 'pointermove', handlePointerMove as EventListener);
    on(card, 'pointerleave', handlePointerLeave);

    onFrame(() => {
      currentRx = lerp(currentRx, targetRx, LERP_FACTOR);
      currentRy = lerp(currentRy, targetRy, LERP_FACTOR);

      // Evita micro-oscilações quando o cursor já saiu do card.
      if (!hovering && Math.abs(currentRx) < STOP_THRESHOLD && Math.abs(currentRy) < STOP_THRESHOLD) {
        currentRx = 0;
        currentRy = 0;
      }

      card.style.setProperty('--rx', `${currentRx.toFixed(2)}deg`);
      card.style.setProperty('--ry', `${currentRy.toFixed(2)}deg`);
    });
  });
}
