import '@fontsource-variable/fraunces';
import '@fontsource-variable/manrope';
import './styles/tokens.css';
import './styles/base.css';
import './styles/product.css';
import './styles/header.css';

import { theme, toggleTheme, type Theme } from './lib/theme';
import { createIcon } from './svg/icons';

import { mount as mountHero } from './sections/hero';
import { mount as mountScrollTelling } from './sections/scrollTelling';
import { mount as mountConfigurator } from './sections/configurator';
import { mount as mountFeatures } from './sections/features';
import { mount as mountTestimonials } from './sections/testimonials';
import { mount as mountFaq } from './sections/faq';
import { mount as mountCtaFooter } from './sections/ctaFooter';

function buildHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'site-header';

  const inner = document.createElement('div');
  inner.className = 'site-header__inner container';

  const logo = document.createElement('a');
  logo.href = '#hero';
  logo.className = 'site-header__logo';
  logo.textContent = 'ÓRBITA';

  const nav = document.createElement('nav');
  nav.className = 'site-header__nav';
  nav.setAttribute('aria-label', 'Navegação principal');
  const list = document.createElement('ul');
  const links: Array<[string, string]> = [
    ['#como-funciona', 'Como funciona'],
    ['#configurador', 'Configurar'],
    ['#depoimentos', 'Depoimentos'],
    ['#faq', 'Perguntas'],
  ];
  links.forEach(([href, label]) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    li.append(a);
    list.append(li);
  });
  nav.append(list);

  const right = document.createElement('div');
  right.className = 'site-header__right';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', 'Alternar tema claro/escuro');

  function renderToggleIcon(current: Theme) {
    toggleBtn.replaceChildren(createIcon(current === 'dark' ? 'sun' : 'moon'));
  }
  renderToggleIcon(theme.get());
  theme.subscribe((value) => renderToggleIcon(value));

  toggleBtn.addEventListener('click', () => toggleTheme(toggleBtn));
  right.append(toggleBtn);

  const cta = document.createElement('a');
  cta.href = '#configurador';
  cta.className = 'site-header__cta';
  cta.textContent = 'Configurar';
  right.append(cta);

  inner.append(logo, nav, right);
  header.append(inner);
  return header;
}

function mountApp(): void {
  const app = document.getElementById('app');
  if (!app) throw new Error('#app não encontrado');

  app.append(buildHeader());

  const main = document.createElement('main');
  main.id = 'main';

  const sectionMounters = [
    mountHero,
    mountScrollTelling,
    mountConfigurator,
    mountFeatures,
    mountTestimonials,
    mountFaq,
    mountCtaFooter,
  ];

  for (const mount of sectionMounters) {
    const slot = document.createElement('div');
    slot.className = 'section-slot';
    mount(slot);
    main.append(slot);
  }

  app.append(main);
}

mountApp();
