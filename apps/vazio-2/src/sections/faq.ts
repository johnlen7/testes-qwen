/**
 * ÓRBITA — FAQ (§4.6)
 * Accordion autoral com animação de altura por grid-template-rows,
 * navegação por teclado e um painel aberto por vez.
 */

import './faq.css';
import { qs, qsa, on } from '../lib/dom';

export function mountFaq(): void {
  const list = qs<HTMLElement>('[data-faq]');
  const items = qsa<HTMLElement>('[data-faq-item]', list);
  const buttons = qsa<HTMLButtonElement>('[data-faq-button]', list);
  if (buttons.length === 0) return;

  const setOpen = (targetItem: HTMLElement, open: boolean): void => {
    const button = qs<HTMLButtonElement>('[data-faq-button]', targetItem);

    if (open) {
      // Fecha os demais itens — apenas um aberto por vez.
      items.forEach((item) => {
        if (item !== targetItem && item.classList.contains('is-open')) {
          const otherButton = qs<HTMLButtonElement>('[data-faq-button]', item);
          item.classList.remove('is-open');
          otherButton.setAttribute('aria-expanded', 'false');
        }
      });

      targetItem.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    } else {
      targetItem.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }
  };

  const toggle = (button: HTMLButtonElement): void => {
    const item = button.closest('[data-faq-item]') as HTMLElement | null;
    if (!item) return;
    const isOpen = item.classList.contains('is-open');
    setOpen(item, !isOpen);
  };

  buttons.forEach((button) => {
    on(button, 'click', () => toggle(button));
  });

  // Navegação por teclado entre os botões do accordion.
  on(list, 'keydown', (ev: Event) => {
    const e = ev as KeyboardEvent;
    const active = document.activeElement;
    if (!(active instanceof HTMLButtonElement) || !buttons.includes(active)) {
      return;
    }

    const index = buttons.indexOf(active);
    let next: HTMLButtonElement | null = null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        next = buttons[index + 1] ?? buttons[0];
        break;
      case 'ArrowUp':
        e.preventDefault();
        next = buttons[index - 1] ?? buttons[buttons.length - 1];
        break;
      case 'Home':
        e.preventDefault();
        next = buttons[0];
        break;
      case 'End':
        e.preventDefault();
        next = buttons[buttons.length - 1];
        break;
      default:
        return;
    }

    next?.focus();
  });
}
