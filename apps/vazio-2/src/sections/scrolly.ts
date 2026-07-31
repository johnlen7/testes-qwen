/**
 * ÓRBITA — Scroll-telling (PRD 4.2)
 * Showpiece de 400vh: scrub real com suavização exponencial,
 * coreografia do fone em 3 etapas e visualização de ANC em canvas.
 */

import './scrolly.css';
import { qs, qsa } from '../lib/dom';
import { clamp, lerp, ease, onFrame, prefersReducedMotion, onReducedMotionChange } from '../lib/motion';
import { onScrub } from '../lib/scroll';
import { store } from '../lib/store';
import { createHeadphone, updateHeadphone, setExplode } from '../product/headphone';

interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Converte um token de cor em RGB (hex ou rgb/rgba). */
function parseTokenColor(raw: string): RGB {
  const v = raw.trim();
  if (v.startsWith('#')) {
    const hex = v.slice(1);
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }
  const m = v.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  return { r: 255, g: 255, b: 255 };
}

function rgba(color: RGB, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function getTokenColor(name: string): RGB {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  return parseTokenColor(raw);
}

export function mountScrolly(): void {
  const section = qs<HTMLElement>('[data-scrolly]');
  const stage = qs<HTMLElement>('.scrolly__stage', section);
  const hpWrapper = qs<HTMLElement>('[data-scrolly-hp]', section);
  const slot = qs<HTMLElement>('[data-headphone-slot="scrolly"]', section);
  const canvas = qs<HTMLCanvasElement>('[data-anc-canvas]', section);
  const steps = qsa<HTMLElement>('[data-step]', section);
  const labels = qsa<HTMLElement>('[data-part-label]', section);
  const numEl = qs<HTMLElement>('[data-scrolly-num]', section);
  const barEl = qs<HTMLElement>('[data-scrolly-bar]', section);

  // Fone central, sincronizado com o store de cor.
  const svg = createHeadphone({ color: store.get().color });
  slot.appendChild(svg);
  const unsubscribeColor = store.subscribe((cfg) => updateHeadphone(svg, { color: cfg.color }));

  // Anel de ANC criado dinamicamente ao redor do fone.
  const ancRing = document.createElement('div');
  ancRing.className = 'scrolly__anc-ring';
  ancRing.setAttribute('aria-hidden', 'true');
  stage.appendChild(ancRing);

  let cleanupScrub: (() => void) | null = null;
  let cleanupFrame: (() => void) | null = null;
  let targetProgress = 0;
  let currentProgress = 0;

  /** Renderiza um frame completo a partir do progresso suavizado. */
  function render(p: number, elapsed: number): void {
    const step = Math.min(2, Math.floor(p * 3));
    const local = (i: number) => clamp(p * 3 - i, 0, 1);

    // Etapa 0 · Escultura: rotação 3D do wrapper.
    const rotT = clamp(p / 0.66, 0, 1);
    const rotateY = lerp(-18, 18, rotT);
    const rotateX = lerp(6, -4, rotT);
    hpWrapper.style.transform = `perspective(900px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;

    // Explosão do fone: sobe na Engenharia e volta no Silêncio.
    let explode = 0;
    if (step === 1) {
      explode = ease.outCubic(local(1));
    } else if (step === 2) {
      explode = 1 - ease.outCubic(local(2));
    }
    setExplode(svg, explode);

    // Labels técnicos com stagger na etapa 1.
    labels.forEach((label, i) => {
      const on = step === 1 && local(1) > 0.18 + i * 0.18;
      label.classList.toggle('is-on', on);
    });

    // Textos da etapa ativa.
    steps.forEach((s) => {
      const i = Number(s.dataset.step);
      s.classList.toggle('is-active', i === step);
    });

    // Indicador numérico e barra de progresso.
    numEl.textContent = `0${step + 1}`;
    barEl.style.transform = `scaleX(${p})`;

    // Anel de ANC pulsa apenas na etapa 2.
    section.classList.toggle('is-anc', step === 2);

    // Canvas de ondas: só desenha durante a etapa 2.
    drawCanvas(local(2), elapsed);
  }

  function drawCanvas(anc: number, elapsed: number): void {
    if (anc <= 0) {
      canvas.style.opacity = '0';
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    canvas.style.opacity = String(anc);

    const ink2 = getTokenColor('--ink-2');
    const signal = getTokenColor('--signal');
    const ink = getTokenColor('--ink');

    const w = rect.width;
    const h = rect.height;
    const cy = h / 2;
    const A = h * 0.18;
    const speed = elapsed * 1.2;

    // Ruído ambiente.
    ctx.beginPath();
    ctx.strokeStyle = rgba(ink2, 0.55 * anc);
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 2) {
      const y = cy + A * (Math.sin(x * 0.018 + speed) + Math.sin(x * 0.044 + speed * 1.3));
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Antifase: mesma forma deslocada π, amplitude proporcional ao ANC.
    ctx.beginPath();
    ctx.strokeStyle = rgba(signal, anc);
    ctx.lineWidth = 1.5;
    const antiA = A * anc;
    for (let x = 0; x <= w; x += 2) {
      const y = cy + antiA * (Math.sin(x * 0.018 + speed + Math.PI) + Math.sin(x * 0.044 + speed * 1.3 + Math.PI));
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Resultante: amplitude decrescente até linha plana.
    ctx.beginPath();
    ctx.strokeStyle = rgba(ink, anc);
    ctx.lineWidth = 2.5;
    const resultA = A * (1 - anc);
    for (let x = 0; x <= w; x += 2) {
      const y = cy + resultA * (Math.sin(x * 0.018 + speed) + Math.sin(x * 0.044 + speed * 1.3));
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  function startScrub(): void {
    if (cleanupScrub || cleanupFrame) return;
    cleanupScrub = onScrub(section, (p) => {
      targetProgress = p;
    });
    cleanupFrame = onFrame((dt, elapsed) => {
      currentProgress = lerp(currentProgress, targetProgress, 1 - Math.exp(-dt * 8));
      render(currentProgress, elapsed);
    });
  }

  function stopScrub(): void {
    cleanupScrub?.();
    cleanupScrub = null;
    cleanupFrame?.();
    cleanupFrame = null;

    // Reseta estados dinâmicos para a versão estática.
    hpWrapper.style.transform = '';
    barEl.style.transform = 'scaleX(0)';
    section.classList.remove('is-anc');
    steps.forEach((s) => s.classList.remove('is-active'));
    labels.forEach((l) => l.classList.remove('is-on'));
    setExplode(svg, 0);
    canvas.style.opacity = '0';
  }

  function handleReducedChange(reduced: boolean): void {
    section.classList.toggle('is-static', reduced);
    if (reduced) {
      stopScrub();
    } else {
      startScrub();
    }
  }

  // Estado inicial de acessibilidade.
  handleReducedChange(prefersReducedMotion());
  const unsubscribeReduced = onReducedMotionChange(handleReducedChange);

  // Cleanup genérico (não usado no bootstrap atual, mas mantido para consistência).
  function dispose(): void {
    unsubscribeColor();
    unsubscribeReduced();
    stopScrub();
    ancRing.remove();
  }

  // Expõe o cleanup apenas para casos de desmontagem futura.
  (section as HTMLElement & { __scrollyDispose?: () => void }).__scrollyDispose = dispose;
}
