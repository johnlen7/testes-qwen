/**
 * ÓRBITA — Hero (§4.1)
 * Entrada orquestrada, partículas canvas, satélite, flutuação do fone,
 * paralaxe de mouse e integração com o store de cor.
 */

import './hero.css';
import { qs, qsa, on } from '../lib/dom';
import { onFrame, prefersReducedMotion, lerp } from '../lib/motion';
import { store } from '../lib/store';
import { createHeadphone, updateHeadphone } from '../product/headphone';

const DPR_CAP = 2;
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const STAGGER_MS = 110;

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Orbiter {
  rx: number;
  ry: number;
  speed: number;
  phase: number;
  size: number;
  alpha: number;
}

/**
 * Converte graus em radianos.
 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Inicializa o conjunto de partículas do hero.
 */
function createParticles(width: number, height: number): { dust: DustParticle[]; orbiters: Orbiter[] } {
  const dust: DustParticle[] = [];
  for (let i = 0; i < 90; i++) {
    dust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 1.4 + 0.5,
      baseAlpha: Math.random() * 0.22 + 0.06,
      twinkleSpeed: Math.random() * 1.8 + 0.5,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }

  const orbiters: Orbiter[] = [];
  for (let i = 0; i < 14; i++) {
    const rx = 80 + Math.random() * 180;
    orbiters.push({
      rx,
      ry: rx * 0.59,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.12 + Math.random() * 0.26),
      phase: Math.random() * Math.PI * 2,
      size: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.45 + 0.3,
    });
  }

  return { dust, orbiters };
}

/**
 * Monta a seção hero: entrada, fone, partículas, satélite e paralaxe.
 */
export function mountHero(): void {
  const section = qs<HTMLElement>('.hero');
  const canvas = qs<HTMLCanvasElement>('[data-hero-canvas]', section);
  const hpSlot = qs<HTMLElement>('[data-headphone-slot="hero"]', section);
  const satellite = qs<SVGGElement>('[data-satellite]', section);
  const depthEls = qsa<HTMLElement>('[data-depth]', section);
  const enterEls = qsa<HTMLElement>('[data-hero-enter]', section);
  const hpWrapper = qs<HTMLElement>('.hero__hp', section);

  // Prepara o estado inicial para a entrada orquestrada (sem flash pré-JS).
  section.classList.add('hero--armed');

  const reduced = prefersReducedMotion();

  // --- Fone no slot do hero (criado antes da animação de entrada) ---
  const headphoneSvg = createHeadphone({ color: store.get().color });
  hpSlot.appendChild(headphoneSvg);

  // Evita o sheen na primeira chamada do subscribe (estado já reflete a cor).
  let isInitialStoreCall = true;
  store.subscribe((cfg) => {
    if (isInitialStoreCall) {
      isInitialStoreCall = false;
      return;
    }
    updateHeadphone(headphoneSvg, { color: cfg.color });
  });

  // --- Entrada orquestrada via WAAPI ---
  if (reduced) {
    enterEls.forEach((el, i) => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        delay: i * 40,
        easing: 'ease-out',
        fill: 'forwards',
      });
    });
    headphoneSvg.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      delay: enterEls.length * 40,
      easing: 'ease-out',
      fill: 'forwards',
    });
  } else {
    enterEls.forEach((el, i) => {
      const isTitleLine = el.parentElement?.classList.contains('hero__line');
      const delay = i * STAGGER_MS;

      if (isTitleLine) {
        el.animate(
          [
            { clipPath: 'inset(100% 0 0 0)', opacity: 0, transform: 'translateY(28px)' },
            { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 880, delay, easing: EASE_OUT, fill: 'forwards' },
        );
      } else {
        el.animate(
          [
            { opacity: 0, transform: 'translateY(28px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 820, delay, easing: EASE_OUT, fill: 'forwards' },
        );
      }
    });

    // O fone entra por último: scale + desfoque + fade.
    const hpEnterDelay = enterEls.length * STAGGER_MS + 80;
    const hpAnim = hpWrapper.animate(
      [
        { opacity: 0, transform: 'scale(0.82)', filter: 'blur(14px)' },
        { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
      ],
      { duration: 900, delay: hpEnterDelay, easing: EASE_OUT, fill: 'forwards' },
    );

    // Libera o transform para a paralaxe/logo continuar controlando o wrapper.
    hpAnim.onfinish = () => {
      hpAnim.cancel();
      hpWrapper.style.opacity = '1';
      hpWrapper.style.transform = 'scale(1)';
      hpWrapper.style.filter = 'blur(0px)';
    };
  }

  // --- Sem animações decorativas quando o usuário prefere movimento reduzido ---
  if (reduced) return;

  // --- Flutuação do fone (loop senoidal) ---
  onFrame((_dt, elapsed) => {
    const y = Math.sin((elapsed * Math.PI * 2) / 5) * 10;
    headphoneSvg.style.transform = `translateY(${y}px)`;
  });

  // --- Satélite orbitando o anel externo ---
  let satelliteTheta = 0;
  onFrame((dt) => {
    satelliteTheta += dt * 0.45;
    const rx = 270;
    const ry = 160;
    const angle = toRad(-18);
    const xl = rx * Math.cos(satelliteTheta);
    const yl = ry * Math.sin(satelliteTheta);
    const x = 300 + xl * Math.cos(angle) - yl * Math.sin(angle);
    const y = 300 + xl * Math.sin(angle) + yl * Math.cos(angle);
    satellite.setAttribute('transform', `translate(${x} ${y})`);
  });

  // --- Partículas canvas: poeira estelar + orbitadores âmbar ---
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Alias local para manter a estreitamento de tipo dentro das closures.
    const ctx2d = ctx;
    let { dust, orbiters } = createParticles(canvas.clientWidth, canvas.clientHeight);
    let canvasVisible = true;

    function resizeCanvas(): void {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ({ dust, orbiters } = createParticles(rect.width, rect.height));
    }

    resizeCanvas();
    on(window, 'resize', resizeCanvas, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        canvasVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(section);

    const accentColor = getComputedStyle(section).getPropertyValue('--accent').trim() || '#f5a524';
    const inkColor = getComputedStyle(section).getPropertyValue('--ink').trim() || '#eae6dc';

    onFrame((dt, elapsed) => {
      if (!canvasVisible) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx2d.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const orbitAngle = toRad(-18);
      const cosA = Math.cos(orbitAngle);
      const sinA = Math.sin(orbitAngle);

      // Poeira estelar: drift lento + twinkle senoidal.
      for (const p of dust) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;

        const twinkle = 0.6 + 0.4 * Math.sin(elapsed * p.twinkleSpeed + p.twinklePhase);
        const alpha = p.baseAlpha * twinkle;

        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx2d.fillStyle = inkColor;
        ctx2d.globalAlpha = alpha;
        ctx2d.fill();
      }

      // Orbitadores âmbar em elipses inclinadas.
      ctx2d.globalAlpha = 1;
      for (const o of orbiters) {
        const theta = o.phase + elapsed * o.speed;
        const xl = o.rx * Math.cos(theta);
        const yl = o.ry * Math.sin(theta);
        const x = cx + xl * cosA - yl * sinA;
        const y = cy + xl * sinA + yl * cosA;

        ctx2d.beginPath();
        ctx2d.arc(x, y, o.size, 0, Math.PI * 2);
        ctx2d.fillStyle = accentColor;
        ctx2d.globalAlpha = o.alpha;
        ctx2d.fill();
      }

      ctx2d.globalAlpha = 1;
    });
  }

  // --- Paralaxe de mouse (apenas pointer fino) ---
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    on(window, 'mousemove', (ev) => {
      const e = ev as MouseEvent;
      const rect = section.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      targetX = clamp(nx, -1, 1) * 28;
      targetY = clamp(ny, -1, 1) * 28;
    });

    onFrame(() => {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      depthEls.forEach((el) => {
        const depth = parseFloat(el.dataset.depth || '0');
        el.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
      });
    });
  }
}

/**
 * Limita um valor ao intervalo [min, max].
 */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
