/** Strings CSS — espelham exatamente os tokens em styles/tokens.css. Usar nas WAAPI/keyframes. */
export const easingCSS = {
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  outQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
  inOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  outBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.16, 1.36, 0.34, 1)',
  inQuad: 'cubic-bezier(0.55, 0.09, 0.68, 0.53)',
  linear: 'cubic-bezier(0, 0, 1, 1)',
  magnetic: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;

/** Equivalentes numéricos (t: 0..1 -> 0..1) para interpolação via JS (rAF, count-up, scroll-scrub). */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

export function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeInQuad(t: number): number {
  return t * t;
}

export function easeLinear(t: number): number {
  return t;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
