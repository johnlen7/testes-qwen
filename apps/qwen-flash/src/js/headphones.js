/* ============================================================
   ÓRBITA — fábrica do SVG do fone (autoral, parametrizável)
   Vista frontal, over-ear. Cada parte tem classe própria para
   ser animada no scroll-telling (exploded view) e no configurador.
   IDs de gradiente/filtro são prefixados por instância (HPID),
   evitando IDs duplicados no documento com múltiplos fones.
   ============================================================ */

/**
 * Gera o markup SVG do fone.
 * @param {object} c  cores resolvidas: { cup, cupLight, cupDark, pad, ring }
 * @param {object} o  opções: { id: prefixo único, label }
 * @returns {string}
 */
export function headphonesSVG(c, o = {}) {
  const P = o.id || 'hp';
  const metal = `url(#${P}-metal)`;
  const metalSoft = `url(#${P}-metal-soft)`;
  return `
<svg class="hp" viewBox="0 0 480 360" role="img" aria-label="Fone de ouvido ÓRBITA ${o.label || ''}">
  <defs>
    <linearGradient id="${P}-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--hp-metal-light)"/>
      <stop offset="0.45" stop-color="var(--hp-metal)"/>
      <stop offset="1" stop-color="var(--hp-metal-dark)"/>
    </linearGradient>
    <linearGradient id="${P}-metal-soft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--hp-metal)"/>
      <stop offset="1" stop-color="var(--hp-metal-dark)"/>
    </linearGradient>
    <radialGradient id="${P}-cup-grad" cx="0.34" cy="0.26" r="0.95">
      <stop offset="0" stop-color="var(--hp-cup-light)"/>
      <stop offset="0.42" stop-color="var(--hp-cup)"/>
      <stop offset="1" stop-color="var(--hp-cup-dark)"/>
    </radialGradient>
    <radialGradient id="${P}-pad-grad" cx="0.38" cy="0.3" r="1">
      <stop offset="0" stop-color="var(--hp-pad-light)"/>
      <stop offset="0.5" stop-color="var(--hp-pad)"/>
      <stop offset="1" stop-color="var(--hp-pad-dark)"/>
    </radialGradient>
    <radialGradient id="${P}-core-grad" cx="0.35" cy="0.3" r="1">
      <stop offset="0" stop-color="#3a4152"/>
      <stop offset="1" stop-color="#14161d"/>
    </radialGradient>
    <linearGradient id="${P}-driver" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8b44a"/>
      <stop offset="0.5" stop-color="#b0782a"/>
      <stop offset="1" stop-color="#7a4f12"/>
    </linearGradient>
    <filter id="${P}-soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feOffset dy="10" in="b" result="o"/>
      <feColorMatrix in="o" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="${P}-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="7" result="g"/>
      <feMerge>
        <feMergeNode in="g"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- sombra no chão -->
  <ellipse class="hp-ground" cx="240" cy="340" rx="150" ry="10" fill="var(--hp-shadow)"/>

  <g class="hp-scene" filter="url(#${P}-soft)">

    <!-- ===== ARCO (headband) ===== -->
    <g class="hp-band">
      <path d="M 92 132 C 92 62 388 62 388 132" fill="none" stroke="${metal}" stroke-width="16" stroke-linecap="round"/>
      <path d="M 104 132 C 104 78 376 78 376 132" fill="none" stroke="var(--hp-pad)" stroke-width="7.5" stroke-linecap="round" opacity="0.92"/>
      <path d="M 104 132 C 104 78 376 78 376 132" fill="none" stroke="var(--hp-pad-light)" stroke-width="2" stroke-linecap="round" opacity="0.35" transform="translate(0 -2.5)"/>
      <!-- articulações -->
      <circle cx="92" cy="132" r="8" fill="${metalSoft}"/>
      <circle cx="388" cy="132" r="8" fill="${metalSoft}"/>
      <circle cx="92" cy="132" r="3" fill="var(--hp-metal-light)"/>
      <circle cx="388" cy="132" r="3" fill="var(--hp-metal-light)"/>
    </g>

    <!-- ===== ALMOFADAS (pads) ===== -->
    <g class="hp-pad hp-pad--l">
      <rect x="86" y="150" width="128" height="168" rx="48" fill="url(#${P}-pad-grad)"/>
      <rect x="100" y="164" width="100" height="140" rx="38" fill="none" stroke="var(--hp-pad-light)" stroke-width="1.4" opacity="0.28"/>
    </g>
    <g class="hp-pad hp-pad--r">
      <rect x="266" y="150" width="128" height="168" rx="48" fill="url(#${P}-pad-grad)"/>
      <rect x="280" y="164" width="100" height="140" rx="38" fill="none" stroke="var(--hp-pad-light)" stroke-width="1.4" opacity="0.28"/>
    </g>

    <!-- ===== HASTES (yokes) ===== -->
    <g class="hp-yoke hp-yoke--l">
      <rect x="110" y="128" width="10" height="52" rx="5" fill="${metalSoft}"/>
      <rect x="110" y="128" width="10" height="52" rx="5" fill="url(#${P}-metal)" opacity="0.35"/>
    </g>
    <g class="hp-yoke hp-yoke--r">
      <rect x="360" y="128" width="10" height="52" rx="5" fill="${metalSoft}"/>
      <rect x="360" y="128" width="10" height="52" rx="5" fill="url(#${P}-metal)" opacity="0.35"/>
    </g>

    <!-- ===== CONCHAS (cups) ===== -->
    <g class="hp-cup hp-cup--l">
      <!-- caixa da concha -->
      <rect x="98" y="168" width="104" height="132" rx="40" fill="url(#${P}-cup-grad)"/>
      <!-- refletor interno -->
      <path d="M 118 178 C 108 196 108 272 118 290" fill="none" stroke="var(--hp-cup-light)" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
      <!-- bisel -->
      <rect x="98" y="168" width="104" height="132" rx="40" fill="none" stroke="var(--hp-cup-dark)" stroke-width="1.6" opacity="0.6"/>
      <!-- parafusos -->
      <circle cx="114" cy="184" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <circle cx="186" cy="184" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <circle cx="114" cy="284" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <circle cx="186" cy="284" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <!-- anel LED -->
      <g class="hp-ring" filter="url(#${P}-glow)">
        <circle cx="150" cy="234" r="24" fill="none" stroke="var(--hp-ring)" stroke-width="2.6"/>
      </g>
      <circle cx="150" cy="234" r="24" fill="none" stroke="var(--hp-ring)" stroke-width="1" opacity="0.35"/>
      <!-- disco do anel -->
      <circle cx="150" cy="234" r="18" fill="#0b0d12"/>
      <circle cx="150" cy="234" r="18" fill="none" stroke="var(--hp-ring)" stroke-width="0.8" opacity="0.4"/>
      <g class="hp-logo">
        <circle cx="150" cy="234" r="4.5" fill="var(--hp-ring)"/>
        <ellipse cx="150" cy="234" rx="10.5" ry="4.2" fill="none" stroke="var(--hp-ring)" stroke-width="1.4" transform="rotate(-26 150 234)"/>
      </g>
    </g>
    <g class="hp-cup hp-cup--r">
      <rect x="278" y="168" width="104" height="132" rx="40" fill="url(#${P}-cup-grad)"/>
      <path d="M 298 178 C 288 196 288 272 298 290" fill="none" stroke="var(--hp-cup-light)" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
      <rect x="278" y="168" width="104" height="132" rx="40" fill="none" stroke="var(--hp-cup-dark)" stroke-width="1.6" opacity="0.6"/>
      <circle cx="294" cy="184" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <circle cx="366" cy="184" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <circle cx="294" cy="284" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <circle cx="366" cy="284" r="2.4" fill="var(--hp-cup-dark)" opacity="0.8"/>
      <g class="hp-ring" filter="url(#${P}-glow)">
        <circle cx="330" cy="234" r="24" fill="none" stroke="var(--hp-ring)" stroke-width="2.6"/>
      </g>
      <circle cx="330" cy="234" r="24" fill="none" stroke="var(--hp-ring)" stroke-width="1" opacity="0.35"/>
      <circle cx="330" cy="234" r="18" fill="#0b0d12"/>
      <circle cx="330" cy="234" r="18" fill="none" stroke="var(--hp-ring)" stroke-width="0.8" opacity="0.4"/>
      <g class="hp-logo">
        <circle cx="330" cy="234" r="4.5" fill="var(--hp-ring)"/>
        <ellipse cx="330" cy="234" rx="10.5" ry="4.2" fill="none" stroke="var(--hp-ring)" stroke-width="1.4" transform="rotate(-26 330 234)"/>
      </g>
    </g>

    <!-- ===== NÚCLEO (driver, revelado no scroll-telling) ===== -->
    <g class="hp-core">
      <circle cx="240" cy="220" r="66" fill="url(#${P}-core-grad)"/>
      <circle cx="240" cy="220" r="66" fill="none" stroke="var(--hp-ring)" stroke-width="1.6" opacity="0.35"/>
      <circle cx="240" cy="220" r="54" fill="none" stroke="url(#${P}-driver)" stroke-width="3"/>
      <circle cx="240" cy="220" r="34" fill="none" stroke="url(#${P}-driver)" stroke-width="2" opacity="0.8"/>
      <circle cx="240" cy="220" r="16" fill="#0b0d12"/>
      <circle cx="240" cy="220" r="16" fill="none" stroke="url(#${P}-driver)" stroke-width="1.4"/>
      <g class="hp-core-spokes">
        <line x1="240" y1="220" x2="240" y2="166" stroke="url(#${P}-driver)" stroke-width="1.6" opacity="0.7"/>
        <line x1="240" y1="220" x2="240" y2="274" stroke="url(#${P}-driver)" stroke-width="1.6" opacity="0.7"/>
        <line x1="240" y1="220" x2="186" y2="220" stroke="url(#${P}-driver)" stroke-width="1.6" opacity="0.7"/>
        <line x1="240" y1="220" x2="294" y2="220" stroke="url(#${P}-driver)" stroke-width="1.6" opacity="0.7"/>
      </g>
    </g>

  </g>
</svg>`;
}

/** Aplica cores resolvidas como custom props no elemento (para transição @property). */
export function setProductColors(el, c) {
  const s = el.style;
  s.setProperty('--hp-cup', c.cup);
  s.setProperty('--hp-cup-light', c.cupLight);
  s.setProperty('--hp-cup-dark', c.cupDark || shade(c.cup, -0.45));
  s.setProperty('--hp-pad', c.pad);
  s.setProperty('--hp-pad-light', c.padLight || shade(c.pad, 0.55));
  s.setProperty('--hp-pad-dark', c.padDark || shade(c.pad, -0.35));
  s.setProperty('--hp-ring', c.ring);
}

/** Escurece/clareia uma cor hex (#rrggbb) por fator -1..1. */
export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 + f));
  const g = Math.round(((n >> 8) & 255) * (1 + f));
  const b = Math.round((n & 255) * (1 + f));
  const to = (v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

let uid = 0;

/** Monta o fone dentro de um contêiner e devolve a raiz do SVG. */
export function mountHeadphones(el, colors, opts = {}) {
  const id = opts.id || `hp${++uid}`;
  el.innerHTML = headphonesSVG(colors, { ...opts, id });
  const svg = el.querySelector('svg');
  setProductColors(svg, colors);
  return svg;
}
