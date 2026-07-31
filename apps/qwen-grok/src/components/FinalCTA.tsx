import { useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import { HeadphoneSVG } from './headphone/HeadphoneSVG'
import { MagneticButton } from './MagneticButton'
import './final-cta.css'

export function FinalCTA() {
  const { color, shell, ctaLabel, price } = useConfig()
  const [done, setDone] = useState(false)

  return (
    <section id="comprar" className="section final-cta" aria-labelledby="final-title">
      <div className="shell final-cta__panel">
        <div className="final-cta__visual">
          <HeadphoneSVG color={color} shell={shell} size="lg" showOrbits />
        </div>
        <div className="final-cta__copy">
          <p className="section__eyebrow">Pré-encomenda</p>
          <h2 id="final-title" className="final-cta__title">
            Sua órbita está pronta
          </h2>
          <p className="final-cta__lead">
            Acabamento <strong>{color.label}</strong>, concha{' '}
            <strong>{shell === 'oversized' ? 'Oversized' : 'Standard'}</strong>.
            Envio estimado em 3–5 semanas. Sem cobrança até o despacho.
          </p>
          <p className="final-cta__price">
            R$ {price.toLocaleString('pt-BR')}
          </p>
          {done ? (
            <p className="final-cta__thanks" role="status">
              Pré-encomenda registrada — enviamos a confirmação em breve.
              (Simulação · sem backend)
            </p>
          ) : (
            <MagneticButton
              onClick={() => setDone(true)}
              aria-label={ctaLabel}
            >
              {ctaLabel}
            </MagneticButton>
          )}
        </div>
      </div>
    </section>
  )
}
