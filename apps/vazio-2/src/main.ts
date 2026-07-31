// ÓRBITA — bootstrap.
// Estilos globais primeiro; depois cada seção é montada de forma isolada:
// se uma falhar, as demais continuam funcionando (erro fica no console).
import './styles/tokens.css';
import './styles/base.css';

import { mountChrome } from './sections/chrome';
import { mountHero } from './sections/hero';
import { mountScrolly } from './sections/scrolly';
import { mountConfigurator } from './sections/configurator';
import { mountFeatures } from './sections/features';
import { mountFaq } from './sections/faq';
import { mountTestimonials } from './sections/testimonials';
import { mountCta } from './sections/cta';

const mounts = [
  mountChrome,
  mountHero,
  mountScrolly,
  mountConfigurator,
  mountFeatures,
  mountFaq,
  mountTestimonials,
  mountCta,
];

for (const mount of mounts) {
  try {
    mount();
  } catch (err) {
    console.error(`[orbita] falha ao montar ${mount.name}:`, err);
  }
}
