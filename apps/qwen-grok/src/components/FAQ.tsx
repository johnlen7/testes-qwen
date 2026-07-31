import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react'
import './faq.css'

const ITEMS = [
  {
    q: 'O que é cancelamento adaptativo espacial?',
    a: 'Em vez de um filtro único, ÓRBITA constrói um mapa esférico do ruído ao redor da sua cabeça e aplica cancelamento seletivo por zona. Você define o que passa — vozes, alertas, o resto some.',
  },
  {
    q: 'Qual a diferença entre Standard e Oversized?',
    a: 'Oversized amplia a câmara de cushion em ~12%, aumenta o isolamento passivo e adiciona 22 g. Ideal para voos longos. Standard equilibra presença e portabilidade no dia a dia.',
  },
  {
    q: 'Funciona com óculos?',
    a: 'Sim. O arco de carbono tem flexão lateral de 18° e o cushion open-cell acomoda hastes sem ponto de pressão nas têmporas.',
  },
  {
    q: 'Como funciona a garantia e devolução?',
    a: 'Dois anos de cobertura global + 30 dias para devolução integral. Pré-encomendas têm fila prioritária de suporte e troca de acabamento em até 14 dias após o recebimento.',
  },
  {
    q: 'Preciso do app para usar o ANC?',
    a: 'Não. O perfil espacial padrão já vem calibrado. O app entra só se você quiser zonas personalizadas, equalizer e atualizações de firmware.',
  },
] as const

export function FAQ() {
  const baseId = useId()
  const [open, setOpen] = useState<number | null>(0)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  const toggle = useCallback((i: number) => {
    setOpen((prev) => (prev === i ? null : i))
  }, [])

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const max = ITEMS.length - 1
    let next: number | null = null
    if (e.key === 'ArrowDown') next = i === max ? 0 : i + 1
    if (e.key === 'ArrowUp') next = i === 0 ? max : i - 1
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = max
    if (next === null) return
    e.preventDefault()
    btnRefs.current[next]?.focus()
  }

  return (
    <section id="faq" className="section faq" aria-labelledby="faq-title">
      <div className="shell faq__layout">
        <div>
          <p className="section__eyebrow">Dúvidas</p>
          <h2 id="faq-title" className="section__title">
            Antes de entrar em órbita
          </h2>
          <p className="section__lead">
            Respostas diretas. Se faltar algo, o suporte responde em português em até 4 h úteis.
          </p>
        </div>

        <div className="faq__list">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            const panelId = `${baseId}-panel-${i}`
            const headerId = `${baseId}-header-${i}`
            return (
              <div className={`faq__item ${isOpen ? 'is-open' : ''}`} key={item.q}>
                <h3>
                  <button
                    ref={(el) => {
                      btnRefs.current[i] = el
                    }}
                    type="button"
                    id={headerId}
                    className="faq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                        <path
                          d="M6 10l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  className="faq__panel"
                  // grid 0fr/1fr technique — animates height correctly
                >
                  <div className="faq__panel-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
