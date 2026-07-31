import { useConfig } from '../context/ConfigContext'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggle } from './ThemeToggle'
import './header.css'

export function Header() {
  const { theme, toggle } = useTheme()
  const { color, price } = useConfig()

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <a href="#topo" className="site-header__logo" aria-label="ÓRBITA — início">
          <span className="site-header__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28">
              <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
              <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="16" cy="6" r="2.2" fill="var(--accent)" />
            </svg>
          </span>
          <span className="site-header__word">ÓRBITA</span>
        </a>

        <nav className="site-header__nav" aria-label="Seções">
          <a href="#como-funciona">Como funciona</a>
          <a href="#configurador">Configurar</a>
          <a href="#features">Recursos</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="site-header__actions">
          <ThemeToggle theme={theme} onToggle={toggle} />
          <a className="btn btn--primary site-header__cta" href="#configurador">
            <span className="site-header__cta-dot" style={{ background: color.ring }} aria-hidden="true" />
            R$ {price.toLocaleString('pt-BR')}
          </a>
        </div>
      </div>
    </header>
  )
}
