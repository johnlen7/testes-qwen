// theme.js — toggle claro/escuro com reveal circular a partir do clique
const root = document.documentElement;
const btn = document.querySelector('[data-theme-toggle]');

function probeBg(theme) {
  const probe = document.createElement('div');
  probe.setAttribute('data-theme', theme);
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const bg = getComputedStyle(probe).getPropertyValue('--bg').trim();
  probe.remove();
  return bg;
}

function syncPressed() {
  btn?.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));
}

function apply(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem('orbita-theme', theme); } catch (e) {}
  syncPressed();
}

if (btn) {
  syncPressed();
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) { apply(next); return; }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText =
      `position:fixed;inset:0;z-index:150;pointer-events:none;` +
      `background:${probeBg(next)};clip-path:circle(0px at ${x}px ${y}px);`;
    document.body.appendChild(overlay);

    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const expand = overlay.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
      { duration: 620, easing: 'cubic-bezier(0.65,0,0.35,1)', fill: 'forwards' }
    );

    expand.finished
      .then(() => {
        apply(next);
        return overlay.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 260, easing: 'ease-out', fill: 'forwards' }
        ).finished;
      })
      .then(() => overlay.remove())
      .catch(() => { apply(next); overlay.remove(); });
  });
}
