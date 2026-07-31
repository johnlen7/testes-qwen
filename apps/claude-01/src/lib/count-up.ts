import { easeOutExpo } from './easing';
import { onFrame } from './raf-loop';
import { reducedMotion } from './reduced-motion';

export interface CountUpOptions {
  from: number;
  to: number;
  duration?: number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

/** Tween numérico via rAF (não CSS) para poder formatar/exibir dígitos a cada frame. */
export function countUp({ from, to, duration = 600, onUpdate, onComplete }: CountUpOptions): void {
  if (reducedMotion.get()) {
    onUpdate(to);
    onComplete?.();
    return;
  }

  let elapsed = 0;
  const unsubscribe = onFrame((_time, delta) => {
    elapsed += delta;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(from + (to - from) * easeOutExpo(t));
    if (t >= 1) {
      unsubscribe();
      onComplete?.();
    }
  });
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}
