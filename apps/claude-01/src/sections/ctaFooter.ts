import { productState, getCtaLabel } from '../state/productState';
import { createHeadphoneSVG } from '../svg/headphone';
import { onFrame } from '../lib/raf-loop';
import { reducedMotion } from '../lib/reduced-motion';
import { smoothDamp, clamp } from '../lib/lerp';
import { easingCSS } from '../lib/easing';
import './ctaFooter.css';

/** raio (px) a partir do centro do botão em que o efeito magnético passa a puxar. */
const MAGNETIC_RADIUS = 120;
/** fração do deslocamento do ponteiro seguida pelo botão. */
const MAGNETIC_STRENGTH = 0.35;
/** deslocamento máximo (px) do botão em qualquer eixo. */
const MAGNETIC_MAX = 14;
/** fator de suavização passado a smoothDamp — maior = alcança o alvo mais rápido. */
const SMOOTH_FACTOR = 14;

const currentYear = new Date().getFullYear();

export function mount(container: HTMLElement): void {
  const section = buildCtaSection();
  const footer = buildFooter();

  container.append(section, footer);

  const label = section.querySelector<HTMLSpanElement>('.cta-footer__button-label');
  const button = section.querySelector<HTMLButtonElement>('.cta-footer__button');
  const buttonWrap = section.querySelector<HTMLDivElement>('.cta-footer__button-wrap');

  if (label) {
    productState.subscribe((state) => {
      label.textContent = getCtaLabel(state);
    });
  }

  if (button) {
    button.addEventListener('pointerdown', (event) => spawnRipple(button, event));
  }

  if (button && buttonWrap) {
    setupMagneticButton(buttonWrap, button);
  }
}

function buildCtaSection(): HTMLElement {
  const section = document.createElement('section');
  section.id = 'comprar';
  section.className = 'cta-footer';

  const inner = document.createElement('div');
  inner.className = 'container cta-footer__inner';

  const visual = document.createElement('div');
  visual.className = 'cta-footer__visual';
  visual.setAttribute('aria-hidden', 'true');
  const svg = createHeadphoneSVG('Fone de ouvido ÓRBITA na cor selecionada');
  svg.classList.add('is-spinning');
  visual.append(svg);

  const content = document.createElement('div');
  content.className = 'cta-footer__content';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Pronto pra decolar';

  const heading = document.createElement('h2');
  heading.className = 'cta-footer__heading';
  heading.textContent = 'Leve o ÓRBITA com você';

  const lead = document.createElement('p');
  lead.className = 'cta-footer__lead';
  lead.textContent =
    'Frete grátis para todo o Brasil, garantia estendida de 2 anos e 30 dias para trocar de ideia.';

  const buttonWrap = document.createElement('div');
  buttonWrap.className = 'cta-footer__button-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cta-footer__button';

  const label = document.createElement('span');
  label.className = 'cta-footer__button-label';
  label.textContent = getCtaLabel(productState.get());

  button.append(label);
  buttonWrap.append(button);

  const fineprint = document.createElement('p');
  fineprint.className = 'cta-footer__fineprint';
  fineprint.textContent = 'Em até 12x sem juros. Envio em 24h.';

  content.append(eyebrow, heading, lead, buttonWrap, fineprint);
  inner.append(visual, content);
  section.append(inner);

  return section;
}

function spawnRipple(button: HTMLButtonElement, event: PointerEvent): void {
  if (reducedMotion.get()) return;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.8;
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'cta-footer__ripple';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - size / 2}px`;
  ripple.style.top = `${y - size / 2}px`;
  button.append(ripple);

  const animation = ripple.animate(
    [
      { transform: 'scale(0)', opacity: 0.5 },
      { transform: 'scale(1)', opacity: 0 },
    ],
    { duration: 620, easing: easingCSS.outQuint }
  );

  animation.onfinish = () => ripple.remove();
}

/**
 * Efeito magnético: enquanto o ponteiro está dentro de MAGNETIC_RADIUS do centro
 * do botão, ele é puxado em direção ao ponteiro via smoothDamp no loop de rAF
 * único. Só ativa em dispositivos com ponteiro fino e hover real, e respeita
 * reduced-motion (nesse caso o botão fica estático, só :hover de cor via CSS).
 */
function setupMagneticButton(wrap: HTMLDivElement, button: HTMLButtonElement): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let pointerX = -Infinity;
  let pointerY = -Infinity;
  let currentX = 0;
  let currentY = 0;
  let stopLoop: (() => void) | null = null;

  function handlePointerMove(event: PointerEvent): void {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }

  function resetTransform(): void {
    currentX = 0;
    currentY = 0;
    button.style.transform = '';
  }

  function tick(_time: number, delta: number): void {
    const rect = wrap.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = pointerX - centerX;
    const dy = pointerY - centerY;
    const distance = Math.hypot(dx, dy);

    let targetX = 0;
    let targetY = 0;
    if (distance < MAGNETIC_RADIUS) {
      const pull = 1 - distance / MAGNETIC_RADIUS;
      targetX = clamp(dx * MAGNETIC_STRENGTH * pull, -MAGNETIC_MAX, MAGNETIC_MAX);
      targetY = clamp(dy * MAGNETIC_STRENGTH * pull, -MAGNETIC_MAX, MAGNETIC_MAX);
    }

    currentX = smoothDamp(currentX, targetX, SMOOTH_FACTOR, delta || 16);
    currentY = smoothDamp(currentY, targetY, SMOOTH_FACTOR, delta || 16);

    if (targetX === 0 && targetY === 0 && Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
      button.style.transform = '';
    } else {
      button.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
    }
  }

  function start(): void {
    if (stopLoop) return;
    stopLoop = onFrame(tick);
    window.addEventListener('pointermove', handlePointerMove);
  }

  function stop(): void {
    stopLoop?.();
    stopLoop = null;
    window.removeEventListener('pointermove', handlePointerMove);
    resetTransform();
  }

  reducedMotion.subscribe((reduced) => {
    if (reduced) {
      stop();
    } else {
      start();
    }
  });
}

function buildFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';

  const inner = document.createElement('div');
  inner.className = 'container site-footer__inner';

  const brand = document.createElement('div');
  brand.className = 'site-footer__brand';

  const brandName = document.createElement('p');
  brandName.className = 'site-footer__logo';
  brandName.textContent = 'ÓRBITA';

  const claim = document.createElement('p');
  claim.className = 'site-footer__claim';
  claim.textContent = 'Som que acompanha sua órbita — em qualquer ambiente, em qualquer silêncio.';

  brand.append(brandName, claim);

  const groups = document.createElement('div');
  groups.className = 'site-footer__groups';

  const footerLinks: Array<{ title: string; links: string[] }> = [
    { title: 'Produto', links: ['Configurador', 'Recursos', 'Especificações', 'Comparar modos'] },
    { title: 'Suporte', links: ['Central de ajuda', 'Garantia', 'Trocas e devoluções', 'Contato'] },
    { title: 'Legal', links: ['Privacidade', 'Termos de uso', 'Cookies'] },
  ];

  footerLinks.forEach(({ title, links }) => {
    const group = document.createElement('div');
    group.className = 'site-footer__group';

    const heading = document.createElement('p');
    heading.className = 'site-footer__group-title';
    heading.textContent = title;

    const list = document.createElement('ul');
    list.className = 'site-footer__list';

    links.forEach((linkLabel) => {
      const item = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = '#';
      anchor.className = 'site-footer__link';
      anchor.textContent = linkLabel;
      item.append(anchor);
      list.append(item);
    });

    group.append(heading, list);
    groups.append(group);
  });

  inner.append(brand, groups);

  const bottom = document.createElement('div');
  bottom.className = 'site-footer__bottom';

  const copyright = document.createElement('p');
  copyright.className = 'site-footer__copyright';
  copyright.textContent = `© ${currentYear} ÓRBITA. Todos os direitos reservados.`;

  bottom.append(copyright);

  footer.append(inner, bottom);

  return footer;
}
