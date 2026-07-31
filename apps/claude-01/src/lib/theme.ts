import { Store } from './store';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'orbita-theme';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const theme = new Store<Theme>(getInitialTheme());

theme.subscribe((value) => {
  document.documentElement.setAttribute('data-theme', value);
  localStorage.setItem(STORAGE_KEY, value);
});

/**
 * Alterna o tema. Se o navegador suporta View Transitions e o usuário não pediu
 * reduced-motion, a troca vira um reveal circular a partir do botão de origem
 * (ver ::view-transition-new(root) em styles/base.css).
 */
export function toggleTheme(originEl?: HTMLElement): void {
  const next: Theme = theme.get() === 'dark' ? 'light' : 'dark';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.startViewTransition || reduced) {
    theme.set(next);
    return;
  }

  if (originEl) {
    const rect = originEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    document.documentElement.style.setProperty('--theme-origin-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-origin-y', `${y}px`);
  }

  document.startViewTransition(() => {
    theme.set(next);
  });
}
