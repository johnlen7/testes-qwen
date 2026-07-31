import { useEffect, useState } from 'react';
import type { ProductAttribute, ProductColor } from '../types';
import { MagneticButton } from './MagneticButton';
import { ProductVisual } from './ProductVisual';
import { formatPrice } from './Configurator';

interface FinalCTAProps {
  color: ProductColor;
  attribute: ProductAttribute;
  price: number;
}

export function FinalCTA({ color, attribute, price }: FinalCTAProps) {
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    setConfirmation(false);
  }, [attribute.id, color.id, price]);

  return (
    <section className="final-cta-section" aria-labelledby="final-cta-title">
      <div className="container">
        <div className="final-cta">
          <div className="final-cta__copy">
            <h2 id="final-cta-title">Leve o silêncio com você.</h2>
            <p>{color.label} com perfil {attribute.label}. O espaço que você escolheu, pronto para tocar.</p>
            <MagneticButton className="final-cta__button" variant="primary" onClick={() => setConfirmation(true)}>
              Garantir o meu ÓRBITA
            </MagneticButton>
            {confirmation && <p className="purchase-status" role="status" aria-live="polite">Pedido simulado para ÓRBITA {color.label}, {formatPrice(price)}.</p>}
          </div>
          <div className="final-cta__visual">
            <ProductVisual color={color} attribute={attribute} stage="final" size="100%" />
          </div>
        </div>
      </div>
    </section>
  );
}
