import './footer.css'

const LINKS = [
  { href: '#tecnologia', label: 'Tecnologia' },
  { href: '#configurador', label: 'Configurador' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'FAQ' },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <a className="footer__brand" href="#topo" aria-label="ÓRBITA — voltar ao topo">
            <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
              <circle cx="16" cy="16" r="12.5" fill="none" stroke="var(--accent)" strokeOpacity="0.35" />
              <circle cx="16" cy="16" r="5" fill="var(--accent)" />
              <circle cx="28.5" cy="16" r="2.4" fill="var(--accent)" />
            </svg>
            <span className="footer__wordmark">ÓRBITA</span>
          </a>
          <nav className="footer__nav" aria-label="Links do rodapé">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="footer__link">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer__bottom">
          <p>© 2026 ÓRBITA. Produto fictício criado como demonstração de engenharia frontend.</p>
          <p>Feito à mão — animação e componentes autorais, sem bibliotecas proibidas.</p>
        </div>
      </div>
    </footer>
  )
}
