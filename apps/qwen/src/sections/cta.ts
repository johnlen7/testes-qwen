/**
 * 4.7 CTA final — botão magnético + ripple autoral no clique.
 * Magnético: dentro de um raio de 140px o botão translada até ~30% da
 * distância ao cursor (damp no rAF); na saída, spring de volta.
 */
import { addTick, damp } from '../lib/raf'
import { hasFinePointer, prefersReducedMotion } from '../lib/media'

export function initCta(): void {
  const btn = document.querySelector<HTMLElement>('[data-magnetic]')
  if (!btn) return

  /* ── Ripple no clique (funciona também em touch) ── */
  btn.addEventListener('click', (e) => {
    if (prefersReducedMotion()) return
    const rect = btn.getBoundingClientRect()
    const x = (e as PointerEvent).clientX
      ? (e as PointerEvent).clientX - rect.left
      : rect.width / 2
    const y = (e as PointerEvent).clientY
      ? (e as PointerEvent).clientY - rect.top
      : rect.height / 2
    const size = Math.hypot(rect.width, rect.height) * 2

    const ripple = document.createElement('span')
    ripple.className = 'btn-ripple'
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x - size / 2}px`
    ripple.style.top = `${y - size / 2}px`
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  })

  /* ── Magnético — só em ponteiro fino e com movimento permitido ── */
  if (!hasFinePointer() || prefersReducedMotion()) return

  const RADIUS = 150
  const PULL = 0.32
  let tx = 0
  let ty = 0
  let cx = 0
  let cy = 0
  let near = false

  document.addEventListener('pointermove', (e) => {
    const rect = btn.getBoundingClientRect()
    const bx = rect.left + rect.width / 2
    const by = rect.top + rect.height / 2
    const dx = e.clientX - bx
    const dy = e.clientY - by
    const dist = Math.hypot(dx, dy)

    if (dist < RADIUS + rect.width / 2) {
      near = true
      tx = dx * PULL
      ty = dy * PULL
      btn.classList.add('is-near')
    } else if (near) {
      near = false
      tx = 0
      ty = 0
      btn.classList.remove('is-near')
    }
  })

  addTick((dt) => {
    cx = damp(cx, tx, near ? 10 : 6, dt)
    cy = damp(cy, ty, near ? 10 : 6, dt)
    if (Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05 && !near) {
      cx = cy = 0
      btn.style.transform = ''
      return
    }
    btn.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`
  })
}
