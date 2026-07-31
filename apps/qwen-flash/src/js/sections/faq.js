/* ============================================================
   ÓRBITA — FAQ: accordion acessível (Enter/Espaço, setas, aria)
   Altura animada via grid-template-rows 0fr↔1fr (CSS).
   ============================================================ */

export function initFaq() {
  const root = document.querySelector('[data-faq]');
  if (!root) return;

  const buttons = [...root.querySelectorAll('[data-faq-btn]')];

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // fecha todos (acordeão exclusivo)
      buttons.forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.faq__item')?.classList.remove('is-open');
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        btn.closest('.faq__item')?.classList.add('is-open');
      }
    });

    // navegação por setas (roving tabindex)
    btn.addEventListener('keydown', (e) => {
      let next = null;
      const n = buttons.length;
      if (e.key === 'ArrowDown') next = buttons[(i + 1) % n];
      else if (e.key === 'ArrowUp') next = buttons[(i - 1 + n) % n];
      else if (e.key === 'Home') next = buttons[0];
      else if (e.key === 'End') next = buttons[n - 1];
      if (next) {
        e.preventDefault();
        next.focus();
      }
    });
  });
}
