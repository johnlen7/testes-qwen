/**
 * ÓRBITA — Depoimentos / Marquee
 * Marquee autoral com rAF: loop infinito, pausa suave, drag com inércia.
 */

import './testimonials.css';
import { qs, on } from '../lib/dom';
import { onFrame, lerp, clamp, prefersReducedMotion } from '../lib/motion';

const BASE_VEL = 45; // px/s
const INERTIA_DECAY = 3; // expoente de decaimento da inércia

interface Sample {
  x: number;
  t: number;
}

export function mountTestimonials(): void {
  const section = qs<HTMLElement>('.quotes');
  const marquee = qs<HTMLElement>('[data-marquee]', section);
  const track = qs<HTMLElement>('[data-marquee-track]', marquee);

  // Modo reduced-motion: scroll horizontal nativo, sem loop nem drag.
  if (prefersReducedMotion()) {
    marquee.classList.add('is-static');
    return;
  }

  const originalCards = Array.from(track.children) as HTMLElement[];
  if (originalCards.length === 0) return;

  let setWidth = 0; // largura de um conjunto de cards originais
  let containerWidth = 0;
  let offset = 0;
  let targetVel = BASE_VEL;
  let currentVel = BASE_VEL;
  let isDragging = false;
  let isInertia = false;
  let inertiaVel = 0;
  let lastPointerX = 0;
  let dragSamples: Sample[] = [];
  let resizeRaf = 0;

  /**
   * Clona o conjunto original até preencher pelo menos 2× container + 1 conjunto.
   * Isso garante que não haja espaços vazios durante o loop contínuo.
   */
  function populateTrack(): void {
    // Restaura apenas os cards originais.
    track.innerHTML = '';
    originalCards.forEach((card) => track.appendChild(card));

    containerWidth = marquee.clientWidth;
    setWidth = track.scrollWidth;
    if (setWidth === 0 || containerWidth === 0) return;

    const targetWidth = containerWidth * 2 + setWidth;
    let currentWidth = setWidth;

    while (currentWidth < targetWidth) {
      originalCards.forEach((card) => {
        track.appendChild(card.cloneNode(true));
      });
      currentWidth += setWidth;
    }
  }

  function getReleaseVelocity(): number {
    const now = performance.now();
    const recent = dragSamples.filter((s) => now - s.t <= 100);
    if (recent.length < 2) return 0;

    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) return 0;

    return (last.x - first.x) / dt;
  }

  function endDrag(ev: PointerEvent): void {
    if (!isDragging) return;
    isDragging = false;
    marquee.classList.remove('is-dragging');

    const releaseVel = getReleaseVelocity();
    if (Math.abs(releaseVel) > BASE_VEL) {
      isInertia = true;
      inertiaVel = releaseVel;
    } else {
      targetVel = BASE_VEL;
    }

    if (marquee.hasPointerCapture(ev.pointerId)) {
      marquee.releasePointerCapture(ev.pointerId);
    }
  }

  // ---------- eventos de pausa suave ----------
  on(marquee, 'mouseenter', () => {
    targetVel = 0;
  });

  on(marquee, 'mouseleave', () => {
    if (!isDragging && !isInertia) targetVel = BASE_VEL;
  });

  on(marquee, 'focusin', () => {
    targetVel = 0;
  });

  on(marquee, 'focusout', () => {
    if (!isDragging && !isInertia) targetVel = BASE_VEL;
  });

  // ---------- eventos de drag ----------
  on(marquee, 'pointerdown', (e) => {
    const ev = e as PointerEvent;
    if (ev.button !== 0) return;

    ev.preventDefault();
    isDragging = true;
    isInertia = false;
    targetVel = 0;
    currentVel = 0;
    lastPointerX = ev.clientX;
    dragSamples = [{ x: ev.clientX, t: performance.now() }];

    marquee.classList.add('is-dragging');
    marquee.setPointerCapture(ev.pointerId);
  });

  on(marquee, 'pointermove', (e) => {
    if (!isDragging) return;
    const ev = e as PointerEvent;

    const dx = ev.clientX - lastPointerX;
    lastPointerX = ev.clientX;
    offset = (offset - dx + setWidth) % setWidth;

    dragSamples.push({ x: ev.clientX, t: performance.now() });
    // Mantém amostras recentes para não acumular memória.
    const cutoff = performance.now() - 150;
    while (dragSamples.length > 0 && dragSamples[0].t < cutoff) {
      dragSamples.shift();
    }
  });

  on(marquee, 'pointerup', (e) => endDrag(e as PointerEvent));
  on(marquee, 'pointercancel', (e) => endDrag(e as PointerEvent));

  // ---------- loop rAF ----------
  onFrame((dt) => {
    if (setWidth === 0) return;

    if (isDragging) {
      // Suaviza a velocidade visual para zero durante o arrasto.
      currentVel = lerp(currentVel, 0, 1 - Math.exp(-dt * 10));
    } else if (isInertia) {
      inertiaVel *= Math.exp(-dt * INERTIA_DECAY);
      offset = (offset + inertiaVel * dt) % setWidth;

      // Quando a inércia cruza a velocidade base, o automático reassume suavemente.
      if (Math.abs(inertiaVel) <= BASE_VEL) {
        isInertia = false;
        targetVel = BASE_VEL;
        currentVel = inertiaVel;
      }
    } else {
      currentVel = lerp(currentVel, targetVel, 1 - Math.exp(-dt * 6));
      offset = (offset + currentVel * dt) % setWidth;
    }

    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  });

  // ---------- resize (debounce via rAF) ----------
  on(window, 'resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      populateTrack();
      offset = clamp(offset, 0, setWidth || 1);
    });
  });

  // Inicialização.
  populateTrack();
}
