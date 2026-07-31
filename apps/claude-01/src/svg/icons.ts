const SVG_NS = 'http://www.w3.org/2000/svg';

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

function base(): SVGSVGElement {
  return el('svg', {
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 1.6,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  });
}

export const ICON_NAMES = ['orbit', 'wave', 'feather', 'battery', 'drop', 'touch', 'sun', 'moon'] as const;
export type IconName = (typeof ICON_NAMES)[number];

const builders: Record<IconName, () => SVGSVGElement> = {
  orbit: () => {
    const svg = base();
    svg.append(
      el('circle', { cx: 16, cy: 16, r: 4 }),
      el('ellipse', { cx: 16, cy: 16, rx: 13, ry: 6, transform: 'rotate(-20 16 16)' }),
      el('ellipse', { cx: 16, cy: 16, rx: 13, ry: 6, transform: 'rotate(20 16 16)' })
    );
    return svg;
  },
  wave: () => {
    const svg = base();
    svg.append(
      el('path', { d: 'M4 16c3-6 6-6 8 0s5 6 8 0 5-6 8 0' }),
      el('path', { d: 'M4 22c3-6 6-6 8 0s5 6 8 0 5-6 8 0', opacity: 0.5 })
    );
    return svg;
  },
  feather: () => {
    const svg = base();
    svg.append(
      el('path', { d: 'M23 5C14 6 8 13 7 22c9-1 16-7 17-16z' }),
      el('path', { d: 'M9 21 20 10' })
    );
    return svg;
  },
  battery: () => {
    const svg = base();
    svg.append(
      el('rect', { x: 4, y: 11, width: 21, height: 10, rx: 3 }),
      el('rect', { x: 26, y: 14, width: 3, height: 4, rx: 1 }),
      el('path', { d: 'M15 13 11 17h4l-4 4', 'stroke-width': 1.4 })
    );
    return svg;
  },
  drop: () => {
    const svg = base();
    svg.append(el('path', { d: 'M16 4c5 7 9 12 9 17a9 9 0 1 1-18 0c0-5 4-10 9-17z' }));
    return svg;
  },
  touch: () => {
    const svg = base();
    svg.append(
      el('circle', { cx: 16, cy: 16, r: 2.4, fill: 'currentColor', stroke: 'none' }),
      el('path', { d: 'M16 8v2M16 22v2M8 16h2M22 16h2', opacity: 0.8 }),
      el('circle', { cx: 16, cy: 16, r: 9, opacity: 0.5 })
    );
    return svg;
  },
  sun: () => {
    const svg = base();
    svg.append(el('circle', { cx: 16, cy: 16, r: 6 }));
    [0, 45, 90, 135, 180, 225, 270, 315].forEach((deg) => {
      svg.append(el('line', { x1: 16, y1: 3, x2: 16, y2: 7, transform: `rotate(${deg} 16 16)` }));
    });
    return svg;
  },
  moon: () => {
    const svg = base();
    svg.append(el('path', { d: 'M21 5a12 12 0 1 0 5 22.9A10 10 0 0 1 21 5Z' }));
    return svg;
  },
};

export function createIcon(name: IconName): SVGSVGElement {
  return builders[name]();
}
