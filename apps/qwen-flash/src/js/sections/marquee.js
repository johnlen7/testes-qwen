/* ============================================================
   ÓRBITA — marquee de depoimentos
   Loop infinito via Web Animations API (sem salto), pausa em
   hover e drag por pointer events (arrastar e soltar).
   A segunda fileira (.marquee--reverse) roda em direção oposta.
   ============================================================ */

import { reducedMotion, clamp } from '../utils.js';

const DURATION = 44000; // ms por volta completa

export function initMarquee() {
  const marquees = [...document.querySelectorAll('[data-marquee]')];
  marquees.forEach(initOne);
}

function initOne(root) {
  const list = root.querySelector('[data-marquee-track]');
  if (!list) return;

  const reverse = root.classList.contains('marquee--reverse');

  // conteúdo duplicado (aria-hidden) para loop perfeito
  const clone = list.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.classList.add('marquee__clone');
  clone.removeAttribute('data-marquee-track');

  const wrap = document.createElement('div');
  wrap.className = 'marquee__wrap';
  list.before(wrap);
  wrap.appendChild(list);
  wrap.appendChild(clone);

  const reduce = reducedMotion();

  // keyframes: -50% = exatamente um conjunto (itens usam margin-right,
  // sem gap no wrap → período perfeito, sem salto)
  const from = { transform: reverse ? 'translate3d(-50%,0,0)' : 'translate3d(0,0,0)' };
  const to = { transform: reverse ? 'translate3d(0,0,0)' : 'translate3d(-50%,0,0)' };

  const anim = wrap.animate([from, to], {
    duration: DURATION,
    iterations: Infinity,
    easing: 'linear',
  });

  if (reduce) {
    anim.pause();
    return;
  }

  let dragging = false;
  let startX = 0;
  let startTime = 0;
  let hovered = false;

  const playState = () => {
    if (!dragging && !hovered) anim.play();
    else anim.pause();
  };

  root.addEventListener('mouseenter', () => {
    hovered = true;
    playState();
  });
  root.addEventListener('mouseleave', () => {
    hovered = false;
    playState();
  });

  root.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startTime = anim.currentTime || 0;
    root.classList.add('is-dragging');
    anim.pause();
    root.setPointerCapture(e.pointerId);
  });

  root.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const width = wrap.getBoundingClientRect().width / 2; // metade = um conjunto
    if (width <= 0) return;
    const deltaPx = e.clientX - startX;
    const deltaMs = (deltaPx / width) * DURATION;
    anim.currentTime = clamp(startTime - deltaMs, 0, DURATION * 999999);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    playState();
  };

  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);
  // se o browser roubar a captura, nunca ficar preso em "pausado"
  root.addEventListener('lostpointercapture', endDrag);
}
