/** Media queries reativas — fonte única de verdade para reduced-motion e touch. */

export const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
export const mqFinePointer = window.matchMedia('(pointer: fine)')

export const prefersReducedMotion = (): boolean => mqReduced.matches
export const hasFinePointer = (): boolean => mqFinePointer.matches

/** Executa fn agora e a cada mudança da query. */
export function watchMedia(mq: MediaQueryList, fn: () => void): void {
  fn()
  mq.addEventListener('change', fn)
}
