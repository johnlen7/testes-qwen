import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { COLORS, SOUND_MODES } from '../../data/site';
import { formatBRL, clamp, lerp } from '../../lib/motion';
import { useReducedMotion, isFinePointer } from '../../lib/useReducedMotion';
import { useProduct } from '../../contexts/ProductContext';
import ProductGraphic from '../ProductGraphic/ProductGraphic';
import './FinalCta.css';

const MAGNET_MAX = 10; // deslocamento máximo do botão, em px
const MAGNET_LERP = 0.15; // fator de suavização do lerp por frame
const RIPPLE_SIZE = 18; // tamanho inicial do ripple, em px

export default function FinalCta() {
  const { colorId, modeId, price } = useProduct();
  const reduced = useReducedMotion();
  const magnetEnabled = isFinePointer() && !reduced;

  const color = COLORS.find((c) => c.id === colorId) ?? COLORS[0];
  const mode = SOUND_MODES.find((m) => m.id === modeId) ?? SOUND_MODES[0];

  const wrapRef = useRef<HTMLSpanElement>(null);

  /* Botão magnético — ref direto no wrapper, zero setState.
     O translate vai no wrapper (e não no botão) para não sobrescrever
     o hover translateY(-2px) do .btn--primary global. */
  useEffect(() => {
    if (!magnetEnabled) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let running = false;

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const tick = () => {
      current.x = lerp(current.x, target.x, MAGNET_LERP);
      current.y = lerp(current.y, target.y, MAGNET_LERP);
      const settled =
        Math.abs(current.x - target.x) < 0.05 &&
        Math.abs(current.y - target.y) < 0.05;
      if (settled) {
        current.x = target.x;
        current.y = target.y;
      }
      wrap.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
      if (settled) stop();
      else raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      target.x = clamp(dx, -MAGNET_MAX, MAGNET_MAX);
      target.y = clamp(dy, -MAGNET_MAX, MAGNET_MAX);
      start();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      stop();
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.style.transform = '';
    };
  }, [magnetEnabled]);

  /* Ripple — span criado direto no DOM e removido no animationend */
  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'fcta-ripple';
    ripple.style.left = `${e.clientX - rect.left - RIPPLE_SIZE / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - RIPPLE_SIZE / 2}px`;
    const remove = () => {
      ripple.removeEventListener('animationend', remove);
      ripple.remove();
    };
    ripple.addEventListener('animationend', remove);
    btn.appendChild(ripple);
  };

  const summary = `${color.name} · ${mode.name} · ${formatBRL(price)}`;
  const ariaLabel = `Comprar ÓRBITA ${color.name}, modo ${mode.name}, por ${formatBRL(price)}`;

  return (
    <section id="final-cta" className="section fcta">
      <span className="fcta-orbit" aria-hidden="true" />

      <div className="container fcta-inner">
        <div className="fcta-glow-wrap">
          <span
            className="fcta-glow"
            aria-hidden="true"
            style={{ '--fcta-glow-c': color.glow } as CSSProperties}
          />
          <ProductGraphic
            color={color}
            modeId={modeId}
            eq
            className="fcta-product"
          />
        </div>

        <h2 className="display fcta-title">
          Feito para o <em>seu som</em>.
        </h2>
        <p className="lead fcta-lead">
          O ÓRBITA que você montou, na sua cabeça em até 7 dias. Frete grátis
          e 30 dias para se apaixonar.
        </p>

        <p className="fcta-config">{summary}</p>

        <span className="fcta-magnet" ref={wrapRef}>
          <button
            type="button"
            className="btn btn--primary fcta-btn"
            aria-label={ariaLabel}
            onPointerDown={onPointerDown}
          >
            <span>Comprar ÓRBITA — {formatBRL(price)}</span>
            <svg
              className="fcta-arrow"
              viewBox="0 0 20 20"
              width="16"
              height="16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 10h13M11.5 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </span>

        <p className="fcta-note">Pré-venda simulada — sem checkout real.</p>
      </div>
    </section>
  );
}
