/**
 * ÓRBITA — bootstrap.
 * Marca <html class="js"> (estados iniciais de animação só com JS presente),
 * monta as instâncias do fone e inicializa cada seção.
 */
import './styles/tokens.css'
import './styles/base.css'
import './styles/headphone.css'
import './styles/hero.css'
import './styles/scrolltell.css'
import './styles/configurator.css'
import './styles/features.css'
import './styles/testimonials.css'
import './styles/faq.css'
import './styles/cta.css'
import './styles/theme.css'

import { mountAllHeadphones } from './components/headphone'
import { initHero } from './sections/hero'
import { initScrolltell } from './sections/scrolltell'
import { initConfigurator, initFinaleBinding } from './sections/configurator'
import { initReveals, initFeatures } from './sections/features'
import { initTestimonials } from './sections/testimonials'
import { initFaq } from './sections/faq'
import { initCta } from './sections/cta'
import { initTheme } from './sections/theme'

document.documentElement.classList.add('js')

const instances = mountAllHeadphones()

initTheme()
initHero()
initScrolltell(instances.tell)
initConfigurator()
initFinaleBinding()
initReveals()
initFeatures()
initTestimonials()
initFaq()
initCta()
