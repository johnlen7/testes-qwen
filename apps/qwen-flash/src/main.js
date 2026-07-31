/* ============================================================
   ÓRBITA — main: boot dos módulos
   ============================================================ */

import { initHero } from './js/sections/hero.js';
import { initScrollTelling } from './js/sections/scrolltelling.js';
import { initConfigurator } from './js/sections/configurator.js';
import { initFeatures } from './js/sections/features.js';
import { initMarquee } from './js/sections/marquee.js';
import { initFaq } from './js/sections/faq.js';
import { initCta } from './js/sections/cta.js';
import { initTheme } from './js/sections/theme.js';
import { initReveals } from './js/utils.js';

function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

initTheme();
initNav();
initHero();
initScrollTelling();
initConfigurator();
initFeatures();
initMarquee();
initFaq();
initCta();
initReveals();
