import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { FAQItem } from '../types';
import { Icon } from './Icon';

export function FAQ({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState(items[0]?.id ?? '');
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next >= 0) {
      event.preventDefault();
      buttons.current[next]?.focus();
    }
  };

  return (
    <section className="section faq-section" id="duvidas" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <div className="section-heading">
          <h2 id="faq-title">Ainda orbitando uma dúvida?</h2>
          <p>Respostas curtas para as decisões que importam antes de colocar o som no ouvido.</p>
        </div>
        <div className="faq-list">
          {items.map((item, index) => {
            const isOpen = item.id === openId;
            const panelId = `faq-panel-${item.id}`;
            const triggerId = `faq-trigger-${item.id}`;
            return (
              <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.id}>
                <button
                  ref={(element) => { buttons.current[index] = element; }}
                  id={triggerId}
                  className="faq-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? '' : item.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-trigger__icon" aria-hidden="true"><Icon name="plus" size={16} /></span>
                </button>
                <div className="faq-panel" id={panelId} role="region" aria-labelledby={triggerId} aria-hidden={!isOpen}>
                  <div className="faq-panel__inner">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
