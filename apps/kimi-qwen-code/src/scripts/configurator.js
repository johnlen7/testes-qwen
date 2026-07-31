// configurator.js — cor, concha, preço com count-up e estado compartilhado
import {
  store, CORES, CONCHAS, fmtBRL,
  paintProduct, reducedMotion, easeOutExpo, lerp,
} from './motion.js';

const section = document.querySelector('.cfg');

if (section) {
  const svg = section.querySelector('.orbita-svg');
  const cupGroup = section.querySelector('.o-cup-group');
  const corNome = section.querySelector('[data-cor-nome]');
  const precoEl = section.querySelector('[data-preco]');
  const precoSr = section.querySelector('[data-preco-sr]');
  const cta = section.querySelector('[data-cta]');

  // ---- count-up do preço ----
  let shown = store.preco;
  let rafId = null;

  function animatePrice(target) {
    if (rafId) cancelAnimationFrame(rafId);
    const from = shown;

    if (reducedMotion() || from === target) {
      shown = target;
      precoEl.textContent = fmtBRL.format(target);
      precoSr.textContent = `Preço total: ${target} reais`;
      return;
    }
    const t0 = performance.now();
    const dur = 600;
    const tick = (t) => {
      const k = easeOutExpo(Math.min((t - t0) / dur, 1));
      shown = Math.round(lerp(from, target, k));
      precoEl.textContent = fmtBRL.format(shown);
      if (k < 1) rafId = requestAnimationFrame(tick);
      else {
        shown = target;
        precoSr.textContent = `Preço total: ${target} reais`;
      }
    };
    rafId = requestAnimationFrame(tick);
  }

  function render() {
    const s = store.snapshot();
    paintProduct(svg, s.cor);
    corNome.textContent = s.corNome;
    if (cupGroup) cupGroup.style.transform = `scale(${CONCHAS[s.concha].escala})`;
    cta.textContent = `Comprar ÓRBITA — ${s.corNome} · ${fmtBRL.format(s.preco)}`;
    animatePrice(s.preco);
  }

  section.querySelectorAll('input[name="cor"]').forEach((input) => {
    input.addEventListener('change', () => store.set({ cor: input.value }));
  });
  section.querySelectorAll('input[name="concha"]').forEach((input) => {
    input.addEventListener('change', () => store.set({ concha: input.value }));
  });

  // estado inicial + re-render quando outro ponto da página mudar o store
  render();
  addEventListener('orbita:config', render);

  cta.addEventListener('click', () => {
    cta.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }],
      { duration: 300, easing: 'cubic-bezier(0.34,1.4,0.4,1)' }
    );
  });
}
