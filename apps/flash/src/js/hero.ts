/* ============================================================
   hero — entrada orquestrada + paralaxe de mouse (desktop)
   ============================================================ */

import { addFrame, RM, FINE_POINTER } from './motion';

export function initHero(hp: { svg: SVGSVGElement }) {
  const hero = document.getElementById('top')!;
  const stage = document.getElementById('hero-stage');
  const glow = hero.querySelector<HTMLElement>('.hero-glow');

  // entrada: classe dispara as transições em cascata (--d no HTML)
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-enter')));

  // paralaxe sutil no fone (desktop com mouse)
  if (RM || !FINE_POINTER) return;

  const svg = hp.svg;
  const cx = () => hero.offsetWidth / 2;
  const cy = () => hero.offsetHeight / 2;

  let tx = 0, ty = 0, curX = 0, curY = 0;
  let inView = true;

  const onMove = (e: PointerEvent) => {
    tx = (e.clientX - cx()) / cx();
    ty = (e.clientY - cy()) / cy();
  };
  const onLeave = () => {
    tx = 0;
    ty = 0;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('mouseleave', onLeave);

  addFrame(() => {
    curX += (tx - curX) * 0.08;
    curY += (ty - curY) * 0.08;
    if (Math.abs(curX) < 0.001 && Math.abs(curY) < 0.001) return;
    if (!inView) return;
    svg.style.transform = `perspective(1100px) rotateX(${(-curY * 5).toFixed(2)}deg) rotateY(${(curX * 7).toFixed(2)}deg)`;
    if (glow) {
      glow.style.transform = `translate(${(curX * 16).toFixed(1)}px, ${(curY * 10).toFixed(1)}px)`;
    }
  });

  // desliga o trabalho quando o hero sai da tela
  const io = new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
  });
  io.observe(stage ?? hero);
}
