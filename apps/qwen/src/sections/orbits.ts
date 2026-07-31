/**
 * Campo de partículas orbitais — canvas 2D autoral no hero.
 * Partículas em órbitas elípticas inclinadas ao redor do fone (motivo "ÓRBITA"),
 * com rastros curtos e brilho aditivo. Pausa fora do viewport; DPR ≤ 2.
 */
import { addTick } from '../lib/raf'
import { prefersReducedMotion } from '../lib/media'

interface Particle {
  shell: number
  theta: number
  speed: number
  size: number
  alpha: number
  accent: boolean
  px: number
  py: number
}

interface OrbitTheme {
  accent: [number, number, number]
  muted: [number, number, number]
}

const SHELLS = 5
const TAU = Math.PI * 2

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim()
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function initOrbits(canvas: HTMLCanvasElement, anchor: HTMLElement): void {
  const ctxMaybe = canvas.getContext('2d')
  if (!ctxMaybe) return
  const ctx: CanvasRenderingContext2D = ctxMaybe

  const heroEl = canvas.parentElement
  if (!heroEl) return
  const hero: HTMLElement = heroEl

  let w = 0
  let h = 0
  let dpr = 1
  let cx = 0
  let cy = 0
  let baseR = 0
  let active = false
  let theme: OrbitTheme = readTheme()
  const particles: Particle[] = []
  const tilts: number[] = []

  function readTheme(): OrbitTheme {
    const cs = getComputedStyle(document.documentElement)
    return {
      accent: hexToRgb(cs.getPropertyValue('--accent')),
      muted: hexToRgb(cs.getPropertyValue('--ink-muted')),
    }
  }

  function seed(): void {
    particles.length = 0
    tilts.length = 0
    for (let s = 0; s < SHELLS; s++) {
      tilts.push(-0.42 + s * 0.21) // leque de inclinações — profundidade
      const count = 2 + (s % 2)
      for (let i = 0; i < count; i++) {
        particles.push({
          shell: s,
          theta: (TAU / count) * i + s * 0.9,
          speed: (0.16 + Math.random() * 0.1) / (0.6 + s * 0.35), // ∝ 1/raio
          size: 1 + Math.random() * 1.8,
          alpha: 0.35 + Math.random() * 0.5,
          accent: Math.random() < 0.3,
          px: 0,
          py: 0,
        })
      }
    }
  }

  function shellRadii(shell: number): { rx: number; ry: number } {
    const k = 0.5 + shell * 0.24
    return { rx: baseR * k, ry: baseR * k * 0.36 } // elipse achatada = órbita em perspectiva
  }

  function pointOn(shell: number, theta: number): [number, number] {
    const { rx, ry } = shellRadii(shell)
    const t = tilts[shell]
    const x = rx * Math.cos(theta)
    const y = ry * Math.sin(theta)
    return [cx + x * Math.cos(t) - y * Math.sin(t), cy + x * Math.sin(t) + y * Math.cos(t)]
  }

  function resize(): void {
    const rect = hero.getBoundingClientRect()
    dpr = Math.min(2, window.devicePixelRatio || 1)
    w = rect.width
    h = rect.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const anchorRect = anchor.getBoundingClientRect()
    cx = anchorRect.left - rect.left + anchorRect.width / 2
    cy = anchorRect.top - rect.top + anchorRect.height / 2
    baseR = Math.min(anchorRect.width * 0.62, w * 0.3)
  }

  function drawGuides(): void {
    const [mr, mg, mb] = theme.muted
    for (let s = 0; s < SHELLS; s++) {
      const { rx, ry } = shellRadii(s)
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, tilts[s], 0, TAU)
      ctx.strokeStyle = `rgba(${mr},${mg},${mb},${0.05 + (s % 2) * 0.02})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  function draw(dt: number): void {
    ctx.clearRect(0, 0, w, h)
    drawGuides()
    ctx.globalCompositeOperation = 'lighter'

    for (const p of particles) {
      if (dt > 0) p.theta = (p.theta + p.speed * dt) % TAU
      const [x, y] = pointOn(p.shell, p.theta)
      const [ox, oy] = pointOn(p.shell, p.theta - 0.14) // cauda tangencial curta
      const [r, g, b] = p.accent ? theme.accent : theme.muted

      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(x, y)
      ctx.strokeStyle = `rgba(${r},${g},${b},${p.alpha * 0.4})`
      ctx.lineWidth = p.size
      ctx.lineCap = 'round'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, p.size, 0, TAU)
      ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`
      ctx.fill()

      p.px = x
      p.py = y
    }

    ctx.globalCompositeOperation = 'source-over'
  }

  // pausa quando o hero sai de tela
  new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting
    },
    { threshold: 0 }
  ).observe(hero)

  seed()
  resize()
  window.addEventListener('resize', () => {
    resize()
    if (prefersReducedMotion()) draw(0)
  })
  window.addEventListener('orbita:theme', () => {
    theme = readTheme()
    if (prefersReducedMotion()) draw(0)
  })

  if (prefersReducedMotion()) {
    // movimento decorativo desligado — renderiza um frame estático
    draw(0)
    return
  }

  addTick((dt) => {
    if (!active) return
    draw(dt)
  })
}
