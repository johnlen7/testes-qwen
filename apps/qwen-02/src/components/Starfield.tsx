import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './starfield.css'

interface Star {
  x: number
  y: number
  z: number
  r: number
  tw: number
}

interface Palette {
  star: string
  accent: string
}

function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement)
  const text = cs.getPropertyValue('--text-0').trim() || '#f2f5fa'
  const accent = cs.getPropertyValue('--accent').trim() || '#f5a83c'
  return { star: text, accent }
}

/** Converte #rgb/#rrggbb em [r,g,b] */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n)) return [242, 245, 250]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Campo de estrelas autoral em Canvas 2D: estrelas em 3 profundidades com
 * cintilação e deriva lenta, dois anéis orbitais e um satélite em cada órbita.
 * Cores lidas dos tokens do tema (adapta claro/escuro). Reduced-motion → frame
 * estático único.
 */
export function Starfield({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let stars: Star[] = []
    let palette = readPalette()
    let starRgb = hexToRgb(palette.star)
    let raf = 0
    const start = performance.now()

    const orbitCx = () => width * 0.7
    const orbitCy = () => height * 0.5

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(220, Math.round((width * height) / 8500))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.3 + 0.3,
        tw: Math.random() * Math.PI * 2,
      }))
      if (reduced) drawFrame(0, true)
    }

    const drawOrbit = (rx: number, ry: number, rot: number, angle: number, staticFrame: boolean) => {
      const cx = orbitCx()
      const cy = orbitCy()
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rot)
      // anel
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${starRgb[0]},${starRgb[1]},${starRgb[2]},0.12)`
      ctx.lineWidth = 1
      ctx.stroke()
      // satélite
      const sx = Math.cos(angle) * rx
      const sy = Math.sin(angle) * ry
      const [ar, ag, ab] = hexToRgb(palette.accent)
      if (!staticFrame) {
        ctx.shadowColor = palette.accent
        ctx.shadowBlur = 14
      }
      ctx.beginPath()
      ctx.arc(sx, sy, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.95)`
      ctx.fill()
      ctx.restore()
    }

    const drawFrame = (time: number, staticFrame: boolean) => {
      ctx.clearRect(0, 0, width, height)

      // estrelas
      for (const s of stars) {
        const twinkle = staticFrame ? 0.7 : 0.55 + 0.45 * Math.sin(time * 0.0016 * s.z + s.tw)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${starRgb[0]},${starRgb[1]},${starRgb[2]},${(0.5 * s.z * twinkle).toFixed(3)})`
        ctx.fill()
      }

      // anéis orbitais + satélites
      const base = Math.min(width, height)
      drawOrbit(base * 0.34, base * 0.15, -0.32, staticFrame ? 0.9 : time * 0.00045, staticFrame)
      drawOrbit(base * 0.5, base * 0.22, -0.32, staticFrame ? 3.6 : -time * 0.0003 + 2, staticFrame)
    }

    const loop = (now: number) => {
      const time = now - start
      // deriva lenta das estrelas (só transform-like: mexe em x, com wrap)
      for (const s of stars) {
        s.x += s.z * 0.03
        if (s.x > width + 2) s.x = -2
      }
      drawFrame(time, false)
      raf = requestAnimationFrame(loop)
    }

    // re-ler cores quando o tema muda
    const observer = new MutationObserver(() => {
      palette = readPalette()
      starRgb = hexToRgb(palette.star)
      if (reduced) drawFrame(0, true)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    resize()
    window.addEventListener('resize', resize, { passive: true })
    if (!reduced) raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [reduced])

  return <canvas ref={canvasRef} className={`starfield ${className ?? ''}`} aria-hidden="true" />
}
