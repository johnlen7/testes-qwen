/**
 * ÓRBITA — motion primitives
 * Durações, easings, loop rAF global, tween e helpers de acessibilidade.
 */

export const DUR = {
  fast: 150,
  med: 300,
  slow: 600,
  lazy: 1200,
} as const;

export const ease: Record<
  'linear' | 'outQuad' | 'outCubic' | 'outQuart' | 'outExpo' | 'outBack' | 'inOutCubic' | 'inOutQuart',
  (t: number) => number
> = {
  linear: (t) => t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outBack: (t) => {
    const c1 = 1.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
};

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = () => cb(mql.matches);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

/* ---------- loop rAF global ---------- */

const frameCallbacks = new Set<(dt: number, elapsed: number) => void>();
let rafHandle: number | null = null;
let lastFrameTime = 0;
let elapsedTime = 0;

function runLoop(now: number): void {
  rafHandle = null;
  if (document.hidden) return;

  if (lastFrameTime > 0) {
    const dt = Math.min((now - lastFrameTime) / 1000, 0.05); // clamp em 50 ms
    elapsedTime += dt;
    frameCallbacks.forEach((cb) => cb(dt, elapsedTime));
  }
  lastFrameTime = now;

  if (frameCallbacks.size > 0) {
    rafHandle = requestAnimationFrame(runLoop);
  }
}

function startLoop(): void {
  if (rafHandle !== null || document.hidden) return;
  lastFrameTime = 0;
  rafHandle = requestAnimationFrame(runLoop);
}

function stopLoop(): void {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
}

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopLoop();
  } else {
    startLoop();
  }
});

export function onFrame(cb: (dt: number, elapsed: number) => void): () => void {
  frameCallbacks.add(cb);
  startLoop();
  return () => {
    frameCallbacks.delete(cb);
    if (frameCallbacks.size === 0) stopLoop();
  };
}

/* ---------- tween ---------- */

export function tween(opts: {
  from: number;
  to: number;
  duration: number;
  ease?: (t: number) => number;
  onUpdate: (v: number) => void;
  onComplete?: () => void;
}): () => void {
  if (prefersReducedMotion()) {
    opts.onUpdate(opts.to);
    opts.onComplete?.();
    return () => {};
  }

  const easeFn = opts.ease ?? ease.outQuad;
  const startTime = performance.now();
  let raf: number;

  function step(now: number): void {
    const raw = Math.min((now - startTime) / opts.duration, 1);
    const t = easeFn(raw);
    opts.onUpdate(lerp(opts.from, opts.to, t));

    if (raw < 1) {
      raf = requestAnimationFrame(step);
    } else {
      opts.onComplete?.();
    }
  }

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
