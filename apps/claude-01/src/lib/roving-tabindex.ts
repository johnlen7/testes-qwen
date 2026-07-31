export interface RovingTabindexOptions {
  container: HTMLElement;
  itemSelector: string;
  onSelect: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  initialIndex?: number;
}

/** Roving tabindex para radiogroups autorais (cor do configurador, dots do carrossel). */
export function createRovingTabindex(options: RovingTabindexOptions): void {
  const { container, itemSelector, onSelect, orientation = 'horizontal', initialIndex = 0 } = options;
  const items = () => Array.from(container.querySelectorAll<HTMLElement>(itemSelector));

  function setActiveIndex(index: number, focus: boolean, notify: boolean) {
    const els = items();
    els.forEach((el, i) => {
      el.setAttribute('tabindex', i === index ? '0' : '-1');
      el.setAttribute('aria-checked', String(i === index));
    });
    if (focus) els[index]?.focus();
    if (notify) onSelect(index);
  }

  const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
  const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

  container.addEventListener('keydown', (event) => {
    const els = items();
    const currentIndex = els.findIndex((el) => el.getAttribute('tabindex') === '0');
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (event.key === nextKey) nextIndex = (currentIndex + 1) % els.length;
    else if (event.key === prevKey) nextIndex = (currentIndex - 1 + els.length) % els.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = els.length - 1;
    else return;

    event.preventDefault();
    setActiveIndex(nextIndex, true, true);
  });

  items().forEach((el, i) => {
    el.addEventListener('click', () => setActiveIndex(i, false, true));
  });

  setActiveIndex(initialIndex, false, false);
}
