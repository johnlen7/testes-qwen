import { prefersReducedMotion } from "./motion";

export type Theme = "dark" | "light";

type ThemeListener = (theme: Theme) => void;

const STORAGE_KEY = "orbita-theme";
const META_COLORS: Record<Theme, string> = {
  dark: "#0a0c12",
  light: "#f4f1ea",
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

const listeners = new Set<ThemeListener>();

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = META_COLORS[theme];
  for (const fn of listeners) fn(theme);
}

export function initTheme(): void {
  applyTheme(getInitialTheme());
}

export function toggleTheme(originX?: number, originY?: number): void {
  const root = document.documentElement;
  const next: Theme = root.dataset.theme === "light" ? "dark" : "light";
  const doc = document as ViewTransitionDocument;

  if (doc.startViewTransition && !prefersReducedMotion()) {
    const rect = root.getBoundingClientRect();
    const x = originX ?? rect.width / 2;
    const y = originY ?? rect.height / 2;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    const dx = Math.max(x, rect.width - x);
    const dy = Math.max(y, rect.height - y);
    root.style.setProperty("--vt-r", `${Math.hypot(dx, dy)}px`);
    doc.startViewTransition(() => applyTheme(next));
  } else {
    applyTheme(next);
  }

  localStorage.setItem(STORAGE_KEY, next);
}

export function onThemeChange(cb: ThemeListener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
