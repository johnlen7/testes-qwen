import { useRef } from 'react';
import { Icon } from './Icon';
import type { Theme } from '../types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: (origin: { x: number; y: number }) => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const nextTheme = theme === 'dark' ? 'claro' : 'escuro';

  return (
    <button
      ref={ref}
      className="theme-toggle"
      type="button"
      aria-label={`Ativar tema ${nextTheme}`}
      aria-pressed={theme === 'light'}
      onClick={() => {
        const bounds = ref.current?.getBoundingClientRect();
        onToggle({
          x: bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2,
          y: bounds ? bounds.top + bounds.height / 2 : 32,
        });
      }}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
      <span className="sr-only">Tema atual: {theme === 'dark' ? 'escuro' : 'claro'}</span>
    </button>
  );
}
