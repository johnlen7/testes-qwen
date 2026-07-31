import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  toggleTheme: (x: number, y: number) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const STORAGE_KEY = 'orbita-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined'
      ? ((document.documentElement.dataset.theme as Theme) ?? 'dark')
      : 'dark',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* privado — segue sem persistência */
    }
  }, [theme]);

  /**
   * Troca de tema com reveal circular (iris wipe).
   * O overlay pinta a cor do NOVO tema e expande do ponto do clique;
   * o flip real acontece oculto atrás do overlay no transitionend.
   */
  const toggleTheme = useCallback((x: number, y: number) => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setTheme(next);
      return;
    }

    const root = document.documentElement;
    const prev = root.dataset.theme;

    // Lê a cor do tema futuro sem pintar (getComputedStyle força reflow, não paint)
    root.dataset.theme = next;
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    const bg2 = getComputedStyle(root).getPropertyValue('--bg-2').trim();
    root.dataset.theme = prev;

    const overlay = document.createElement('div');
    overlay.className = 'theme-reveal';
    overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, ${bg2} 0%, ${bg} 70%)`;
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition =
          'clip-path 780ms cubic-bezier(0.65, 0, 0.35, 1)';
        overlay.style.clipPath = `circle(160vmax at ${x}px ${y}px)`;
      });
    });

    overlay.addEventListener(
      'transitionend',
      () => {
        root.dataset.theme = next;
        setTheme(next);
        overlay.remove();
      },
      { once: true },
    );
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
