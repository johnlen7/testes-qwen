const SVG_NS = 'http://www.w3.org/2000/svg';

export type HeadphonePart =
  | 'band'
  | 'hinge-left'
  | 'hinge-right'
  | 'cup-left'
  | 'cup-right'
  | 'cushion-left'
  | 'cushion-right'
  | 'orbit-ring-1'
  | 'orbit-ring-2'
  | 'orbit-ring-3'
  | 'signal-dot';

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

/**
 * Fone ÓRBITA autoral em SVG, construído por partes nomeadas (`data-part`) para
 * que o scroll-telling e o configurador possam animar/recolorir cada peça
 * individualmente. As superfícies do produto usam um gradiente sutil cujos stops
 * são amarrados a `--product-shell`/`--product-shell-light` via classe CSS (ver
 * styles/product.css) — trocar de cor no configurador continua sendo só uma
 * reatribuição de custom property, sem re-render.
 */
export function createHeadphoneSVG(label = 'Fone de ouvido ÓRBITA'): SVGSVGElement {
  const svg = el('svg', {
    viewBox: '0 0 320 320',
    role: 'img',
    'aria-label': label,
    class: 'orbita-svg',
  });

  const defs = el('defs', {});

  const glow = el('filter', { id: 'orbita-glow', x: '-60%', y: '-60%', width: '220%', height: '220%' });
  glow.append(el('feGaussianBlur', { stdDeviation: 4, result: 'blur' }));
  defs.append(glow);

  const softShadow = el('filter', { id: 'orbita-shadow', x: '-40%', y: '-40%', width: '180%', height: '180%' });
  softShadow.append(el('feGaussianBlur', { stdDeviation: 6 }));
  defs.append(softShadow);

  const shellGradient = el('linearGradient', {
    id: 'orbita-shell-gradient',
    x1: '0.1',
    y1: '0',
    x2: '0.9',
    y2: '1',
  });
  shellGradient.append(
    el('stop', { class: 'grad-stop-light', offset: 0 }),
    el('stop', { class: 'grad-stop-base', offset: 1 })
  );
  defs.append(shellGradient);

  svg.append(defs);

  // sombra de contato — puramente decorativa, não recolore, não anima
  svg.append(
    el('ellipse', {
      cx: 160,
      cy: 272,
      rx: 96,
      ry: 12,
      fill: '#000',
      opacity: 0.22,
      filter: 'url(#orbita-shadow)',
    })
  );

  // halo orbital — três anéis elípticos ao redor de todo o produto (tema "ÓRBITA")
  const ringsGroup = el('g', { class: 'orbita-rings', 'data-part': 'orbit-rings' });
  const ringSpecs = [
    { rx: 128, ry: 48, rotate: -12, dash: 'none', opacity: 0.55, width: 1.2 },
    { rx: 146, ry: 57, rotate: 9, dash: '1 4', opacity: 0.4, width: 1.4 },
    { rx: 164, ry: 66, rotate: -5, dash: '1 6', opacity: 0.26, width: 1.4 },
  ];
  ringSpecs.forEach((spec, i) => {
    const ring = el('ellipse', {
      cx: 160,
      cy: 150,
      rx: spec.rx,
      ry: spec.ry,
      class: 'part-signal',
      'data-part': `orbit-ring-${i + 1}`,
      fill: 'none',
      'stroke-width': spec.width,
      'stroke-dasharray': spec.dash,
      opacity: spec.opacity,
      transform: `rotate(${spec.rotate} 160 150)`,
    });
    ringsGroup.append(ring);
  });
  svg.append(ringsGroup);

  // indicador de sinal — LED de status no topo do arco
  const dot = el('circle', {
    cx: 160,
    cy: 27,
    r: 4.5,
    class: 'part-signal-fill',
    'data-part': 'signal-dot',
  });
  svg.append(dot);

  // headband — arco principal + traço de luz interno (dimensionalidade)
  const bandPath = 'M76,152 C76,56 112,28 160,28 C208,28 244,56 244,152';
  const band = el('path', {
    d: bandPath,
    fill: 'none',
    stroke: 'url(#orbita-shell-gradient)',
    'stroke-width': 20,
    'stroke-linecap': 'round',
    'data-part': 'band',
  });
  const bandHighlight = el('path', {
    d: bandPath,
    fill: 'none',
    class: 'part-band-highlight',
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
    opacity: 0.4,
    transform: 'translate(0, -6) scale(0.97)',
    'aria-hidden': 'true',
  });
  svg.append(band, bandHighlight);

  // hinges
  const hingeLeft = el('rect', {
    x: 68,
    y: 142,
    width: 16,
    height: 30,
    rx: 8,
    fill: 'url(#orbita-shell-gradient)',
    'data-part': 'hinge-left',
  });
  const hingeRight = el('rect', {
    x: 236,
    y: 142,
    width: 16,
    height: 30,
    rx: 8,
    fill: 'url(#orbita-shell-gradient)',
    'data-part': 'hinge-right',
  });
  svg.append(hingeLeft, hingeRight);

  // rebites de acento — pequeno detalhe de estúdio de design onde a haste encontra a concha
  svg.append(
    el('circle', { cx: 76, cy: 157, r: 2.6, class: 'part-signal-fill', opacity: 0.85 }),
    el('circle', { cx: 244, cy: 157, r: 2.6, class: 'part-signal-fill', opacity: 0.85 })
  );

  function buildCup(side: 'left' | 'right'): SVGGElement {
    const sign = side === 'left' ? 1 : -1;
    const cupX = side === 'left' ? 34 : 220;
    const cushionX = side === 'left' ? 48 : 234;
    const highlightX = side === 'left' ? 46 : 244;

    const cup = el('g', { 'data-part': `cup-${side}` }) as SVGGElement;
    cup.append(
      el('rect', {
        x: cupX,
        y: 132,
        width: 66,
        height: 120,
        rx: 33,
        fill: 'url(#orbita-shell-gradient)',
        stroke: 'var(--product-shell-light)',
        'stroke-opacity': 0.3,
        'stroke-width': 1,
      }),
      el('rect', {
        x: cushionX,
        y: 150,
        width: 38,
        height: 84,
        rx: 19,
        class: 'part-cushion',
        'data-part': `cushion-${side}`,
      }),
      el('ellipse', {
        cx: highlightX,
        cy: 160,
        rx: 8,
        ry: 22,
        class: 'part-cup-sheen',
        opacity: 0.22,
        transform: `rotate(${-14 * sign} ${highlightX} 160)`,
        'aria-hidden': 'true',
      })
    );
    return cup;
  }

  svg.append(buildCup('left'), buildCup('right'));

  return svg;
}

export function getPart(svg: SVGSVGElement, part: HeadphonePart): SVGElement | null {
  return svg.querySelector(`[data-part="${part}"]`);
}
