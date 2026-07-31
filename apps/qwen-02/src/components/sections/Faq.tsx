import { useRef, useState, type KeyboardEvent } from 'react'
import { FAQ } from '../../lib/product'
import { Reveal } from '../Reveal'
import './faq.css'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | null = null
    if (e.key === 'ArrowDown') next = (i + 1) % FAQ.length
    else if (e.key === 'ArrowUp') next = (i - 1 + FAQ.length) % FAQ.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = FAQ.length - 1
    if (next !== null) {
      e.preventDefault()
      btnRefs.current[next]?.focus()
    }
  }

  return (
    <section className="faq section" id="faq" aria-labelledby="faq-title">
      <div className="container faq__container">
        <Reveal>
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title" id="faq-title">
            Perguntas frequentes
          </h2>
        </Reveal>

        <Reveal delay={120} className="faq__list">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="faq__item" data-open={isOpen}>
                <h3 className="faq__heading">
                  <button
                    type="button"
                    ref={(el) => {
                      btnRefs.current[i] = el
                    }}
                    className="faq__trigger"
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    <span className="faq__question">{item.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq__panel" id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`}>
                  <div className="faq__panel-inner">
                    <p className="faq__answer">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
