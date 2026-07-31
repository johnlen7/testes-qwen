/* ============================================================
   ÓRBITA X1 — boot
   ============================================================ */

import './styles/main.css';

import { initTheme } from './js/theme';
import { initStarfield } from './js/starfield';
import { buildHeadphone } from './js/headphone';
import { initHero } from './js/hero';
import { initStory } from './js/story';
import { initConfig } from './js/config';
import { initFeatures } from './js/features';
import { initMarquee } from './js/marquee';
import { initFaq } from './js/faq';
import { initCta } from './js/cta';
import { initCursor } from './js/cursor';
import { getState } from './js/store';

/* ---------- tema ---------- */
initTheme();

/* ---------- instâncias do fone ---------- */
const heroHp = buildHeadphone(document.getElementById('hero-hp')!, {
  prefix: 'hero',
  colorway: 'ion',
  mode: 'espacial',
  view: 'side'
});
const storyHp = buildHeadphone(document.getElementById('story-hp')!, {
  prefix: 'story',
  colorway: getState().colorway,
  mode: 'espacial',
  view: 'side'
});
const configHp = buildHeadphone(document.getElementById('config-hp')!, {
  prefix: 'config',
  colorway: getState().colorway,
  mode: getState().mode,
  view: 'front'
});
const finaleHp = buildHeadphone(document.getElementById('finale-hp')!, {
  prefix: 'finale',
  colorway: getState().colorway,
  mode: getState().mode,
  view: 'front'
});

/* ---------- seções ---------- */
initStarfield(document.getElementById('starfield') as HTMLCanvasElement);
initHero(heroHp);
initStory(storyHp);
initConfig(configHp);
initFeatures();
initMarquee();
initFaq();
initCta(finaleHp);
initCursor();

/* ---------- reveal on scroll (stagger nas features) ---------- */
document
  .querySelectorAll<HTMLElement>('.feature.reveal-up')
  .forEach((c, i) => c.style.setProperty('--d', `${i * 60}ms`));

const revealIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
);
document.querySelectorAll('.reveal-up').forEach((el) => revealIO.observe(el));

/* ---------- nav: fundo ao rolar + links ativos ---------- */
const nav = document.getElementById('nav')!;
const progressBar = document.getElementById('page-progress-bar')!;
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('.nav-link')];
const sections = navLinks
  .map((l) => document.querySelector<HTMLElement>(l.getAttribute('href')!))
  .filter((s): s is HTMLElement => !!s);

const sectionIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const id = `#${e.target.id}`;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      }
    }
  },
  { rootMargin: '-38% 0px -55% 0px' }
);
sections.forEach((s) => sectionIO.observe(s));

const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
