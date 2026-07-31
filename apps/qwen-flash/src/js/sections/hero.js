/* ============================================================
   ÓRBITA — hero: estrelas, poeira de luz, paralaxe de scroll/mouse
   ============================================================ */

import { mountHeadphones, setProductColors } from '../headphones.js';
import { COLORS } from '../store.js';
import { reducedMotion, gatedLoop, lerp } from '../utils.js';

// PRNG determinístico: mesmo céu a cada load
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(svg) {
  const rand = mulberry32(20260731);
  // 3 camadas com paralaxe diferente
  for (let layer = 0; layer < 3; layer++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-layer', String(layer));
    const count = layer === 0 ? 26 : layer === 1 ? 18 : 12;
    for (let i = 0; i < count; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', (rand() * 100).toFixed(2));
      c.setAttribute('cy', (rand() * 100).toFixed(2));
      const r = (0.4 + rand() * (layer === 0 ? 0.5 : layer === 1 ? 0.8 : 1.3)).toFixed(2);
      c.setAttribute('r', r);
      c.setAttribute('opacity', (0.25 + rand() * 0.55).toFixed(2));
      g.appendChild(c);
    }
    svg.appendChild(g);
  }
}

function buildDust(container) {
  const rand = mulberry32(4242);
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.style.left = `${(rand() * 100).toFixed(1)}%`;
    s.style.top = `${(rand() * 100).toFixed(1)}%`;
    s.style.transform = `scale(${(0.6 + rand() * 1.6).toFixed(2)})`;
    s.style.animationDelay = `${(rand() * 6).toFixed(1)}s`;
    container.appendChild(s);
  }
}

export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const sky = hero.querySelector('[data-hero-sky]');
  const stars = hero.querySelector('.hero__stars');
  const dust = hero.querySelector('[data-hero-dust]');
  const product = hero.querySelector('[data-hero-product]');
  const stage = hero.querySelector('.hero__stage');
  const copy = hero.querySelector('.hero__copy');
  const ring = hero.querySelector('[data-hero-ring]');

  buildStars(stars);
  buildDust(dust);

  const svg = mountHeadphones(product, COLORS.grafite);
  setProductColors(svg, COLORS.grafite);

  const reduce = reducedMotion();

  /* ---- paralaxe de scroll: estrelas em 3 velocidades ---- */
  const layers = [...(sky ? sky.querySelectorAll('g[data-layer]') : [])];
  const speeds = [0.08, 0.16, 0.26];

  /* ---- reação ao mouse (desktop apenas) ---- */
  let tx = 0, ty = 0; // alvo
  let cx = 0, cy = 0; // atual (lerp)

  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      tx = nx;
      ty = ny;
    });
    hero.addEventListener('mouseleave', () => {
      tx = 0;
      ty = 0;
    });
  }

  gatedLoop(() => {
    const scroll = window.scrollY;

    // estrelas com paralaxe de scroll (só dentro da viewport do hero)
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    if (scroll < heroBottom) {
      layers.forEach((g, i) => {
        g.setAttribute('transform', `translate(0 ${(scroll * speeds[i]).toFixed(1)})`);
      });
    }

    // mouse: lerp suave — produto inclina, copy deriva
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);
    if (Math.abs(cx) > 0.001 || Math.abs(cy) > 0.001) {
      if (stage && ring) {
        stage.style.transform = `rotateX(${(-cy * 7).toFixed(2)}deg) rotateY(${(cx * 9).toFixed(2)}deg)`;
      }
      if (copy) {
        copy.style.transform = `translate3d(${(cx * -14).toFixed(1)}px, ${(cy * -10).toFixed(1)}px, 0)`;
      }
    }
  }, hero, 1.5);

  // scroll suave das âncoras com offset do nav fixo
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
}
