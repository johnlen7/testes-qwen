/**
 * 4.5 Depoimentos — marquee infinito autoral.
 * Dirigido por rAF (não keyframe): conteúdo duplicado, wrap em −50% = loop
 * sem emenda. Pausa em hover/focus; drag com Pointer Events e inércia.
 * Reduced motion: vira fileira com scroll-x nativo.
 */
import { addTick, damp } from '../lib/raf'
import { prefersReducedMotion } from '../lib/media'

export function initTestimonials(): void {
  const region = document.querySelector<HTMLElement>('[data-marquee]')
  const track = region?.querySelector<HTMLElement>('.marquee-track')
  if (!region || !track) return

  // duplica os cards — 2× conteúdo permite wrap invisível em −50%
  const originals = [...track.children]
  originals.forEach((card) => {
    const clone = card.cloneNode(true) as HTMLElement
    clone.setAttribute('aria-hidden', 'true')
    track.appendChild(clone)
  })

  if (prefersReducedMotion()) return // CSS assume: scroll-x nativo

  const BASE_V = 46 // px/s
  let x = 0
  let inertia = 0
  let paused = false
  let dragging = false
  let lastPointerX = 0
  let half = 1

  const measure = () => {
    half = track.scrollWidth / 2
  }
  measure()
  window.addEventListener('resize', measure)

  region.addEventListener('pointerenter', () => {
    paused = true
    region.classList.add('is-paused')
  })
  region.addEventListener('pointerleave', () => {
    paused = false
    region.classList.remove('is-paused')
  })
  region.addEventListener('focusin', () => {
    paused = true
  })
  region.addEventListener('focusout', () => {
    paused = false
  })

  region.addEventListener('pointerdown', (e) => {
    dragging = true
    lastPointerX = e.clientX
    region.setPointerCapture(e.pointerId)
    region.classList.add('is-dragging')
  })

  region.addEventListener('pointermove', (e) => {
    if (!dragging) return
    const dx = e.clientX - lastPointerX
    lastPointerX = e.clientX
    x += dx
    inertia = damp(inertia, dx * 55, 8, 0.016) // suaviza a velocidade de arrasto
  })

  const endDrag = () => {
    if (!dragging) return
    dragging = false
    region.classList.remove('is-dragging')
  }
  region.addEventListener('pointerup', endDrag)
  region.addEventListener('pointercancel', endDrag)

  // impede seleção de texto durante o drag
  region.addEventListener('dragstart', (e) => e.preventDefault())

  addTick((dt) => {
    inertia *= Math.exp(-2.2 * dt)
    const v = (paused && !dragging ? 0 : BASE_V) - inertia
    x -= v * dt

    // wrap sem emenda
    if (-x >= half) x += half
    if (-x < 0) x -= half

    track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
  })
}
