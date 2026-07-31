/**
 * Tema claro/escuro.
 * - Início: prefers-color-scheme (aplicado por script inline no <head>).
 * - Toggle: reveal circular via View Transitions API (fallback: troca direta).
 * - Persiste em localStorage.
 */

import { prefersReducedMotion } from "./motion";

const KEY = "orbita-theme";
type Theme = "dark" | "light";

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
}
type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

function current(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage indisponível — segue sem persistir */
  }
  syncButton();
}

function syncButton(): void {
  const btn = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (btn) btn.setAttribute("aria-pressed", String(current() === "light"));
}

function toggleAt(x: number, y: number): void {
  const next: Theme = current() === "dark" ? "light" : "dark";

  const doc = document as VTDocument;
  const supportsVT =
    typeof doc.startViewTransition === "function" && !prefersReducedMotion();

  if (!supportsVT || !doc.startViewTransition) {
    apply(next);
    return;
  }

  const transition = doc.startViewTransition(() => apply(next));
  transition.ready
    .then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {
      /* view transition cancelada — o tema já foi aplicado */
    });
}

export function initTheme(): void {
  syncButton();
  const btn = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    toggleAt(x, y);
  });
}
