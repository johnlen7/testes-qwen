import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './testimonials.css'

const QUOTES = [
  {
    name: 'Marina K.',
    role: 'Produtora musical · SP',
    text: 'Pela primeira vez um ANC que não achata a sala. Eu ainda ouço o ar — só sem o trânsito.',
  },
  {
    name: 'Theo R.',
    role: 'Eng. de voo · LIS',
    text: 'Doze horas de cockpit. O campo espacial corta o zumbido sem me isolar dos alertas.',
  },
  {
    name: 'Aya S.',
    role: 'ArquitetA · TYO',
    text: 'O oversized abraça sem apertar. Parece que a música ganhou gravidade própria.',
  },
  {
    name: 'Leo M.',
    role: 'Critico de áudio · BCN',
    text: 'Drivers de bio-celulose com corpo de verdade. Graves que ocupam espaço, não volume.',
  },
  {
    name: 'Nina V.',
    role: 'Fundadora · CPH',
    text: 'Configurar a cor cobre e ver o CTA mudar foi o detalhe que me convenceu a pré-encomendar.',
  },
  {
    name: 'Omar H.',
    role: 'DJ · DXB',
    text: 'Latência imperceptível no monitoring. ÓRBITA sumiu entre eu e o deck.',
  },
] as const

export function Testimonials() {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const offset = useRef(0)
  const drag = useRef<{ active: boolean; startX: number; startOffset: number }>({
    active: false,
    startX: 0,
    startOffset: 0,
  })
  const paused = useRef(false)
  const raf = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  const apply = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    // Loop: content is duplicated; wrap at half width
    const half = el.scrollWidth / 2
    if (half <= 0) return
    if (offset.current <= -half) offset.current += half
    if (offset.current > 0) offset.current -= half
    el.style.transform = `translate3d(${offset.current}px, 0, 0)`
  }, [])

  useEffect(() => {
    if (reduced) return

    const speed = 0.45 // px per frame @60fps ≈ 27px/s
    const loop = () => {
      if (!paused.current && !drag.current.active) {
        offset.current -= speed
        apply()
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [apply, reduced])

  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current
    if (!el) return
    drag.current = { active: true, startX: e.clientX, startOffset: offset.current }
    setIsDragging(true)
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    offset.current = drag.current.startOffset + dx
    apply()
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    setIsDragging(false)
    try {
      trackRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const items = [...QUOTES, ...QUOTES]

  return (
    <section className="section testimonials" aria-labelledby="testimonials-title">
      <div className="shell">
        <p className="section__eyebrow">Campo de quem usa</p>
        <h2 id="testimonials-title" className="section__title">
          Ecos de quem já entrou em órbita
        </h2>
      </div>

      <div
        className={`testimonials__viewport ${isDragging ? 'is-dragging' : ''}`}
        onMouseEnter={() => {
          paused.current = true
        }}
        onMouseLeave={() => {
          paused.current = false
        }}
        onFocusCapture={() => {
          paused.current = true
        }}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            paused.current = false
          }
        }}
      >
        <div
          ref={trackRef}
          className="testimonials__track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {items.map((q, i) => (
            <figure className="testimonials__card" key={`${q.name}-${i}`}>
              <blockquote>
                <p>“{q.text}”</p>
              </blockquote>
              <figcaption>
                <span className="testimonials__name">{q.name}</span>
                <span className="testimonials__role">{q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <p className="testimonials__hint shell">Arraste · pause no hover</p>
    </section>
  )
}
