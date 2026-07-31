import { useMemo } from 'react'
import { useConfig } from '../context/ConfigContext'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { clamp, mapRange, smoothstep } from '../utils/easings'
import { HeadphoneSVG } from './headphone/HeadphoneSVG'
import './scroll-story.css'

const STEPS = [
  {
    id: 'campo',
    kicker: '01 — Campo',
    title: 'O silêncio também tem forma',
    body: 'Seis microfones de campo abrem um mapa esférico do ambiente. ÓRBITA não abafa o mundo — ele o compreende, amostra a amostra.',
  },
  {
    id: 'anatomia',
    kicker: '02 — Anatomia',
    title: 'Peças que respiram juntas',
    body: 'Arco de carbono, conchas usinadas e drivers de bio-celulose se separam no ar para revelar a engenharia que mantém 42 horas de órbita contínua.',
  },
  {
    id: 'anc',
    kicker: '03 — ANC espacial',
    title: 'Anéis de cancelamento vivo',
    body: 'O processador espacial esculpe zonas de silêncio ao redor da sua cabeça. Música no centro. Mundo na periferia — só o que você escolher ouvir.',
  },
] as const

export function ScrollStory() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>()
  const { color, shell } = useConfig()

  // Scrub explode 0→1 across full track
  const explode = useMemo(() => smoothstep(0.05, 0.92, progress), [progress])

  // Active step index from progress
  const active = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2

  // Per-step opacity — tight windows so only one step reads clearly
  const opacities = useMemo(() => {
    return STEPS.map((_, i) => {
      const start = i / STEPS.length
      const end = (i + 1) / STEPS.length
      const fade = 0.045
      if (progress < start - fade || progress > end + fade) return 0
      if (progress >= start && progress <= end) return 1
      if (progress < start) return clamp(smoothstep(start - fade, start, progress))
      return clamp(1 - smoothstep(end, end + fade, progress))
    })
  }, [progress])

  // Progress ring dash
  const ringLen = 113 // ~2πr for r=18
  const dash = ringLen * progress

  return (
    <section
      id="como-funciona"
      className="scroll-story"
      aria-labelledby="scroll-story-title"
      ref={ref}
    >
      <div className="scroll-story__sticky">
        <div className="shell scroll-story__layout">
          <header className="scroll-story__intro">
            <p className="section__eyebrow">Como funciona</p>
            <h2 id="scroll-story-title" className="section__title">
              Três órbitas até o silêncio
            </h2>
          </header>

          <div className="scroll-story__stage">
            {/* Progress indicator */}
            <div className="scroll-story__progress" aria-hidden="true">
              <svg viewBox="0 0 40 40" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="var(--line)" strokeWidth="2" />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${ringLen}`}
                  transform="rotate(-90 20 20)"
                />
              </svg>
              <span>{String(Math.round(progress * 100)).padStart(2, '0')}</span>
            </div>

            <div className="scroll-story__visual">
              <HeadphoneSVG
                color={color}
                shell={shell}
                explode={explode}
                showOrbits={progress > 0.55}
                size="lg"
              />
            </div>

            <div className="scroll-story__copy" aria-live="polite">
              {STEPS.map((step, i) => (
                <article
                  key={step.id}
                  className={`scroll-story__step ${i === active ? 'is-active' : ''}`}
                  style={{
                    opacity: opacities[i],
                    transform: `translateY(${mapRange(opacities[i], 0, 1, 18, 0)}px)`,
                    pointerEvents: i === active ? 'auto' : 'none',
                    zIndex: i === active ? 2 : 1,
                  }}
                  aria-hidden={i !== active}
                >
                  <p className="scroll-story__kicker">{step.kicker}</p>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>

            {/* Step dots */}
            <ol className="scroll-story__dots" aria-label="Etapas">
              {STEPS.map((step, i) => (
                <li key={step.id}>
                  <span className={i === active ? 'is-on' : ''} aria-current={i === active ? 'step' : undefined}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
