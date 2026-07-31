/**
 * Scheduler de requestAnimationFrame único.
 * Um frame, N animações — nada de rAF espalhado pela página.
 */
type Tick = (dt: number, t: number) => void

const ticks = new Set<Tick>()
let running = false
let last = 0

function frame(t: number): void {
  if (!running) return
  const dt = Math.min(0.05, (t - last) / 1000 || 0.016) // clamp anti-salto pós-tab
  last = t
  ticks.forEach((fn) => fn(dt, t))
  requestAnimationFrame(frame)
}

/** Registra um tick. Retorna unsubscribe; scheduler pausa sozinho quando vazio. */
export function addTick(fn: Tick): () => void {
  ticks.add(fn)
  if (!running) {
    running = true
    last = performance.now()
    requestAnimationFrame(frame)
  }
  return () => {
    ticks.delete(fn)
    if (ticks.size === 0) running = false
  }
}

export const clamp = (v: number, a: number, b: number): number =>
  Math.min(b, Math.max(a, v))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Damping independente de framerate (exponential smoothing). */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

/** Easing expo-out para progresso normalizado [0,1]. */
export const easeOut = (p: number): number => 1 - Math.pow(1 - p, 4)

/** Triângulo de visibilidade: sobe 0→1 em [start, peakStart], desce em [peakEnd, end]. */
export function window01(p: number, start: number, end: number, fade = 0.08): number {
  if (p <= start || p >= end) return 0
  return clamp(Math.min((p - start) / fade, (end - p) / fade, 1), 0, 1)
}
