import { useRef } from 'react';
import type { ProductAttribute, ProductColor } from '../types';
import { usePointerParallax } from '../hooks/usePointerParallax';
import { MagneticButton } from './MagneticButton';
import { ProductVisual } from './ProductVisual';

interface HeroProps {
  color: ProductColor;
  attribute: ProductAttribute;
}

export function Hero({ color, attribute }: HeroProps) {
  const visualRef = useRef<HTMLDivElement>(null);
  usePointerParallax(visualRef, true);

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="mono-label hero-kicker">FONE DE OUVIDO / 01</div>
          <h1 className="hero-title" id="hero-title">
            <span>Escute</span>
            <span>o espaço.</span>
          </h1>
          <p>Cancelamento de ruído adaptativo espacial. O silêncio também pode ter direção.</p>
          <div className="hero-actions">
            <MagneticButton href="#sistema" variant="primary">Explorar o sistema</MagneticButton>
            <MagneticButton href="#configurador" variant="ghost">Configurar o seu</MagneticButton>
          </div>
        </div>

        <div ref={visualRef} className="hero-visual-wrap">
          <ProductVisual color={color} attribute={attribute} stage="hero" size="100%" />
          <span className="orbital-caption">sinal em órbita / 01</span>
        </div>
      </div>
    </section>
  );
}
