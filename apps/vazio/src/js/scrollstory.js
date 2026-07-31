/* ============================================================
   ÓRBITA · scroll-telling "Como funciona" (#tecnologia)
   Container de 350vh com palco sticky de 100vh. Um rAF lê
   scrollY a cada frame, normaliza o progresso (0–1) sobre o
   container, suaviza com lerp e escreve transforms DIRETAMENTE
   nos grupos do SVG (scrubbing real — nada de triggers).

   Fórmula do progresso:
     raw      = clamp((scrollY - trackTop) / (trackHeight - viewport), 0, 1)
     smoothed = lerp(smoothed, raw, 0.14) por frame
     explode  = sin(smoothed * π)  → 0 montado · 1 explodido · 0 selado

   Layout reads (offsetTop/offsetHeight) só em init/resize/load.
   Reduced-motion: sem scrub — estado final estático via CSS.
   ============================================================ */

import { prefersReducedMotion, lerp, clamp, rafLoop } from './motion.js';
import { renderProduct } from './product.js';

const LERP_FACTOR = 0.14;
const SNAP_EPSILON = 0.0004;

export function initScrollStory() {
  const track = document.getElementById('story-track');
  if (!track) return;

  const productMount = document.getElementById('story-product');
  const ring = document.getElementById('story-ring');
  const bar = document.getElementById('story-bar-fill');
  const counter = document.getElementById('story-counter');
  const steps = Array.from(track.querySelectorAll('.story-step'));

  if (productMount) productMount.innerHTML = renderProduct();

  // Reduced-motion: produto montado + textos em sequência (CSS cuida).
  if (prefersReducedMotion()) return;

  const shell = productMount.querySelector('.layer-shell');
  const cushion = productMount.querySelector('.layer-cushion');
  const driver = productMount.querySelector('.layer-driver');
  const cushionL = productMount.querySelector('.cush-l');
  const cushionR = productMount.querySelector('.cush-r');

  let trackTop = 0;
  let span = 1;
  let maxShift = 110;

  function measure() {
    const rect = track.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    span = Math.max(1, track.offsetHeight - window.innerHeight);
    // Deslocamento das camadas limitado em telas estreitas
    maxShift = Math.min(110, window.innerWidth * 0.12);
  }

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure).catch(() => {});
  }

  const STEP_COUNT = steps.length;
  let smoothed = 0;
  let activeStep = -1;

  function apply(p) {
    const explode = Math.sin(p * Math.PI); // 0 → 1 → 0

    // Camadas do produto (vista frontal): arco+conchas sobem,
    // almofadas descem e se separam lateralmente, drivers ficam
    // revelados dentro das conchas e ganham leve escala.
    shell.style.transform = `translate3d(0, ${(-explode * maxShift * 0.7).toFixed(2)}px, 0)`;
    const down = (explode * maxShift * 0.85).toFixed(2);
    const apart = (explode * maxShift * 0.28).toFixed(2);
    if (cushionL && cushionR) {
      cushionL.style.transform = `translate3d(${-apart}px, ${down}px, 0)`;
      cushionR.style.transform = `translate3d(${apart}px, ${down}px, 0)`;
    } else {
      cushion.style.transform = `translate3d(0, ${down}px, 0)`;
    }
    driver.style.transform = `scale(${(1 + explode * 0.1).toFixed(4)})`;

    // Anel orbital abre e alinha
    if (ring) {
      ring.style.transform = `scale(${(0.82 + explode * 0.23).toFixed(4)}) rotate(${(explode * 40).toFixed(2)}deg)`;
      ring.style.opacity = (0.35 + explode * 0.65).toFixed(3);
    }

    // Barra de progresso (só transform)
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;

    // Crossfade das etapas por faixas de progresso; as pontas
    // (primeira/última) começam e terminam visíveis.
    for (let i = 0; i < STEP_COUNT; i += 1) {
      let local = p * STEP_COUNT - i;
      if (i === 0) local = Math.max(local, 0.2);
      if (i === STEP_COUNT - 1) local = Math.min(local, 0.8);
      const fade = (Math.max(0, 0.2 - local) + Math.max(0, local - 0.8)) / 0.2;
      const opacity = clamp(1 - fade, 0, 1);
      const step = steps[i];
      step.style.opacity = opacity.toFixed(3);
      step.style.transform = `translate3d(0, ${((1 - opacity) * 14).toFixed(2)}px, 0)`;
    }

    const idx = Math.min(STEP_COUNT - 1, Math.floor(p * STEP_COUNT));
    if (idx !== activeStep) {
      activeStep = idx;
      if (counter) counter.textContent = `ETAPA 0${idx + 1}/0${STEP_COUNT}`;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    }
  }

  rafLoop(() => {
    const raw = clamp((window.scrollY - trackTop) / span, 0, 1);
    smoothed = Math.abs(raw - smoothed) < SNAP_EPSILON ? raw : lerp(smoothed, raw, LERP_FACTOR);
    apply(smoothed);
  });

  apply(0);
}
