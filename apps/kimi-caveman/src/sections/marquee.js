import './marquee.css';
import { reducedMotion, lerp, clamp, createRafLoop } from '../lib/motion.js';
import { observeReveal } from '../lib/reveal.js';

const testimonials = [
  {
    quote: 'Pela primeira vez ouço todos os detalhes da mixagem sem forçar o volume. A imagem estéreo é cirúrgica.',
    name: 'Marina Costa',
    role: 'Produtora musical',
  },
  {
    quote: 'O cancelamento transformou voos longos. O ruído da turbina some em segundos — é quase estranho no começo.',
    name: 'Ricardo Almeida',
    role: 'Engenheiro de voo',
  },
  {
    quote: 'Saí de casa na sexta com 80% e só precisei carregar na segunda. A bateria parece não acabar.',
    name: 'Paula Nunes',
    role: 'Jornalista de política',
  },
  {
    quote: 'Uso o dia todo em calls e nunca senti pressão nas têmporas. O ajuste é discreto e firme.',
    name: 'Felipe Sato',
    role: 'Arquiteto de soluções',
  },
  {
    quote: 'A construção é sólida, com acabamento de precisão. Parece um instrumento, não um acessório.',
    name: 'Camila Rocha',
    role: 'Designer de produto',
  },
  {
    quote: 'Criei um preset para cada projeto. O EQ paramétrico mudou minha relação com streaming.',
    name: 'André Lopes',
    role: 'Músico e professor',
  },
];

function renderTestimonial(t) {
  return `
    <figure class="testimonial-card" tabindex="0">
      <div class="testimonial-quote-mark" aria-hidden="true">“</div>
      <blockquote class="testimonial-quote">${t.quote}</blockquote>
      <figcaption class="testimonial-author">
        <span class="testimonial-name mono">${t.name}</span>
        <span class="testimonial-role">${t.role}</span>
      </figcaption>
    </figure>
  `;
}

export function initMarquee(el) {
  if (!el) return;

  const cardsHtml = testimonials.map(renderTestimonial).join('');

  el.innerHTML = `
    <div class="marquee">
      <div class="container">
        <header class="marquee__header" data-reveal="0">
          <span class="marquee__eyebrow mono">SYS.04 — VOZES</span>
          <h2 class="marquee__title">Quem usa, recomenda</h2>
        </header>
      </div>
      <div class="marquee__viewport" role="region" aria-label="Depoimentos de usuários">
        <div class="marquee__track" data-marquee-track>
          <div class="marquee__set" aria-hidden="false">${cardsHtml}</div>
          <div class="marquee__set" aria-hidden="true">${cardsHtml}</div>
        </div>
      </div>
    </div>
  `;

  const track = el.querySelector('[data-marquee-track]');
  const viewport = el.querySelector('.marquee__viewport');
  const rm = reducedMotion();

  observeReveal(el);

  if (rm) {
    viewport.classList.add('marquee__viewport--reduced');
    return;
  }

  let setWidth = 0;
  const setEl = track.querySelector('.marquee__set');
  const measure = () => {
    setWidth = setEl.getBoundingClientRect().width;
  };
  measure();

  const state = {
    x: 0,
    speed: 40,
    targetSpeed: 40,
    dragging: false,
    pointerDown: false,
    lastPointerX: 0,
    velocity: 0,
    momentum: false,
    hovered: false,
    focused: false,
  };

  const updateTargetSpeed = () => {
    if (state.dragging || state.momentum) {
      state.targetSpeed = 0;
    } else if (state.hovered || state.focused) {
      state.targetSpeed = 0;
    } else {
      state.targetSpeed = 40;
    }
  };

  viewport.addEventListener('pointerenter', () => { state.hovered = true; updateTargetSpeed(); });
  viewport.addEventListener('pointerleave', () => { state.hovered = false; updateTargetSpeed(); });
  viewport.addEventListener('focusin', () => { state.focused = true; updateTargetSpeed(); });
  viewport.addEventListener('focusout', () => { state.focused = false; updateTargetSpeed(); });

  viewport.addEventListener('pointerdown', (e) => {
    state.pointerDown = true;
    state.dragging = true;
    state.momentum = false;
    state.velocity = 0;
    state.lastPointerX = e.clientX;
    viewport.setPointerCapture(e.pointerId);
    updateTargetSpeed();
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!state.dragging || setWidth <= 0) return;
    const dx = e.clientX - state.lastPointerX;
    state.lastPointerX = e.clientX;
    state.x = clamp(state.x + dx, -setWidth, 0);
    state.velocity = dx;
  });

  const release = (e) => {
    if (!state.pointerDown) return;
    state.pointerDown = false;
    state.dragging = false;
    viewport.releasePointerCapture(e.pointerId);
    if (Math.abs(state.velocity) > 0.5) {
      state.momentum = true;
    }
    updateTargetSpeed();
  };

  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);

  let lastTime = performance.now();
  const loop = createRafLoop(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Lerp drift speed for buttery pause/resume.
    state.speed = lerp(state.speed, state.targetSpeed, 0.08);

    if (state.momentum) {
      state.x = clamp(state.x + state.velocity, -setWidth, 0);
      state.velocity *= 0.92;
      if (Math.abs(state.velocity) < 2 || state.x === -setWidth || state.x === 0) {
        state.momentum = false;
        updateTargetSpeed();
      }
    } else if (!state.dragging) {
      state.x -= state.speed * dt;
      // Seamless loop: the track contains two identical sets.
      if (setWidth > 0 && state.x < -setWidth) {
        state.x += setWidth;
      }
    }

    track.style.transform = `translate3d(${state.x}px, 0, 0)`;
  }, { element: el });

  loop.start();

  window.addEventListener('resize', measure, { passive: true });
}
