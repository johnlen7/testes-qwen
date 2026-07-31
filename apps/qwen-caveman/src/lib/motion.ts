/** Utilitários de movimento — sem dependências. */

export const clamp = (v: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Mapeia v de [inMin,inMax] para [outMin,outMax] com clamp. */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  const t = clamp((v - inMin) / (inMax - inMin));
  return lerp(outMin, outMax, t);
};

/** easing expo-out para count-ups e transições JS. */
export const easeOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

/** prefers-reduced-motion reativo. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Ponteiro fino (mouse) vs toque. */
export function hasFinePointer(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

/**
 * Loop de rAF compartilhado com fator de suavização (dt-normalized).
 * Retorna uma função para cancelar.
 */
export function rafLoop(cb: (dt: number) => void): () => void {
  let raf = 0;
  let last = performance.now();
  let running = true;

  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min((now - last) / 16.6667, 3); // em "frames", limitado
    last = now;
    cb(dt);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}

/**
 * IntersectionObserver que adiciona .is-in uma única vez.
 * Elementos precisam da classe .io-reveal no CSS.
 */
export function observeReveal(elements: Element[]): void {
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  elements.forEach((el) => io.observe(el));
}
