import './footer.css'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__word">ÓRBITA</span>
          <p>Cancelamento adaptativo espacial. Produto fictício · desafio frontend.</p>
        </div>
        <nav className="site-footer__nav" aria-label="Rodapé">
          <a href="#como-funciona">Como funciona</a>
          <a href="#configurador">Configurar</a>
          <a href="#features">Recursos</a>
          <a href="#faq">FAQ</a>
          <a href="#comprar">Pré-encomenda</a>
        </nav>
        <p className="site-footer__meta">
          © {new Date().getFullYear()} ÓRBITA · Feito com CSS, rAF e teimosia
        </p>
      </div>
    </footer>
  )
}
