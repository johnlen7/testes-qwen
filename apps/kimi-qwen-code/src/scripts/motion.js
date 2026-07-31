// motion.js — utilitários compartilhados de animação e estado

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
// progresso de uma faixa [start,end] dentro de um valor 0..1
export const seg = (p, start, end) => clamp((p - start) / (end - start), 0, 1);
export const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const reducedMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = () => matchMedia('(pointer: coarse)').matches;

// loop rAF que pausa quando a aba perde foco
export function rafLoop(fn) {
  let id = null;
  const tick = (t) => { fn(t); id = requestAnimationFrame(tick); };
  const start = () => { if (id === null) id = requestAnimationFrame(tick); };
  const stop = () => { if (id !== null) { cancelAnimationFrame(id); id = null; } };
  document.addEventListener('visibilitychange', () =>
    document.hidden ? stop() : start()
  );
  start();
  return { start, stop };
}

// ---- store mínimo do configurador (compartilhado com o CTA final) ----
export const CORES = {
  grafite: { nome: 'Grafite', cup: '#23232e', cup2: '#3a3a4a', swatch: '#2c2c38', preco: 0 },
  lunar:   { nome: 'Lunar',   cup: '#e8e4d8', cup2: '#fbf8ee', swatch: '#eeeadd', preco: 100 },
  solar:   { nome: 'Solar',   cup: '#ff4d24', cup2: '#ff7a52', swatch: '#ff4d24', preco: 150 },
  abissal: { nome: 'Abissal', cup: '#0f4c46', cup2: '#1a6e64', swatch: '#12554e', preco: 150 },
};

export const CONCHAS = {
  compacta: { nome: 'Concha compacta', preco: 0, escala: 0.94 },
  ampla:    { nome: 'Concha ampla',    preco: 200, escala: 1.08 },
};

export const PRECO_BASE = 2499;

export const store = {
  cor: 'grafite',
  concha: 'compacta',
  get preco() {
    return PRECO_BASE + CORES[this.cor].preco + CONCHAS[this.concha].preco;
  },
  set(patch) {
    Object.assign(this, patch);
    dispatchEvent(new CustomEvent('orbita:config', { detail: this.snapshot() }));
  },
  snapshot() {
    return {
      cor: this.cor,
      corNome: CORES[this.cor].nome,
      concha: this.concha,
      conchaNome: CONCHAS[this.concha].nome,
      preco: this.preco,
    };
  },
};

export const fmtBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

// aplica a cor do produto a um SVG .orbita-svg
export function paintProduct(svg, corKey) {
  const c = CORES[corKey];
  if (!svg || !c) return;
  svg.style.setProperty('--cup', c.cup);
  svg.style.setProperty('--cup-2', c.cup2);
}

// ripple autoral para elementos [data-ripple]
export function attachRipples(scope = document) {
  scope.querySelectorAll('[data-ripple]').forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
      if (reducedMotion()) return;
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2.2;
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px;`;
      el.appendChild(dot);
      dot.animate(
        [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }],
        { duration: 650, easing: 'cubic-bezier(0.16,1,0.3,1)' }
      ).finished.then(() => dot.remove()).catch(() => dot.remove());
    });
  });
}

if (typeof document !== 'undefined') attachRipples();
