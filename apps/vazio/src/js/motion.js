/* ============================================================
   ÓRBITA · motion helpers
   Easings, lerp, loop rAF compartilhado, reduced-motion.
   Consumido por hero.js e pelos próximos módulos (scrollstory,
   configurator, marquee, cta).
   ============================================================ */

export const EASE = {
  outExpo: 'cubic-bezier(.16,1,.3,1)',
  inOutQuart: 'cubic-bezier(.76,0,.24,1)',
  spring: 'cubic-bezier(.34,1.56,.64,1)'
};

export const DURATION = { d1: 150, d2: 300, d3: 600, d4: 900 };

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer() {
  return window.matchMedia('(pointer: fine)').matches;
}

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/* Loop rAF compartilhado: vários módulos assinam, um único frame roda.
   Uso: const stop = rafLoop((t) => { ... }); stop() quando desmontar. */
const subscribers = new Set();
let running = false;

function frame(t) {
  subscribers.forEach((cb) => cb(t));
  if (subscribers.size > 0) {
    requestAnimationFrame(frame);
  } else {
    running = false;
  }
}

export function rafLoop(cb) {
  subscribers.add(cb);
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
  return () => subscribers.delete(cb);
}

/* Resolve um cubic-bezier CSS em função de easing JS (para count-ups
   e scrubbing). Mesma curva de --ease-spring & cia, sem biblioteca. */
export function cubicBezier(x1, y1, x2, y2) {
  const NEWTON_ITERATIONS = 4;
  const NEWTON_MIN_SLOPE = 0.001;
  const SUBDIVISION_PRECISION = 0.0000001;
  const SUBDIVISION_MAX_ITERATIONS = 10;
  const SPLINE_TABLE_SIZE = 11;
  const SAMPLE_STEP = 1 / (SPLINE_TABLE_SIZE - 1);

  const A = (a1, a2) => 1 - 3 * a2 + 3 * a1;
  const B = (a1, a2) => 3 * a2 - 6 * a1;
  const C = (a1) => 3 * a1;
  const calc = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
  const slope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);

  const sampleX = new Float32Array(SPLINE_TABLE_SIZE);
  for (let i = 0; i < SPLINE_TABLE_SIZE; i += 1) {
    sampleX[i] = calc(i * SAMPLE_STEP, x1, x2);
  }

  function solveT(x) {
    // Newton-Raphson enquanto a inclinação for boa
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i += 1) {
      const s = slope(t, x1, x2);
      if (s < NEWTON_MIN_SLOPE) break;
      t -= (calc(t, x1, x2) - x) / s;
    }
    if (t > 0 && t < 1 && Math.abs(calc(t, x1, x2) - x) < SUBDIVISION_PRECISION) {
      return t;
    }
    // Fallback: bisseção sobre a tabela de amostras
    let lo = 0;
    let hi = 1;
    let mid = x;
    for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i += 1) {
      mid = (lo + hi) / 2;
      const v = calc(mid, x1, x2);
      if (Math.abs(v - x) < SUBDIVISION_PRECISION) return mid;
      if (x > v) lo = mid; else hi = mid;
    }
    return mid;
  }

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calc(solveT(x), y1, y2);
  };
}

/* Easings prontos, espelhando os tokens CSS */
export const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
export const easeInOutQuart = cubicBezier(0.76, 0, 0.24, 1);
export const easeSpring = cubicBezier(0.34, 1.56, 0.64, 1);
