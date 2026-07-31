import { type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { FEATURES, type Feature } from '../../data/site';
import { useInView } from '../../lib/useInView';
import { isFinePointer, useReducedMotion } from '../../lib/useReducedMotion';
import './Features.css';

/* rAF pendente por card — throttle do tilt (um frame por movimento) */
const tiltFrames = new WeakMap<HTMLElement, number>();

/**
 * Ícones SVG autorais — viewBox 24, stroke em currentColor.
 * Desenhados à mão para esta página, sem depender de libs de ícones.
 */
function IconFeature({ name }: { name: Feature['icon'] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'wave' && (
        <>
          <circle cx="12" cy="12" r="1.6" />
          <path d="M7.4 8.4c-2.2 2.1-2.2 5.1 0 7.2" />
          <path d="M4.6 6.2c-4.2 3.7-4.2 8 0 11.6" />
          <path d="M16.6 8.4c2.2 2.1 2.2 5.1 0 7.2" />
          <path d="M19.4 6.2c4.2 3.7 4.2 8 0 11.6" />
        </>
      )}
      {name === 'orbit' && (
        <>
          <ellipse cx="12" cy="12" rx="8.4" ry="3.8" transform="rotate(-24 12 12)" />
          <circle cx="19.7" cy="8.6" r="1.7" />
          <circle cx="12" cy="12" r="1.3" />
        </>
      )}
      {name === 'battery' && (
        <>
          <rect x="3.4" y="7.2" width="17" height="10.4" rx="2.4" />
          <path d="M22 10.2v3.6" />
          <path d="M10 12.8 12.7 9.2v2.9l1.7 2.1-2.6 3.2v-2.9z" />
        </>
      )}
      {name === 'link' && (
        <>
          <circle cx="12" cy="12" r="7.8" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="12" cy="12" r="1.2" />
          <path d="M12 3.8v1.6" />
        </>
      )}
      {name === 'driver' && (
        <>
          <circle cx="12" cy="12" r="8.6" />
          <circle cx="13.7" cy="13.3" r="4.2" />
          <circle cx="13.7" cy="13.3" r="1.2" />
        </>
      )}
      {name === 'weight' && (
        <>
          <path d="M4.6 7h14.8" />
          <path d="M7.4 12h9.2" />
          <path d="M4.6 17h14.8" />
          <circle cx="12" cy="12" r="1.5" />
        </>
      )}
    </svg>
  );
}

/* Tilt 3D — escreve --rx/--ry/--gx/--gy direto no card (throttle por rAF) */
function handleTiltMove(e: ReactMouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  if (tiltFrames.has(card)) return;
  const { clientX, clientY } = e;
  tiltFrames.set(
    card,
    requestAnimationFrame(() => {
      tiltFrames.delete(card);
      const rect = card.getBoundingClientRect();
      if (rect.width === 0) return;
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      card.classList.add('is-tracking'); // sem transição durante o movimento
      card.style.setProperty('--rx', `${((0.5 - py) * 12).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    }),
  );
}

function handleTiltLeave(e: ReactMouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  const raf = tiltFrames.get(card);
  if (raf) cancelAnimationFrame(raf);
  tiltFrames.delete(card);
  card.classList.remove('is-tracking');
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--gx', '50%');
  card.style.setProperty('--gy', '50%');
}

function FeatureCard({ feature, index, tilt }: { feature: Feature; index: number; tilt: boolean }) {
  const { ref, inView } = useInView<HTMLElement>({ once: true });

  const cls = ['feat-card', 'rv', tilt ? 'feat-card--tilt' : '', inView ? 'is-in' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={ref}
      className={cls}
      style={{ '--i': `${index * 70}ms` } as CSSProperties}
      onMouseMove={tilt ? handleTiltMove : undefined}
      onMouseLeave={tilt ? handleTiltLeave : undefined}
    >
      <div className="feat-tilt">
        <span className="feat-icon">
          <IconFeature name={feature.icon} />
        </span>
        <h3 className="feat-title">{feature.title}</h3>
        <p className="feat-desc">{feature.desc}</p>
      </div>
    </article>
  );
}

export default function Features() {
  const reduced = useReducedMotion();
  const tilt = !reduced && isFinePointer();

  return (
    <section id="recursos" className="section">
      <div className="container">
        <header className="feat-head">
          <p className="eyebrow">Recursos · 04</p>
          <h2 className="display">
            Projetado nos <em>detalhes</em>.
          </h2>
        </header>

        <div className="feat-grid">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} tilt={tilt} />
          ))}
        </div>
      </div>
    </section>
  );
}
