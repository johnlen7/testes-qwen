import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { ProductAttribute, ProductColor } from '../types';

export type ProductVisualStage =
  | 'hero'
  | 'isolate'
  | 'separate'
  | 'recompose'
  | 'configurator'
  | 'final'
  | 'story';

export interface ProductVisualProps {
  color: ProductColor | string;
  attribute: ProductAttribute | string;
  stage?: ProductVisualStage | string;
  progress?: number;
  size?: number | string;
  className?: string;
}

const DEFAULT_COLOR = {
  id: 'graphite',
  label: 'Grafite',
  shortLabel: 'GRA',
  hex: '#89959B',
  shadow: '#2B353B',
  priceDelta: 0,
  description: 'Acabamento grafite mineral.',
} satisfies ProductColor;

const COLOR_BY_ID: Record<string, ProductColor> = {
  graphite: DEFAULT_COLOR,
  lunar: {
    ...DEFAULT_COLOR,
    id: 'lunar',
    label: 'Lunar',
    shortLabel: 'LUN',
    hex: '#DDE5E2',
    shadow: '#8B9B9B',
  },
  ember: {
    ...DEFAULT_COLOR,
    id: 'ember',
    label: 'Ember',
    shortLabel: 'EMB',
    hex: '#FF8968',
    shadow: '#6F3025',
  },
  moss: {
    ...DEFAULT_COLOR,
    id: 'moss',
    label: 'Moss',
    shortLabel: 'MOS',
    hex: '#91B6A5',
    shadow: '#365A4D',
  },
};

const ATTRIBUTE_LABELS: Record<string, string> = {
  focus: 'Focus',
  spatial: 'Spatial',
  open: 'Open air',
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function resolveColor(color: ProductColor | string): ProductColor {
  if (typeof color !== 'string') return color;
  return COLOR_BY_ID[color.toLowerCase()] ?? {
    ...DEFAULT_COLOR,
    id: color,
    label: color,
    hex: color.startsWith('#') ? color : DEFAULT_COLOR.hex,
  };
}

function resolveAttribute(attribute: ProductAttribute | string) {
  if (typeof attribute !== 'string') {
    return {
      id: attribute.id,
      label: attribute.label,
      visual: attribute.visual,
    };
  }

  const id = attribute.toLowerCase();
  return {
    id,
    label: ATTRIBUTE_LABELS[id] ?? attribute,
    visual: id === 'spatial' || id === 'open' ? id : 'focus',
  } as const;
}

function getStageProgress(stage?: ProductVisualProps['stage'], progress?: number) {
  if (typeof progress === 'number') return clamp(progress);
  switch (stage) {
    case 'separate':
      return 0.5;
    case 'recompose':
      return 0.84;
    case 'isolate':
    case 'hero':
    case 'configurator':
    case 'final':
    default:
      return 0.08;
  }
}

function Layer({ children, className }: { children: ReactNode; className: string }) {
  return <g className={`product-visual__layer ${className}`}>{children}</g>;
}

export function ProductVisual({
  color,
  attribute,
  stage = 'hero',
  progress,
  size = '100%',
  className,
}: ProductVisualProps) {
  const reactId = useId();
  const visualId = `orbita-product-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const selectedColor = resolveColor(color);
  const selectedAttribute = resolveAttribute(attribute);
  const storyProgress = getStageProgress(stage, progress);
  const explosion = Math.sin(storyProgress * Math.PI);
  const orbitalLift = 11 * explosion;
  const cupSpread = 44 * explosion;
  const cupRotation = 3 * explosion;
  const isSpatial = selectedAttribute.visual === 'spatial';
  const isOpen = selectedAttribute.visual === 'open';
  const spatialScale = isSpatial ? 1.16 : isOpen ? 0.92 : 1;
  const shell = selectedColor.hex || DEFAULT_COLOR.hex;
  const shadow = selectedColor.shadow || DEFAULT_COLOR.shadow;
  const dimension = size;
  const cssVariables = {
    '--orbita-shell': shell,
    '--orbita-shadow': shadow,
    '--orbita-accent': 'var(--accent, #8BE7D4)',
    '--orbita-progress': storyProgress,
    '--orbita-explosion': explosion,
  } as CSSProperties;

  return (
    <svg
      className={`product-visual${className ? ` ${className}` : ''}`}
      style={cssVariables}
      width={dimension}
      height={dimension}
      viewBox="0 0 720 620"
      role="img"
      aria-labelledby={`${visualId}-title ${visualId}-description`}
      data-product-color={selectedColor.id}
      data-product-attribute={selectedAttribute.id}
      data-product-stage={stage}
      data-product-progress={storyProgress}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={`${visualId}-title`}>Fone ÓRBITA, {selectedColor.label}</title>
      <desc id={`${visualId}-description`}>
        Fone de ouvido premium com arco suspenso, conchas laterais, trajetórias orbitais e perfil {selectedAttribute.label}.
      </desc>

      <defs>
        <linearGradient id={`${visualId}-shell`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--orbita-shell)" />
          <stop offset="0.48" stopColor="color-mix(in srgb, var(--orbita-shell) 74%, white)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--orbita-shell) 54%, #10171b)" />
        </linearGradient>
        <linearGradient id={`${visualId}-band`} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--orbita-shell) 76%, white)" />
          <stop offset="0.55" stopColor="var(--orbita-shell)" />
          <stop offset="1" stopColor="var(--orbita-shadow)" />
        </linearGradient>
        <radialGradient id={`${visualId}-aura`} cx="50%" cy="48%" r="55%">
          <stop offset="0" stopColor="var(--orbita-accent)" stopOpacity="0.18" />
          <stop offset="0.58" stopColor="var(--orbita-accent)" stopOpacity="0.045" />
          <stop offset="1" stopColor="var(--orbita-accent)" stopOpacity="0" />
        </radialGradient>
        <filter id={`${visualId}-blur`} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id={`${visualId}-soft-shadow`} x="-25%" y="-25%" width="150%" height="170%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="var(--orbita-shadow)" floodOpacity="0.34" />
        </filter>
      </defs>

      <Layer className="product-visual__aura" >
        <ellipse cx="360" cy="296" rx="286" ry="244" fill={`url(#${visualId}-aura)`} />
      </Layer>

      <Layer className="product-visual__orbit product-visual__orbit--primary">
        <ellipse
          cx="360"
          cy="312"
          rx={264 + 10 * explosion}
          ry="118"
          fill="none"
          stroke="var(--orbita-accent)"
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeDasharray="2 13 72 9"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="597" cy="270" r="4" fill="var(--orbita-accent)" />
      </Layer>

      <Layer className="product-visual__orbit product-visual__orbit--secondary">
        <ellipse
          cx="360"
          cy="310"
          rx="214"
          ry="190"
          fill="none"
          stroke="var(--orbita-accent)"
          strokeOpacity="0.22"
          strokeWidth="1"
          strokeDasharray="112 20 4 18"
          transform="rotate(-24 360 310)"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M141 167c42-38 90-57 139-64" fill="none" stroke="var(--orbita-accent)" strokeOpacity="0.3" strokeWidth="1" />
      </Layer>

      <Layer className="product-visual__shadow">
        <ellipse
          cx="360"
          cy={502 + orbitalLift}
          rx={168 - 13 * explosion}
          ry={22 - 5 * explosion}
          fill="var(--orbita-shadow)"
          opacity="0.44"
          filter={`url(#${visualId}-blur)`}
          transform={`rotate(-5 ${360} ${502 + orbitalLift})`}
        />
        <ellipse cx="360" cy={497 + orbitalLift} rx={128 - 10 * explosion} ry="8" fill="var(--orbita-shadow)" opacity="0.25" />
      </Layer>

      <Layer className="product-visual__headband" >
        <path
          d="M183 365C153 198 238 91 357 85c135-7 214 108 180 277"
          fill="none"
          stroke="var(--orbita-shadow)"
          strokeWidth="62"
          strokeLinecap="round"
          opacity="0.88"
          filter={`url(#${visualId}-soft-shadow)`}
          transform={`translate(0 ${orbitalLift * 0.35})`}
        />
        <path
          d="M183 365C153 198 238 91 357 85c135-7 214 108 180 277"
          fill="none"
          stroke={`url(#${visualId}-band)`}
          strokeWidth="48"
          strokeLinecap="round"
          transform={`translate(0 ${orbitalLift * 0.35})`}
        />
        <path
          d="M192 350C170 207 249 116 357 109c112-7 179 89 164 196"
          fill="none"
          stroke="var(--orbita-accent)"
          strokeOpacity="0.24"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`translate(0 ${orbitalLift * 0.35})`}
        />
        <path d="M193 329l-4 63M531 324l5 63" stroke="var(--orbita-shadow)" strokeWidth="18" strokeLinecap="round" opacity="0.9" />
      </Layer>

      <Layer className="product-visual__separation-lines">
        <path d="M196 390L127 423" stroke="var(--orbita-accent)" strokeWidth="1" strokeDasharray="4 8" opacity={0.24 + explosion * 0.52} />
        <path d="M524 390L593 423" stroke="var(--orbita-accent)" strokeWidth="1" strokeDasharray="4 8" opacity={0.24 + explosion * 0.52} />
        <circle cx="126" cy="423" r="3" fill="var(--orbita-accent)" opacity={0.36 + explosion * 0.54} />
        <circle cx="594" cy="423" r="3" fill="var(--orbita-accent)" opacity={0.36 + explosion * 0.54} />
      </Layer>

      <g
        className="product-visual__earcups"
        style={{ '--earcup-scale': spatialScale } as CSSProperties}
      >
        <g
          className="product-visual__earcup product-visual__earcup--left"
          transform={`translate(${-cupSpread} ${-orbitalLift * 0.25}) rotate(${-cupRotation} 190 396) scale(${spatialScale} 1)`}
          style={{ transformOrigin: '190px 396px' }}
        >
          <path d="M177 336c-42 5-61 31-62 68l-2 57c-1 31 22 52 55 49l25-2c26-2 42-22 43-50l2-73c1-32-22-53-61-49z" fill="var(--orbita-shadow)" opacity="0.84" />
          <path d="M177 343c-35 4-51 26-52 60l-2 51c-1 23 14 39 38 39l26-2c20-1 31-17 32-40l2-61c1-29-15-49-44-47z" fill={`url(#${visualId}-shell)`} filter={`url(#${visualId}-soft-shadow)`} />
          <path d="M179 365c-22 2-31 18-32 40l-1 31c-1 17 9 28 26 27l17-1c14-1 21-13 22-30l1-36c1-21-11-33-33-31z" fill="var(--orbita-shadow)" opacity={isOpen ? 0.5 : 0.78} />
          <ellipse cx="179" cy="408" rx="22" ry="28" fill="none" stroke="var(--orbita-accent)" strokeOpacity={isSpatial ? 0.78 : 0.38} strokeWidth="2" />
          <path d="M160 349c-12 8-17 19-18 34" fill="none" stroke="white" strokeOpacity="0.34" strokeWidth="3" strokeLinecap="round" />
          <circle cx="181" cy="409" r="5" fill="var(--orbita-accent)" opacity={isSpatial ? 0.9 : 0.55} />
          <path d="M201 369l12-6M202 450l10-5" stroke="var(--orbita-accent)" strokeWidth="1" opacity="0.65" />
        </g>

        <g
          className="product-visual__earcup product-visual__earcup--right"
          transform={`translate(${cupSpread} ${-orbitalLift * 0.25}) rotate(${cupRotation} 530 396) scale(${spatialScale} 1)`}
          style={{ transformOrigin: '530px 396px' }}
        >
          <path d="M543 336c42 5 61 31 62 68l2 57c1 31-22 52-55 49l-25-2c-26-2-42-22-43-50l-2-73c-1-32 22-53 61-49z" fill="var(--orbita-shadow)" opacity="0.84" />
          <path d="M543 343c35 4 51 26 52 60l2 51c1 23-14 39-38 39l-26-2c-20-1-31-17-32-40l-2-61c-1-29 15-49 44-47z" fill={`url(#${visualId}-shell)`} filter={`url(#${visualId}-soft-shadow)`} />
          <path d="M541 365c22 2 31 18 32 40l1 31c1 17-9 28-26 27l-17-1c-14-1-21-13-22-30l-1-36c-1-21 11-33 33-31z" fill="var(--orbita-shadow)" opacity={isOpen ? 0.5 : 0.78} />
          <ellipse cx="541" cy="408" rx="22" ry="28" fill="none" stroke="var(--orbita-accent)" strokeOpacity={isSpatial ? 0.78 : 0.38} strokeWidth="2" />
          <path d="M560 349c12 8 17 19 18 34" fill="none" stroke="white" strokeOpacity="0.34" strokeWidth="3" strokeLinecap="round" />
          <circle cx="539" cy="409" r="5" fill="var(--orbita-accent)" opacity={isSpatial ? 0.9 : 0.55} />
          <path d="M519 369l-12-6M518 450l-10-5" stroke="var(--orbita-accent)" strokeWidth="1" opacity="0.65" />
        </g>
      </g>

      <Layer className="product-visual__signal">
        <g opacity={isSpatial ? 0.95 : 0.58}>
          <path d="M317 408c13-18 27-27 43-27s30 9 43 27" fill="none" stroke="var(--orbita-accent)" strokeWidth="2" strokeLinecap="round" />
          {isSpatial && <path d="M297 432c20-27 41-40 63-40s43 13 63 40" fill="none" stroke="var(--orbita-accent)" strokeWidth="1.5" strokeDasharray="3 8" />}
        </g>
        <path d="M350 159h20" stroke="var(--orbita-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
        <circle cx="360" cy="159" r="4" fill="var(--orbita-accent)" opacity="0.78" />
      </Layer>

      <Layer className="product-visual__labels">
        <text x="360" y="552" textAnchor="middle" fill="var(--orbita-accent)" fillOpacity="0.68" fontSize="10" letterSpacing="3" fontFamily="SFMono-Regular, Consolas, monospace">ORBITAL SIGNAL / {selectedColor.shortLabel}</text>
      </Layer>
    </svg>
  );
}

export default ProductVisual;
