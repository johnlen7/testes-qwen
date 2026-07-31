/* ============================================================
   ÓRBITA · tema claro/escuro
   Toggle com reveal circular: overlay fixed expande via
   clip-path: circle() a partir das coordenadas do botão;
   o data-theme troca no ponto médio da animação.
   Persiste em localStorage (chave "orbita-theme").
   O tema inicial é definido por script inline no <head>.
   ============================================================ */

const KEY = 'orbita-theme';

/* Espelho dos tokens --bg de tokens.css (o overlay precisa da cor
   do PRÓXIMO tema antes dele estar ativo). */
const THEME_BG = {
  dark: '#070910',
  light: '#edeef2'
};

const MIDPOINT_MS = 300; // metade de --d3 (600ms)
const TOTAL_MS = 650;

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function syncButton(btn) {
  const isLight = getTheme() === 'light';
  btn.setAttribute('aria-pressed', String(isLight));
  btn.classList.toggle('is-light', isLight);
}

function applyTheme(theme, btn) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch (e) {
    /* storage indisponível: tema vale só para a sessão */
  }
  syncButton(btn);
}

export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const overlay = document.getElementById('theme-reveal');
  if (!btn) return;

  syncButton(btn);

  btn.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !overlay) {
      applyTheme(next, btn);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    overlay.style.background = THEME_BG[next];
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.classList.add('is-active');
    void overlay.offsetWidth; // força reflow para a transição engatar
    overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

    window.setTimeout(() => applyTheme(next, btn), MIDPOINT_MS);
    window.setTimeout(() => {
      overlay.classList.remove('is-active');
      overlay.style.clipPath = 'circle(0px at 50% 50%)';
    }, TOTAL_MS);
  });
}
