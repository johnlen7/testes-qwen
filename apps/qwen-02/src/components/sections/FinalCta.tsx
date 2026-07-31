import type { MouseEvent } from 'react'
import { useConfigurator } from '../../state/ConfiguratorContext'
import { formatBRL } from '../../lib/format'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Headphones } from '../Headphones'
import { Magnetic } from '../Magnetic'
import { Starfield } from '../Starfield'
import { Reveal } from '../Reveal'
import './final-cta.css'

export function FinalCta() {
  const { color, size } = useConfigurator()
  const reduced = usePrefersReducedMotion()

  const onRipple = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduced) return
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const span = document.createElement('span')
    const diameter = Math.max(rect.width, rect.height) * 2.2
    span.className = 'ripple'
    span.style.width = span.style.height = `${diameter}px`
    span.style.left = `${e.clientX - rect.left - diameter / 2}px`
    span.style.top = `${e.clientY - rect.top - diameter / 2}px`
    btn.appendChild(span)
    span.addEventListener('animationend', () => span.remove(), { once: true })
  }

  return (
    <section className="cta section" aria-labelledby="cta-title">
      <Starfield />
      <div className="container cta__inner">
        <Reveal className="cta__visual">
          <div className="cta__glow" aria-hidden="true" />
          <Headphones color={color} cupScale={size.cupScale} decorative />
        </Reveal>

        <Reveal delay={130} className="cta__copy">
          <span className="eyebrow">ÓRBITA {size.short}</span>
          <h2 className="cta__title" id="cta-title">
            Pronto para entrar em <em>órbita</em>?
          </h2>
          <p className="cta__sub">
            O seu ÓRBITA {color.name} por {formatBRL(size.price)}, com frete grátis e 30 dias para se apaixonar — ou
            devolver sem perguntas.
          </p>
          <Magnetic strength={0.38}>
            <button type="button" className="btn btn--primary cta__btn" onClick={onRipple}>
              Comprar ÓRBITA — {color.name}, {formatBRL(size.price)}
            </button>
          </Magnetic>
          <p className="cta__fine">Produto fictício — nenhum pedido é processado.</p>
        </Reveal>
      </div>
    </section>
  )
}
