export type TickFn = (dt: number) => void;

const callbacks = new Set<TickFn>();
let rafId = 0;
let lastTime = 0;

function frame(now: number): void {
  const dt = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  for (const fn of callbacks) fn(dt);
  if (callbacks.size > 0) rafId = requestAnimationFrame(frame);
}

export function tick(fn: TickFn): () => void {
  if (callbacks.size === 0) {
    lastTime = 0;
    rafId = requestAnimationFrame(frame);
  }
  callbacks.add(fn);
  return () => {
    callbacks.delete(fn);
    if (callbacks.size === 0 && rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}
