/**
 * ÓRBITA — utilitários de scroll
 * Scrub de seção, reveal por IntersectionObserver e progresso global.
 */

import { prefersReducedMotion } from './motion';

export function onScrub(section: HTMLElement, cb: (progress: number) => void): () => void {
  let scheduled = false;
  let disposed = false;

  function compute(): void {
    if (disposed) return;

    const rect = section.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const travel = rect.height - viewportH;

    // progresso 0 → topo da seção toca o topo da viewport
    // progresso 1 → fim da seção toca o fim da viewport
    const progress = travel <= 0 ? 0 : clamp(-rect.top / travel, 0, 1);
    cb(progress);
    scheduled = false;
  }

  function requestCompute(): void {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(compute);
  }

  window.addEventListener('scroll', requestCompute, { passive: true });
  window.addEventListener('resize', requestCompute, { passive: true });
  compute();

  return () => {
    disposed = true;
    window.removeEventListener('scroll', requestCompute);
    window.removeEventListener('resize', requestCompute);
  };
}

export function reveal(
  target: Element | Element[],
  opts?: { threshold?: number; stagger?: number; className?: string },
): void {
  const elements = Array.isArray(target) ? target : [target];
  if (elements.length === 0) return;

  const threshold = opts?.threshold ?? 0.18;
  const stagger = opts?.stagger ?? 0;
  const className = opts?.className ?? 'is-in';

  if (prefersReducedMotion()) {
    elements.forEach((el) => el.classList.add(className));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;

        const reveal = () => entry.target.classList.add(className);
        const delay = stagger * index;

        if (delay > 0) {
          setTimeout(reveal, delay);
        } else {
          reveal();
        }
        observer.unobserve(entry.target);
      });
    },
    { threshold },
  );

  elements.forEach((el) => observer.observe(el));
}

export function pageProgress(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clamp(window.scrollY / scrollable, 0, 1);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
