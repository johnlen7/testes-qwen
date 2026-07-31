import { COLOR_MAP } from './store.js';

export const PRODUCT_COLORS = {
  shell: (hex) => hex,
  shade: (hex) => shadeColor(hex, -20),
  highlight: (hex) => shadeColor(hex, 24)
};

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = clampChannel((num >> 16) + amt);
  const G = clampChannel(((num >> 8) & 0x00ff) + amt);
  const B = clampChannel((num & 0x0000ff) + amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, value));
}

export function renderProduct({ color = 'grafite', size = 'm', exploded = 0, id = '' } = {}) {
  const baseHex = COLOR_MAP[color] || COLOR_MAP.grafite;
  const shell = PRODUCT_COLORS.shell(baseHex);
  const shade = PRODUCT_COLORS.shade(baseHex);
  const highlight = PRODUCT_COLORS.highlight(baseHex);
  const suffix = id ? `-${id}` : '';

  const sizeScale = size === 'p' ? 0.9 : size === 'g' ? 1.12 : 1;
  const cupSpread = exploded * 28;
  const yokeSpread = exploded * 14;
  const bandSpread = exploded * 10;
  const driverSpread = exploded * 18;

  return `
<svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" class="orbita-product" aria-label="Fone de ouvido ÓRBITA">
  <defs>
    <linearGradient id="shellGrad${suffix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${highlight}" />
      <stop offset="55%" stop-color="var(--product-shell)" />
      <stop offset="100%" stop-color="${shade}" />
    </linearGradient>
    <linearGradient id="bandGrad${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${shade}" />
      <stop offset="40%" stop-color="var(--product-shell)" />
      <stop offset="100%" stop-color="${highlight}" />
    </linearGradient>
    <linearGradient id="cushionGrad${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${shade}" />
      <stop offset="100%" stop-color="#090b0e" />
    </linearGradient>
    <radialGradient id="driverGrad${suffix}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#111" />
      <stop offset="80%" stop-color="#050505" />
      <stop offset="100%" stop-color="#1a1a1a" />
    </radialGradient>
  </defs>

  <!-- Headband -->
  <g data-part="band" transform="translate(0, ${-bandSpread})">
    <path d="M120,168 C120,68 280,68 280,168" fill="none" stroke="url(#bandGrad${suffix})" stroke-width="22" stroke-linecap="round" />
    <path d="M120,168 C120,78 280,78 280,168" fill="none" stroke="var(--line)" stroke-width="2" opacity="0.5" />
  </g>

  <!-- Left yoke -->
  <g data-part="yoke-l" transform="translate(${-yokeSpread}, ${yokeSpread})">
    <path d="M122,168 L122,232" fill="none" stroke="url(#bandGrad${suffix})" stroke-width="10" stroke-linecap="round" />
    <circle cx="122" cy="232" r="7" fill="var(--line)" />
  </g>

  <!-- Right yoke -->
  <g data-part="yoke-r" transform="translate(${yokeSpread}, ${yokeSpread})">
    <path d="M278,168 L278,232" fill="none" stroke="url(#bandGrad${suffix})" stroke-width="10" stroke-linecap="round" />
    <circle cx="278" cy="232" r="7" fill="var(--line)" />
  </g>

  <!-- Left cup -->
  <g data-part="cup-l" transform="translate(${-cupSpread}, ${cupSpread * 0.6}) scale(${sizeScale})">
    <g transform="translate(118, 236)">
      <!-- Cushion -->
      <ellipse data-part="cushion-l" cx="0" cy="0" rx="34" ry="46" fill="url(#cushionGrad${suffix})" />
      <!-- Outer shell -->
      <circle cx="0" cy="0" r="42" fill="url(#shellGrad${suffix})" stroke="var(--line)" stroke-width="1.5" />
      <!-- Concentric instrument ring -->
      <circle cx="0" cy="0" r="34" fill="none" stroke="var(--line)" stroke-width="1" />
      <circle cx="0" cy="0" r="26" fill="none" stroke="var(--line)" stroke-width="0.75" opacity="0.7" />
      <!-- Ticks -->
      ${ringTicks(-8)}
      <!-- Accent ring -->
      <circle cx="0" cy="0" r="20" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.9" />
      <!-- Driver -->
      <g data-part="driver-l" transform="translate(${-driverSpread}, 0)">
        <circle cx="0" cy="0" r="14" fill="url(#driverGrad${suffix})" stroke="var(--line)" stroke-width="1" />
        <circle cx="0" cy="0" r="6" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.8" />
      </g>
    </g>
  </g>

  <!-- Right cup -->
  <g data-part="cup-r" transform="translate(${cupSpread}, ${cupSpread * 0.6}) scale(${sizeScale})">
    <g transform="translate(282, 236)">
      <ellipse data-part="cushion-r" cx="0" cy="0" rx="34" ry="46" fill="url(#cushionGrad${suffix})" />
      <circle cx="0" cy="0" r="42" fill="url(#shellGrad${suffix})" stroke="var(--line)" stroke-width="1.5" />
      <circle cx="0" cy="0" r="34" fill="none" stroke="var(--line)" stroke-width="1" />
      <circle cx="0" cy="0" r="26" fill="none" stroke="var(--line)" stroke-width="0.75" opacity="0.7" />
      ${ringTicks(8)}
      <circle cx="0" cy="0" r="20" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.9" />
      <g data-part="driver-r" transform="translate(${driverSpread}, 0)">
        <circle cx="0" cy="0" r="14" fill="url(#driverGrad${suffix})" stroke="var(--line)" stroke-width="1" />
        <circle cx="0" cy="0" r="6" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.8" />
      </g>
    </g>
  </g>
</svg>`;
}

function ringTicks(sideOffset) {
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const r1 = 30;
    const r2 = i % 3 === 0 ? 26 : 28;
    const x1 = Math.cos(angle) * r1;
    const y1 = Math.sin(angle) * r1;
    const x2 = Math.cos(angle) * r2;
    const y2 = Math.sin(angle) * r2;
    ticks.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--line)" stroke-width="${i % 3 === 0 ? 1.25 : 0.75}" />`);
  }
  return ticks.join('\n');
}
