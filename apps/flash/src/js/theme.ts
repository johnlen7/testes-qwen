/* ============================================================
   theme — prefers-color-scheme + localStorage + reveal circular
   ============================================================ */

import { RM } from './motion';

const KEY = 'orbita:theme';
const THEME_COLORS = { dark: '#070B12', light: '#F4F6F9' } as const;
type Theme = keyof typeof THEME_COLORS;

let btn: HTMLButtonElement | null = null;

export function initTheme() {
  btn = document.getElementById('theme-toggle') as HTMLButtonElement | null;
  const saved = localStorage.getItem(KEY);
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme: Theme =
    saved === 'light' || saved === 'dark' ? saved : prefersLight ? 'light' : 'dark';
  apply(theme);
  btn?.addEventListener('click', () => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    if (RM) {
      apply(next);
    } else {
      wipe(next, btn);
    }
  });
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
  const meta = document.getElementById('theme-color');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
  if (btn) btn.setAttribute('aria-pressed', String(theme === 'light'));
  document.dispatchEvent(new CustomEvent('orbita:theme'));
}

/**
 * Reveal circular: um círculo de fundo (na cor do novo tema) cresce
 * a partir do botão; quando cobre a tela, trocamos o tema por baixo
 * (com transições desligadas) e o círculo esmaece.
 */
function wipe(theme: Theme, origin: HTMLElement | null) {
  const html = document.documentElement;
  const wipeEl = document.querySelector<HTMLElement>('.theme-wipe');
  if (!wipeEl) {
    apply(theme);
    return;
  }
  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  // pinta o wipe com a cor do NOVO tema (fixo, independente do data-theme atual)
  wipeEl.style.background = THEME_COLORS[theme];
  wipeEl.style.opacity = '1';
  wipeEl.style.clipPath = `circle(0px at ${x}px ${y}px)`;

  html.classList.add('no-anim'); // segura transições de cor durante o wipe

  const anim = wipeEl.animate(
    [
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      { clipPath: `circle(${maxR + 80}px at ${x}px ${y}px)` }
    ],
    { duration: 620, easing: 'cubic-bezier(0.77, 0, 0.18, 1)' }
  );

  anim.onfinish = () => {
    apply(theme); // troca o tema escondido atrás do wipe
    wipeEl.style.opacity = '0';
    wipeEl.animate(
      [
        { opacity: 1 },
        { opacity: 0 }
      ],
      { duration: 320, easing: 'ease-out' }
    ).onfinish = () => {
      html.classList.remove('no-anim');
      wipeEl.style.clipPath = '';
      wipeEl.style.background = '';
    };
  };
}
