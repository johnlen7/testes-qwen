import { useCallback, useEffect, useRef, useState } from 'react';
import type { Theme } from '../types';

const storageKey = 'orbita-theme';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(storageKey);
  return saved === 'light' || saved === 'dark'
    ? saved
    : document.documentElement.dataset.theme === 'light' || document.documentElement.dataset.theme === 'dark'
      ? document.documentElement.dataset.theme
      : systemTheme();
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const sweepTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#090B0E' : '#EFF2F0');
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return;
    const update = () => setTheme(media.matches ? 'dark' : 'light');
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => () => {
    if (sweepTimeout.current) window.clearTimeout(sweepTimeout.current);
  }, []);

  const toggleTheme = useCallback((origin?: { x: number; y: number }) => {
    if (origin) {
      document.documentElement.style.setProperty('--theme-x', `${origin.x}px`);
      document.documentElement.style.setProperty('--theme-y', `${origin.y}px`);
    }
    document.documentElement.classList.remove('theme-sweep');
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add('theme-sweep');
    if (sweepTimeout.current) window.clearTimeout(sweepTimeout.current);
    sweepTimeout.current = window.setTimeout(() => {
      document.documentElement.classList.remove('theme-sweep');
      sweepTimeout.current = undefined;
    }, 700);
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(storageKey, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
