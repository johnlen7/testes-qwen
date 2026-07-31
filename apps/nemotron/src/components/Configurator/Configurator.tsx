import { useEffect, useRef } from 'react';
import { COLORS, SOUND_MODES, BASE_PRICE } from '../../data/site';
import { useProduct } from '../../contexts/ProductContext';
import ProductGraphic from '../ProductGraphic/ProductGraphic';
import { countUp, formatBRL, fmtPrice } from '../../lib/motion';
import { useReducedMotion } from '../../lib/useReducedMotion';
import './Configurator.css';

/** Cor do check sobre a concha — escuro nos tons claros, claro nos escuros */
const shellInk = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const lum =
    0.2126 * ((n >> 16) & 255) +
    0.7152 * ((n >> 8) & 255) +
    0.0722 * (n & 255);
  return lum > 150 ? 'rgba(0,0,0,0.62)' : 'rgba(255,255,255,0.92)';
};

export default function Configurator() {
  const { colorId, modeId, setColorId, setModeId, price } = useProduct();
  const color = COLORS.find((c) => c.id === colorId) ?? COLORS[0];
  const mode = SOUND_MODES.find((m) => m.id === modeId) ?? SOUND_MODES[0];
  const reduced = useReducedMotion();

  // Count-up do preço — escrita direto no DOM, sem re-render por frame
  const priceEl = useRef<HTMLSpanElement>(null);
  const shownPrice = useRef(price);

  useEffect(() => {
    const el = priceEl.current;
    if (!el) return;
    // Sem animação: no mount, em reduced-motion ou quando nada mudou
    if (reduced || shownPrice.current === price) {
      el.textContent = formatBRL(price);
      shownPrice.current = price;
      return;
    }
    const cancel = countUp(shownPrice.current, price, 600, (v) => {
      shownPrice.current = v;
      el.textContent = formatBRL(Math.round(v));
    });
    return cancel;
  }, [price, reduced]);

  const totalDelta = price - BASE_PRICE;

  return (
    <section id="configurar" className="section">
      <div className="container">
        <header className="cfg-head">
          <span className="eyebrow">Configurador · 03</span>
          <h2 className="display cfg-title">
            Monte o seu <em>ÓRBITA.</em>
          </h2>
          <p className="lead cfg-lead">
            Escolha a concha, escolha o som. O preço se ajusta sozinho, sem
            surpresas.
          </p>
        </header>

        <div className="cfg-grid">
          {/* Produto — glow acompanha a cor da concha */}
          <div className="cfg-stage">
            <div
              className="cfg-glow"
              aria-hidden="true"
              style={{
                background: `radial-gradient(circle, ${color.glow} 0%, transparent 65%)`,
                transition: 'background 600ms var(--ease-out-quart)',
              }}
            />
            <div className="cfg-product">
              <ProductGraphic color={color} modeId={modeId} eq orbit />
            </div>
          </div>

          {/* Controles */}
          <div className="cfg-controls">
            <fieldset className="cfg-fieldset">
              <legend className="cfg-label">Cor da concha</legend>
              <div className="cfg-swatches">
                {COLORS.map((c) => {
                  const isSel = c.id === colorId;
                  return (
                    <div className="cfg-swatch" key={c.id}>
                      <button
                        type="button"
                        className="cfg-swatch-btn"
                        style={{ background: c.shell, color: shellInk(c.shell) }}
                        aria-pressed={isSel}
                        aria-label={`Cor ${c.name}`}
                        onClick={() => setColorId(c.id)}
                      >
                        <svg viewBox="0 0 12 12" aria-hidden="true">
                          <path
                            d="M2.5 6.5 5 9l4.5-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <span className={`cfg-swatch-name${isSel ? ' is-on' : ''}`}>
                        {c.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="cfg-fieldset">
              <legend className="cfg-label">Modo de som</legend>
              <div className="cfg-modes">
                {SOUND_MODES.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className="cfg-mode"
                    aria-pressed={m.id === modeId}
                    onClick={() => setModeId(m.id)}
                  >
                    <span className="cfg-mode-text">
                      <span className="cfg-mode-name">{m.name}</span>
                      <span className="cfg-mode-desc">{m.desc}</span>
                    </span>
                    <span className="cfg-mode-delta">
                      {m.priceDelta === 0
                        ? 'Incluído'
                        : `+ R$ ${fmtPrice(m.priceDelta)}`}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="cfg-price">
              <div className="cfg-price-row">
                <span className="cfg-label">Preço</span>
                <span className="cfg-price-value" ref={priceEl}>
                  {formatBRL(price)}
                </span>
              </div>
              <div className="cfg-price-breakdown">
                {color.name} · {mode.name} · + R$ {fmtPrice(totalDelta)}
              </div>
            </div>

            <a
              className="btn btn--primary cfg-cta"
              href="#final-cta"
              aria-label={`Comprar ÓRBITA ${color.name} modo ${mode.name} por ${formatBRL(price)}`}
            >
              <span>Comprar ÓRBITA — {color.name}</span>
              <span className="cfg-cta-price">{formatBRL(price)}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
