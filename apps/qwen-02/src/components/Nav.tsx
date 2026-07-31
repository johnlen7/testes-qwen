import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'
import './nav.css'

const LINKS = [
  { href: '#tecnologia', label: 'Tecnologia' },
  { href: '#configurador', label: 'Configurador' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#faq', label: 'FAQ' },
]

/** Logo: planeta + anel + satélite orbitando continuamente (decorativo). */
function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="var(--accent)" strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="5" fill="var(--accent)" />
      <g className="logo-sat">
        <circle cx="28.5" cy="16" r="2.4" fill="var(--accent)" />
      </g>
    </svg>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setScrolled(window.scrollY > 12)
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a className="nav__brand" href="#topo" aria-label="ÓRBITA — voltar ao topo">
          <LogoMark />
          <span className="nav__wordmark">ÓRBITA</span>
        </a>

        <nav className="nav__links" aria-label="Seções da página">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <ThemeToggle />
          <a className="btn btn--primary nav__cta" href="#configurador">
            Comprar
          </a>
        </div>
      </div>
      <div className="nav__progress" ref={progressRef} aria-hidden="true" />
    </header>
  )
}
