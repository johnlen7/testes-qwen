import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function useScrollScrub(
  ref: RefObject<HTMLElement>,
  onStepChange?: (step: number) => void,
) {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const metrics = useRef({ top: 0, height: 1, viewport: 1 });

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const updateMetrics = () => {
      const rect = section.getBoundingClientRect();
      metrics.current = {
        top: rect.top + window.scrollY,
        height: Math.max(1, section.offsetHeight),
        viewport: Math.max(1, window.innerHeight),
      };
    };

    const update = () => {
      const { top, height, viewport } = metrics.current;
      const travel = Math.max(1, height - viewport);
      const progress = reducedMotion ? 0 : clamp((window.scrollY - top) / travel);
      section.style.setProperty('--story-progress', progress.toFixed(4));
      section.style.setProperty('--story-separation', Math.sin(progress * Math.PI).toFixed(4));
      const nextStep = reducedMotion ? 0 : Math.min(2, Math.floor(progress * 3));
      setStep((current) => {
        if (current !== nextStep) {
          onStepChange?.(nextStep);
          return nextStep;
        }
        return current;
      });
    };

    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    updateMetrics();
    update();
    document.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    const observer = new ResizeObserver(() => {
      updateMetrics();
      schedule();
    });
    observer.observe(section);

    return () => {
      document.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [onStepChange, reducedMotion, ref]);

  return { step, reducedMotion };
}
