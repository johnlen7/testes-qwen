import { useEffect, useRef, useState } from 'react'
import { Headphones } from '../Headphones'
import { useConfigurator } from '../../state/ConfiguratorContext'
import { useScrollScrub } from '../../hooks/useScrollScrub'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { STORY_STEPS } from '../../lib/product'
import './story.css'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

interface Parts {
  all: SVGGElement | null
  band: SVGGElement | null
  yokes: SVGGElement | null
  cushionL: SVGGElement | null
  cushionR: SVGGElement | null
  faceL: SVGGElement | null
  faceR: SVGGElement | null
  driverL: SVGGElement | null
  driverR: SVGGElement | null
}

export function ScrollStory() {
  const { color } = useConfigurator()
  const reduced = usePrefersReducedMotion()
  const [stage, setStage] = useState(0)

  const hpRef = useRef<SVGSVGElement | null>(null)
  const partsRef = useRef<Parts>({
    all: null,
    band: null,
    yokes: null,
    cushionL: null,
    cushionR: null,
    faceL: null,
    faceR: null,
    driverL: null,
    driverR: null,
  })
  const waveRef = useRef<HTMLDivElement | null>(null)
  const railRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef(0)

  useEffect(() => {
    const svg = hpRef.current
    if (!svg) return
    const q = (name: string) => svg.querySelector<SVGGElement>(`[data-part="${name}"]`)
    partsRef.current = {
      all: q('all'),
      band: q('band'),
      yokes: q('yokes'),
      cushionL: q('cushion-l'),
      cushionR: q('cushion-r'),
      faceL: q('face-l'),
      faceR: q('face-r'),
      driverL: q('driver-l'),
      driverR: q('driver-r'),
    }
  }, [])

  const apply = (p: number) => {
    const parts = partsRef.current

    const nextStage = p < 0.34 ? 0 : p < 0.67 ? 1 : 2
    if (nextStage !== stageRef.current) {
      stageRef.current = nextStage
      setStage(nextStage)
    }

    // estágio 1 — fone assenta e endireita
    const settle = 1 - easeInOut(clamp01(p / 0.28))
    const rot = -7 * settle
    const ty = 30 * settle

    // estágio 2 — explode; estágio 3 — recombinado
    const burst = easeInOut(clamp01((p - 0.3) / 0.2))
    const reform = easeInOut(clamp01((p - 0.64) / 0.2))
    const ex = burst * (1 - reform)

    if (parts.all) parts.all.style.transform = `translateY(${ty.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`
    if (parts.band) parts.band.style.transform = `translateY(${(-96 * ex).toFixed(1)}px)`
    if (parts.yokes) parts.yokes.style.transform = `translateY(${(-48 * ex).toFixed(1)}px)`
    if (parts.cushionL) parts.cushionL.style.transform = `translate(${(-72 * ex).toFixed(1)}px, ${(58 * ex).toFixed(1)}px)`
    if (parts.cushionR) parts.cushionR.style.transform = `translate(${(72 * ex).toFixed(1)}px, ${(58 * ex).toFixed(1)}px)`
    if (parts.faceL)
      parts.faceL.style.transform = `translate(${(-36 * ex).toFixed(1)}px, ${(-24 * ex).toFixed(1)}px) rotate(${(-11 * ex).toFixed(2)}deg)`
    if (parts.faceR)
      parts.faceR.style.transform = `translate(${(36 * ex).toFixed(1)}px, ${(-24 * ex).toFixed(1)}px) rotate(${(11 * ex).toFixed(2)}deg)`
    if (parts.driverL) parts.driverL.style.opacity = ex.toFixed(3)
    if (parts.driverR) parts.driverR.style.opacity = ex.toFixed(3)

    // estágio 3 — ondas ANC
    const wave = easeInOut(clamp01((p - 0.7) / 0.26))
    if (waveRef.current) {
      waveRef.current.style.opacity = (wave * 0.95).toFixed(3)
      waveRef.current.style.transform = `scale(${(0.82 + wave * 0.28).toFixed(3)})`
    }

    // trilho de progresso
    if (railRef.current) railRef.current.style.transform = `scaleY(${p.toFixed(4)})`
  }

  const trackRef = useScrollScrub<HTMLDivElement>(apply)

  // Reduced-motion: versão estática empilhada, sem sticky/scrub.
  if (reduced) {
    return (
      <section className="story story--static section" id="tecnologia" aria-labelledby="story-title">
        <div className="container">
          <span className="eyebrow">Como funciona</span>
          <h2 className="section-title" id="story-title">
            Três camadas de silêncio
          </h2>
          <div className="story__static-grid">
            <div className="story__static-hp">
              <Headphones color={color} decorative />
            </div>
            <ol className="story__static-steps">
              {STORY_STEPS.map((s) => (
                <li key={s.index} className="story__static-step">
                  <span className="story__index">{s.index}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="story" id="tecnologia" aria-labelledby="story-title">
      <div className="story__track" ref={trackRef}>
        <div className="story__sticky">
          <div className="container story__layout">
            <div className="story__copy">
              <span className="eyebrow">Como funciona</span>
              <h2 className="story__title" id="story-title">
                Três camadas de silêncio
              </h2>

              <div className="story__panels" aria-live="polite">
                {STORY_STEPS.map((s, i) => (
                  <article key={s.index} className="story__panel" data-active={stage === i} aria-hidden={stage !== i}>
                    <span className="story__index">{s.index}</span>
                    <h3 className="story__panel-title">{s.title}</h3>
                    <p className="story__panel-desc">{s.desc}</p>
                  </article>
                ))}
              </div>

              <div className="story__rail" aria-hidden="true">
                <div className="story__rail-track">
                  <div className="story__rail-fill" ref={railRef} />
                </div>
                <div className="story__rail-dots">
                  {STORY_STEPS.map((s, i) => (
                    <span key={s.index} className="story__rail-dot" data-active={stage >= i} />
                  ))}
                </div>
              </div>
            </div>

            <div className="story__stage">
              <div className="story__wave" ref={waveRef} aria-hidden="true">
                <svg viewBox="0 0 420 420" width="100%" height="100%">
                  <g fill="none" stroke="var(--accent)">
                    <circle cx="210" cy="210" r="120" strokeOpacity="0.5" strokeDasharray="4 10" />
                    <circle cx="210" cy="210" r="160" strokeOpacity="0.3" strokeDasharray="4 12" />
                    <circle cx="210" cy="210" r="200" strokeOpacity="0.16" strokeDasharray="4 14" />
                  </g>
                </svg>
              </div>
              <Headphones ref={hpRef} color={color} decorative />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
