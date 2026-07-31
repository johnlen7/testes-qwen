/* ============================================================
   ÓRBITA · bootstrap
   ============================================================ */

import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import { initTheme } from './js/theme.js';
import { initHero } from './js/hero.js';
import { initScrollStory } from './js/scrollstory.js';
import { initConfigurator } from './js/configurator.js';
import { initFeatures } from './js/features.js';
import { initMarquee } from './js/marquee.js';
import { initFaq } from './js/faq.js';
import { initCta } from './js/cta.js';

initTheme();
initHero();
initScrollStory();
initConfigurator();
initFeatures();
initMarquee();
initFaq();
initCta();
initHeaderScroll();

/* Header ganha fundo + blur leve após os primeiros pixels de scroll */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
}
