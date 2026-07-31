import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { FEATURES, type Feature } from '../../lib/product'
import { useInView } from '../../hooks/useInView'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Reveal } from '../Reveal'
import './features.css'

function FeatureIcon({ id }: { id: Feature['icon'] }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (id) {
    case 'anc':
      return (
        <svg {...common}>
          <path d="M2.5 12h2.6l2.4-6.5 3.6 13 3-9.5 1.9 3h5.5" />
        </svg>
      )
    case 'orbit':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.1" />
          <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(-24 12 12)" />
          <circle cx="20.4" cy="7.6" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'battery':
      return (
        <svg {...common}>
          <rect x="2.5" y="8" width="16" height="8" rx="2" />
          <path d="M21 10.8v2.4" />
          <path d="M5.8 10.6v2.8M8.8 10.6v2.8M11.8 10.6v2.8" />
        </svg>
      )
    case 'charge':
      return (
        <svg {...common}>
          <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
        </svg>
      )
    case 'bluetooth':
      return (
        <svg {...common}>
          <path d="M6.8 7.3 17 16.5l-5 4V3.5l5 4L6.8 16.7" />
        </svg>
      )
  }
}

function FeatureCard({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * 9
    const ry = (px - 0.5) * 11
    el.style.transform = `perspective(720px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`
    el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
  }

  const onLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ''
  }

  return (
    <div ref={ref} className="feat__card" tabIndex={0} onPointerMove={onMove} onPointerLeave={onLeave}>
      <span className="feat__glow" aria-hidden="true" />
      <span className="feat__icon">
        <FeatureIcon id={feature.icon} />
      </span>
      <h3 className="feat__title">{feature.title}</h3>
      <p className="feat__desc">{feature.desc}</p>
    </div>
  )
}

export function Features() {
  const { ref, inView } = useInView<HTMLUListElement>()

  return (
    <section className="feat section" id="recursos" aria-labelledby="feat-title">
      <div className="container">
        <Reveal>
          <span className="eyebrow">Recursos</span>
          <h2 className="section-title" id="feat-title">
            Engenharia que desaparece
          </h2>
          <p className="section-lead">
            Tecnologia de ponta cujo único efeito perceptível é a música. Nada entre você e o som.
          </p>
        </Reveal>

        <ul className="feat__grid" ref={ref}>
          {FEATURES.map((f, i) => (
            <li
              key={f.id}
              className={`reveal ${inView ? 'is-in' : ''}`}
              style={{ '--reveal-delay': `${i * 90}ms` } as CSSProperties}
            >
              <FeatureCard feature={f} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
