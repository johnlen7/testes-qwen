import './outro.css';
import { renderProduct, PRODUCT_COLORS } from '../lib/product.js';
import {
  COLOR_MAP,
  SIZE_NAMES,
  subscribe,
  priceOf,
  labelOf,
  formatBRL
} from '../lib/store.js';
import { reducedMotion, lerp, createRafLoop } from '../lib/motion.js';
import { observeReveal } from '../lib/reveal.js';

const SIZE_KEYS = ['p', 'm', 'g'];

function sizeScale(size) {
  return size === 'p' ? 0.9 : size === 'g' ? 1.12 : 1;
}

function setProductColorVars(wrap, color) {
  const hex = COLOR_MAP[color];
  wrap.style.setProperty('--product-shell', hex);
  wrap.style.setProperty('--product-shade', PRODUCT_COLORS.shade(hex));
  wrap.style.setProperty('--product-highlight', PRODUCT_COLORS.highlight(hex));
}

function setCupScale(wrap, size) {
  wrap.style.setProperty('--outro-cup-scale', String(sizeScale(size)));
}

function animateTextChange(el, nextText) {
  if (el.textContent === nextText) return;
  if (reducedMotion()) {
    el.textContent = nextText;
    return;
  }
  el.classList.add('is-changing');
  const anim = el.animate(
    [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-6px)', offset: 0.45 },
      { opacity: 0, transform: 'translateY(6px)', offset: 0.55 },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    { duration: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  );
  anim.onfinish = () => {
    el.textContent = nextText;
    el.classList.remove('is-changing');
  };
}

function createRipple(button, event) {
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const ripple = document.createElement('span');
  ripple.className = 'outro-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  button.appendChild(ripple);

  const anim = ripple.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.45 },
      { transform: 'translate(-50%, -50%) scale(2.6)', opacity: 0 }
    ],
    { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
  );
  anim.onfinish = () => ripple.remove();
}

export function initOutro(el) {
  if (!el) return;

  el.innerHTML = `
    <div class="container outro-hero">
      <div class="outro-copy" data-reveal="0">
        <span class="mono outro-eyebrow">SYS.07 — FECHAMENTO</span>
        <h2 id="outro-title" class="outro-title">O silêncio espera por você.</h2>
        <p class="outro-lead">
          Leve o observatório para qualquer lugar. O ÓRBITA vem na configuração que você escolheu.
        </p>

        <div class="outro-product-mini" data-reveal="1">
          <div class="outro-product-wrap" id="outro-product-wrap" role="img" aria-label="Fone de ouvido ÓRBITA na configuração escolhida"></div>
          <p class="mono outro-label" id="outro-label"></p>
        </div>

        <button type="button" class="outro-cta magnetic" id="outro-cta">
          <span class="outro-cta-text" id="outro-cta-text"></span>
        </button>
      </div>
    </div>

    <footer class="outro-footer" data-reveal="2">
      <div class="container footer-grid">
        <div class="footer-brand">
          <span class="footer-wordmark">ÓRBITA</span>
        </div>

        <nav class="footer-col" aria-label="Produto">
          <h3 class="mono footer-heading">Produto</h3>
          <ul>
            <li><a href="#">Especificações</a></li>
            <li><a href="#">Cores e acabamentos</a></li>
            <li><a href="#">Acessórios</a></li>
            <li><a href="#">Comparar</a></li>
          </ul>
        </nav>

        <nav class="footer-col" aria-label="Suporte">
          <h3 class="mono footer-heading">Suporte</h3>
          <ul>
            <li><a href="#">Central de ajuda</a></li>
            <li><a href="#">Garantia orbital</a></li>
            <li><a href="#">Rastrear pedido</a></li>
            <li><a href="#">Contato</a></li>
          </ul>
        </nav>

        <nav class="footer-col" aria-label="Legal">
          <h3 class="mono footer-heading">Legal</h3>
          <ul>
            <li><a href="#">Termos de uso</a></li>
            <li><a href="#">Privacidade</a></li>
            <li><a href="#">Cookies</a></li>
            <li><a href="#">Licenças</a></li>
          </ul>
        </nav>
      </div>

      <div class="container footer-bottom">
        <p class="mono footer-copyright">ÓRBITA © 2026 — Produto fictício · Desafio frontend</p>
        <p class="footer-note">Tema escolhido pelo explorador.</p>
      </div>
    </footer>
  `;

  const wrap = el.querySelector('#outro-product-wrap');
  const labelEl = el.querySelector('#outro-label');
  const cta = el.querySelector('#outro-cta');
  const ctaText = el.querySelector('#outro-cta-text');

  wrap.innerHTML = renderProduct({ color: 'grafite', size: 'm', id: 'outro' });

  function updateUI(state) {
    setProductColorVars(wrap, state.color);
    setCupScale(wrap, state.size);

    const label = labelOf(state);
    const price = formatBRL(priceOf(state));
    labelEl.textContent = `${label} — ${price}`;

    animateTextChange(ctaText, `Comprar ÓRBITA — ${label}, ${price}`);
  }

  const unsubscribe = subscribe(updateUI);

  cta.addEventListener('click', (e) => {
    createRipple(cta, e);
  });

  const reveal = observeReveal(el);

  const magneticEnabled =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !reducedMotion();

  if (magneticEnabled) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    el.addEventListener('pointermove', (e) => {
      const rect = cta.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = 120;

      if (dist <= radius && dist > 0) {
        const pull = (radius - dist) / radius;
        targetX = dx * 0.35 * pull;
        targetY = dy * 0.35 * pull;
      } else {
        targetX = 0;
        targetY = 0;
      }
    });

    el.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });

    const loop = createRafLoop(() => {
      currentX = lerp(currentX, targetX, 0.12);
      currentY = lerp(currentY, targetY, 0.12);
      cta.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }, { element: el });

    loop.start();

    return () => {
      unsubscribe();
      loop.destroy();
      reveal.destroy();
    };
  }

  return () => {
    unsubscribe();
    reveal.destroy();
  };
}
