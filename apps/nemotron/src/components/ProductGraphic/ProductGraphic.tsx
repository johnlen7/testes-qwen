import { useId, type CSSProperties, type Ref } from 'react';
import type { ProductColor } from '../../data/site';
import './ProductGraphic.css';

interface Props {
  color: ProductColor;
  modeId?: string;
  /** renderiza as barras de EQ (configurador / CTA final) */
  eq?: boolean;
  /** desliga o anel orbital contínuo */
  orbit?: boolean;
  className?: string;
  /** para scrubbing externo (scroll-telling) */
  ref?: Ref<SVGSVGElement>;
}

const EQ_AMP: Record<string, number> = { imersivo: 0.45, focado: 0.75, espacial: 1 };

/**
 * ÓRBITA — fone em SVG autoral, parametrizado por CSS variables:
 * --cup / --cup-shade (cor), --explode (0..1), --spin2 (deg),
 * --wave (0..1), --eq (amplitude das barras).
 * O scrubbing escreve direto no DOM — zero re-render por frame.
 */
export default function ProductGraphic({
  color,
  modeId = 'imersivo',
  eq = false,
  orbit = true,
  className = '',
  ref,
}: Props) {
  const uid = useId();

  const vars = {
    '--cup': color.shell,
    '--cup-shade': color.shade,
    '--explode': '0',
    '--spin2': '0deg',
    '--wave': modeId === 'espacial' ? '0.55' : '0',
    '--eq': String(EQ_AMP[modeId] ?? 0.6),
  } as CSSProperties;

  const shellTransition = {
    transition:
      'fill 600ms cubic-bezier(0.25, 1, 0.5, 1), opacity 600ms cubic-bezier(0.25, 1, 0.5, 1)',
  } as CSSProperties;

  return (
    <svg
      ref={ref}
      viewBox="0 0 480 520"
      role="img"
      aria-label={`Fone ÓRBITA na cor ${color.name}`}
      className={`pg ${className}`}
      style={vars}
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </linearGradient>
      </defs>

      {/* Halo */}
      <circle className="pg-glow" cx="240" cy="305" r="170" fill={`url(#${uid}-glow)`} />

      {/* Órbitas contínuas */}
      {orbit && (
        <g aria-hidden="true">
          <ellipse
            className="pg-orbit-ring pg-orbit-ring--a"
            cx="240"
            cy="305"
            rx="198"
            ry="92"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeDasharray="3 12"
            opacity="0.5"
          />
          <ellipse
            className="pg-orbit-ring pg-orbit-ring--b"
            cx="240"
            cy="305"
            rx="170"
            ry="78"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="1.5 9"
            opacity="0.28"
          />
          <g className="pg-sat" style={{ '--orbit-r': '198px' } as CSSProperties}>
            <circle cx="240" cy="305" r="4.5" fill="var(--accent)" />
          </g>
          <g className="pg-sat pg-sat--b" style={{ '--orbit-r': '170px' } as CSSProperties}>
            <circle cx="240" cy="305" r="3" fill="var(--accent)" opacity="0.8" />
          </g>
        </g>
      )}

      {/* Produto montado */}
      <g className="pg-breath">
        {/* Cápsula + haste + arco */}
        <g className="pg-band">
          <rect x="224" y="136" width="32" height="16" rx="8" fill="var(--cup-shade)" />
          <path d="M240 152 v36" stroke="var(--cup)" strokeWidth="9" strokeLinecap="round" />
          <path
            d="M132 300 C 132 168, 348 168, 348 300"
            fill="none"
            stroke="var(--cup)"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path
            d="M146 296 C 148 180, 332 180, 334 296"
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M164 290 C 166 196, 314 196, 316 290"
            fill="none"
            stroke="var(--cup-shade)"
            strokeWidth="13"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>

        {/* Braços */}
        <path
          className="pg-yoke-l"
          d="M130 288 L112 322"
          stroke="var(--cup-shade)"
          strokeWidth="17"
          strokeLinecap="round"
          style={shellTransition}
        />
        <path
          className="pg-yoke-r"
          d="M350 288 L368 322"
          stroke="var(--cup-shade)"
          strokeWidth="17"
          strokeLinecap="round"
          style={shellTransition}
        />

        {/* Drivers — núcleo espacial, revelados na explosão */}
        <g className="pg-driver-l">
          <circle cx="114" cy="348" r="37" fill="var(--cup-shade)" style={shellTransition} />
          <circle cx="114" cy="348" r="25" fill="#0d0a08" />
          <circle
            cx="114"
            cy="348"
            r="27"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeDasharray="2 5"
            opacity="0.7"
          />
          <circle className="pg-core" cx="114" cy="348" r="9" fill="var(--accent)" />
        </g>
        <g className="pg-driver-r">
          <circle cx="366" cy="348" r="37" fill="var(--cup-shade)" style={shellTransition} />
          <circle cx="366" cy="348" r="25" fill="#0d0a08" />
          <circle
            cx="366"
            cy="348"
            r="27"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.4"
            strokeDasharray="2 5"
            opacity="0.7"
          />
          <circle className="pg-core" cx="366" cy="348" r="9" fill="var(--accent)" />
        </g>

        {/* Ondas espaciais (etapa 3 / modo espacial) */}
        <g className="pg-waves" aria-hidden="true">
          <circle className="pg-wave" cx="114" cy="348" r="38" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          <circle className="pg-wave pg-wave--b" cx="366" cy="348" r="38" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        </g>

        {/* Concha esquerda */}
        <g className="pg-cup-l">
          <rect x="62" y="284" width="104" height="128" rx="38" fill="var(--cup)" style={shellTransition} />
          <rect x="62" y="284" width="104" height="128" rx="38" fill={`url(#${uid}-shade)`} />
          <ellipse cx="114" cy="348" rx="45" ry="52" fill="var(--cup-shade)" opacity="0.85" style={shellTransition} />
          <ellipse cx="114" cy="348" rx="30" ry="36" fill="#0d0a08" />
          <ellipse cx="114" cy="348" rx="30" ry="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <ellipse cx="86" cy="316" rx="13" ry="24" fill="rgba(255,255,255,0.22)" transform="rotate(-18 86 316)" />
        </g>

        {/* Concha direita */}
        <g className="pg-cup-r">
          <rect x="314" y="284" width="104" height="128" rx="38" fill="var(--cup)" style={shellTransition} />
          <rect x="314" y="284" width="104" height="128" rx="38" fill={`url(#${uid}-shade)`} />
          <ellipse cx="366" cy="348" rx="45" ry="52" fill="var(--cup-shade)" opacity="0.85" style={shellTransition} />
          <ellipse cx="366" cy="348" rx="30" ry="36" fill="#0d0a08" />
          <ellipse cx="366" cy="348" rx="30" ry="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <ellipse cx="338" cy="316" rx="13" ry="24" fill="rgba(255,255,255,0.22)" transform="rotate(-18 338 316)" />
        </g>

        {/* Barras de EQ */}
        {eq && (
          <g className="pg-eq" aria-hidden="true">
            <rect className="pg-eq-bar" x="196" y="452" width="9" height="40" rx="4.5" fill="var(--accent)" />
            <rect className="pg-eq-bar pg-eq-bar--2" x="216" y="452" width="9" height="40" rx="4.5" fill="var(--accent)" />
            <rect className="pg-eq-bar pg-eq-bar--3" x="236" y="452" width="9" height="40" rx="4.5" fill="var(--accent)" />
            <rect className="pg-eq-bar pg-eq-bar--4" x="256" y="452" width="9" height="40" rx="4.5" fill="var(--accent)" />
            <rect className="pg-eq-bar pg-eq-bar--5" x="276" y="452" width="9" height="40" rx="4.5" fill="var(--accent)" />
          </g>
        )}
      </g>
    </svg>
  );
}
