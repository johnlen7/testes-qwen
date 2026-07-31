import { useCallback, useRef } from 'react';
import type { ProductAttribute, ProductColor } from '../types';
import { useScrollScrub } from '../hooks/useScrollScrub';
import { ProductVisual } from './ProductVisual';

const steps = [
  {
    title: 'Isolamento',
    text: 'O fone encontra o ruído e o coloca fora do centro da sua atenção.',
  },
  {
    title: 'Separação',
    text: 'Sensores e conchas trabalham em órbitas diferentes para desenhar o silêncio.',
  },
  {
    title: 'Recomposição',
    text: 'Tudo volta ao eixo. O ambiente continua perto, só não precisa comandar a cena.',
  },
];

interface StorySectionProps {
  color: ProductColor;
  attribute: ProductAttribute;
}

export function StorySection({ color, attribute }: StorySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const onStepChange = useCallback(() => undefined, []);
  const { step, reducedMotion } = useScrollScrub(ref, onStepChange);

  return (
    <section className="section story-section" id="sistema" ref={ref} aria-labelledby="story-title">
      <div className="container story-sticky">
        <div className="story-copy">
          <h2 id="story-title">Como o silêncio se organiza.</h2>
          <p className="story-copy-intro">O ÓRBITA lê a sala como um campo. A resposta muda com o lugar, não com um menu.</p>
          <div className="story-steps" aria-label="Etapas do sistema espacial">
            {steps.map((item, index) => (
              <article className={`story-step ${index === step ? 'is-active' : ''}`} key={item.title} aria-current={index === step ? 'step' : undefined}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="story-visual">
          <ProductVisual color={color} attribute={attribute} stage="story" progress={0} size="100%" />
        </div>

        <div className="story-progress" aria-hidden="true">
          <span />
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {reducedMotion ? 'A sequência é apresentada sem animação. Etapa 1 de 3: Isolamento.' : `Etapa ${step + 1} de ${steps.length}: ${steps[step].title}.`}
        </p>
      </div>
    </section>
  );
}
