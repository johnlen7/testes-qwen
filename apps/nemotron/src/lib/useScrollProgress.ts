import { useEffect, useRef } from 'react';

interface ScrollProgressOptions {
  /** Porcentagem da altura do viewport que a seção precisa rolar (0..1) */
  distance?: number;
  /** Suavização (lerp) aplicada ao progresso */
  smoothing?: number;
}

/**
 * Progresso de scroll 0..1 de uma seção em relação ao viewport.
 * Não causa re-render: chama `onChange` dentro de rAF com o valor suavizado.
 * Desligado quando prefers-reduced-motion.
 */
export function useScrollProgress<T extends HTMLElement>(
  onChange: (p: number) => void,
  opts: ScrollProgressOptions = {},
) {
  const { distance = 1, smoothing = 0.12 } = opts;
  const ref = useRef<T | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      cb.current(0);
      return;
    }

    let raf = 0;
    let current = 0;
    let target = 0;
    let disposed = false;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const passed = -rect.top;
      target = Math.min(1, Math.max(0, passed / total / distance));
    };

    const tick = () => {
      if (disposed) return;
      current += (target - current) * smoothing;
      if (Math.abs(target - current) < 0.0001) current = target;
      cb.current(current);
      raf = requestAnimationFrame(tick);
    };

    measure();
    raf = requestAnimationFrame(tick);
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          measure();
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [distance, smoothing]);

  return ref;
}
