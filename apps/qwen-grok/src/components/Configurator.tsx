import { COLORS, useConfig, type ShellSize } from '../context/ConfigContext'
import { useCountUp } from '../hooks/useCountUp'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { HeadphoneSVG } from './headphone/HeadphoneSVG'
import { MagneticButton } from './MagneticButton'
import './configurator.css'

export function Configurator() {
  const { color, colorId, setColorId, shell, setShell, price, ctaLabel } = useConfig()
  const reduced = useReducedMotion()
  const displayPrice = useCountUp(price, 720, !reduced)

  return (
    <section id="configurador" className="section configurator" aria-labelledby="config-title">
      <div className="shell">
        <p className="section__eyebrow">Configurador</p>
        <h2 id="config-title" className="section__title">
          Monte a sua órbita
        </h2>
        <p className="section__lead">
          Cinco acabamentos usinados. Duas geometrias de concha. O preço acompanha
          cada escolha — e o CTA final já sabe o que você configurou.
        </p>

        <div className="configurator__panel">
          <div className="configurator__preview" aria-live="polite">
            <HeadphoneSVG color={color} shell={shell} size="lg" showOrbits />
            <p className="configurator__swatch-name">
              {color.label}
              <span> · {shell === 'oversized' ? 'Oversized' : 'Standard'}</span>
            </p>
          </div>

          <div className="configurator__controls">
            <fieldset className="configurator__field">
              <legend>Acabamento</legend>
              <div className="configurator__colors" role="radiogroup" aria-label="Cor do fone">
                {COLORS.map((c) => {
                  const selected = c.id === colorId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={c.label}
                      className={`configurator__color ${selected ? 'is-selected' : ''}`}
                      style={{
                        ['--swatch' as string]: c.body,
                        ['--swatch-ring' as string]: c.ring,
                      }}
                      onClick={() => setColorId(c.id)}
                    >
                      <span className="configurator__color-core" />
                      <span className="configurator__color-label">{c.label}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="configurator__field">
              <legend>Concha</legend>
              <div className="configurator__shells" role="radiogroup" aria-label="Tamanho da concha">
                {(
                  [
                    {
                      id: 'standard' as ShellSize,
                      title: 'Standard',
                      desc: 'Perfil equilibrado · 278 g',
                    },
                    {
                      id: 'oversized' as ShellSize,
                      title: 'Oversized',
                      desc: 'Cushion +12% · isolamento extra',
                    },
                  ] as const
                ).map((opt) => {
                  const selected = shell === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`configurator__shell ${selected ? 'is-selected' : ''}`}
                      onClick={() => setShell(opt.id)}
                    >
                      <span className="configurator__shell-title">{opt.title}</span>
                      <span className="configurator__shell-desc">{opt.desc}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="configurator__price-block">
              <div>
                <p className="configurator__price-label">Investimento</p>
                <p className="configurator__price" aria-live="polite">
                  <span className="configurator__currency">R$</span>
                  <span className="configurator__digits">
                    {displayPrice.toLocaleString('pt-BR')}
                  </span>
                </p>
              </div>
              <MagneticButton
                aria-label={ctaLabel}
                onClick={() =>
                  document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                {ctaLabel}
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
