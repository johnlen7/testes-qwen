import './styles/tokens.css';
import './styles/base.css';

import { initHeader } from './sections/header.js';
import { initHero } from './sections/hero.js';
import { initStory } from './sections/story.js';
import { initConfigurator } from './sections/configurator.js';
import { initFeatures } from './sections/features.js';
import { initMarquee } from './sections/marquee.js';
import { initFaq } from './sections/faq.js';
import { initOutro } from './sections/outro.js';

function boot() {
  const headerEl = document.getElementById('site-header');
  initHeader(headerEl);

  initHero(document.getElementById('hero'));
  initStory(document.getElementById('como-funciona'));
  initConfigurator(document.getElementById('configurador'));
  initFeatures(document.getElementById('features'));
  initMarquee(document.getElementById('depoimentos'));
  initFaq(document.getElementById('faq'));
  initOutro(document.getElementById('comprar'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
