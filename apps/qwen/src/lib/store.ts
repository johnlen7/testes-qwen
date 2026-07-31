/**
 * Micro-store pub/sub — estado compartilhado (configurador ↔ CTA final)
 * sem framework. ~20 linhas, reatividade suficiente.
 */
export type Listener<T> = (state: T) => void

export interface Store<T> {
  get(): T
  set(partial: Partial<T>): void
  subscribe(fn: Listener<T>): () => void
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state: T = { ...initial }
  const listeners = new Set<Listener<T>>()

  return {
    get: () => state,
    set: (partial) => {
      state = { ...state, ...partial }
      listeners.forEach((fn) => fn(state))
    },
    subscribe: (fn) => {
      listeners.add(fn)
      fn(state) // emite estado atual na inscrição — UI nasce sincronizada
      return () => listeners.delete(fn)
    },
  }
}
