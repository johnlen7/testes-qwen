import { useRef, type CSSProperties } from 'react'
import { Starfield } from '../Starfield'
import { Headphones } from '../Headphones'
import { Magnetic } from '../Magnetic'
import { useConfigurator } from '../../state/ConfiguratorContext'
import { usePointerParallax } from '../../hooks/usePointerParallax'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import './hero.css'

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  const { color, size } = useConfigurator()
  const visualRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()

  usePointerParallax((x, y) => {
    if (visualRef.current) {
      visualRef.current.style.transform = `translate3d(${(x * 22).toFixed(1)}px, ${(y * 16).toFixed(1)}px, 0)`
    }
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${(x * -16).toFixed(1)}px, ${(y * -12).toFixed(1)}px, 0)`
    }
  }, !reduced)

  return (
    <section className="hero" id="topo" aria-labelledby="hero-title">
      <Starfield className="hero__stars" />

      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="eyebrow" data-enter style={delay(80)}>
            Cancelamento adaptativo espacial
          </span>
          <h1 className="hero__title" id="hero-title" data-enter style={delay(180)}>
            Áudio que <em>orbita</em> você.
          </h1>
          <p className="hero__sub" data-enter style={delay(430)}>
            Silêncio que se adapta ao espaço ao seu redor e um palco sonoro que permanece fixo enquanto você se move.
          </p>
          <div className="hero__cta" data-enter style={delay(580)}>
            <Magnetic>
              <a className="btn btn--primary" href="#configurador">
                Comprar ÓRBITA
              </a>
            </Magnetic>
            <a className="btn btn--ghost" href="#tecnologia">
              Ver tecnologia
            </a>
          </div>
        </div>

        <div className="hero__visual" ref={visualRef}>
          <div className="hero__glow" ref={glowRef} aria-hidden="true" />
          <div className="hero__visual-enter" data-enter style={delay(340)}>
            <div className="hero__visual-float">
              <Headphones color={color} cupScale={size.cupScale} />
            </div>
          </div>
        </div>
      </div>

      <a className="hero__cue" href="#tecnologia">
        <span>explorar</span>
        <span className="hero__cue-line" aria-hidden="true" />
      </a>
    </section>
  )
}
