/* ============================================================
   ÓRBITA · produto (SVG autoral)
   Headphone circumaural em vista frontal levemente 3-4:
   as DUAS conchas visíveis ligadas pelo arco completo.
   Função que retorna markup SVG — reutilizado pelo hero,
   scroll-telling, configurador e CTA final.
   Cores via CSS vars (--product-shell, --product-cushion,
   --product-accent etc.) com transição de fill/stroke no CSS.
   Camadas (.layer-shell, .layer-cushion, .layer-driver) para o
   "explode" do scroll-telling: arco+conchas sobem, almofadas
   descem/separam (.cush-l/.cush-r) e os drivers se revelam
   dentro das conchas. Sem transform aplicado, o produto aparece
   montado. Sem filtros pesados, sem assets externos.
   ============================================================ */

function cup(cx, side) {
  // Concha completa: corpo, sombras, rim, ticks. side: 'l' | 'r'
  return `
    <ellipse class="p-shell" cx="${cx}" cy="424" rx="74" ry="92" />
    <ellipse class="p-shade-top" cx="${cx - 8}" cy="392" rx="64" ry="72" />
    <ellipse class="p-shade-bottom" cx="${cx + 6}" cy="456" rx="62" ry="68" />
    <ellipse class="p-rim" cx="${cx}" cy="424" rx="74" ry="92" />
    <ellipse class="p-ticks" cx="${cx}" cy="424" rx="63" ry="81" />`;
}

function cushion(cx) {
  return `
      <ellipse class="p-cushion" cx="${cx}" cy="424" rx="50" ry="66" />
      <ellipse class="p-cushion-hair" cx="${cx}" cy="424" rx="39" ry="53" />`;
}

function driver(cx) {
  return `
      <ellipse class="p-driver" cx="${cx}" cy="424" rx="30" ry="40" />
      <ellipse class="p-driver p-driver-2" cx="${cx}" cy="424" rx="16" ry="22" />
      <circle class="p-accent" cx="${cx}" cy="424" r="6" />`;
}

export function renderProduct() {
  return `
<svg class="product" viewBox="0 0 560 560" role="img" aria-label="Fone de ouvido circumaural ÓRBITA em vista frontal, com as duas conchas ligadas pelo arco">
  <!-- CONCHA (estrutura): arco completo, espuma, hastes, corpos -->
  <g class="layer layer-shell">
    <path class="p-band" d="M128 312 C118 148 442 148 432 312" />
    <path class="p-band-pad" d="M136 302 C128 162 432 162 424 302" />
    <path class="p-band-stitch" d="M136 302 C128 162 432 162 424 302" />
    <path class="p-yoke" d="M128 312 C116 344 112 372 116 402" />
    <path class="p-yoke" d="M432 312 C444 344 448 372 444 402" />
    ${cup(126, 'l')}
    ${cup(434, 'r')}
    <!-- Detalhes: filete hélio na concha esquerda, LED na direita -->
    <path class="p-accent-line" d="M70 474 C60 442 64 406 80 386" />
    <circle class="p-led-glow" cx="492" cy="396" r="9" />
    <circle class="p-led" cx="492" cy="396" r="4" />
    <text class="p-label" x="280" y="550" text-anchor="middle">ÓRBITA · Ó-01</text>
  </g>

  <!-- DRIVERS: revelados quando as almofadas se separam -->
  <g class="layer layer-driver">
    <g class="drv-l">${driver(126)}</g>
    <g class="drv-r">${driver(434)}</g>
  </g>

  <!-- ALMOFADAS: descem e se separam lateralmente no explode -->
  <g class="layer layer-cushion">
    <g class="cush-l">${cushion(126)}</g>
    <g class="cush-r">${cushion(434)}</g>
  </g>
</svg>`.trim();
}
