import { clamp, tick } from "../lib/raf";
import { prefersReducedMotion } from "../lib/motion";
import { toggleTheme } from "../lib/theme";

export function initNav(): void {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", (e: MouseEvent) => {
      toggleTheme(e.clientX, e.clientY);
    });
  }

  const nav = document.querySelector<HTMLElement>(".nav");
  const sat = document.querySelector<SVGGElement>(".nav__orbit-sat");
  if (!nav || !sat) return;

  let scrollY = window.scrollY;

  const onScroll = (): void => {
    scrollY = window.scrollY;
    nav.classList.toggle("nav--scrolled", scrollY > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (prefersReducedMotion()) return;

  // assume o controle da rotação (a animação CSS gira continuamente)
  sat.style.animation = "none";

  tick(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(scrollY / max, 0, 1);
    sat.style.transform = `rotate(${progress * 360}deg)`;
  });
}
