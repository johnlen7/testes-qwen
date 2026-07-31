import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: (origin: { x: number; y: number }) => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand-mark-link" href="#top" aria-label="ÓRBITA, voltar ao início">
          <BrandMark />
        </a>
        <nav className="header-nav" aria-label="Navegação principal">
          <a href="#sistema">Sistema</a>
          <a href="#configurador">Configurar</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
