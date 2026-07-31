/* ============================================================
   ÓRBITA — tema claro/escuro
   Default: prefers-color-scheme. Escolha pinada em localStorage
   (script inline anti-FOUC no <head>). Transição com View
   Transitions API (reveal circular) + fallback direto.
   ============================================================ */

const STORAGE_KEY = 'orbita-theme';

export function initTheme() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;

  const root = document.documentElement;
  const meta = document.querySelector('meta[name="color-scheme"]');

  const current = () => {
    const pinned = root.getAttribute('data-theme');
    if (pinned === 'dark' || pinned === 'light') return pinned;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const sync = () => {
    const t = current();
    btn.setAttribute('aria-checked', String(t === 'light'));
    btn.setAttribute('aria-label', t === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
  };

  const apply = (t) => {
    root.setAttribute('data-theme', t);
    if (meta) meta.content = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch (e) {
      /* armazenamento indisponível: segue sem persistir */
    }
    sync();
  };

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';

    // origem do clique → centro do reveal circular
    const r = btn.getBoundingClientRect();
    root.style.setProperty('--vt-x', `${(r.left + r.width / 2).toFixed(1)}px`);
    root.style.setProperty('--vt-y', `${(r.top + r.height / 2).toFixed(1)}px`);

    if (document.startViewTransition) {
      document.startViewTransition(() => apply(next));
    } else {
      apply(next);
    }
  });

  sync();
}
