/**
 * 4.1 Hero — entrada orquestrada + paralaxe de camadas.
 * Paralaxe: pointer move → alvo normalizado; rAF com damp aplica translate3d
 * por camada (fator data-parallax). Desligado em touch e reduced-motion.
 */
import { addTick, damp } from '../lib/raf'
import { hasFinePointer, prefersReducedMotion, watchMedia, mqFinePointer } from '../lib/media'
import { initOrbits } from './orbits'

export function initHero(): void {
  const hero = document.querySelector<HTMLElement>('.hero')
  if (!hero) return

  // dispara a coreografia de entrada (stagger via --d no CSS)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('is-loaded')
    })
  })

  const canvas = document.getElementById('orbit-canvas') as HTMLCanvasElement | null
  const anchor = hero.querySelector<HTMLElement>('.hero-visual')
  if (canvas && anchor) initOrbits(canvas, anchor)

  const layers = hero.querySelectorAll<HTMLElement>('[data-parallax]')
  if (!layers.length) return

  let tx = 0
  let ty = 0
  let px = 0
  let py = 0
  let enabled = false

  function setEnabled(): void {
    enabled = hasFinePointer() && !prefersReducedMotion()
    if (!enabled) {
      layers.forEach((el) => {
        el.style.transform = ''
      })
      px = py = 0
    }
  }

  watchMedia(mqFinePointer, setEnabled)
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', setEnabled)

  hero.addEventListener('pointermove', (e) => {
    if (!enabled) return
    const rect = hero.getBoundingClientRect()
    tx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    ty = ((e.clientY - rect.top) / rect.height) * 2 - 1
  })

  hero.addEventListener('pointerleave', () => {
    tx = 0
    ty = 0
  })

  addTick((dt) => {
    if (!enabled) return
    px = damp(px, tx, 4, dt)
    py = damp(py, ty, 4, dt)
    layers.forEach((el) => {
      const f = parseFloat(el.dataset.parallax ?? '0.5')
      el.style.transform = `translate3d(${(-px * f * 26).toFixed(2)}px, ${(-py * f * 20).toFixed(2)}px, 0)`
    })
  })
}
