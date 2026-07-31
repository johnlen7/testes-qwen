/**
 * 4.4 Grade de features — tilt 3D + glow que segue o cursor +
 * traço dos ícones desenhado no primeiro hover + reveal stagger por scroll.
 */
import { hasFinePointer } from '../lib/media'

export function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>(
    '.feature-card, .section-head, .quote-card, .acc-item'
  )
  targets.forEach((el) => el.classList.add('reveal'))

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  )

  targets.forEach((el) => io.observe(el))
}

export function initFeatures(): void {
  const cards = document.querySelectorAll<HTMLElement>('.feature-card')
  if (!cards.length) return

  // pathLength normalizado para o efeito de traço no hover
  cards.forEach((card) => {
    card
      .querySelectorAll<SVGGeometryElement>('.feature-icon :is(path, polyline, circle, ellipse, line)')
      .forEach((shape) => {
        if (!shape.classList.contains('fi-fill')) shape.setAttribute('pathLength', '100')
      })
  })

  if (!hasFinePointer()) return // touch: sem tilt — estado base já comunica tudo

  cards.forEach((card) => {
    let raf = 0

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width // 0..1
      const ny = (e.clientY - rect.top) / rect.height

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        card.style.setProperty('--rx', `${((0.5 - ny) * 7).toFixed(2)}deg`)
        card.style.setProperty('--ry', `${((nx - 0.5) * 9).toFixed(2)}deg`)
        card.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`)
        card.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`)
      })
      card.classList.add('is-live')
    })

    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-live')
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
    })
  })
}
