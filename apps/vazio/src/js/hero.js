/* ============================================================
   ÓRBITA · hero
   - Injeta o SVG do produto (product.js)
   - Constrói os anéis orbitais (elipses tracejadas + tick marks)
     e os satélites (chips mono com specs)
   - Entrada orquestrada em beats (classe .is-in + delays no CSS)
   - Paralaxe de mouse com rAF + lerp (só pointer:fine, off em
     reduced-motion)
   ============================================================ */

import { prefersReducedMotion, hasFinePointer, lerp, rafLoop } from './motion.js';
import { renderProduct } from './product.js';

const CX = 260;
const CY = 260;

/* Anéis: raios casados com os wrappers dos satélites no CSS
   (inset% = 50 − r/520·100). */
const RINGS = [
  { cls: 'ring-a', r: 150, dash: '1 9', ticks: 36, tickLen: 5, majorEvery: 9 },
  { cls: 'ring-b', r: 205, dash: '10 14', ticks: 48, tickLen: 9, majorEvery: 12 },
  { cls: 'ring-c', r: 248, dash: '2 16', ticks: 72, tickLen: 5, majorEvery: 12 }
];

const SATELLITES = [
  { cls: 'sat-o-a', label: 'ANC −42dB' },
  { cls: 'sat-o-b', label: '40h' },
  { cls: 'sat-o-c', label: '9.2g' }
];

function tickMarks(r, count, len, majorEvery) {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const x1 = (CX + cos * (r - len)).toFixed(1);
    const y1 = (CY + sin * (r - len)).toFixed(1);
    const x2 = (CX + cos * r).toFixed(1);
    const y2 = (CY + sin * r).toFixed(1);
    const cls = i % majorEvery === 0 ? 'tick tick-major' : 'tick';
    out += `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }
  return out;
}

function renderRings() {
  const rings = RINGS.map(
    (ring) => `
    <g class="ring ${ring.cls}">
      <circle class="ring-path" cx="${CX}" cy="${CY}" r="${ring.r}" stroke-dasharray="${ring.dash}" />
      <g class="ticks">${tickMarks(ring.r, ring.ticks, ring.tickLen, ring.majorEvery)}</g>
    </g>`
  ).join('');

  return `<svg class="orbit" viewBox="0 0 520 520" aria-hidden="true">${rings}</svg>`;
}

function renderSatellites() {
  return SATELLITES.map(
    (sat) => `
    <div class="sat-orbit ${sat.cls}">
      <span class="sat"><span class="sat-inner"><i class="sat-dot" aria-hidden="true"></i>${sat.label}</span></span>
    </div>`
  ).join('');
}

function initEntrance(hero) {
  // Dois frames: garante que o estado inicial (opacity 0) foi pintado
  // antes de ligar as transições dos beats.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => hero.classList.add('is-in'));
  });
}

function initParallax(hero) {
  if (prefersReducedMotion() || !hasFinePointer()) return;

  const layers = Array.from(hero.querySelectorAll('[data-parallax]')).map((el) => ({
    el,
    k: parseFloat(el.dataset.parallax) || 0,
    x: 0,
    y: 0
  }));
  if (layers.length === 0) return;

  let targetX = 0;
  let targetY = 0;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  });

  hero.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
  });

  rafLoop(() => {
    for (const layer of layers) {
      layer.x = lerp(layer.x, targetX * layer.k, 0.08);
      layer.y = lerp(layer.y, targetY * layer.k, 0.08);
      layer.el.style.transform = `translate3d(${layer.x.toFixed(2)}px, ${layer.y.toFixed(2)}px, 0)`;
    }
  });
}

export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const productMount = document.getElementById('hero-product');
  const ringsMount = document.getElementById('hero-rings-svg');
  const satsMount = document.getElementById('hero-sats');

  if (productMount) productMount.innerHTML = renderProduct();
  if (ringsMount) ringsMount.innerHTML = renderRings();
  if (satsMount) satsMount.innerHTML = renderSatellites();

  initEntrance(hero);
  initParallax(hero);
}
