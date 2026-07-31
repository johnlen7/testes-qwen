import { Store } from './store';

const query = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Fonte única de verdade para prefers-reduced-motion. Toda animação decorativa
 * (JS ou WAAPI) DEVE checar `reducedMotion.get()` antes de animar e, se true,
 * aplicar o estado final diretamente (sem interpolação).
 */
export const reducedMotion = new Store<boolean>(query.matches);

query.addEventListener('change', (event) => {
  reducedMotion.set(event.matches);
});
