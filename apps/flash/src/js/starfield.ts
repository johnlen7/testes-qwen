/* ============================================================
   starfield — céu profundo em Canvas 2D
   Drift lento, twinkle, paralaxe por mouse/scroll. RM: estático.
   ============================================================ */

import { RM, addFrame } from './motion';

interface Star {
  x: number;
  y: number;
  r: number;
  p: number;    // fase do twinkle
  sp: number;   // velocidade de drift (px/s)
  tw: number;   // frequência do twinkle
  accent: boolean;
}

export function initStarfield(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let stars: Star[] = [];
  let accent = '#5BA8FF';
  let mouseX = 0;
  let mouseY = 0;

  const readAccent = () => {
    accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || accent;
  };
  readAccent();

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(150, Math.floor((w * h) / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.35 + 0.4,
      p: Math.random() * Math.PI * 2,
      sp: 1.5 + Math.random() * 3,
      tw: 0.5 + Math.random() * 1.8,
      accent: Math.random() < 0.16
    }));
  };
  resize();

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  const onMouse = (e: PointerEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  window.addEventListener('pointermove', onMouse, { passive: true });
  document.addEventListener('orbita:accent', readAccent);
  document.addEventListener('orbita:theme', readAccent);

  // RM: desenha uma vez, sem animação
  if (RM) {
    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        ctx.globalAlpha = 0.35 + 0.3 * Math.sin(s.p);
        ctx.fillStyle = s.accent ? accent : '#cdd6e6';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawStatic();
    return;
  }

  let scrollY = 0;
  const onScroll = () => {
    scrollY = window.scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  addFrame((t, dt) => {
    // offset de paralaxe (sutil)
    const ox = (mouseX / window.innerWidth - 0.5) * 16;
    const oy = (mouseY / window.innerHeight - 0.5) * 10 - (scrollY * 0.05) % h;

    ctx.clearRect(0, 0, w, h);
    const sec = t / 1000;
    for (const s of stars) {
      // drift ascendente lento (espaço "subindo")
      s.y -= s.sp * (dt / 1000);
      if (s.y < -4) s.y = h + 4;

      const tw = 0.32 + 0.34 * (0.5 + 0.5 * Math.sin(sec * s.tw + s.p));
      const px = (s.x + ox) % w;
      const py = ((s.y + oy + h) % h + h) % h;
      ctx.globalAlpha = tw;
      ctx.fillStyle = s.accent ? accent : '#cdd6e6';
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}
