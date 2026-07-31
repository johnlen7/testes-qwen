import './header.css';

const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="5" />
  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
</svg>`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
</svg>`;

export function initHeader(el) {
  if (!el) return;

  el.classList.add('site-header');
  el.innerHTML = `
    <div class="container site-header__inner">
      <a href="#hero" class="site-header__wordmark" aria-label="ÓRBITA — ir para o topo">
        <span class="orb">Ó</span>RBITA
      </a>

      <nav class="site-header__nav" aria-label="Navegação principal">
        <ul class="site-header__nav-list">
          <li><a href="#como-funciona" class="site-header__nav-link">Como funciona</a></li>
          <li><a href="#configurador" class="site-header__nav-link">Configurar</a></li>
          <li><a href="#features" class="site-header__nav-link">Features</a></li>
          <li><a href="#faq" class="site-header__nav-link">FAQ</a></li>
        </ul>
      </nav>

      <div class="site-header__actions">
        <button
          type="button"
          class="theme-toggle"
          aria-pressed="false"
          aria-label="Ativar tema escuro"
        >
          <span class="theme-toggle__icon theme-toggle__icon--sun">${sunIcon}</span>
          <span class="theme-toggle__icon theme-toggle__icon--moon">${moonIcon}</span>
        </button>

        <button
          type="button"
          class="mobile-menu-btn"
          aria-expanded="false"
          aria-controls="site-header-nav"
          aria-label="Abrir menu"
        >
          <span class="mobile-menu-btn__bar" aria-hidden="true"></span>
          <span class="mobile-menu-btn__bar" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  `;

  const nav = el.querySelector('.site-header__nav');
  nav.id = 'site-header-nav';

  const toggleBtn = el.querySelector('.theme-toggle');
  const mobileBtn = el.querySelector('.mobile-menu-btn');
  const navLinks = el.querySelectorAll('.site-header__nav-link');

  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  function updateTheme(dark) {
    isDark = dark;
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('orbita-theme', theme);
    } catch (e) {
      // ignore
    }
    toggleBtn.setAttribute('aria-pressed', String(!dark));
    toggleBtn.setAttribute(
      'aria-label',
      dark ? 'Ativar tema claro' : 'Ativar tema escuro'
    );
  }

  updateTheme(isDark);

  toggleBtn.addEventListener('click', () => {
    updateTheme(!isDark);
  });

  function toggleMenu(open) {
    mobileBtn.setAttribute('aria-expanded', String(open));
    mobileBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
  }

  mobileBtn.addEventListener('click', () => {
    const open = mobileBtn.getAttribute('aria-expanded') === 'false';
    toggleMenu(open);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Scroll-driven background change
  let scrolled = false;
  function onScroll() {
    const shouldScroll = window.scrollY > 12;
    if (shouldScroll !== scrolled) {
      scrolled = shouldScroll;
      el.classList.toggle('is-scrolled', scrolled);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Close mobile menu on resize to desktop
  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth > 767) toggleMenu(false);
    },
    { passive: true }
  );
}
