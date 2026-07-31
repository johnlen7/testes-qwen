import './scrollTelling.css';
import { createHeadphoneSVG, getPart, type HeadphonePart } from '../svg/headphone';
import { createScrollScrub } from '../lib/scroll-progress';
import { reducedMotion } from '../lib/reduced-motion';
import { easeInOutQuart, easeOutBack } from '../lib/easing';
import { clamp } from '../lib/lerp';

interface Step {
  eyebrow: string;
  headline: string;
  description: string;
}

const STEPS: Step[] = [
  {
    eyebrow: 'Etapa 01',
    headline: 'A concha se abre',
    description:
      'As conchas deslizam para fora em um único movimento contínuo, revelando a suspensão interna que isola cada driver do ruído externo.',
  },
  {
    eyebrow: 'Etapa 02',
    headline: 'O driver se revela',
    description:
      'A espuma de memória se expande e o diafragma de 40mm aparece — a origem do grave profundo e do médio limpo do ÓRBITA.',
  },
  {
    eyebrow: 'Etapa 03',
    headline: 'O campo espacial ativa',
    description:
      'Sensores de posição calibram o áudio espacial em tempo real, projetando um campo sonoro que acompanha cada giro da sua cabeça.',
  },
  {
    eyebrow: 'Etapa 04',
    headline: 'Sintonia perfeita',
    description:
      'Concha, driver e campo espacial trabalham como um só sistema: um sinal, do estúdio ao seu ouvido, sem perdas.',
  },
];

const TRANSFORM_PARTS: HeadphonePart[] = [
  'band',
  'hinge-left',
  'hinge-right',
  'cup-left',
  'cup-right',
  'cushion-left',
  'cushion-right',
  'orbit-ring-1',
  'orbit-ring-2',
  'orbit-ring-3',
  'signal-dot',
];

/** Progresso local 0..1 dentro de uma faixa [start,end] do progresso global. */
function localProgress(progress: number, start: number, end: number): number {
  return clamp((progress - start) / (end - start), 0, 1);
}

export function mount(container: HTMLElement): void {
  const section = document.createElement('section');
  section.id = 'como-funciona';
  section.className = 'scroll-telling';
  section.setAttribute('aria-labelledby', 'como-funciona-title');

  const wrapper = document.createElement('div');
  wrapper.className = 'scroll-telling__wrapper';
  wrapper.style.setProperty('--steps', String(STEPS.length));

  const stage = document.createElement('div');
  stage.className = 'scroll-telling__stage';

  // ---- indicador de progresso (barra + dots) ----
  const progress = document.createElement('div');
  progress.className = 'scroll-telling__progress';
  progress.setAttribute('aria-hidden', 'true');

  const progressTrack = document.createElement('div');
  progressTrack.className = 'scroll-telling__progress-track';
  const progressFill = document.createElement('div');
  progressFill.className = 'scroll-telling__progress-fill';
  progressTrack.append(progressFill);

  const dotsEl = document.createElement('div');
  dotsEl.className = 'scroll-telling__dots';
  const dots = STEPS.map(() => {
    const dot = document.createElement('span');
    dot.className = 'scroll-telling__dot';
    dotsEl.append(dot);
    return dot;
  });

  progress.append(progressTrack, dotsEl);

  // ---- palco visual ----
  const visual = document.createElement('div');
  visual.className = 'scroll-telling__visual';
  const svg = createHeadphoneSVG('Fone ÓRBITA em vista explodida, mostrando a montagem por camadas');
  visual.append(svg);

  // origem/caixa de transformação previsíveis para as partes que animamos
  TRANSFORM_PARTS.forEach((part) => {
    const node = getPart(svg, part);
    if (node) {
      node.style.transformBox = 'fill-box';
      node.style.transformOrigin = 'center';
    }
  });

  // ---- painel de texto ----
  const panel = document.createElement('div');
  panel.className = 'scroll-telling__panel';

  const title = document.createElement('h2');
  title.id = 'como-funciona-title';
  title.className = 'eyebrow scroll-telling__title';
  title.textContent = 'Como funciona';

  const panelStack = document.createElement('div');
  panelStack.className = 'scroll-telling__panel-stack';

  const stepPanels = STEPS.map((step) => {
    const stepPanel = document.createElement('div');
    stepPanel.className = 'scroll-telling__step-panel';
    stepPanel.setAttribute('aria-hidden', 'true');

    const eyebrow = document.createElement('span');
    eyebrow.className = 'eyebrow scroll-telling__step-eyebrow';
    eyebrow.textContent = step.eyebrow;

    const headline = document.createElement('h3');
    headline.className = 'scroll-telling__step-headline';
    headline.textContent = step.headline;

    const desc = document.createElement('p');
    desc.className = 'scroll-telling__step-desc';
    desc.textContent = step.description;

    stepPanel.append(eyebrow, headline, desc);
    panelStack.append(stepPanel);
    return stepPanel;
  });

  panel.append(title, panelStack);

  stage.append(progress, visual, panel);
  wrapper.append(stage);
  section.append(wrapper);
  container.append(section);

  const numSteps = STEPS.length;
  let activeIndex = -1;

  function setActiveStep(index: number): void {
    if (index === activeIndex) return;
    activeIndex = index;
    stepPanels.forEach((stepPanel, i) => {
      const isActive = i === index;
      stepPanel.classList.toggle('is-active', isActive);
      stepPanel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  /** Coreografia "explodida" das partes do SVG, contínua e proporcional ao scroll. */
  function applyChoreography(p: number): void {
    const cupT = easeInOutQuart(localProgress(p, 0, 0.32));
    const cupOffset = cupT * 42;

    const finalSpreadT = easeInOutQuart(localProgress(p, 0.82, 1));
    const totalOffset = cupOffset + finalSpreadT * 8;

    const cushionT = easeInOutQuart(localProgress(p, 0.12, 0.42));
    const cushionScale = 0.82 + cushionT * 0.2;
    const cushionOpacity = 0.55 + cushionT * 0.45;

    const bandT = easeInOutQuart(localProgress(p, 0.4, 0.68));
    const bandTilt = bandT * 4;

    const signalT = easeOutBack(localProgress(p, 0.58, 0.9));

    const cupLeft = getPart(svg, 'cup-left');
    const cupRight = getPart(svg, 'cup-right');
    const hingeLeft = getPart(svg, 'hinge-left');
    const hingeRight = getPart(svg, 'hinge-right');
    const cushionLeft = getPart(svg, 'cushion-left');
    const cushionRight = getPart(svg, 'cushion-right');
    const band = getPart(svg, 'band');
    const signalDot = getPart(svg, 'signal-dot');

    if (cupLeft) cupLeft.style.transform = `translateX(${-totalOffset}px)`;
    if (cupRight) cupRight.style.transform = `translateX(${totalOffset}px)`;
    if (hingeLeft) hingeLeft.style.transform = `translateX(${-totalOffset * 0.35}px)`;
    if (hingeRight) hingeRight.style.transform = `translateX(${totalOffset * 0.35}px)`;

    if (cushionLeft) {
      cushionLeft.style.opacity = String(cushionOpacity);
      cushionLeft.style.transform = `scale(${cushionScale})`;
    }
    if (cushionRight) {
      cushionRight.style.opacity = String(cushionOpacity);
      cushionRight.style.transform = `scale(${cushionScale})`;
    }

    if (band) band.style.transform = `rotate(${bandTilt}deg)`;

    [1, 2, 3].forEach((n) => {
      const ring = getPart(svg, `orbit-ring-${n}` as HeadphonePart);
      if (!ring) return;
      const delay = (n - 1) * 0.06;
      const ringT = easeOutBack(localProgress(p, 0.5 + delay, 0.86 + delay));
      ring.style.transform = `scale(${0.45 + ringT * 0.65})`;
      ring.style.opacity = String(0.15 + ringT * 0.55);
    });

    if (signalDot) {
      signalDot.style.transform = `scale(${0.35 + signalT * 0.75})`;
      signalDot.style.opacity = String(0.25 + signalT * 0.75);
    }
  }

  /** Sob reduced motion: nenhuma parte do SVG se move, só o texto troca por crossfade. */
  function resetChoreography(): void {
    TRANSFORM_PARTS.forEach((part) => {
      const node = getPart(svg, part);
      if (node) {
        node.style.transform = '';
        node.style.opacity = '';
      }
    });
  }

  let lastProgress = 0;

  function onProgress(p: number): void {
    lastProgress = p;
    progressFill.style.transform = `scaleX(${p})`;

    const index = clamp(Math.floor(p * numSteps), 0, numSteps - 1);
    setActiveStep(index);

    if (reducedMotion.get()) {
      resetChoreography();
    } else {
      applyChoreography(p);
    }
  }

  createScrollScrub({ wrapper, onProgress });

  reducedMotion.subscribe((isReduced) => {
    if (isReduced) {
      resetChoreography();
    } else {
      applyChoreography(lastProgress);
    }
  }, false);
}
