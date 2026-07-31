import { useConfig } from '../context/ConfigContext'
import { usePointerParallax } from '../hooks/usePointerParallax'
import { HeadphoneSVG } from './headphone/HeadphoneSVG'
import { MagneticButton } from './MagneticButton'
import './hero.css'

export function Hero() {
  const { color } = useConfig()
  const parallaxRef = usePointerParallax<HTMLDivElement>(22)

  return (
    <section id="topo" className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="shell hero__grid">
        <div className="hero__copy">
          <p className="hero__eyebrow hero-enter" style={{ ['--d' as string]: '0ms' }}>
            Lançamento · Cancelamento espacial
          </p>
          <h1 id="hero-title" className="hero__title hero-enter" style={{ ['--d' as string]: '80ms' }}>
            Escute o<span className="hero__title-accent"> silêncio </span>
            entre as órbitas
          </h1>
          <p className="hero__sub hero-enter" style={{ ['--d' as string]: '180ms' }}>
            ÓRBITA mapeia o campo sonoro ao seu redor em tempo real e esculpe um
            silêncio tridimensional — sem isolamento do mundo, com presença total
            na música.
          </p>
          <div className="hero__actions hero-enter" style={{ ['--d' as string]: '280ms' }}>
            <MagneticButton
              onClick={() =>
                document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Configurar o meu
            </MagneticButton>
            <a className="btn btn--ghost" href="#como-funciona">
              Ver como funciona
            </a>
          </div>
          <dl className="hero__stats hero-enter" style={{ ['--d' as string]: '380ms' }}>
            <div>
              <dt>Latência ANC</dt>
              <dd>&lt; 2 ms</dd>
            </div>
            <div>
              <dt>Drivers</dt>
              <dd>40 mm bio-celulose</dd>
            </div>
            <div>
              <dt>Autonomia</dt>
              <dd>42 h</dd>
            </div>
          </dl>
        </div>

        <div className="hero__stage hero-enter" style={{ ['--d' as string]: '200ms' }} ref={parallaxRef}>
          <div className="hero__orbit-label" aria-hidden="true">
            <span>ANC SPATIAL</span>
            <span>FIELD 01</span>
          </div>
          <HeadphoneSVG color={color} shell="standard" showOrbits size="hero" explode={0} />
          <div className="hero__floor" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
