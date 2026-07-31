export type Listener<T> = (value: T) => void;

/** Pub/sub mínimo — fonte única de verdade compartilhada entre seções (tema, produto, reduced-motion). */
export class Store<T> {
  private value: T;
  private listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  set(next: T): void {
    if (Object.is(next, this.value)) return;
    this.value = next;
    this.listeners.forEach((listener) => listener(this.value));
  }

  update(fn: (value: T) => T): void {
    this.set(fn(this.value));
  }

  subscribe(listener: Listener<T>, immediate = true): () => void {
    this.listeners.add(listener);
    if (immediate) listener(this.value);
    return () => this.listeners.delete(listener);
  }
}
