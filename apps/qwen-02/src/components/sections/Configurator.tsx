import type { KeyboardEvent } from 'react'
import { useConfigurator } from '../../state/ConfiguratorContext'
import { COLORS, SIZES } from '../../lib/product'
import { formatBRL } from '../../lib/format'
import { useCountUp } from '../../hooks/useCountUp'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Headphones } from '../Headphones'
import { Reveal } from '../Reveal'
import './configurator.css'

/** Navegação por setas para radiogroups (roving tabindex). */
function onGroupArrow(e: KeyboardEvent<HTMLDivElement>, ids: string[], set: (id: string) => void) {
  const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown'
  const backward = e.key === 'ArrowLeft' || e.key === 'ArrowUp'
  if (!forward && !backward) return
  e.preventDefault()
  const active = document.activeElement?.getAttribute('data-id') ?? ids[0]
  const current = Math.max(ids.indexOf(active), 0)
  const next = (current + (forward ? 1 : -1) + ids.length) % ids.length
  set(ids[next])
  e.currentTarget.querySelector<HTMLElement>(`[data-id="${ids[next]}"]`)?.focus()
}

export function Configurator() {
  const { color, size, setColorId, setSizeId } = useConfigurator()
  const reduced = usePrefersReducedMotion()
  const animatedPrice = useCountUp(size.price, 650, !reduced)
  const price = formatBRL(Math.round(animatedPrice))
  const colorIds = COLORS.map((c) => c.id)
  const sizeIds = SIZES.map((s) => s.id)

  return (
    <section className="config section" id="configurador" aria-labelledby="config-title">
      <div className="container">
        <Reveal>
          <span className="eyebrow">Configurador</span>
          <h2 className="section-title" id="config-title">
            Monte o seu ÓRBITA
          </h2>
          <p className="section-lead">Duas decisões. Um fone com a sua assinatura sonora e estética.</p>
        </Reveal>

        <div className="config__grid">
          <div className="config__stage">
            <div className="config__glow" aria-hidden="true" />
            <Headphones color={color} cupScale={size.cupScale} />
            <span className="config__stage-tag" aria-hidden="true">
              {color.name} · {size.short}
            </span>
          </div>

          <div className="config__panel">
            <fieldset className="config__field">
              <legend className="config__label">
                Cor <span className="config__label-value">— {color.name}</span>
              </legend>
              <div
                className="config__swatches"
                role="radiogroup"
                aria-label="Cor do fone"
                onKeyDown={(e) => onGroupArrow(e, colorIds, setColorId)}
              >
                {COLORS.map((c) => {
                  const active = c.id === color.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="config__swatch"
                      data-id={c.id}
                      data-active={active}
                      role="radio"
                      aria-checked={active}
                      aria-label={c.name}
                      title={c.name}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setColorId(c.id)}
                    >
                      <span className="config__swatch-dot" style={{ background: c.swatch }} />
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="config__field">
              <legend className="config__label">Tamanho da concha</legend>
              <div
                className="config__sizes"
                role="radiogroup"
                aria-label="Tamanho da concha"
                onKeyDown={(e) => onGroupArrow(e, sizeIds, setSizeId)}
              >
                {SIZES.map((s) => {
                  const active = s.id === size.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className="config__size"
                      data-id={s.id}
                      data-active={active}
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setSizeId(s.id)}
                    >
                      <span className="config__size-name">{s.name}</span>
                      <span className="config__size-price">{formatBRL(s.price)}</span>
                    </button>
                  )
                })}
              </div>
              <p className="config__size-desc">{size.desc}</p>
            </fieldset>

            <div className="config__buy">
              <div className="config__price">
                <span className="config__price-label">Total</span>
                <span className="config__price-value">{price}</span>
              </div>
              <button type="button" className="btn btn--primary config__cta">
                Comprar ÓRBITA — {color.name}, {price}
              </button>
              <p className="config__note">Frete grátis · 30 dias para devolução · 2 anos de garantia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
