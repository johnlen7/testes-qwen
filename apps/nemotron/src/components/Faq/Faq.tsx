import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { FAQS } from '../../data/site';
import './Faq.css';

export default function Faq() {
  const uid = useId();
  const [openIndex, setOpenIndex] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? -1 : i));

  /* Navegação por setas entre os botões — todos tabáveis (Enter/Space nativos) */
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = FAQS.length - 1;
    let next = -1;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        next = i === last ? 0 : i + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        next = i === 0 ? last : i - 1;
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = last;
        break;
      default:
        return;
    }
    btnRefs.current[next]?.focus();
  };

  return (
    <section id="faq" className="section faq">
      <div className="container faq-container">
        <header className="faq-head">
          <p className="eyebrow">FAQ · 06</p>
          <h2 className="display faq-title">Perguntas frequentes.</h2>
        </header>

        <div className="faq-list">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            const headerId = `${uid}-h-${i}`;
            const panelId = `${uid}-p-${i}`;

            return (
              <div className="faq-item" key={item.q}>
                <h3 className="faq-q-title">
                  <button
                    type="button"
                    id={headerId}
                    ref={(el) => {
                      btnRefs.current[i] = el;
                    }}
                    className="faq-btn"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                  >
                    <span className="faq-q">{item.q}</span>
                    <span
                      className={`faq-icon${open ? ' is-open' : ''}`}
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                        <path
                          d="M8 2v12M2 8h12"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  aria-hidden={!open}
                  inert={!open}
                  className={`faq-panel${open ? ' is-open' : ''}`}
                >
                  <div className="faq-panel-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
