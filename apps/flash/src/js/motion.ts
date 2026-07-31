/* ============================================================
   motion — easings, helpers de interpolação, loop de rAF global
   ============================================================ */

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** smoothstep — easing suave para scrub de scroll */
export const smoothstep = (t: number) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOutQuart = (t: number) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
/** overshoot sutil para o snap de retorno (remontagem do fone) */
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  t -= 1;
  return 1 + c3 * t * t * t + c1 * t * t;
};

/**
 * Interpolação por keypoints — o coração do scrubbing.
 * kps: [[key, value], ...] com ease opcional por segmento.
 */
export function seq(
  p: number,
  kps: Array<[number, number] | [number, number, (t: number) => number]>,
  ease: (t: number) => number = smoothstep
): number {
  if (p <= kps[0][0]) return kps[0][1];
  for (let i = 1; i < kps.length; i++) {
    const [k0, v0] = kps[i - 1];
    const [k1, v1, segEase] = kps[i];
    if (p <= k1) {
      return lerp(v0, v1, (segEase ?? ease)((p - k0) / (k1 - k0)));
    }
  }
  return kps[kps.length - 1][1];
}

/** fade janela: 0 fora de [a,b], sobe/desce nas bordas */
export function windowFade(p: number, a: number, b: number, fade: number = 0.06): number {
  const inT = clamp((p - a) / fade, 0, 1);
  const outT = clamp((b - p) / fade, 0, 1);
  return Math.min(inT, outT, 1);
}

/** anima um valor com easing em rAF; onValue recebe o valor a cada frame */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  onValue: (v: number) => void,
  ease: (t: number) => number = easeOutExpo
): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now: number) => {
      const t = clamp((now - t0) / duration, 0, 1);
      onValue(lerp(from, to, ease(t)));
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

/* ---- loop de rAF global (todos os módulos registram callbacks) ---- */
type FrameCb = (now: number, dt: number) => void;
const cbs = new Set<FrameCb>();
let last = performance.now();
let running = false;

function tick(now: number) {
  const dt = Math.min(50, now - last);
  last = now;
  for (const cb of cbs) cb(now, dt);
  requestAnimationFrame(tick);
}

export function addFrame(cb: FrameCb) {
  cbs.add(cb);
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}
export function removeFrame(cb: FrameCb) {
  cbs.delete(cb);
}

/* ---- preferências do usuário ---- */
export const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;
