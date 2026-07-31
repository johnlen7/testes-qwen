export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Suavização exponencial independente de framerate — usar para paralaxe/magnetismo. */
export function smoothDamp(current: number, target: number, factor: number, deltaMs: number): number {
  const t = 1 - Math.exp(-factor * (deltaMs / 1000));
  return lerp(current, target, t);
}
