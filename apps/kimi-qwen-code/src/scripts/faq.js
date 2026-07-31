// faq.js — accordion com roving keyboard navigation
const list = document.querySelector('.faq__list');

if (list) {
  const btns = [...list.querySelectorAll('.faq__btn')];

  function toggle(btn, force) {
    const item = btn.closest('.faq__item');
    const open = force !== undefined ? force : btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    if (open) item.setAttribute('data-open', '');
    else item.removeAttribute('data-open');
  }

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => toggle(btn));

    btn.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowDown') next = btns[(i + 1) % btns.length];
      else if (e.key === 'ArrowUp') next = btns[(i - 1 + btns.length) % btns.length];
      else if (e.key === 'Home') next = btns[0];
      else if (e.key === 'End') next = btns[btns.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
      }
    });
  });
}
