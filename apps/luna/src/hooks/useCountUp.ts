import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, reducedMotion: boolean): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (reducedMotion) {
      current.current = target;
      setValue(target);
      return;
    }

    const start = current.current;
    const delta = target - start;
    if (delta === 0) return;
    const duration = 560;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + delta * eased);
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, target]);

  return value;
}
