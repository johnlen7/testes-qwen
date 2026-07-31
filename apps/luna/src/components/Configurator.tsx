import { useEffect, useMemo, useState } from 'react';
import type { ProductAttribute, ProductColor, ProductSelection } from '../types';
import { useCountUp } from '../hooks/useCountUp';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { MagneticButton } from './MagneticButton';
import { ProductVisual } from './ProductVisual';

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

interface ConfiguratorProps {
  selection: ProductSelection;
  colors: ProductColor[];
  attributes: ProductAttribute[];
  price: number;
  onColorChange: (id: string) => void;
  onAttributeChange: (id: string) => void;
}

export function Configurator({ selection, colors, attributes, price, onColorChange, onAttributeChange }: ConfiguratorProps) {
  const reducedMotion = useReducedMotion();
  const [confirmation, setConfirmation] = useState(false);
  const displayPrice = useCountUp(price, reducedMotion);
  const color = colors.find((item) => item.id === selection.colorId) ?? colors[0];
  const attribute = attributes.find((item) => item.id === selection.attributeId) ?? attributes[0];
  const purchaseLabel = useMemo(() => `Comprar ÓRBITA - ${color.label}, ${formatPrice(price)}`, [color.label, price]);

  useEffect(() => {
    setConfirmation(false);
  }, [selection.attributeId, selection.colorId]);

  return (
    <section className="section configurator-section" id="configurador" aria-labelledby="configurator-title">
      <div className="container configurator-grid">
        <div className="configurator-visual">
          <ProductVisual color={color} attribute={attribute} stage="configurator" size="100%" />
        </div>

        <div className="configurator-copy">
          <div className="section-heading">
            <h2 id="configurator-title">Dê um corpo ao seu silêncio.</h2>
            <p>Escolha o acabamento e o perfil de escuta. A forma do produto acompanha a sua decisão.</p>
          </div>

          <fieldset className="control-group">
            <legend className="control-label">Acabamento</legend>
            <div className="swatch-list">
              {colors.map((item) => (
                <button
                  className={`swatch ${item.id === selection.colorId ? 'is-selected' : ''}`}
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === selection.colorId}
                  aria-label={`${item.label}. ${item.description}`}
                  onClick={() => onColorChange(item.id)}
                  style={{ '--swatch-color': item.hex } as React.CSSProperties}
                >
                  <span className="swatch__dot" aria-hidden="true" />
                  <span className="swatch__text">{item.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="control-group">
            <legend className="control-label">Perfil espacial</legend>
            <div className="attribute-list">
              {attributes.map((item) => (
                <button
                  className={`attribute-option ${item.id === selection.attributeId ? 'is-selected' : ''}`}
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === selection.attributeId}
                  aria-describedby={`attribute-description-${item.id}`}
                  onClick={() => onAttributeChange(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.priceDelta ? `+ ${formatPrice(item.priceDelta)}` : 'incluído'}</span>
                  <span className="sr-only" id={`attribute-description-${item.id}`}>{item.description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="price-line">
            <span>ÓRBITA / edição escolhida</span>
            <strong aria-hidden="true">{formatPrice(displayPrice)}</strong>
            <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{formatPrice(price)}</span>
          </div>
          <MagneticButton className="configurator-cta" variant="primary" onClick={() => setConfirmation(true)}>
            {purchaseLabel}
          </MagneticButton>
          {confirmation && <p className="purchase-status" role="status" aria-live="polite">Pedido simulado para {color.label}, perfil {attribute.label}.</p>}
        </div>
      </div>
    </section>
  );
}
