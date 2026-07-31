/* ============================================================
   ÓRBITA — math & motion helpers
   ============================================================ */

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Suavização 0→1 com easing suave (smoothstep) */
export const smoothstep = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

/** Mapeia uma janela [a,b] do progresso para 0..1 com smoothstep */
export const window01 = (p: number, a: number, b: number) =>
  smoothstep(clamp((p - a) / (b - a)));

/** Count-up com rAF: anima de `from` a `to` em `dur` ms, ease-out-expo */
export function countUp(
  from: number,
  to: number,
  dur: number,
  onUpdate: (v: number) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const t0 = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = clamp((now - t0) / dur);
    const eased = 1 - Math.pow(2, -10 * t); // easeOutExpo
    onUpdate(from + (to - from) * (t === 1 ? 1 : eased));
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export const formatBRL = (v: number) =>
  'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

/** Formata com dígito rolado estilo odômetro: "2.499" */
export const fmtPrice = (v: number) => v.toLocaleString('pt-BR');
