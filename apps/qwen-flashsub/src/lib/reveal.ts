import { prefersReducedMotion } from "./motion";

export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");

  if (prefersReducedMotion()) {
    for (const el of targets) el.classList.add("is-in");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number.parseFloat(el.dataset.revealDelay ?? "");
        if (Number.isFinite(delay)) el.style.setProperty("--d", `${delay}ms`);
        el.classList.add("is-in");
        observer.unobserve(el);
      }
    },
    { threshold: 0.15 }
  );

  for (const el of targets) observer.observe(el);
}
