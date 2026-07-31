import { useEffect } from 'react';
import type { RefObject } from 'react';

export function usePointerParallax(
  ref: RefObject<HTMLElement>,
  enabled: boolean,
): void {
  useEffect(() => {
    const element = ref.current;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!element || !enabled || !canHover) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const render = () => {
      frame = 0;
      element.style.setProperty('--pointer-x', `${x.toFixed(3)}`);
      element.style.setProperty('--pointer-y', `${y.toFixed(3)}`);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(render);
    };

    const reset = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(render);
    };

    element.addEventListener('pointermove', onPointerMove, { passive: true });
    element.addEventListener('pointerleave', reset, { passive: true });

    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, ref]);
}
