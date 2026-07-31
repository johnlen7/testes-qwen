import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { NAV } from '../../data/site';
import { prefersReducedMotion } from '../../lib/useReducedMotion';
import './Header.css';

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  /* Borda ao rolar — classList direto no ref (sem setState por frame),
     listener passivo com throttle via rAF */
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    burgerRef.current?.focus();
  }, []);

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  /* Esc fecha o menu móvel */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeMenu]);

  /* Trava o scroll do body enquanto o menu está aberto
     (useLayoutEffect: aplica/remove antes do paint, evitando salto) */
  useLayoutEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prev;
    };
  }, [open]);

  /* Link do menu móvel: fecha e rola suave até a âncora
     (após o lock de scroll sair, via rAF) */
  const handleMobileNav = (e: MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href?.startsWith('#')) return;
    e.preventDefault();
    closeMenu();
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <header className="header" ref={headerRef}>
      <div className="container header-inner">
        <a className="header-logo" href="#inicio">
          ÓRBITA
          <span className="header-logo-dot" aria-hidden="true" />
        </a>

        <nav className="header-nav" aria-label="Navegação principal">
          <ul className="header-nav-list">
            {NAV.map((item) => (
              <li key={item.href}>
                <a className="header-nav-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a className="btn btn--primary header-cta" href="#final-cta">
            Pré-venda
          </a>
          <ThemeToggle />
          <button
            type="button"
            ref={burgerRef}
            className="header-burger"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="header-menu"
            onClick={toggleMenu}
          >
            <svg
              className={`header-burger-icon${open ? ' is-open' : ''}`}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay full-screen do menu móvel (inert quando fechado) */}
      <div
        id="header-menu"
        className={`header-overlay${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        inert={!open}
        onClick={closeMenu}
      >
        <nav className="header-overlay-nav" aria-label="Navegação móvel">
          <ul>
            {NAV.map((item, index) => (
              <li key={item.href} style={{ '--i': index } as CSSProperties}>
                <a
                  className="header-overlay-link"
                  href={item.href}
                  onClick={handleMobileNav}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="btn btn--primary header-overlay-cta"
            href="#final-cta"
            onClick={handleMobileNav}
            style={{ '--i': NAV.length } as CSSProperties}
          >
            Pré-venda
          </a>
        </nav>
      </div>
    </header>
  );
}
