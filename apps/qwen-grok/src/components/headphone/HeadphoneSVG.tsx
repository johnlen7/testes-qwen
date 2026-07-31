import { useId, type CSSProperties } from 'react'
import type { ColorOption, ShellSize } from '../../context/ConfigContext'
import { clamp, lerp, mapRange, smoothstep } from '../../utils/easings'
import './headphone.css'

export interface HeadphoneSVGProps {
  color: ColorOption
  shell?: ShellSize
  /** 0 = assembled, 1 = fully exploded + ANC rings */
  explode?: number
  /** ambient orbit rings visible */
  showOrbits?: boolean
  className?: string
  style?: CSSProperties
  /** decorative size hint */
  size?: 'sm' | 'md' | 'lg' | 'hero'
}

/**
 * Autoral premium headphone — parametric fills, explode stages for scroll-telling.
 * Stage A (0–0.35): solid product
 * Stage B (0.35–0.7): parts separate (headband up, cups out, drivers reveal)
 * Stage C (0.7–1): ANC spatial rings + mic nodes
 */
export function HeadphoneSVG({
  color,
  shell = 'standard',
  explode = 0,
  showOrbits = false,
  className = '',
  style,
  size = 'md',
}: HeadphoneSVGProps) {
  const uid = useId().replace(/:/g, '')
  const ids = {
    body: `hpBody-${uid}`,
    metal: `hpMetal-${uid}`,
    shine: `hpShine-${uid}`,
    driver: `hpDriver-${uid}`,
    glow: `hpGlow-${uid}`,
    drop: `hpDrop-${uid}`,
  }

  const e = clamp(explode)
  const sep = smoothstep(0.28, 0.72, e)
  const rings = smoothstep(0.62, 0.95, e)
  const driverReveal = smoothstep(0.4, 0.75, e)

  const cupScale = shell === 'oversized' ? 1.12 : 1
  const cupOut = lerp(0, 28, sep)
  const bandUp = lerp(0, -22, sep)
  const driverScale = lerp(0.85, 1.05, driverReveal)

  const cssVars = {
    '--hp-body': color.body,
    '--hp-body-hi': color.bodyHi,
    '--hp-body-lo': color.bodyLo,
    '--hp-cushion': color.cushion,
    '--hp-accent-ring': color.ring,
    '--hp-metal': color.metal,
    ...style,
  } as CSSProperties

  const glowOpacity = mapRange(e, 0, 1, 0.15, 0.55)

  return (
    <div
      className={`hp hp--${size} ${showOrbits ? 'hp--orbits' : ''} ${className}`}
      style={cssVars}
      aria-hidden="true"
    >
      {showOrbits && (
        <>
          <span className="hp-orbit hp-orbit--a" />
          <span className="hp-orbit hp-orbit--b" />
          <span className="hp-orbit hp-orbit--c" />
        </>
      )}

      <svg
        className="hp__svg"
        viewBox="0 0 320 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <defs>
          <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--hp-body-hi)" />
            <stop offset="45%" stopColor="var(--hp-body)" />
            <stop offset="100%" stopColor="var(--hp-body-lo)" />
          </linearGradient>
          <linearGradient id={ids.metal} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hp-metal)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--hp-body-lo)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={ids.shine} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={ids.driver} cx="0.35" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="var(--hp-accent-ring)" stopOpacity="0.9" />
            <stop offset="40%" stopColor="var(--hp-body-hi)" />
            <stop offset="100%" stopColor="var(--hp-body-lo)" />
          </radialGradient>
          <filter id={ids.glow} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={ids.drop} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        <ellipse
          cx="160"
          cy="300"
          rx="90"
          ry="18"
          fill="var(--hp-accent-ring)"
          opacity={0.12 + glowOpacity * 0.15}
        />

        <g
          className="hp__anc"
          style={{
            opacity: rings,
            transform: `scale(${lerp(0.7, 1, rings)})`,
            transformOrigin: '160px 200px',
          }}
        >
          <ellipse
            cx="160"
            cy="200"
            rx="118"
            ry="78"
            stroke="var(--hp-accent-ring)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            opacity="0.55"
            className="hp__anc-spin"
          />
          <ellipse
            cx="160"
            cy="200"
            rx="138"
            ry="96"
            stroke="var(--hp-accent-ring)"
            strokeWidth="0.8"
            opacity="0.3"
            className="hp__anc-spin hp__anc-spin--rev"
          />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x = 160 + Math.cos(rad) * 118
            const y = 200 + Math.sin(rad) * 78
            return (
              <circle
                key={deg}
                cx={x}
                cy={y}
                r="3.5"
                fill="var(--hp-accent-ring)"
                opacity={0.5 + rings * 0.5}
              />
            )
          })}
        </g>

        <g
          className="hp__band"
          style={{ transform: `translateY(${bandUp}px)` }}
          filter={`url(#${ids.drop})`}
        >
          <path
            d="M78 148 C78 62, 242 62, 242 148"
            stroke={`url(#${ids.body})`}
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M92 148 C92 78, 228 78, 228 148"
            stroke="var(--hp-cushion)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M88 140 C88 72, 232 72, 232 140"
            stroke={`url(#${ids.shine})`}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="70" y="130" width="16" height="48" rx="8" fill={`url(#${ids.metal})`} />
          <rect x="234" y="130" width="16" height="48" rx="8" fill={`url(#${ids.metal})`} />
        </g>

        <g
          className="hp__cup hp__cup--left"
          style={{
            transform: `translate(${-cupOut}px, ${sep * 6}px) scale(${cupScale})`,
            transformOrigin: '88px 210px',
          }}
          filter={`url(#${ids.drop})`}
        >
          <Cup
            side="left"
            driverScale={driverScale}
            driverReveal={driverReveal}
            ids={ids}
          />
        </g>

        <g
          className="hp__cup hp__cup--right"
          style={{
            transform: `translate(${cupOut}px, ${sep * 6}px) scale(${cupScale})`,
            transformOrigin: '232px 210px',
          }}
          filter={`url(#${ids.drop})`}
        >
          <Cup
            side="right"
            driverScale={driverScale}
            driverReveal={driverReveal}
            ids={ids}
          />
        </g>

        <g opacity={sep * 0.85}>
          <line
            x1="86"
            y1={lerp(178, 160, sep)}
            x2="86"
            y2={lerp(178, 195, sep)}
            stroke="var(--hp-metal)"
            strokeWidth="2"
            strokeDasharray="3 4"
            opacity="0.5"
          />
          <line
            x1="234"
            y1={lerp(178, 160, sep)}
            x2="234"
            y2={lerp(178, 195, sep)}
            stroke="var(--hp-metal)"
            strokeWidth="2"
            strokeDasharray="3 4"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  )
}

function Cup({
  side,
  driverScale,
  driverReveal,
  ids,
}: {
  side: 'left' | 'right'
  driverScale: number
  driverReveal: number
  ids: Record<string, string>
}) {
  const cx = side === 'left' ? 88 : 232
  const cy = 210

  return (
    <>
      <ellipse cx={cx} cy={cy} rx="48" ry="58" fill={`url(#${ids.body})`} />
      <ellipse
        cx={cx}
        cy={cy}
        rx="40"
        ry="48"
        fill="none"
        stroke="var(--hp-accent-ring)"
        strokeWidth="2.5"
        opacity="0.85"
      />
      <ellipse cx={cx} cy={cy} rx="32" ry="38" fill="var(--hp-body-lo)" />
      <ellipse
        cx={cx}
        cy={cy}
        rx="36"
        ry="44"
        fill="none"
        stroke="var(--hp-cushion)"
        strokeWidth="7"
        opacity="0.9"
      />
      <g
        style={{
          transform: `scale(${driverScale})`,
          transformOrigin: `${cx}px ${cy}px`,
          opacity: 0.55 + driverReveal * 0.45,
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r="22"
          fill={`url(#${ids.driver})`}
          filter={`url(#${ids.glow})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r="14"
          fill="none"
          stroke="var(--hp-accent-ring)"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <circle cx={cx} cy={cy} r="6" fill="var(--hp-body-lo)" />
        <circle cx={cx - 4} cy={cy - 5} r="3" fill="#fff" opacity="0.25" />
      </g>
      <path
        d={
          side === 'left'
            ? `M${cx - 28} ${cy - 30} Q${cx - 10} ${cy - 40} ${cx + 8} ${cy - 28}`
            : `M${cx - 8} ${cy - 28} Q${cx + 10} ${cy - 40} ${cx + 28} ${cy - 30}`
        }
        stroke={`url(#${ids.shine})`}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x={side === 'left' ? cx + 20 : cx - 32}
        y={cy - 48}
        width="12"
        height="22"
        rx="4"
        fill={`url(#${ids.metal})`}
      />
    </>
  )
}
