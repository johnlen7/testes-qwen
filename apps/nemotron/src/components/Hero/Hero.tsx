import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import ProductGraphic from '../ProductGraphic/ProductGraphic';
import { COLORS, BASE_PRICE } from '../../data/site';
import { formatBRL } from '../../lib/motion';
import { useReducedMotion, isFinePointer } from '../../lib/useReducedMotion';
import { useScrollProgress } from '../../lib/useScrollProgress';
import './Hero.css';

/* ------------------------------ Poeira estelar ------------------------------ */
/* Posições, tamanhos e atrasos determinísticos (fixos no módulo) —
   nunca Math.random() no render. O drift usa o keyframe dust-drift. */

interface DustSpec {
  top: number; // % dentro do grupo
  left: number; // %
  size: number; // px
  dx: number; // deslocamento horizontal do drift, px
  dy: number; // deslocamento vertical do drift, px
  o: number; // opacidade de pico
  d: number; // atraso da animação (negativo), s
  dur: number; // duração do ciclo, s
  accent?: boolean; // âmbar em vez de tinta
}

const TITLE_DUST: DustSpec[] = [
  { top: -6, left: 84, size: 3, dx: 14, dy: -58, o: 0.5, d: -1.2, dur: 9, accent: true },
  { top: 2, left: 6, size: 2, dx: -10, dy: -40, o: 0.4, d: -4.6, dur: 11 },
  { top: 24, left: 68, size: 4, dx: 22, dy: -72, o: 0.45, d: -2.9, dur: 10, accent: true },
  { top: 46, left: 14, size: 2, dx: -16, dy: -52, o: 0.35, d: -6.4, dur: 12 },
  { top: 62, left: 92, size: 3, dx: 8, dy: -64, o: 0.5, d: -8.1, dur: 9, accent: true },
];

const PRODUCT_DUST: DustSpec[] = [
  { top: 6, left: 8, size: 2, dx: -12, dy: -46, o: 0.4, d: -0.8, dur: 10 },
  { top: 4, left: 86, size: 3, dx: 16, dy: -60, o: 0.5, d: -3.4, dur: 9, accent: true },
  { top: 30, left: 94, size: 2, dx: 6, dy: -38, o: 0.35, d: -5.9, dur: 11 },
  { top: 42, left: 4, size: 3, dx: -18, dy: -66, o: 0.45, d: -7.2, dur: 10, accent: true },
  { top: -4, left: 48, size: 4, dx: 24, dy: -84, o: 0.5, d: -2.1, dur: 12, accent: true },
  { top: 58, left: 90, size: 2, dx: 10, dy: -44, o: 0.4, d: -9.3, dur: 10 },
  { top: 86, left: 26, size: 3, dx: -14, dy: -56, o: 0.5, d: -1.7, dur: 9, accent: true },
  { top: 90, left: 62, size: 2, dx: 20, dy: -70, o: 0.35, d: -5.2, dur: 11 },
  { top: 16, left: 32, size: 2, dx: -8, dy: -34, o: 0.4, d: -3.9, dur: 8 },
];

const dustStyle = (d: DustSpec): CSSProperties =>
  ({
    top: `${d.top}%`,
    left: `${d.left}%`,
    width: `${d.size}px`,
    height: `${d.size}px`,
    background: d.accent ? 'var(--accent)' : 'var(--ink)',
    '--dust-x': `${d.dx}px`,
    '--dust-y': `${d.dy}px`,
    '--dust-o': String(d.o),
    '--d': `${d.d}s`,
    '--dur': `${d.dur}s`,
  }) as CSSProperties;

/* ------------------------------ Componente ------------------------------ */

export default function Hero() {
  const reduced = useReducedMotion();

  /* Fade ao rolar: escreve --fade (0..1) direto no <section> via rAF,
     sem re-render. O CSS lê a variável em transform/opacity. */
  const sectionRef = useScrollProgress<HTMLElement>((p) => {
    sectionRef.current?.style.setProperty('--fade', p.toFixed(3));
  });

  /* Parallax de mouse — apenas pointer fino e sem reduced motion.
     Normaliza o cursor em [-1, 1] e escreve --px/--py no section
     dentro de rAF com lerp leve (0.08). Zero setState por frame. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced || !isFinePointer()) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let running = false;

    const tick = () => {
      tx += (cx - tx) * 0.08;
      ty += (cy - ty) * 0.08;
      el.style.setProperty('--px', tx.toFixed(4));
      el.style.setProperty('--py', ty.toFixed(4));
      if (Math.abs(cx - tx) > 0.0005 || Math.abs(cy - ty) > 0.0005) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: MouseEvent) => {
      cx = (e.clientX / window.innerWidth) * 2 - 1;
      cy = (e.clientY / window.innerHeight) * 2 - 1;
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    el.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      el.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      el.style.removeProperty('--px');
      el.style.removeProperty('--py');
    };
  }, [reduced, sectionRef]);

  const titleDust = useMemo(() => TITLE_DUST, []);
  const productDust = useMemo(() => PRODUCT_DUST, []);

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className="hero"
      aria-labelledby="hero-title"
    >
      <div className="hero-grid">
        <div className="hero-content">
          <div className="hero-text">
            <p className="eyebrow hero-in" style={{ animationDelay: '0ms' }}>
              Lançamento · 2026
            </p>

            <h1
              id="hero-title"
              className="display hero-title hero-in"
              style={{ animationDelay: '90ms' }}
            >
              O som encontra o <em>seu espaço</em>.
            </h1>

            <p className="lead hero-in" style={{ animationDelay: '180ms' }}>
              Áudio espacial com head-tracking, cancelamento que se adapta ao
              ambiente e 40 horas de bateria — tudo em 258g de alumínio.
            </p>

            <div className="hero-ctas hero-in" style={{ animationDelay: '270ms' }}>
              <a className="btn btn--primary" href="#configurar">
                Configurar o seu
              </a>
              <a className="btn btn--ghost" href="#como-funciona">
                Ver como funciona
              </a>
            </div>

            <div className="hero-dust-group" aria-hidden="true">
              {titleDust.map((d, i) => (
                <span key={i} className="hero-dust" style={dustStyle(d)} />
              ))}
            </div>
          </div>
        </div>

        <div className="hero-product">
          <ProductGraphic color={COLORS[0]} className="hero-pg hero-product-in" />

          <div className="hero-price hero-in" style={{ animationDelay: '520ms' }}>
            <span className="hero-price-label">A partir de</span>
            <span className="hero-price-value">{formatBRL(BASE_PRICE)}</span>
          </div>

          <div className="hero-dust-group" aria-hidden="true">
            {productDust.map((d, i) => (
              <span key={i} className="hero-dust" style={dustStyle(d)} />
            ))}
          </div>
        </div>

        <div className="hero-cue" aria-hidden="true">
          <span className="hero-cue-label">Role para explorar</span>
          <span className="hero-cue-line" />
        </div>
      </div>
    </section>
  );
}
