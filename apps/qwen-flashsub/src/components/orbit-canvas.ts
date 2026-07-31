import { tick, lerp } from "../lib/raf";
import { prefersReducedMotion, onMotionChange } from "../lib/motion";

export interface OrbitField {
  destroy(): void;
}

interface Particle {
  a: number; // semi-eixo maior
  squash: number; // achatamento da órbita (perspectiva)
  tilt: number; // rotação do plano orbital
  theta: number; // posição angular
  omega: number; // velocidade angular (kepleriana)
  size: number;
  alpha: number;
  color: string;
}

interface Palette {
  ink: string;
  copper: string;
  ice: string;
}

function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const get = (name: string) => cs.getPropertyValue(name).trim() || "#ffffff";
  return { ink: get("--ink"), copper: get("--copper"), ice: get("--ice") };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function createOrbitField(
  canvas: HTMLCanvasElement,
  opts: { center?: [number, number]; count?: number; interactive?: boolean } = {},
): OrbitField {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { destroy() {} };

  const centerBase = opts.center ?? [0.5, 0.5];
  const interactive = opts.interactive ?? false;

  let palette = readPalette();
  let particles: Particle[] = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let visible = true;
  let mx = 0; // alvo do mouse (px, relativo ao centro)
  let my = 0;
  let cx = 0; // centro suavizado
  let cy = 0;

  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  function spawn() {
    const count = opts.count ?? Math.min(110, Math.round((w * h) / 16000));
    particles = [];
    const colors = [palette.ink, palette.ink, palette.copper, palette.copper, palette.ice];
    for (let i = 0; i < count; i++) {
      const a = rand(60, Math.max(w, h) * 0.62);
      particles.push({
        a,
        squash: rand(0.24, 0.5),
        tilt: rand(0, Math.PI),
        theta: rand(0, Math.PI * 2),
        omega: (rand(0.05, 0.16) * 240) / Math.max(a, 120), // 3ª lei de Kepler, aproximada
        size: rand(0.6, 2.1),
        alpha: rand(0.25, 0.8),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w * centerBase[0];
    cy = h * centerBase[1];
    spawn();
    if (prefersReducedMotion()) drawStatic();
  }

  function orbitPoint(p: Particle, ox: number, oy: number): [number, number, number] {
    const cosT = Math.cos(p.tilt);
    const sinT = Math.sin(p.tilt);
    const x0 = p.a * Math.cos(p.theta);
    const y0 = p.a * p.squash * Math.sin(p.theta);
    const depth = (Math.sin(p.theta) + 1) / 2; // 0 = fundo · 1 = frente
    return [ox + x0 * cosT - y0 * sinT, oy + x0 * sinT + y0 * cosT, depth];
  }

  function draw() {
    ctx!.clearRect(0, 0, w, h);
    const ox = cx + mx;
    const oy = cy + my;

    // três órbitas-guia, quase imperceptíveis
    ctx!.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const r = Math.min(w, h) * (0.24 + i * 0.16);
      ctx!.save();
      ctx!.translate(ox, oy);
      ctx!.rotate(-0.32 + i * 0.21);
      ctx!.scale(1, 0.38);
      ctx!.strokeStyle = `rgba(${hexToRgb(palette.copper).join(",")}, ${0.05 - i * 0.012})`;
      ctx!.beginPath();
      ctx!.arc(0, 0, r, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();
    }

    for (const p of particles) {
      const [x, y, depth] = orbitPoint(p, ox, oy);
      const [r, g, b] = hexToRgb(p.color);
      const a = p.alpha * (0.35 + depth * 0.65);
      const s = p.size * (0.7 + depth * 0.6);
      ctx!.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.arc(x, y, s, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  function drawStatic() {
    // frame único para prefers-reduced-motion
    for (const p of particles) p.theta = rand(0, Math.PI * 2);
    draw();
  }

  const cancelTick = tick((dt) => {
    if (!visible || document.hidden) return;
    mx = lerp(mx, targetMx, 0.06);
    my = lerp(my, targetMy, 0.06);
    for (const p of particles) p.theta += p.omega * dt;
    draw();
  });

  let targetMx = 0;
  let targetMy = 0;

  function onPointer(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    targetMx = (e.clientX - rect.left - w * centerBase[0]) * 0.1;
    targetMy = (e.clientY - rect.top - h * centerBase[1]) * 0.1;
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // re-ler paleta quando o tema muda
  const mo = new MutationObserver(() => {
    palette = readPalette();
    spawn();
    if (prefersReducedMotion()) drawStatic();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  onMotionChange((reduced) => {
    if (reduced) drawStatic();
  });

  if (interactive && !prefersReducedMotion()) {
    window.addEventListener("pointermove", onPointer, { passive: true });
  }

  resize();

  return {
    destroy() {
      cancelTick();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
    },
  };
}
