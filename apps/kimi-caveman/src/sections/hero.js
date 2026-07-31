import './hero.css';

import { renderProduct } from '../lib/product.js';
import { reducedMotion, lerp, clamp, createRafLoop } from '../lib/motion.js';

export function initHero(el) {
  if (!el) return;
  el.classList.add('hero');

  const wantsReduced = reducedMotion();
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  const enableParallax = hasFinePointer && !wantsReduced;

  el.innerHTML = `
    <canvas class="hero__starfield" aria-hidden="true"></canvas>

    <div class="hero__rings" aria-hidden="true">
      <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" class="hero__rings-svg">
        <g class="hero__ring hero__ring--1">
          <circle cx="300" cy="300" r="220" fill="none" stroke="var(--line)" stroke-width="1" />
          ${orbitTicks(300, 300, 220, 48)}
        </g>
        <g class="hero__ring hero__ring--2">
          <circle cx="300" cy="300" r="260" fill="none" stroke="var(--line)" stroke-width="1" />
          ${orbitTicks(300, 300, 260, 64)}
        </g>
        <g class="hero__ring hero__ring--3">
          <circle cx="300" cy="300" r="300" fill="none" stroke="var(--line)" stroke-width="1" />
          ${orbitTicks(300, 300, 300, 80)}
        </g>
      </svg>
    </div>

    <div class="hero__content container">
      <span class="hero__eyebrow mono" data-order="0">SYS.00 — LANÇAMENTO</span>
      <h1 class="hero__title" data-order="1">${splitChars('ÓRBITA')}</h1>
      <p class="hero__subtitle" data-order="2">Cancelamento adaptativo espacial. Silêncio em órbita.</p>
      <div class="hero__product" data-order="4" aria-hidden="true">
        ${renderProduct({ color: 'grafite', size: 'm', id: 'hero' })}
      </div>
      <div class="hero__actions" data-order="3">
        <a href="#configurador" class="hero__cta hero__cta--primary">Configurar o seu</a>
        <a href="#como-funciona" class="hero__cta hero__cta--secondary">Como funciona</a>
      </div>
    </div>

    <a href="#como-funciona" class="hero__scroll-cue" aria-label="Rolar para Como funciona">
      <span class="mono">SCROLL</span>
      <span class="hero__scroll-line" aria-hidden="true"></span>
    </a>
  `;

  const canvas = el.querySelector('.hero__starfield');
  const ctx = canvas.getContext('2d');
  const productWrap = el.querySelector('.hero__product');

  // Theme-aware product surface (grafite remains the hero SKU).
  el.style.setProperty('--hero-product-shell', '#2A2E36');
  el.style.setProperty('--hero-product-shade', '#1F2329');
  el.style.setProperty('--hero-product-highlight', '#3D424D');

  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let stars = [];
  let orbiters = [];

  // Canvas fillStyle can't resolve CSS vars — read computed token values.
  let inkColor = '#EEF1F4';
  let accentColor = '#FFAE3D';
  function syncThemeColors() {
    const cs = getComputedStyle(el);
    inkColor = cs.getPropertyValue('--ink').trim() || inkColor;
    accentColor = cs.getPropertyValue('--accent').trim() || accentColor;
  }
  syncThemeColors();
  const themeObserver = new MutationObserver(syncThemeColors);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function resize() {
    const rect = el.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.4 + 0.45,
      driftX: (Math.random() - 0.5) * 0.04,
      driftY: (Math.random() - 0.5) * 0.04,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.015 + 0.005
    }));

    orbiters = [
      { a: Math.min(width, height) * 0.18, b: Math.min(width, height) * 0.12, speed: 0.00025, phase: 0, alpha: 0.9 },
      { a: Math.min(width, height) * 0.26, b: Math.min(width, height) * 0.16, speed: -0.00018, phase: Math.PI * 0.7, alpha: 0.75 }
    ];
  }

  let frame = 0;
  function drawStarfield(parallaxX = 0, parallaxY = 0) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(parallaxX, parallaxY);

    stars.forEach((star) => {
      const twinkle = Math.sin(star.twinkle + frame * star.twinkleSpeed) * 0.15 + 1;
      ctx.globalAlpha = clamp(star.alpha * twinkle, 0.05, 1);
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (!wantsReduced) {
        star.x = (star.x + star.driftX + width) % width;
        star.y = (star.y + star.driftY + height) % height;
        star.twinkle += star.twinkleSpeed;
      }
    });

    orbiters.forEach((orb) => {
      const cx = width * 0.5 + Math.cos(orb.phase) * orb.a;
      const cy = height * 0.5 + Math.sin(orb.phase) * orb.b;
      ctx.globalAlpha = orb.alpha;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (!wantsReduced) {
        orb.phase += orb.speed;
      }
    });

    ctx.restore();
    frame++;
  }

  // Parallax state
  let mx = 0;
  let my = 0;
  let targetMx = 0;
  let targetMy = 0;

  function updateParallax() {
    if (!enableParallax) return;
    mx = lerp(mx, targetMx, 0.08);
    my = lerp(my, targetMy, 0.08);
    el.style.setProperty('--mx', mx.toFixed(5));
    el.style.setProperty('--my', my.toFixed(5));
  }

  function onMouseMove(e) {
    if (!enableParallax) return;
    targetMx = (e.clientX / width) * 2 - 1;
    targetMy = (e.clientY / height) * 2 - 1;
  }

  if (enableParallax) {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  const starLoop = createRafLoop(() => {
    updateParallax();
    const parallaxX = enableParallax ? mx * 18 : 0;
    const parallaxY = enableParallax ? my * 12 : 0;
    drawStarfield(parallaxX, parallaxY);
  }, { element: el });

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (wantsReduced) {
    drawStarfield(0, 0);
  } else {
    starLoop.start();
  }

  // Boot entrance choreography.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('is-booted'));
  });

  // Cleanup hook for hot reload / SPA navigation.
  el.addEventListener('hero:destroy', () => {
    starLoop.destroy();
    themeObserver.disconnect();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', resize);
  });
}

function splitChars(text) {
  return text
    .split('')
    .map((char, i) => `<span class="char" style="--i:${i}" aria-hidden="true">${char}</span>`)
    .join('');
}

function orbitTicks(cx, cy, r, count) {
  let ticks = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const isMajor = i % (count / 8) === 0;
    const r1 = r;
    const r2 = r - (isMajor ? 8 : 4);
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--line)" stroke-width="${isMajor ? 1.25 : 0.75}" />`;
  }
  return ticks;
}
