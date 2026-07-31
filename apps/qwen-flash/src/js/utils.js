/* ============================================================
   ÓRBITA — utils: easing, rAF, reduced-motion, count-up, IO
   ============================================================ */

export const EASING = {
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Loop rAF com gate de visibilidade: quando o elemento está longe da
 * viewport (ou a aba está oculta), o callback não executa — poupa o
 * layout/transform work sem desligar a animação na hora de voltar.
 * Retorna stop().
 */
export function gatedLoop(fn, el, margin = 1.5) {
  let running = true;
  let frame = 0;
  let last = performance.now();
  let visible = true;

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { rootMargin: `${Math.round(margin * 100)}% 0px` }
  );
  io.observe(el);

  const tick = (now) => {
    if (!running) return;
    if (visible && !document.hidden) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      fn(dt, now);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    io.disconnect();
  };
}

/* Contagem animada de número inteiro com easing; retorna cancel() */
export function countUp({ from = 0, to, duration = 700, easing = EASING.outExpo, onUpdate }) {
  const start = performance.now();
  let cancelled = false;
  const tick = (now) => {
    if (cancelled) return;
    const t = clamp((now - start) / duration);
    const v = Math.round(from + (to - from) * easing(t));
    onUpdate(v);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => {
    cancelled = true;
  };
}

/* IntersectionObserver de reveal: adiciona .is-in com stagger via --reveal-delay */
export function initReveals(root = document) {
  if (reducedMotion()) {
    root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    return;
  }
  const els = root.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }
  );
  els.forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 70}ms`);
    io.observe(el);
  });
}
