/* ============================================================
   ÓRBITA — scroll-telling: scrubbing real via rAF
   O contêiner .story__track tem height: 400vh no CSS — isso
   define a duração. Nunca deixar essa altura zerar.
   ============================================================ */

import { mountHeadphones, setProductColors } from '../headphones.js';
import { COLORS } from '../store.js';
import { reducedMotion, clamp, gatedLoop } from '../utils.js';

// smoothstep: 0 → 1 suave entre a e b
function seg(p, a, b) {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}

const STEP_TITLES = [
  'O silêncio começa no ajuste',
  'Conchas que isolam',
  'Driver de 40 mm',
  'Núcleo ÓRBITA',
];

export function initScrollTelling() {
  const track = document.querySelector('[data-story-track]');
  if (!track) return;

  const stage = track.querySelector('[data-story-stage]');
  const product = track.querySelector('[data-story-product]');
  const steps = [...track.querySelectorAll('.story__step')];
  const calls = [...track.querySelectorAll('.story__call')];
  const fill = track.querySelector('[data-story-progress-fill]');
  const heading = track.querySelector('[data-story-heading]');

  const svg = mountHeadphones(product, COLORS.grafite);
  setProductColors(svg, COLORS.grafite);

  const parts = {
    band: svg.querySelector('.hp-band'),
    yokeL: svg.querySelector('.hp-yoke--l'),
    yokeR: svg.querySelector('.hp-yoke--r'),
    padL: svg.querySelector('.hp-pad--l'),
    padR: svg.querySelector('.hp-pad--r'),
    cupL: svg.querySelector('.hp-cup--l'),
    cupR: svg.querySelector('.hp-cup--r'),
    core: svg.querySelector('.hp-core'),
  };

  const reduce = reducedMotion();

  if (reduce) {
    // Tudo visível, sem scrub — o CSS já desliga o sticky
    steps.forEach((s) => s.classList.add('is-active'));
    calls.forEach((c) => c.classList.add('is-on'));
    parts.core.style.opacity = 1;
    return;
  }

  let currentStep = -1;
  let headingTimer = 0;

  function apply(progress) {
    const p = clamp(progress);

    // marcos de animação
    const eIntro = seg(p, 0, 0.18); // giro de apresentação
    const ePad = seg(p, 0.25, 0.5); // almofadas abrem
    const eYoke = seg(p, 0.4, 0.6); // hastes acompanham
    const eCup = seg(p, 0.5, 0.75); // conchas abrem + núcleo revela
    const eFinal = seg(p, 0.78, 1); // apoteose

    const rot = -22 * eIntro + 12 * eFinal;

    // produto inteiro: leve giro dirigido pelo scroll
    product.style.transform = `rotateY(${rot.toFixed(2)}deg)`;

    // arco sobe e encolhe no finale
    parts.band.style.transform = `translateY(${(-26 * eFinal).toFixed(1)}px) scale(${(1 - 0.05 * eFinal).toFixed(3)})`;

    // hastes
    parts.yokeL.style.transform = `translateX(${(26 * eYoke).toFixed(1)}px)`;
    parts.yokeR.style.transform = `translateX(${(-26 * eYoke).toFixed(1)}px)`;

    // almofadas abrem radialmente
    parts.padL.style.transform = `translateX(${(150 * ePad).toFixed(1)}px)`;
    parts.padR.style.transform = `translateX(${(-150 * ePad).toFixed(1)}px)`;

    // conchas abrem + sobem + giram
    const cupOut = 95 * eCup + 24 * eFinal;
    parts.cupL.style.transform = `translateX(${(cupOut).toFixed(1)}px) translateY(${(-34 * eCup).toFixed(1)}px) rotate(${(14 * eCup).toFixed(1)}deg)`;
    parts.cupR.style.transform = `translateX(${(-cupOut).toFixed(1)}px) translateY(${(-34 * eCup).toFixed(1)}px) rotate(${(-14 * eCup).toFixed(1)}deg)`;

    // núcleo: aparece e cresce
    parts.core.style.opacity = eCup.toFixed(3);
    parts.core.style.transform = `scale(${(0.55 + 0.45 * eCup + 0.14 * eFinal).toFixed(3)})`;

    // barra de progresso
    fill.style.transform = `scaleY(${p.toFixed(4)})`;

    // etapa narrativa ativa
    const step = Math.min(3, Math.floor(p * 4));
    if (step !== currentStep) {
      currentStep = step;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === step));
      calls.forEach((c, i) => c.classList.toggle('is-on', i === step));

      // heading troca com fade
      clearTimeout(headingTimer);
      heading.style.opacity = 0;
      headingTimer = setTimeout(() => {
        heading.textContent = STEP_TITLES[step];
        heading.style.opacity = 1;
      }, 170);
    }
  }

  // rAF: uma leitura de rect por frame + writes de transform.
  // clientHeight (não innerHeight) para casar com o 100dvh do stage
  // em mobile com toolbar dinâmica; gate desliga o loop fora da área.
  gatedLoop(() => {
    const rect = track.getBoundingClientRect();
    const total = rect.height - document.documentElement.clientHeight;
    // altura zero = scrub morto (lição do minimax). Proteção extra:
    if (total <= 0) return;
    const progress = -rect.top / total;
    apply(progress);
  }, track, 1.5);

  // climber: valor zero em p=0 (garante estado inicial correto antes do scroll)
  apply(0);
}
