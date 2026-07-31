/* ============================================================
   faq — accordion acessível
   Altura animada via WAAPI (0 → scrollHeight → auto).
   Roving tabindex + setas + Home/End.
   ============================================================ */

export function initFaq() {
  const items = [...document.querySelectorAll<HTMLElement>('.faq-item')];
  const buttons = items.map((item) => item.querySelector<HTMLButtonElement>('.faq-btn')!);
  const panels = items.map((item) => item.querySelector<HTMLElement>('.faq-panel')!);

  // estado inicial: itens com data-open
  items.forEach((item, i) => {
    if (item.dataset.open === 'true') {
      panels[i].classList.add('is-open');
      panels[i].style.height = 'auto';
      buttons[i].setAttribute('aria-expanded', 'true');
    }
  });

  const setOpen = (i: number, open: boolean) => {
    const panel = panels[i];
    const btn = buttons[i];
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (open === isOpen) return;

    const current = isOpen ? getH(panel) : panel.scrollHeight;

    if (open) {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.style.height = '0px';
      // força layout e anima de 0 → scrollHeight
      void panel.offsetHeight;
      const anim = panel.animate(
        [
          { height: '0px' },
          { height: `${current}px` }
        ],
        { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
      anim.onfinish = () => {
        panel.style.height = 'auto';
      };
    } else {
      btn.setAttribute('aria-expanded', 'false');
      panel.style.height = `${current}px`;
      void panel.offsetHeight;
      const anim = panel.animate(
        [
          { height: `${current}px` },
          { height: '0px' }
        ],
        { duration: 320, easing: 'cubic-bezier(0.77, 0, 0.18, 1)' }
      );
      anim.onfinish = () => {
        panel.classList.remove('is-open');
        panel.style.height = '0px';
      };
    }
  };

  function getH(el: HTMLElement): number {
    // altura atual medida quando o painel está aberto (height auto)
    const h = el.offsetHeight;
    return h > 0 ? h : el.scrollHeight;
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      setOpen(i, !open);
    });

    btn.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowDown') {
        e.preventDefault();
        buttons[(i + 1) % buttons.length].focus();
      } else if (k === 'ArrowUp') {
        e.preventDefault();
        buttons[(i - 1 + buttons.length) % buttons.length].focus();
      } else if (k === 'Home') {
        e.preventDefault();
        buttons[0].focus();
      } else if (k === 'End') {
        e.preventDefault();
        buttons[buttons.length - 1].focus();
      }
    });
  });
}
