import './hero.css';
import { reducedMotion } from '../lib/reduced-motion';
import { onFrame } from '../lib/raf-loop';
import { easingCSS } from '../lib/easing';
import { smoothDamp, clamp } from '../lib/lerp';
import { createHeadphoneSVG } from '../svg/headphone';

const PARTICLE_COUNT = 24;

interface Particle {
  angle: number;
  radius: number; // fração do lado do container (0..~0.4)
  speed: number; // rad/s
  size: number;
  hue: 'accent' | 'signal';
  opacity: number;
}

interface RevealOptions {
  delay: number;
  distanceX?: number;
  distanceY?: number;
  scale?: number;
  duration?: number;
  easing?: string;
}

/**
 * Anima a entrada de um elemento via WAAPI e devolve o controle ao CSS assim
 * que termina — evita que uma animação "fill: forwards" concluída continue
 * sobrepondo transforms aplicados depois (ex.: paralaxe de ponteiro).
 */
function reveal(el: HTMLElement, opts: RevealOptions): void {
  const { delay, distanceX = 0, distanceY = 0, scale = 1, duration = 760, easing = easingCSS.outExpo } = opts;
  const anim = el.animate(
    [
      { opacity: 0, transform: `translate3d(${distanceX}px, ${distanceY}px, 0) scale(${scale})` },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
    ],
    { duration, delay, easing, fill: 'forwards' }
  );
  anim.finished.then(() => anim.cancel()).catch(() => undefined);
}

function playEntrance(
  eyebrow: HTMLElement,
  title: HTMLElement,
  subtitle: HTMLElement,
  cta: HTMLElement,
  visual: HTMLElement
): void {
  if (reducedMotion.get()) return; // já estão no estado final — nada a fazer

  reveal(eyebrow, { delay: 120, distanceY: 16, duration: 560 });
  reveal(title, { delay: 220, distanceY: 32, duration: 820, easing: easingCSS.outQuint });
  reveal(visual, { delay: 320, distanceX: 40, scale: 0.94, duration: 900 });
  reveal(subtitle, { delay: 420, distanceY: 24, duration: 700 });
  reveal(cta, { delay: 560, distanceY: 18, duration: 640, easing: easingCSS.outBack });
}

/** Poeira orbital autoral em Canvas 2D, alinhada aos anéis do SVG do produto. */
function initParticles(canvas: HTMLCanvasElement, host: HTMLElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    angle: (i / PARTICLE_COUNT) * Math.PI * 2,
    radius: 0.11 + (i % 6) * 0.045,
    speed: (0.1 + (i % 4) * 0.045) * (i % 2 === 0 ? 1 : -1),
    size: 1 + (i % 3) * 0.7,
    hue: (i % 5 === 0 ? 'signal' : 'accent') as Particle['hue'],
    opacity: 0.22 + (i % 4) * 0.12,
  }));

  let width = 0;
  let height = 0;

  function resize(): void {
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0 || !ctx) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let accentColor = '';
  let signalColor = '';
  function refreshColors(): void {
    const styles = getComputedStyle(document.documentElement);
    accentColor = styles.getPropertyValue('--color-accent').trim();
    signalColor = styles.getPropertyValue('--color-signal').trim();
  }

  function draw(): void {
    if (!ctx || width === 0 || height === 0) return;
    ctx.clearRect(0, 0, width, height);
    const cx = width * 0.5;
    const cy = height * 0.42;
    const base = Math.min(width, height);
    for (const p of particles) {
      const r = p.radius * base;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r;
      ctx.beginPath();
      ctx.fillStyle = p.hue === 'signal' ? signalColor : accentColor;
      ctx.globalAlpha = p.opacity;
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  refreshColors();
  resize();
  draw();

  const resizeObserver = new ResizeObserver(() => {
    resize();
    draw();
  });
  resizeObserver.observe(host);

  const themeObserver = new MutationObserver(() => {
    refreshColors();
    draw();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let stopFrame: (() => void) | null = null;

  function start(): void {
    if (stopFrame) return;
    stopFrame = onFrame((_time, delta) => {
      const dt = clamp(delta, 0, 48) / 1000;
      for (const p of particles) {
        p.angle += p.speed * dt;
      }
      draw();
    });
  }

  function stop(): void {
    stopFrame?.();
    stopFrame = null;
  }

  if (reducedMotion.get()) {
    draw();
  } else {
    start();
  }

  reducedMotion.subscribe((reduced) => {
    if (reduced) {
      stop();
      draw();
    } else {
      start();
    }
  }, false);
}

/** Paralaxe suave de ponteiro — só em telas com hover preciso (mouse/trackpad). */
function initParallax(section: HTMLElement, title: HTMLElement, visual: HTMLElement): void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let targetX = 0;
  let targetY = 0;
  let titleX = 0;
  let titleY = 0;
  let visualX = 0;
  let visualY = 0;

  function handleMove(event: PointerEvent): void {
    const rect = section.getBoundingClientRect();
    targetX = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
    targetY = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
  }

  function handleLeave(): void {
    targetX = 0;
    targetY = 0;
  }

  section.addEventListener('pointermove', handleMove);
  section.addEventListener('pointerleave', handleLeave);

  onFrame((_time, delta) => {
    if (reducedMotion.get()) return;
    titleX = smoothDamp(titleX, targetX, 6, delta);
    titleY = smoothDamp(titleY, targetY, 6, delta);
    visualX = smoothDamp(visualX, targetX, 5, delta);
    visualY = smoothDamp(visualY, targetY, 5, delta);
    title.style.transform = `translate3d(${titleX * -6}px, ${titleY * -4}px, 0)`;
    visual.style.transform = `translate3d(${visualX * -20}px, ${visualY * -14}px, 0)`;
  });
}

export function mount(container: HTMLElement): void {
  const section = document.createElement('section');
  section.id = 'hero';
  section.className = 'hero';

  const inner = document.createElement('div');
  inner.className = 'hero-inner container';

  const text = document.createElement('div');
  text.className = 'hero-text';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Cancelamento adaptativo espacial';

  const title = document.createElement('h1');
  title.className = 'hero-title';
  title.innerHTML = 'O silêncio tem <em>órbita</em> própria.';

  const subtitle = document.createElement('p');
  subtitle.className = 'hero-subtitle';
  subtitle.textContent =
    'ÓRBITA mapeia o campo sonoro ao seu redor e desenha, em tempo real, uma bolha de silêncio sob medida — sem esforço, sem ruído de fundo, sem distração.';

  const cta = document.createElement('a');
  cta.className = 'hero-cta';
  cta.href = '#configurador';
  cta.innerHTML = 'Monte o seu ÓRBITA <span class="hero-cta-arrow" aria-hidden="true">→</span>';

  text.append(eyebrow, title, subtitle, cta);

  const visual = document.createElement('div');
  visual.className = 'hero-visual';

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  canvas.setAttribute('aria-hidden', 'true');

  const svg = createHeadphoneSVG();
  svg.classList.add('hero-product');
  if (!reducedMotion.get()) {
    svg.classList.add('is-spinning');
  }
  reducedMotion.subscribe((reduced) => {
    svg.classList.toggle('is-spinning', !reduced);
  }, false);

  visual.append(canvas, svg);

  inner.append(text, visual);
  section.append(inner);
  container.append(section);

  playEntrance(eyebrow, title, subtitle, cta, visual);
  initParticles(canvas, visual);
  initParallax(section, title, visual);
}
