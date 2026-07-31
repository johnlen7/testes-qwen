import { COLORWAYS, SIZES, type ColorwayId, type SizeId } from "../lib/store";

export interface HeadphoneHandle {
  el: SVGSVGElement;
  setColorway(id: ColorwayId): void;
  setSize(id: SizeId): void;
  /** 0 = montado · 1 = vista explodida (dirigido por scroll ou transição) */
  setExplode(t: number): void;
  /** 0..1 — intensidade dos anéis do campo ANC */
  setField(t: number): void;
  /** inclinação 3D em graus (paralaxe do hero) */
  setTilt(rx: number, ry: number): void;
  /** sem transições nas camadas — para scrubbing direto */
  scrubMode(on: boolean): void;
}

let uid = 0;

const HP_CSS = /* css */ `
.hp {
  width: 100%;
  height: auto;
  overflow: visible;
  --hp-explode: 0;
  --hp-field: 0;
  --hp-scale: 1;
}
.hp stop {
  transition: stop-color var(--dur-3) var(--ease-out);
}
.hp__band,
.hp__arm,
.hp__shell,
.hp__cushion,
.hp__driver,
.hp__cup,
.hp__detail {
  transform-box: fill-box;
}
.hp__band,
.hp__arm,
.hp__shell,
.hp__cushion,
.hp__detail {
  transition: fill var(--dur-3) var(--ease-out), stroke var(--dur-3) var(--ease-out);
}
.hp:not(.hp--scrub) .hp__band,
.hp:not(.hp--scrub) .hp__arm,
.hp:not(.hp--scrub) .hp__shell,
.hp:not(.hp--scrub) .hp__cushion,
.hp:not(.hp--scrub) .hp__driver,
.hp:not(.hp--scrub) .hp__detail {
  transition: transform var(--dur-4) var(--ease-out), opacity var(--dur-3) var(--ease-out),
    fill var(--dur-3) var(--ease-out), stroke var(--dur-3) var(--ease-out);
}
.hp__cup {
  transform-origin: 50% 8%;
  transform: scale(var(--hp-scale));
  transition: transform var(--dur-4) var(--ease-spring);
}

/* — explode: separação por camada — */
.hp__band {
  transform: translateY(calc(var(--hp-explode) * -96px));
}
.hp__band-pad {
  transform: translateY(calc(var(--hp-explode) * -72px));
  opacity: calc(0.4 + 0.6 * (1 - var(--hp-explode)));
}
.hp__arm {
  transform: translateY(calc(var(--hp-explode) * -48px));
}
.hp__shell--l {
  transform: translate(calc(var(--hp-explode) * -72px), calc(var(--hp-explode) * -16px));
}
.hp__shell--r {
  transform: translate(calc(var(--hp-explode) * 72px), calc(var(--hp-explode) * -16px));
}
.hp__cushion--l {
  transform: translate(calc(var(--hp-explode) * 40px), calc(var(--hp-explode) * 100px));
}
.hp__cushion--r {
  transform: translate(calc(var(--hp-explode) * -40px), calc(var(--hp-explode) * 100px));
}
.hp__driver {
  transform-origin: 50% 50%;
  opacity: var(--hp-explode);
  transform: scale(calc(0.5 + 0.5 * var(--hp-explode)));
}

/* — linhas de cota (diagrama técnico) — */
.hp__cota {
  opacity: calc(var(--hp-explode) * 0.7);
  transition: opacity var(--dur-3) var(--ease-out);
}
.hp__cota line,
.hp__cota path {
  stroke: var(--hp-metal);
  stroke-width: 0.8;
  stroke-dasharray: 3 3;
  fill: none;
}
.hp__cota text {
  font-family: var(--font-mono, monospace);
  font-size: 8px;
  fill: var(--hp-metal);
  letter-spacing: 0.08em;
}

/* — campo ANC — */
.hp__field {
  opacity: calc(var(--hp-field) * 0.75);
  transition: opacity var(--dur-3) var(--ease-out);
}
.hp__field-ring {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: hp-pulse 2.6s var(--ease-in-out) infinite alternate;
}
.hp__field-ring:nth-child(2) { animation-delay: -0.8s; }
.hp__field-ring:nth-child(3) { animation-delay: -1.6s; }
@keyframes hp-pulse {
  from { transform: scale(0.94); }
  to { transform: scale(1.1); }
}

/* — brilho especular sutil — */
.hp__specular {
  mix-blend-mode: soft-light;
  opacity: 0.5;
}

@media (prefers-reduced-motion: reduce) {
  .hp__field-ring { animation: none; }
  .hp__cup { transition: none; }
}
`;

function cupMarkup(side: "l" | "r", g: { shell: string; face: string; driver: string; cushion: string }) {
  const cx = side === "l" ? 100 : 360;
  const cushionCx = side === "l" ? cx + 8 : cx - 8;
  const mirror = side === "l" ? 1 : -1;

  return /* svg */ `
    <g class="hp__cup hp__cup--${side}">

      <!-- campo ANC -->
      <g class="hp__field" aria-hidden="true">
        <circle class="hp__field-ring" cx="${cx}" cy="348" r="88" fill="none" stroke="var(--hp-glow)" stroke-width="1.2" />
        <circle class="hp__field-ring" cx="${cx}" cy="348" r="108" fill="none" stroke="var(--hp-glow)" stroke-width="0.8" />
        <circle class="hp__field-ring" cx="${cx}" cy="348" r="128" fill="none" stroke="var(--hp-glow)" stroke-width="0.5" />
      </g>

      <!-- cushion (almofada) -->
      <g class="hp__cushion hp__cushion--${side}">
        <ellipse cx="${cushionCx}" cy="348" rx="62" ry="76" fill="var(--hp-cushion)" />
        <ellipse cx="${cushionCx}" cy="348" rx="62" ry="76" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5" />
        <!-- costura interna -->
        <ellipse cx="${cushionCx}" cy="348" rx="48" ry="62" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1" stroke-dasharray="4 3" />
        <!-- cavidade -->
        <ellipse cx="${cushionCx}" cy="348" rx="40" ry="54" fill="rgba(0,0,0,.28)" />
        <ellipse cx="${cushionCx}" cy="348" rx="36" ry="50" fill="rgba(0,0,0,.12)" />
        <!-- textura da espuma -->
        <ellipse cx="${cushionCx}" cy="336" rx="28" ry="18" fill="rgba(255,255,255,.03)" />
      </g>

      <!-- driver (aparece no explode) -->
      <g class="hp__driver hp__driver--${side}">
        <rect x="${cx - 32}" y="336" width="64" height="24" rx="12" fill="var(--hp-shell-deep)" />
        <circle cx="${cx}" cy="348" r="32" fill="none" stroke="var(--hp-metal)" stroke-width="2.5" />
        <circle cx="${cx}" cy="348" r="24" fill="url(#${g.driver})" />
        <!-- cone do driver -->
        <circle cx="${cx}" cy="348" r="16" fill="none" stroke="var(--hp-metal)" stroke-width="1" opacity=".6" />
        <circle cx="${cx}" cy="348" r="9" fill="none" stroke="var(--hp-metal)" stroke-width="1.5" opacity=".8" />
        <circle cx="${cx}" cy="348" r="3.5" fill="var(--hp-metal)" />
        <!-- linhas radiais do diafragma -->
        ${Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const x1 = cx + Math.cos(a) * 10;
          const y1 = 348 + Math.sin(a) * 10;
          const x2 = cx + Math.cos(a) * 22;
          const y2 = 348 + Math.sin(a) * 22;
          return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--hp-metal)" stroke-width="0.6" opacity=".4" />`;
        }).join("\n        ")}
      </g>

      <!-- shell (concha externa) -->
      <g class="hp__shell hp__shell--${side}">
        <ellipse cx="${cx}" cy="348" rx="60" ry="74" fill="url(#${g.shell})" />
        <ellipse cx="${cx}" cy="348" rx="60" ry="74" fill="none" stroke="var(--hp-shell-deep)" stroke-width="2" opacity=".5" />
        <!-- bisel interno -->
        <ellipse cx="${cx}" cy="348" rx="52" ry="66" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1" />
        <!-- brilho especular -->
        <ellipse class="hp__specular" cx="${cx - 12 * mirror}" cy="316" rx="34" ry="22" fill="rgba(255,255,255,.08)" transform="rotate(${-8 * mirror} ${cx} 316)" />
        <!-- face plate central -->
        <circle cx="${cx}" cy="348" r="22" fill="url(#${g.face})" />
        <circle cx="${cx}" cy="348" r="22" fill="none" stroke="var(--hp-shell-deep)" stroke-width="1.5" opacity=".35" />
        <!-- logo ÓRBITA na concha -->
        <circle cx="${cx}" cy="348" r="5" fill="none" stroke="var(--hp-metal)" stroke-width="1.2" opacity=".7" />
        <circle cx="${cx}" cy="348" r="1.8" fill="var(--hp-metal)" opacity=".8" />
        <!-- órbita decorativa na face -->
        <ellipse cx="${cx}" cy="348" rx="14" ry="5.5" fill="none" stroke="var(--hp-metal)" stroke-width="0.7" opacity=".35" transform="rotate(${-25 * mirror} ${cx} 348)" />
        <!-- parafusos -->
        <circle cx="${cx - 18}" cy="292" r="2.2" fill="var(--hp-metal)" opacity=".8" />
        <circle cx="${cx + 18}" cy="292" r="2.2" fill="var(--hp-metal)" opacity=".8" />
        <circle cx="${cx - 18}" cy="404" r="2.2" fill="var(--hp-metal)" opacity=".8" />
        <circle cx="${cx + 18}" cy="404" r="2.2" fill="var(--hp-metal)" opacity=".8" />
        <!-- linha de seam -->
        <path d="M ${cx - 58} 330 Q ${cx} 310 ${cx + 58} 330" fill="none" stroke="rgba(0,0,0,.1)" stroke-width="0.8" />
      </g>

      <!-- linhas de cota (diagrama técnico, visível no explode) -->
      <g class="hp__cota" aria-hidden="true">
        <line x1="${cx}" y1="270" x2="${cx}" y2="426" />
        <line x1="${cx - 6}" y1="274" x2="${cx + 6}" y2="274" />
        <line x1="${cx - 6}" y1="422" x2="${cx + 6}" y2="422" />
        <text x="${cx + 10}" y="352" text-anchor="start">42mm</text>
      </g>
    </g>`;
}

function buildSvg(id: number): SVGSVGElement {
  const g = {
    band: `hp-band-${id}`,
    shell: `hp-shell-${id}`,
    face: `hp-face-${id}`,
    driver: `hp-driver-${id}`,
    cushion: `hp-cushion-${id}`,
  };
  const wrap = document.createElement("div");
  wrap.innerHTML = /* svg */ `
<svg class="hp" viewBox="0 0 460 500" role="img" aria-label="Fone de ouvido ÓRBITA">
  <defs>
    <linearGradient id="${g.band}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color: var(--hp-shell)" />
      <stop offset="0.5" style="stop-color: var(--hp-shell)" />
      <stop offset="1" style="stop-color: var(--hp-shell-deep)" />
    </linearGradient>
    <linearGradient id="${g.shell}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" style="stop-color: var(--hp-shell)" />
      <stop offset="0.55" style="stop-color: var(--hp-shell)" />
      <stop offset="1" style="stop-color: var(--hp-shell-deep)" />
    </linearGradient>
    <radialGradient id="${g.face}" cx="0.38" cy="0.32" r="0.9">
      <stop offset="0" style="stop-color: var(--hp-shell)" />
      <stop offset="1" style="stop-color: var(--hp-shell-deep)" />
    </radialGradient>
    <radialGradient id="${g.driver}" cx="0.42" cy="0.38" r="0.85">
      <stop offset="0" style="stop-color: var(--hp-metal)" />
      <stop offset="0.6" style="stop-color: var(--hp-shell-deep)" />
      <stop offset="1" style="stop-color: var(--hp-shell-deep)" />
    </radialGradient>
    <radialGradient id="${g.cushion}" cx="0.45" cy="0.4" r="0.8">
      <stop offset="0" style="stop-color: var(--hp-cushion)" />
      <stop offset="1" style="stop-color: rgba(0,0,0,.3)" />
    </radialGradient>
    <!-- sombra de chão -->
    <radialGradient id="hp-shadow-${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" style="stop-color: var(--hp-glow)" />
      <stop offset="1" style="stop-color: transparent" />
    </radialGradient>
  </defs>

  <!-- sombra no chão -->
  <ellipse cx="230" cy="472" rx="160" ry="16" fill="url(#hp-shadow-${id})" opacity="0.6" />

  <!-- band (arco superior) -->
  <g class="hp__band">
    <path d="M 96 228 A 134 134 0 0 1 364 228" fill="none" stroke="url(#${g.band})" stroke-width="32" stroke-linecap="round" />
    <!-- destaque superior do arco -->
    <path d="M 108 222 A 122 122 0 0 1 352 222" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="8" stroke-linecap="round" />
    <!-- textura do arco -->
    <path d="M 140 148 A 134 134 0 0 1 320 148" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="1" stroke-dasharray="2 4" />
  </g>

  <!-- padding interno do arco -->
  <g class="hp__band-pad">
    <path d="M 118 226 A 112 112 0 0 1 342 226" fill="none" stroke="var(--hp-cushion)" stroke-width="14" stroke-linecap="round" />
    <path d="M 126 224 A 104 104 0 0 1 334 224" fill="none" stroke="rgba(0,0,0,.1)" stroke-width="4" stroke-linecap="round" />
  </g>

  <!-- braço esquerdo -->
  <g class="hp__arm hp__arm--l">
    <path d="M 96 224 L 96 280" stroke="var(--hp-shell-deep)" stroke-width="14" stroke-linecap="round" />
    <!-- trilho de ajuste -->
    <path d="M 90 238 H 102 M 90 250 H 102 M 90 262 H 102" stroke="var(--hp-metal)" stroke-width="1.8" stroke-linecap="round" opacity=".7" />
    <!-- pivot -->
    <circle cx="96" cy="284" r="7" fill="var(--hp-shell-deep)" stroke="var(--hp-metal)" stroke-width="1.5" />
    <circle cx="96" cy="284" r="2.5" fill="var(--hp-metal)" />
  </g>

  <!-- braço direito -->
  <g class="hp__arm hp__arm--r">
    <path d="M 364 224 L 364 280" stroke="var(--hp-shell-deep)" stroke-width="14" stroke-linecap="round" />
    <path d="M 358 238 H 370 M 358 250 H 370 M 358 262 H 370" stroke="var(--hp-metal)" stroke-width="1.8" stroke-linecap="round" opacity=".7" />
    <circle cx="364" cy="284" r="7" fill="var(--hp-shell-deep)" stroke="var(--hp-metal)" stroke-width="1.5" />
    <circle cx="364" cy="284" r="2.5" fill="var(--hp-metal)" />
  </g>

  ${cupMarkup("l", g)}
  ${cupMarkup("r", g)}
</svg>`;
  return wrap.firstElementChild as SVGSVGElement;
}

export function renderHeadphone(
  mount: HTMLElement,
  initial?: { colorway?: ColorwayId; size?: SizeId },
): HeadphoneHandle {
  if (!document.getElementById("hp-component-styles")) {
    const style = document.createElement("style");
    style.id = "hp-component-styles";
    style.textContent = HP_CSS;
    document.head.appendChild(style);
  }

  const el = buildSvg(++uid);
  const colorway = initial?.colorway ?? "grafite";
  const size = initial?.size ?? "padrao";
  for (const [prop, value] of Object.entries(COLORWAYS[colorway].vars)) {
    el.style.setProperty(prop, value);
  }
  el.style.setProperty("--hp-scale", String(SIZES[size].scale));
  mount.appendChild(el);

  return {
    el,
    setColorway(id) {
      for (const [prop, value] of Object.entries(COLORWAYS[id].vars)) {
        el.style.setProperty(prop, value);
      }
    },
    setSize(id) {
      el.style.setProperty("--hp-scale", String(SIZES[id].scale));
    },
    setExplode(t) {
      el.style.setProperty("--hp-explode", String(t));
    },
    setField(t) {
      el.style.setProperty("--hp-field", String(t));
    },
    setTilt(rx, ry) {
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    },
    scrubMode(on) {
      el.classList.toggle("hp--scrub", on);
    },
  };
}
