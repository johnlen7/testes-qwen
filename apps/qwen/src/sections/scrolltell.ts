/**
 * 4.2 Scroll-telling — scrubbing real.
 * Uma trilha de 340vh com palco sticky; o progresso p ∈ [0,1] do scroll
 * dirige TUDO: rotação/respiração do fone, vista explodida com cotas,
 * campo de ondas ANC + achatamento do ruído e os três blocos de texto.
 *
 * Física: scrubbing é mapeamento direto (o usuário é o easing) — sem
 * damp nas partes, apenas nos textos para assentamento suave.
 */
import { addTick, clamp, window01, damp } from '../lib/raf'
import { prefersReducedMotion } from '../lib/media'
import { getParts } from '../components/headphone'

export function initScrolltell(tellSvg: SVGSVGElement | undefined): void {
  const trackEl = document.querySelector<HTMLElement>('.tell-track')
  const stageEl = document.querySelector<HTMLElement>('.tell-stage')
  if (!trackEl || !stageEl) return
  const track: HTMLElement = trackEl
  const stage: HTMLElement = stageEl

  const steps = [...stage.querySelectorAll<HTMLElement>('.tell-step')]
  const callouts = [...stage.querySelectorAll<SVGGElement>('.callout')]
  const waves = [...stage.querySelectorAll<SVGCircleElement>('.wave')]
  const noise = stage.querySelector<SVGPathElement>('.noise-path')
  const progressFill = stage.querySelector<HTMLElement>('.tell-progress-fill')
  const dbReadout = stage.querySelector<HTMLElement>('.db-readout')

  const parts = tellSvg ? getParts(tellSvg) : {}
  const hpRoot = tellSvg

  let visible = false
  let p = 0
  const stepVis = steps.map(() => 0)
  let lastDb = -1

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  }, { rootMargin: '10% 0px 10% 0px' }).observe(track)

  function computeProgress(): number {
    const rect = track.getBoundingClientRect()
    const total = rect.height - innerHeight
    if (total <= 0) return 0
    return clamp(-rect.top / total, 0, 1)
  }

  addTick((dt) => {
    if (!visible) return
    p = computeProgress()
    const reduced = prefersReducedMotion()

    stage.style.setProperty('--p', p.toFixed(4))

    // ── 1. respiração/rotação globais (desligadas em reduced motion) ──
    if (hpRoot && !reduced) {
      const rot = (p - 0.5) * 14 // −7° → +7°
      const scale = 0.94 + 0.1 * Math.sin(p * Math.PI)
      hpRoot.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
    }

    // ── 2. vista explodida: e sobe em [0.30, 0.72] ──
    const e = window01(p, 0.26, 0.76, 0.12)
    setPart(parts.band, `translate(0px, ${(-118 * e).toFixed(1)}px)`)
    setPart(parts.stem, `translate(0px, ${(-50 * e).toFixed(1)}px)`)
    setPart(parts.cushionL, `translate(${(-42 * e).toFixed(1)}px, ${(62 * e).toFixed(1)}px)`)
    setPart(parts.cushionR, `translate(${(42 * e).toFixed(1)}px, ${(62 * e).toFixed(1)}px)`)
    setPart(parts.cupL, `translate(${(-16 * e).toFixed(1)}px, 0px)`)
    setPart(parts.cupR, `translate(${(16 * e).toFixed(1)}px, 0px)`)
    setPart(parts.driverL, `translate(${(-124 * e).toFixed(1)}px, ${(10 * e).toFixed(1)}px)`)
    setPart(parts.driverR, `translate(${(124 * e).toFixed(1)}px, ${(10 * e).toFixed(1)}px)`)
    if (parts.driverL) parts.driverL.style.opacity = e.toFixed(2)
    if (parts.driverR) parts.driverR.style.opacity = e.toFixed(2)

    // cotas da vista explodida — entradas escalonadas por índice
    callouts.forEach((c, i) => {
      const v = clamp((e - i * 0.12) * 2.4, 0, 1)
      c.style.opacity = v.toFixed(2)
      c.style.transform = `translateY(${((1 - v) * 10).toFixed(1)}px)`
    })

    // ── 3. campo ANC: a sobe em [0.68, 1] e fica ──
    const a = clamp((p - 0.64) / 0.2, 0, 1)
    waves.forEach((w, i) => {
      const k = 1 + i * 0.5
      const s = 0.55 + a * k * 0.55
      w.style.opacity = (a * (1 - i * 0.24)).toFixed(2)
      w.style.transform = `scale(${s.toFixed(3)})`
    })
    if (noise) {
      const squash = 1 - a * 0.88
      noise.style.transform = `scaleY(${squash.toFixed(3)})`
      noise.style.opacity = (1 - a * 0.5).toFixed(2)
    }
    if (dbReadout) {
      const db = Math.round(42 * a)
      if (db !== lastDb) {
        lastDb = db
        dbReadout.textContent = `−${db} dB`
      }
    }

    // ── 4. textos: janela de visibilidade por etapa, com damp ──
    steps.forEach((step, i) => {
      const start = i / 3
      const end = (i + 1) / 3
      const target = window01(p, start + 0.015, end - 0.015, 0.055)
      const v = reduced
        ? (p >= start && p < end ? 1 : 0)
        : damp(stepVis[i], target, 12, dt)
      stepVis[i] = v
      step.style.opacity = v.toFixed(3)
      step.style.transform = `translateY(${((1 - v) * 26).toFixed(1)}px)`
      step.style.visibility = v < 0.02 ? 'hidden' : 'visible'
    })

    // trilho de progresso
    if (progressFill) progressFill.style.transform = `scaleY(${p.toFixed(4)})`
  })
}

function setPart(g: SVGGElement | undefined, transform: string): void {
  if (g) g.style.transform = transform
}
