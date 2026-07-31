// ÓRBITA — Fone de ouvido em SVG autoral.
// Módulo autônomo: nenhum import externo; tipos definidos localmente.
// Peça visual central do site — earbud premium em vista 3/4, desenhado
// como ilustração de produto (key light no topo-esquerdo, rim light,
// ponta de silicone neutra, malha acústica, PCB revelada no explode).

export type HeadphoneColor = 'grafite' | 'lunar' | 'cobre' | 'aurora';
export type HeadphoneShell = 'compact' | 'standard' | 'max';

export interface HeadphoneOptions {
  color?: HeadphoneColor;
  shell?: HeadphoneShell;
}

// Paleta embutida no módulo (espelha store.COLORS do PLANO.md).
const PALETTE: Record<HeadphoneColor, { body: string; deep: string; hi: string }> = {
  grafite: { body: '#2b3038', deep: '#161a20', hi: '#8a93a3' },
  lunar:   { body: '#e6e2d8', deep: '#b9b4a6', hi: '#ffffff' },
  cobre:   { body: '#b4693b', deep: '#6e3b1c', hi: '#e8a56c' },
  aurora:  { body: '#3f7d6b', deep: '#1e4238', hi: '#8fd8be' },
};

const SHELL_SCALE: Record<HeadphoneShell, number> = {
  compact: 0.92,
  standard: 1,
  max: 1.08,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

let idCounter = 0;
function uniqueId(prefix: string): string {
  return `${prefix}-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

function meshScaleFor(shellScale: number): number {
  return 0.96 + (shellScale - 1) * 0.5;
}

/**
 * Cria o SVG do fone em vista 3/4, pronto para ser inserido no DOM.
 * Aplica cor e concha iniciais sem animação.
 */
export function createHeadphone(opts: HeadphoneOptions = {}): SVGSVGElement {
  const color: HeadphoneColor = opts.color ?? 'grafite';
  const shell: HeadphoneShell = opts.shell ?? 'standard';
  const p = PALETTE[color];
  const uid = uniqueId('hp');

  // Criação via container temporário preserva o namespace SVG corretamente.
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderMarkup(uid, p, SHELL_SCALE[shell]);

  const svg = wrapper.querySelector('svg') as SVGSVGElement | null;
  if (!svg) {
    throw new Error('[headphone] Falha ao criar SVG do fone.');
  }

  svg.dataset.color = color;
  svg.dataset.shell = shell;
  return svg;
}

/**
 * Atualiza cor e/ou concha. A troca de cor transiciona via CSS vars internas
 * (stops e fills declarados no <style> do SVG) e recebe uma varredura de
 * brilho (sheen) para mascarar a mudança. A troca de concha escala a concha
 * com transição CSS.
 */
export function updateHeadphone(svg: SVGSVGElement, opts: HeadphoneOptions): void {
  if (opts.color && opts.color !== (svg.dataset.color as HeadphoneColor | undefined)) {
    const p = PALETTE[opts.color];
    svg.style.setProperty('--hp-body', p.body);
    svg.style.setProperty('--hp-deep', p.deep);
    svg.style.setProperty('--hp-hi', p.hi);
    svg.dataset.color = opts.color;
    triggerSheen(svg);
  }

  if (opts.shell && opts.shell !== (svg.dataset.shell as HeadphoneShell | undefined)) {
    const scale = SHELL_SCALE[opts.shell];
    const bud = svg.querySelector<SVGGElement>('[data-part="bud"]');
    if (bud) {
      bud.style.transform = `scale(${scale})`;
    }
    // Ajusta proporcionalmente a malha para manter a junção com a concha coerente.
    const mesh = svg.querySelector<SVGGElement>('[data-part="mesh"]');
    if (mesh) {
      mesh.style.transform = `scale(${meshScaleFor(scale)})`;
    }
    svg.dataset.shell = opts.shell;
  }
}

/**
 * Posiciona as partes como função pura de t (0 = montado, 1 = explodido).
 * Explode radial: concha sobe, haste desce, ponta vai à esquerda, malha
 * à esquerda-cima, PCB sai por baixo-direita. Sem transições — é dirigido
 * por scroll/frame.
 */
export function setExplode(svg: SVGSVGElement, t: number): void {
  const k = Math.min(1, Math.max(0, t));
  const shellScale = SHELL_SCALE[(svg.dataset.shell as HeadphoneShell) ?? 'standard'];

  const bud = svg.querySelector<SVGGElement>('[data-part="bud"]');
  const stem = svg.querySelector<SVGGElement>('[data-part="stem"]');
  const tip = svg.querySelector<SVGGElement>('[data-part="tip"]');
  const mesh = svg.querySelector<SVGGElement>('[data-part="mesh"]');
  const chip = svg.querySelector<SVGGElement>('[data-part="chip"]');
  const shadow = svg.querySelector<SVGGElement>('[data-part="shadow"]');

  if (bud) {
    bud.style.transform = `translate(0, ${-70 * k}px) rotate(${-5 * k}deg) scale(${shellScale})`;
  }
  if (stem) {
    stem.style.transform = `translate(0, ${92 * k}px) rotate(${6 * k}deg)`;
  }
  if (tip) {
    tip.style.transform = `translate(${-115 * k}px, ${10 * k}px) rotate(${-12 * k}deg)`;
  }
  if (mesh) {
    mesh.style.transform = `translate(${-55 * k}px, ${-85 * k}px) rotate(${-8 * k}deg) scale(${meshScaleFor(shellScale)})`;
  }
  if (chip) {
    chip.style.opacity = String(Math.min(1, k * 1.8));
    chip.style.transform = `translate(${140 * k}px, ${90 * k}px) rotate(${10 * k}deg)`;
  }
  if (shadow) {
    shadow.style.opacity = String(1 - k * 0.75);
    shadow.style.transform = `scale(${1 - k * 0.4})`;
  }
}

function triggerSheen(svg: SVGSVGElement): void {
  const sheen = svg.querySelector<SVGGElement>('[data-part="sheen"]');
  if (!sheen || typeof sheen.animate !== 'function') return;

  // Varredura de brilho através da concha, mascarando a troca de cor.
  sheen.animate(
    [
      { opacity: 0, transform: 'translateX(-170px) skewX(-16deg)' },
      { opacity: 0.85, transform: 'translateX(0px) skewX(-16deg)', offset: 0.5 },
      { opacity: 0, transform: 'translateX(170px) skewX(-16deg)' },
    ],
    { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
  );
}

function renderMarkup(
  uid: string,
  p: { body: string; deep: string; hi: string },
  shellScale: number
): string {
  // Identificadores únicos por instância (vários fones na mesma página).
  const gBody = `${uid}-body`;
  const gFace = `${uid}-face`;
  const gHi = `${uid}-hi`;
  const gRim = `${uid}-rim`;
  const gStem = `${uid}-stem`;
  const gTip = `${uid}-tip`;
  const gMesh = `${uid}-mesh`;
  const gLed = `${uid}-led`;
  const fBlur = `${uid}-blur`;
  const fGlow = `${uid}-glow`;
  const pHoles = `${uid}-holes`;

  return `<svg xmlns="${SVG_NS}" viewBox="0 0 480 560" class="hp" data-hp="${uid}" aria-hidden="true"
    style="--hp-body:${p.body}; --hp-deep:${p.deep}; --hp-hi:${p.hi};">
  <defs>
    <!-- Corpo: key light no topo-esquerdo, profundidade no oposto. -->
    <radialGradient id="${gBody}" cx="36%" cy="26%" r="78%" fx="28%" fy="16%">
      <stop offset="0%" class="hp-stop-hi" stop-opacity="0.6" />
      <stop offset="42%" class="hp-stop-body" />
      <stop offset="100%" class="hp-stop-deep" />
    </radialGradient>

    <!-- Face externa: painel levemente afundado que dá profundidade à concha. -->
    <radialGradient id="${gFace}" cx="50%" cy="42%" r="62%">
      <stop offset="0%" class="hp-stop-deep" stop-opacity="0.42" />
      <stop offset="70%" class="hp-stop-deep" stop-opacity="0.14" />
      <stop offset="100%" class="hp-stop-deep" stop-opacity="0" />
    </radialGradient>

    <!-- Highlight do key light. -->
    <radialGradient id="${gHi}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>

    <!-- Rim light no canto inferior-direito. -->
    <radialGradient id="${gRim}" cx="82%" cy="86%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>

    <!-- Haste: variação lateral de tom. -->
    <linearGradient id="${gStem}" x1="0%" y1="0%" x2="100%" y2="18%">
      <stop offset="0%" class="hp-stop-deep" />
      <stop offset="52%" class="hp-stop-body" />
      <stop offset="100%" class="hp-stop-hi" />
    </linearGradient>

    <!-- Ponta de silicone: cinza fumê neutro (não usa a cor do corpo). -->
    <linearGradient id="${gTip}" x1="0%" y1="30%" x2="100%" y2="65%">
      <stop offset="0%" stop-color="#5c636d" />
      <stop offset="55%" stop-color="#33383f" />
      <stop offset="100%" stop-color="#22262c" />
    </linearGradient>

    <!-- Malha acústica: abertura escura com borda do tom do corpo. -->
    <radialGradient id="${gMesh}" cx="46%" cy="42%" r="58%">
      <stop offset="0%" stop-color="#06080c" />
      <stop offset="72%" stop-color="#10141a" />
      <stop offset="100%" class="hp-stop-deep" />
    </radialGradient>

    <!-- Glow do LED âmbar. -->
    <radialGradient id="${gLed}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f5a524" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#f5a524" stop-opacity="0" />
    </radialGradient>

    <filter id="${fBlur}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="13" />
    </filter>
    <filter id="${fGlow}" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Microfuros da malha. -->
    <pattern id="${pHoles}" x="0" y="0" width="5.4" height="5.4" patternUnits="userSpaceOnUse">
      <circle cx="2.7" cy="2.7" r="1.05" fill="#000000" opacity="0.6" />
      <circle cx="0" cy="0" r="0.5" fill="#000000" opacity="0.35" />
      <circle cx="5.4" cy="5.4" r="0.5" fill="#000000" opacity="0.35" />
    </pattern>
  </defs>

  <style>
    /* Regras escopadas por instância: style em SVG inline vaza para o
       documento, então cada seletor é prefixado com [data-hp="${uid}"]. */
    .hp[data-hp="${uid}"] { display: block; width: 100%; height: auto; overflow: visible; }

    /* Cores sempre via CSS (atributos de apresentação não resolvem var()). */
    [data-hp="${uid}"] .hp-stop-body { stop-color: var(--hp-body); transition: stop-color 600ms ease; }
    [data-hp="${uid}"] .hp-stop-deep { stop-color: var(--hp-deep); transition: stop-color 600ms ease; }
    [data-hp="${uid}"] .hp-stop-hi   { stop-color: var(--hp-hi);   transition: stop-color 600ms ease; }

    [data-hp="${uid}"] .hp-body { fill: url(#${gBody}); }
    [data-hp="${uid}"] .hp-face { fill: url(#${gFace}); }
    [data-hp="${uid}"] .hp-stem { fill: url(#${gStem}); }
    [data-hp="${uid}"] .hp-tip  { fill: url(#${gTip}); }
    [data-hp="${uid}"] .hp-mesh { fill: url(#${gMesh}); }
    [data-hp="${uid}"] .hp-mesh-overlay { fill: url(#${pHoles}); }
    [data-hp="${uid}"] .hp-highlight { fill: url(#${gHi}); }
    [data-hp="${uid}"] .hp-rim { fill: url(#${gRim}); mix-blend-mode: screen; }
    [data-hp="${uid}"] .hp-led { fill: #f5a524; filter: url(#${fGlow}); }
    [data-hp="${uid}"] .hp-led-halo { fill: url(#${gLed}); }
    [data-hp="${uid}"] .hp-mic { fill: #0b0d12; opacity: 0.6; }
    [data-hp="${uid}"] .hp-gold { fill: #d9a441; opacity: 0.95; }
    [data-hp="${uid}"] .hp-chip { fill: #122e27; stroke: #6fe3c1; stroke-width: 1.5; }
    [data-hp="${uid}"] .hp-chip-line { stroke: #6fe3c1; stroke-width: 1; fill: none; opacity: 0.75; }
    [data-hp="${uid}"] .hp-chip-pad { fill: #d9a441; }
    [data-hp="${uid}"] .hp-chip-text { fill: #6fe3c1; font: 600 9.5px ui-monospace, monospace; letter-spacing: 0.08em; }

    /* Logo gravado: sulco escuro + fio de luz deslocado (efeito emboss). */
    [data-hp="${uid}"] .hp-logo-groove { fill: none; stroke: var(--hp-deep); stroke-width: 2; opacity: 0.55; }
    [data-hp="${uid}"] .hp-logo-shine  { fill: none; stroke: var(--hp-hi);   stroke-width: 1;   opacity: 0.4; }
    [data-hp="${uid}"] .hp-logo-dot    { fill: var(--hp-deep); opacity: 0.55; }

    [data-hp="${uid}"] .hp-shadow { fill: rgba(0, 0, 0, 0.38); filter: url(#${fBlur}); }
    [data-hp="${uid}"] .hp-sheen { fill: url(#${gHi}); opacity: 0; mix-blend-mode: screen; filter: blur(12px); }

    [data-hp="${uid}"] [data-part] { transform-box: fill-box; transform-origin: center; }
    [data-hp="${uid}"] [data-part="bud"], [data-hp="${uid}"] [data-part="mesh"] {
      transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-hp="${uid}"] [data-part="sheen"] { pointer-events: none; }
  </style>

  <!-- Sombra de contato -->
  <g data-part="shadow">
    <ellipse class="hp-shadow" cx="255" cy="516" rx="118" ry="16" />
  </g>

  <!-- PCB estilizada (revelada no explode) -->
  <g data-part="chip" opacity="0">
    <g transform="translate(196, 242)">
      <rect class="hp-chip" x="0" y="0" width="96" height="58" rx="7" />
      <circle class="hp-chip-pad" cx="-4" cy="11" r="2.6" />
      <circle class="hp-chip-pad" cx="-4" cy="23" r="2.6" />
      <circle class="hp-chip-pad" cx="-4" cy="35" r="2.6" />
      <circle class="hp-chip-pad" cx="-4" cy="47" r="2.6" />
      <circle class="hp-chip-pad" cx="100" cy="11" r="2.6" />
      <circle class="hp-chip-pad" cx="100" cy="23" r="2.6" />
      <circle class="hp-chip-pad" cx="100" cy="35" r="2.6" />
      <circle class="hp-chip-pad" cx="100" cy="47" r="2.6" />
      <path class="hp-chip-line" d="M10 13h26M10 23h40M10 33h24M10 43h30M46 13v10" />
      <rect class="hp-chip-line" x="58" y="10" width="26" height="17" rx="2" />
      <rect class="hp-chip-line" x="58" y="34" width="18" height="12" rx="2" />
      <text class="hp-chip-text" x="63" y="22">H2</text>
    </g>
  </g>

  <!-- Ponta de silicone (oliva) -->
  <g data-part="tip">
    <path class="hp-tip" d="M 152 232
      C 112 220, 72 232, 59 258
      C 47 283, 62 305, 90 309
      C 118 313, 148 300, 160 283
      C 168 268, 164 242, 152 232 Z" />
    <!-- Aba da oliva -->
    <ellipse cx="84" cy="276" rx="24" ry="29" transform="rotate(-18 84 276)"
      fill="none" stroke="#14171c" stroke-width="3" opacity="0.45" />
    <ellipse cx="76" cy="262" rx="10" ry="14" transform="rotate(-18 76 262)"
      fill="#ffffff" opacity="0.07" />
  </g>

  <!-- Concha principal -->
  <g data-part="bud" style="transform: scale(${shellScale});">
    <path class="hp-body" d="M 132 228
      C 126 158, 178 106, 252 104
      C 330 102, 381 152, 383 218
      C 385 282, 340 330, 264 337
      C 198 343, 139 302, 132 228 Z" />
    <path class="hp-face" d="M 175 232
      C 172 185, 208 148, 262 146
      C 318 144, 356 180, 357 226
      C 358 272, 322 306, 268 310
      C 216 313, 178 282, 175 232 Z" />
    <path class="hp-rim" d="M 132 228
      C 126 158, 178 106, 252 104
      C 330 102, 381 152, 383 218
      C 385 282, 340 330, 264 337
      C 198 343, 139 302, 132 228 Z" />
    <ellipse class="hp-highlight" cx="208" cy="152" rx="60" ry="38" />
    <ellipse class="hp-highlight" cx="196" cy="140" rx="26" ry="14" opacity="0.7" />
    <!-- Logo ÓRBITA gravado (emboss) na face -->
    <g transform="translate(290, 228) rotate(-10)">
      <circle class="hp-logo-groove" cx="0" cy="0" r="17" />
      <circle class="hp-logo-shine" cx="1.3" cy="1.3" r="17" />
      <circle class="hp-logo-dot" cx="14.5" cy="5" r="3.2" />
    </g>
  </g>

  <!-- Malha acústica (vento do driver, na face esquerda da concha) -->
  <g data-part="mesh" style="transform: scale(${meshScaleFor(shellScale)});">
    <g transform="translate(154, 248) rotate(-18)">
      <ellipse class="hp-mesh" cx="0" cy="0" rx="21" ry="27" />
      <ellipse class="hp-mesh-overlay" cx="0" cy="0" rx="17" ry="23" />
      <ellipse cx="0" cy="0" rx="21" ry="27" fill="none"
        stroke="var(--hp-hi)" stroke-width="1.2" opacity="0.28" />
    </g>
  </g>

  <!-- Haste -->
  <g data-part="stem">
    <path class="hp-stem" d="M 234 314
      L 220 458
      C 217 481, 233 496, 253 495
      C 273 494, 285 478, 282 456
      L 269 312
      C 266 300, 238 301, 234 314 Z" />
    <!-- Junção haste/concha -->
    <path d="M 230 326 Q 252 335 274 325" fill="none"
      stroke="var(--hp-deep)" stroke-width="2" opacity="0.4" />
    <!-- Furos de microfone -->
    <circle class="hp-mic" cx="248" cy="356" r="3" />
    <circle class="hp-mic" cx="250" cy="385" r="2.6" />
    <circle class="hp-mic" cx="252" cy="412" r="2.3" />
    <!-- LED de status com glow -->
    <g transform="translate(250, 333)">
      <circle class="hp-led-halo" cx="0" cy="0" r="14" opacity="0.5" />
      <circle class="hp-led" cx="0" cy="0" r="4.2" />
    </g>
    <!-- Contatos de carga -->
    <circle class="hp-gold" cx="240" cy="468" r="3.4" />
    <circle class="hp-gold" cx="266" cy="466" r="3.4" />
  </g>

  <!-- Varredura de brilho (troca de cor) -->
  <g data-part="sheen" opacity="0">
    <ellipse class="hp-sheen" cx="240" cy="210" rx="100" ry="65" />
  </g>
</svg>`;
}
