import { forwardRef } from 'react'
import type { CSSProperties } from 'react'
import type { ColorOption } from '../lib/product'
import './headphones.css'

interface HeadphonesProps {
  color: ColorOption
  /** 1 = over-ear, ~0.82 = on-ear */
  cupScale?: number
  className?: string
  style?: CSSProperties
  /** true = tratado como imagem decorativa (aria-hidden) */
  decorative?: boolean
}

/**
 * Fone de ouvido ÓRBITA desenhado à mão em SVG (vista frontal).
 * Camadas nomeadas via `data-part` para o scroll-telling explodir/recombinar:
 * band, cushion-l/r, shell-l/r, driver-l/r, face-l/r.
 *
 * A cor vem de `color` e transiciona via CSS (fill). Luz/sombra são overlays
 * brancos/pretos translúcidos, então funcionam para qualquer cor e tema.
 */
export const Headphones = forwardRef<SVGSVGElement, HeadphonesProps>(function Headphones(
  { color, cupScale = 1, className, style, decorative = false },
  ref
) {
  const cupTransform = (cx: number, cy: number) =>
    `translate(${cx} ${cy}) scale(${cupScale}) translate(${-cx} ${-cy})`

  return (
    <svg
      ref={ref}
      className={`hp ${className ?? ''}`}
      style={style}
      viewBox="0 0 420 470"
      fill="none"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Fone ÓRBITA na cor ${color.name}`}
      aria-hidden={decorative || undefined}
    >
      <g data-part="all">
        {/* ---- Tiara (headband) ---- */}
        <g data-part="band">
          <path
            className="hp-fill"
            d="M 104 252 C 104 74 316 74 316 252"
            stroke={color.band}
            strokeWidth={30}
            strokeLinecap="round"
          />
          {/* brilho superior da tiara */}
          <path
            d="M 104 246 C 104 78 316 78 316 246"
            stroke="#ffffff"
            strokeOpacity={0.14}
            strokeWidth={7}
            strokeLinecap="round"
          />
          {/* face interna escura da tiara */}
          <path
            d="M 104 260 C 104 92 316 92 316 260"
            stroke="#000000"
            strokeOpacity={0.22}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </g>

        {/* ---- Yokes / sliders (metal) ---- */}
        <g data-part="yokes">
          <rect className="hp-fill" x={95} y={236} width={18} height={48} rx={9} fill={color.metal} />
          <rect className="hp-fill" x={307} y={236} width={18} height={48} rx={9} fill={color.metal} />
          <circle cx={104} cy={278} r={7} fill={color.metal} />
          <circle cx={316} cy={278} r={7} fill={color.metal} />
          <circle cx={104} cy={278} r={3} fill="#000000" fillOpacity={0.35} />
          <circle cx={316} cy={278} r={3} fill="#000000" fillOpacity={0.35} />
        </g>

        {/* ================= COPO ESQUERDO ================= */}
        <g data-part="cup-l" transform={cupTransform(104, 322)}>
          {/* almofada (atrás, levemente maior e deslocada p/ fora) */}
          <g data-part="cushion-l">
            <ellipse className="hp-fill" cx={99} cy={322} rx={64} ry={82} fill={color.cushion} />
            <ellipse cx={99} cy={322} rx={64} ry={82} fill="#000" fillOpacity={0.18} />
          </g>
          {/* casco */}
          <g data-part="shell-l">
            <ellipse className="hp-fill" cx={104} cy={322} rx={58} ry={76} fill={color.shell} />
            <ellipse cx={104} cy={322} rx={58} ry={76} stroke="#fff" strokeOpacity={0.07} />
            <ellipse cx={86} cy={296} rx={24} ry={40} fill="#fff" fillOpacity={0.08} transform="rotate(-22 86 296)" />
            <ellipse cx={120} cy={360} rx={30} ry={26} fill="#000" fillOpacity={0.16} />
          </g>
          {/* driver (revelado ao explodir) */}
          <g data-part="driver-l" opacity={0}>
            <circle cx={104} cy={322} r={32} fill="#0a0c11" />
            <circle cx={104} cy={322} r={32} stroke={color.metal} strokeOpacity={0.6} />
            <circle cx={104} cy={322} r={22} stroke="#fff" strokeOpacity={0.14} />
            <circle cx={104} cy={322} r={12} stroke="#fff" strokeOpacity={0.14} />
            <circle className="hp-accent" cx={104} cy={322} r={4} />
          </g>
          {/* placa frontal + anel de assinatura */}
          <g data-part="face-l">
            <ellipse className="hp-fill" cx={104} cy={322} rx={36} ry={50} fill={color.cup} />
            <ellipse className="hp-ring" cx={104} cy={322} rx={36} ry={50} strokeWidth={2.5} />
            <circle cx={104} cy={322} r={9} fill={color.metal} />
            <circle className="hp-accent" cx={104} cy={322} r={3.5} />
          </g>
        </g>

        {/* ================= COPO DIREITO ================= */}
        <g data-part="cup-r" transform={cupTransform(316, 322)}>
          <g data-part="cushion-r">
            <ellipse className="hp-fill" cx={321} cy={322} rx={64} ry={82} fill={color.cushion} />
            <ellipse cx={321} cy={322} rx={64} ry={82} fill="#000" fillOpacity={0.18} />
          </g>
          <g data-part="shell-r">
            <ellipse className="hp-fill" cx={316} cy={322} rx={58} ry={76} fill={color.shell} />
            <ellipse cx={316} cy={322} rx={58} ry={76} stroke="#fff" strokeOpacity={0.07} />
            <ellipse cx={334} cy={296} rx={24} ry={40} fill="#fff" fillOpacity={0.08} transform="rotate(22 334 296)" />
            <ellipse cx={300} cy={360} rx={30} ry={26} fill="#000" fillOpacity={0.16} />
          </g>
          <g data-part="driver-r" opacity={0}>
            <circle cx={316} cy={322} r={32} fill="#0a0c11" />
            <circle cx={316} cy={322} r={32} stroke={color.metal} strokeOpacity={0.6} />
            <circle cx={316} cy={322} r={22} stroke="#fff" strokeOpacity={0.14} />
            <circle cx={316} cy={322} r={12} stroke="#fff" strokeOpacity={0.14} />
            <circle className="hp-accent" cx={316} cy={322} r={4} />
          </g>
          <g data-part="face-r">
            <ellipse className="hp-fill" cx={316} cy={322} rx={36} ry={50} fill={color.cup} />
            <ellipse className="hp-ring" cx={316} cy={322} rx={36} ry={50} strokeWidth={2.5} />
            <circle cx={316} cy={322} r={9} fill={color.metal} />
            <circle className="hp-accent" cx={316} cy={322} r={3.5} />
          </g>
        </g>
      </g>
    </svg>
  )
})
