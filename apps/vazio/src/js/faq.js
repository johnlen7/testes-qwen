/* ============================================================
   ÓRBITA · FAQ (#faq)
   Accordion autoral: altura animada via grid-template-rows
   0fr → 1fr com transição (sem medir scrollHeight, sem salto).
   Acessível: aria-expanded, região com aria-labelledby,
   Enter/Espaço nativos de <button>, ↑/↓ movem foco entre
   perguntas, Home/End para as pontas. Ícone +/− gira por
   transform (CSS).
   ============================================================ */

export function initFaq() {
  const root = document.getElementById('faq');
  if (!root) return;

  const items = Array.from(root.querySelectorAll('.faq-item'));
  const buttons = items.map((item) => item.querySelector('.faq-q'));

  function toggle(i) {
    const item = items[i];
    const open = item.classList.toggle('is-open');
    buttons[i].setAttribute('aria-expanded', String(open));
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => toggle(i));

    btn.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowDown') target = (i + 1) % buttons.length;
      else if (e.key === 'ArrowUp') target = (i - 1 + buttons.length) % buttons.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = buttons.length - 1;
      if (target === null) return;
      e.preventDefault();
      buttons[target].focus();
    });
  });
}
