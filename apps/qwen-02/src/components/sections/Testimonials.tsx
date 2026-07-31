import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { TESTIMONIALS, type Testimonial } from '../../lib/product'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Reveal } from '../Reveal'
import './testimonials.css'

interface MarqueeRowProps {
  items: Testimonial[]
  reverse?: boolean
  speed?: number
  reduced: boolean
}

function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <figure className="testi__card">
      <span className="testi__mark" aria-hidden="true">
        “
      </span>
      <blockquote className="testi__quote">{t.quote}</blockquote>
      <figcaption className="testi__author">
        <span className="testi__name">{t.name}</span>
        <span className="testi__role">{t.role}</span>
      </figcaption>
    </figure>
  )
}

/**
 * Fileira de marquee infinita dirigida por rAF (fora do render do React).
 * Loop sem salto (conteúdo duplicado + módulo), pausa em hover e drag com
 * Pointer Events. Reduced-motion → lista estática rolável.
 */
function MarqueeRow({ items, reverse = false, speed = 34, reduced }: MarqueeRowProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const s = useRef({ base: 0, drag: 0, dragging: false, hover: false, lastX: 0, copyW: 1 })

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      const copy = track.querySelector<HTMLElement>('.testi__copy')
      if (!copy) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      s.current.copyW = copy.getBoundingClientRect().width + gap || 1
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })

    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const st = s.current
      if (!st.hover && !st.dragging) {
        st.base += speed * dt * (reverse ? -1 : 1)
      }
      const W = st.copyW
      let x = (st.base + st.drag) % W
      if (x < 0) x += W
      track.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [reduced, reverse, speed])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return
    const st = s.current
    st.dragging = true
    st.lastX = e.clientX
    wrapRef.current?.setPointerCapture(e.pointerId)
    wrapRef.current?.setAttribute('data-dragging', 'true')
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current
    if (!st.dragging) return
    const dx = e.clientX - st.lastX
    st.lastX = e.clientX
    st.drag -= dx
  }
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = s.current
    if (!st.dragging) return
    st.base += st.drag
    st.drag = 0
    st.dragging = false
    wrapRef.current?.removeAttribute('data-dragging')
    if (wrapRef.current?.hasPointerCapture(e.pointerId)) {
      wrapRef.current.releasePointerCapture(e.pointerId)
    }
  }

  if (reduced) {
    return (
      <div className="testi__row testi__row--static">
        <div className="testi__track">
          {items.map((t, i) => (
            <QuoteCard key={i} t={t} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="testi__row"
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => (s.current.hover = true)}
      onPointerLeave={(e) => {
        s.current.hover = false
        endDrag(e)
      }}
    >
      <div className="testi__track" ref={trackRef}>
        <div className="testi__copy">
          {items.map((t, i) => (
            <QuoteCard key={`a-${i}`} t={t} />
          ))}
        </div>
        {/* cópia idêntica para o loop contínuo — decorativa */}
        <div className="testi__copy" aria-hidden="true">
          {items.map((t, i) => (
            <QuoteCard key={`b-${i}`} t={t} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const reduced = usePrefersReducedMotion()
  const rowA = TESTIMONIALS.slice(0, 4)
  const rowB = TESTIMONIALS.slice(4)

  return (
    <section className="testi section" id="depoimentos" aria-labelledby="testi-title">
      <div className="container">
        <Reveal>
          <span className="eyebrow">Prova social</span>
          <h2 className="section-title" id="testi-title">
            Quem orbita, não volta
          </h2>
          <p className="section-lead">
            Profissionais que vivem de som — e não abrem mão dele. Arraste para explorar.
          </p>
        </Reveal>
      </div>

      <div className="testi__rows">
        <MarqueeRow items={rowA} reduced={reduced} speed={36} />
        <MarqueeRow items={rowB} reverse reduced={reduced} speed={30} />
      </div>
    </section>
  )
}
