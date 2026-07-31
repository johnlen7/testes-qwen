/**
 * Sprite autoral do fone ÓRBITA em SVG.
 * Cada instância recebe um prefixo único para os gradientes (evita colisão de id)
 * e um "modo" que liga/desliga partes (ex.: órbitas só no hero, driver revelável no explode).
 *
 * As peças têm classes estáveis (.hp-band, .hp-asm-l, .hp-asm-r, .hp-driver-*)
 * para que o scroll-telling possa transformá-las via JS.
 * As cores vêm de CSS custom properties (--hp-*), então recolorir = trocar variáveis.
 */

export type HeadphoneMode = "hero" | "explode" | "config" | "finale";

let counter = 0;

export function headphoneSVG(mode: HeadphoneMode): string {
  const id = `hp${counter++}`;
  const orbits = mode !== "config";
  const revealable = mode === "explode";

  return `
<svg class="hp-svg hp-mode-${mode}" viewBox="0 0 480 520" role="img"
     aria-label="Fone de ouvido ÓRBITA" preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id="${id}-cup" cx="0.36" cy="0.28" r="0.95">
      <stop offset="0" stop-color="var(--hp-shell-hi)" />
      <stop offset="0.5" stop-color="var(--hp-shell)" />
      <stop offset="1" stop-color="var(--hp-shell-2)" />
    </radialGradient>
    <linearGradient id="${id}-band" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--hp-band-hi)" />
      <stop offset="1" stop-color="var(--hp-band)" />
    </linearGradient>
    <radialGradient id="${id}-driver" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="var(--hp-accent)" />
      <stop offset="0.35" stop-color="var(--hp-shell)" />
      <stop offset="1" stop-color="var(--hp-shell-2)" />
    </radialGradient>
    <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="var(--hp-metal)" stop-opacity="0.4" />
      <stop offset="0.5" stop-color="var(--hp-metal)" />
      <stop offset="1" stop-color="var(--hp-metal)" stop-opacity="0.4" />
    </linearGradient>
    <filter id="${id}-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  ${
    orbits
      ? `
  <g class="hp-orbits" aria-hidden="true">
    <g class="hp-orbit-spin hp-orbit-spin-a">
      <ellipse class="hp-ring" cx="240" cy="300" rx="228" ry="84" />
      <circle class="hp-node" cx="468" cy="300" r="5" />
    </g>
    <g class="hp-orbit-spin hp-orbit-spin-b">
      <ellipse class="hp-ring hp-ring-soft" cx="240" cy="300" rx="228" ry="84" />
      <circle class="hp-node hp-node-small" cx="12" cy="300" r="3.5" />
    </g>
  </g>`
      : ""
  }

  <!-- Arco -->
  <g class="hp-band">
    <path class="hp-band-shadow" d="M126 306 C126 116 354 116 354 306" />
    <path class="hp-band-main" d="M126 300 C126 118 354 118 354 300" />
    <path class="hp-band-hi" d="M138 292 C140 138 340 138 342 292" />
  </g>

  <!-- Conjunto esquerdo -->
  <g class="hp-asm-l">
    <rect class="hp-yoke" x="116" y="292" width="20" height="46" rx="10" />
    <g class="hp-cup hp-cup-l">
      <ellipse class="hp-shell" cx="126" cy="360" rx="66" ry="78" fill="url(#${id}-cup)" />
      <ellipse class="hp-rim" cx="126" cy="360" rx="66" ry="78" />
      <ellipse class="hp-face" cx="126" cy="360" rx="47" ry="59" />
      <circle class="hp-logo" cx="126" cy="360" r="6" />
    </g>
    <g class="hp-cushion hp-cushion-l">
      <ellipse cx="126" cy="360" rx="40" ry="52" />
    </g>
    <g class="hp-driver hp-driver-l ${revealable ? "is-revealable" : ""}">
      <circle cx="126" cy="360" r="36" fill="url(#${id}-driver)" />
      <circle class="hp-driver-ring" cx="126" cy="360" r="36" />
      <circle class="hp-driver-ring2" cx="126" cy="360" r="22" />
      <circle class="hp-driver-core" cx="126" cy="360" r="9" />
    </g>
  </g>

  <!-- Conjunto direito -->
  <g class="hp-asm-r">
    <rect class="hp-yoke" x="344" y="292" width="20" height="46" rx="10" />
    <g class="hp-cup hp-cup-r">
      <ellipse class="hp-shell" cx="354" cy="360" rx="66" ry="78" fill="url(#${id}-cup)" />
      <ellipse class="hp-rim" cx="354" cy="360" rx="66" ry="78" />
      <ellipse class="hp-face" cx="354" cy="360" rx="47" ry="59" />
      <circle class="hp-logo" cx="354" cy="360" r="6" />
    </g>
    <g class="hp-cushion hp-cushion-r">
      <ellipse cx="354" cy="360" rx="40" ry="52" />
    </g>
    <g class="hp-driver hp-driver-r ${revealable ? "is-revealable" : ""}">
      <circle cx="354" cy="360" r="36" fill="url(#${id}-driver)" />
      <circle class="hp-driver-ring" cx="354" cy="360" r="36" />
      <circle class="hp-driver-ring2" cx="354" cy="360" r="22" />
      <circle class="hp-driver-core" cx="354" cy="360" r="9" />
    </g>
  </g>
</svg>`;
}

/** Monta o fone dentro de qualquer elemento com [data-hp]. */
export function mountAllHeadphones(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-hp]").forEach((el) => {
    const mode = (el.dataset.hp as HeadphoneMode) || "hero";
    el.innerHTML = headphoneSVG(mode);
  });
}
