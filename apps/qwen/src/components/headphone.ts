/**
 * Fone ÓRBITA — SVG autoral em vista frontal, construído por primitivas.
 * Estilo "blueprint premium": formas geométricas intencionais, sombreamento
 * por sobreposição translúcida (re-pinta sozinho quando as CSS vars de cor mudam).
 *
 * Partes nomeadas (data-part) para a vista explodida do scroll-telling:
 *   band · stem · cupL · cupR · cushionL · cushionR · driverL · driverR
 */

export interface HeadphoneOptions {
  /** rótulo acessível; omitir se decorativo (aria-hidden pelo chamador) */
  label?: string
}

export function headphoneSVG({ label }: HeadphoneOptions): string {
  const a11y = label
    ? `role="img" aria-label="${label}"`
    : `aria-hidden="true" focusable="false"`

  return `<svg class="hp" viewBox="0 0 560 560" ${a11y} xmlns="http://www.w3.org/2000/svg">
  <!-- sombra de contato -->
  <ellipse class="hp-shadow" cx="280" cy="532" rx="168" ry="15" />

  <!-- drivers (revelados na vista explodida) -->
  <g data-part="driverL" class="hp-driver">
    <circle cx="150" cy="392" r="26" />
    <circle cx="150" cy="392" r="17" class="hp-driver-ring" />
    <circle cx="150" cy="392" r="7" class="hp-driver-core" />
  </g>
  <g data-part="driverR" class="hp-driver">
    <circle cx="410" cy="392" r="26" />
    <circle cx="410" cy="392" r="17" class="hp-driver-ring" />
    <circle cx="410" cy="392" r="7" class="hp-driver-core" />
  </g>

  <!-- conchas -->
  <g data-part="cupL" class="hp-cup">
    <rect x="101" y="318" width="98" height="148" rx="49" class="hp-shell" />
    <ellipse cx="150" cy="392" rx="37" ry="60" class="hp-cup-shade" />
    <ellipse cx="128" cy="348" rx="13" ry="24" class="hp-gloss" transform="rotate(-16 128 348)" />
  </g>
  <g data-part="cupR" class="hp-cup">
    <rect x="361" y="318" width="98" height="148" rx="49" class="hp-shell" />
    <ellipse cx="410" cy="392" rx="37" ry="60" class="hp-cup-shade" />
    <ellipse cx="388" cy="348" rx="13" ry="24" class="hp-gloss" transform="rotate(-16 388 348)" />
    <!-- anel orbital decorativo (motivo do nome) -->
    <g class="hp-orbit-spin">
      <circle cx="410" cy="392" r="31" class="hp-orbit" />
      <circle cx="410" cy="361" r="4" class="hp-orbit-dot" />
    </g>
  </g>

  <!-- almofadas -->
  <g data-part="cushionL" class="hp-cushion">
    <ellipse cx="150" cy="392" rx="34" ry="56" class="hp-cushion-main" />
    <ellipse cx="150" cy="392" rx="20" ry="41" class="hp-cushion-hole" />
  </g>
  <g data-part="cushionR" class="hp-cushion">
    <ellipse cx="410" cy="392" rx="34" ry="56" class="hp-cushion-main" />
    <ellipse cx="410" cy="392" rx="20" ry="41" class="hp-cushion-hole" />
  </g>

  <!-- hastes -->
  <g data-part="stem" class="hp-stem">
    <rect x="142" y="276" width="16" height="66" rx="8" />
    <rect x="402" y="276" width="16" height="66" rx="8" />
    <circle cx="150" cy="330" r="11" />
    <circle cx="410" cy="330" r="11" />
    <circle cx="150" cy="330" r="4" class="hp-pivot-dot" />
    <circle cx="410" cy="330" r="4" class="hp-pivot-dot" />
  </g>

  <!-- arco -->
  <g data-part="band" class="hp-band">
    <path d="M 150 300 C 150 150 410 150 410 300" class="hp-band-outer" />
    <path d="M 150 300 C 150 178 410 178 410 300" class="hp-band-pad" />
    <path d="M 216 196 C 252 178 308 178 344 196" class="hp-band-gloss" />
  </g>

  <!-- ondas do modo Imersivo (EQ espacial) -->
  <g class="hp-eq" opacity="0">
    <path d="M 78 352 Q 54 392 78 432" />
    <path d="M 58 334 Q 24 392 58 450" />
    <path d="M 482 352 Q 506 392 482 432" />
    <path d="M 502 334 Q 536 392 502 450" />
  </g>
</svg>`
}

/**
 * Monta o fone em todos os pontos de ancoragem [data-headphone] da página.
 * Retorna mapa uid → elemento SVG para controle fino (scroll-telling).
 */
export function mountAllHeadphones(): Record<string, SVGSVGElement> {
  const mounts = document.querySelectorAll<HTMLElement>('[data-headphone]')
  const instances: Record<string, SVGSVGElement> = {}

  mounts.forEach((mount) => {
    const uid = mount.dataset.headphone ?? 'hp'
    const label = mount.dataset.label
    mount.innerHTML = headphoneSVG({ label })
    const svg = mount.querySelector('svg')
    if (svg) instances[uid] = svg
  })

  return instances
}

/** Retorna os grupos de partes nomeadas de uma instância do fone. */
export function getParts(svg: SVGSVGElement): Record<string, SVGGElement> {
  const parts: Record<string, SVGGElement> = {}
  svg.querySelectorAll<SVGGElement>('[data-part]').forEach((g) => {
    const name = g.dataset.part
    if (name) parts[name] = g
  })
  return parts
}
