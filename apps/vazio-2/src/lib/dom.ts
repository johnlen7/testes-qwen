/**
 * ÓRBITA — utilitários DOM
 * qs/qsa/on: wrappers enxutos e seguros para query e eventos.
 */

export function qs<T extends Element = Element>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector(selector);
  if (!el) {
    throw new Error(`qs: elemento não encontrado para "${selector}"`);
  }
  return el as T;
}

export function qsa<T extends Element = Element>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll(selector)) as T[];
}

export function on(
  el: EventTarget,
  type: string,
  cb: (ev: Event) => void,
  opts?: AddEventListenerOptions,
): () => void {
  el.addEventListener(type, cb, opts);
  return () => el.removeEventListener(type, cb, opts);
}
