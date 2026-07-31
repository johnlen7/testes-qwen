/**
 * ÓRBITA — Chrome: header, tema, navegação ativa e progresso orbital.
 */

import './chrome.css';
import { qs, qsa, on } from '../lib/dom';
import { onFrame, lerp, prefersReducedMotion, onReducedMotionChange } from '../lib/motion';
import { pageProgress } from '../lib/scroll';

const THEME_BG: Record<string, string> = {
  dark: '#090d16',
  light: '#f3efe7',
};

const NAV_TARGETS = [
  { id: 'como-funciona', href: '#como-funciona' },
  { id: 'personalizar', href: '#personalizar' },
  { id: 'recursos', href: '#recursos' },
  { id: 'faq', href: '#faq' },
];

export function mountChrome(): void {
  const header = qs<HTMLElement>('[data-header]');
  const themeToggle = qs<HTMLButtonElement>('[data-theme-toggle]');
  const veil = qs<HTMLElement>('.theme-veil');
  const progressWidget = qs<HTMLElement>('[data-orbit-progress]');
  const satellite = qs<SVGGElement>('[data-orbit-satellite]');
  const ring = qs<SVGEllipseElement>('.orbit-progress__ring');

  initHeader(header);
  initNav();
  initTheme(themeToggle, veil);
  initProgress(progressWidget, satellite, ring);
}

/* ---------- header: fundo/blur ao rolar ---------- */
function initHeader(header: HTMLElement): void {
  function update(): void {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  update();
  on(window, 'scroll', update, { passive: true });
}

/* ---------- navegação ativa por IntersectionObserver ---------- */
function initNav(): void {
  const links = qsa<HTMLAnchorElement>('[data-nav-link]');
  if (links.length === 0) return;

  const byHref = new Map<string, HTMLAnchorElement>();
  links.forEach((link) => byHref.set(link.getAttribute('href') ?? '', link));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = NAV_TARGETS.find((t) => t.id === entry.target.id);
        const link = target ? byHref.get(target.href) : undefined;
        if (!link) return;
        link.classList.toggle('is-active', entry.isIntersecting);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );

  NAV_TARGETS.forEach((t) => {
    const section = document.getElementById(t.id);
    if (section) observer.observe(section);
  });
}

/* ---------- toggle de tema com reveal circular ---------- */
function initTheme(toggle: HTMLButtonElement, veil: HTMLElement): void {
  on(toggle, 'click', () => {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    if (prefersReducedMotion()) {
      applyTheme(next);
      return;
    }

    const rect = toggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    veil.style.background = THEME_BG[next];
    veil.style.opacity = '1';
    veil.style.clipPath = `circle(0px at ${x}px ${y}px)`;

    const anim = veil.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(140vmax at ${x}px ${y}px)` }],
      { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
    );

    anim.onfinish = () => {
      applyTheme(next);
      const fade = veil.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 250,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
      });
      fade.onfinish = () => {
        veil.style.clipPath = '';
        veil.style.background = '';
      };
    };
  });
}

function applyTheme(theme: 'dark' | 'light'): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('orbita-theme', theme);
  } catch {
    // localStorage pode estar indisponível em contextos restritos.
  }
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = THEME_BG[theme];
}

/* ---------- progresso orbital ---------- */
function initProgress(widget: HTMLElement, satellite: SVGGElement, ring: SVGEllipseElement): void {
  const rx = 26;
  const ry = 16;
  const cx = 32;
  const cy = 32;
  const rotDeg = -24;
  const rot = (rotDeg * Math.PI) / 180;

  // Perímetro aproximado da elipse (Ramanujan).
  const perimeter = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  ring.style.strokeDasharray = `${perimeter}`;

  let visible = false;
  let currentProgress = 0;

  function update(): void {
    const target = pageProgress();
    currentProgress = lerp(currentProgress, target, 0.12);

    const shouldShow = currentProgress > 0.05;
    widget.classList.toggle('is-visible', shouldShow);
    if (shouldShow && !visible) visible = true;

    const angle = currentProgress * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = cx + rx * cos * Math.cos(rot) - ry * sin * Math.sin(rot);
    const y = cy + rx * cos * Math.sin(rot) + ry * sin * Math.cos(rot);

    satellite.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    ring.style.strokeDashoffset = `${perimeter * (1 - currentProgress)}`;
  }

  // Pausa visual se o usuário preferir motion reduzida.
  let cleanupFrame = onFrame(update);
  let cleanupMotion = onReducedMotionChange((reduced) => {
    if (reduced) {
      cleanupFrame();
      const p = pageProgress();
      ring.style.strokeDashoffset = `${perimeter * (1 - p)}`;
      widget.classList.add('is-visible');
    } else {
      cleanupFrame = onFrame(update);
    }
  });

  // Inicia halo pulsando no satélite (apenas se motion completa).
  const halo = satellite.querySelector<SVGCircleElement>('.orbit-progress__halo');
  if (halo && !prefersReducedMotion()) {
    halo.animate(
      [
        { opacity: 0.35, transform: 'scale(1)' },
        { opacity: 0.12, transform: 'scale(1.6)' },
        { opacity: 0.35, transform: 'scale(1)' },
      ],
      { duration: 2400, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', iterations: Infinity },
    );
  }

  // Cleanup genérico para desmontagem (pouco usado neste site estático).
  window.addEventListener('beforeunload', () => {
    cleanupFrame();
    cleanupMotion();
  });
}
