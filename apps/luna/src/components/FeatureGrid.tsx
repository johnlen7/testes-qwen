import { useEffect, useRef } from 'react';
import type { Feature } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Icon, type IconName } from './Icon';

const featureIcons: Record<string, IconName> = {
  adaptive: 'wave',
  battery: 'battery',
  comfort: 'weight',
  translation: 'link',
  repair: 'repair',
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) {
      element?.classList.add('is-revealed');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-revealed');
        observer.disconnect();
      }
    }, { threshold: 0.16 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    ref.current.style.setProperty('--tilt-x', x.toFixed(3));
    ref.current.style.setProperty('--tilt-y', y.toFixed(3));
  };

  const resetTilt = () => {
    ref.current?.style.setProperty('--tilt-x', '0');
    ref.current?.style.setProperty('--tilt-y', '0');
  };

  return (
    <article
      ref={ref}
      className="feature-card"
      data-tone={feature.tone}
      style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
    >
      <div className="feature-card__top">
        <div>
          <p className="feature-card__eyebrow">{feature.eyebrow}</p>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
        <span className="feature-card__icon"><Icon name={featureIcons[feature.id] ?? 'orbit'} size={21} /></span>
      </div>
      <div className="feature-card__bottom">
        <div className="feature-card__metric">
          <strong>{feature.metric}</strong>
          <span>{feature.metricLabel}</span>
        </div>
      </div>
    </article>
  );
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <section className="section features-section" aria-labelledby="features-title">
      <div className="container">
        <div className="features-heading">
          <div className="section-heading">
            <div className="mono-label">O que continua quando o ruído some</div>
            <h2 id="features-title">Tecnologia que não pede atenção.</h2>
          </div>
          <p className="features-note">Cinco decisões de engenharia para deixar a escuta no centro.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => <FeatureCard key={feature.id} feature={feature} index={index} />)}
        </div>
      </div>
    </section>
  );
}
