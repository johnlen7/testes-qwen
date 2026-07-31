import { NAV } from '../../data/site';
import './Footer.css';

const PRODUCT_LINKS = [
  { href: '#configurar', label: 'Configurar' },
  { href: '#final-cta', label: 'Pré-venda' },
  { href: '#faq', label: 'Garantia' },
];

const SOCIALS = ['Instagram', 'YouTube', 'X / Twitter'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <p className="foot-logo">
              ÓRBITA<span className="foot-logo-dot" aria-hidden="true">.</span>
            </p>
            <p className="foot-tagline">O som encontra o seu espaço.</p>
          </div>

          <nav className="foot-col" aria-label="Navegação do site">
            <h3 className="foot-col-title">Navegar</h3>
            <ul className="foot-list">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a className="foot-link" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="foot-col">
            <h3 className="foot-col-title">Produto</h3>
            <ul className="foot-list">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <a className="foot-link" href={l.href}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="foot-col">
            <h3 className="foot-col-title">Siga</h3>
            <ul className="foot-list">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <a className="foot-link" href="#" aria-label={`${s} (abre em nova aba)`}>
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <p>© 2026 ÓRBITA Áudio. Todos os direitos reservados.</p>
          <p>Desenhado e construído à mão — sem bibliotecas.</p>
        </div>
      </div>
    </footer>
  );
}
