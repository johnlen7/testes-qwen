import { clamp } from './lerp';

export interface ScrollScrubOptions {
  /** Elemento "alto" (N * 100vh) que define a distância de scroll da etapa. */
  wrapper: HTMLElement;
  onProgress: (progress: number) => void;
}

/**
 * Scrubbing real: progresso 0..1 mapeado à posição de scroll do wrapper,
 * não a triggers de entrada. Combinar com um filho `position: sticky; top: 0;
 * height: 100vh` para o efeito de "pin" clássico do scroll-telling.
 */
export function createScrollScrub({ wrapper, onProgress }: ScrollScrubOptions): () => void {
  let ticking = false;

  function compute() {
    const rect = wrapper.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = clamp(-rect.top, 0, Math.max(total, 1));
    const progress = total > 0 ? scrolled / total : 0;
    onProgress(clamp(progress, 0, 1));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(compute);
    }
  }

  compute();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

/** Trigger simples de entrada em viewport — usar para stagger de cards/grades. */
export function onEnterView(
  el: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { threshold: 0.2 }
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) callback(entry);
    });
  }, options);
  observer.observe(el);
  return () => observer.disconnect();
}
