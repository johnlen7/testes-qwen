import type { SVGAttributes } from 'react';

export type IconName =
  | 'wave'
  | 'orbit'
  | 'battery'
  | 'weight'
  | 'link'
  | 'repair'
  | 'arrow'
  | 'moon'
  | 'sun'
  | 'play'
  | 'pause'
  | 'plus'
  | 'close'
  | 'sound'
  | 'chevron'
  | 'return';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName | string;
  size?: number | string;
  label?: string;
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  vectorEffect: 'non-scaling-stroke' as const,
};

function IconArtwork({ name }: { name: string }) {
  switch (name) {
    case 'wave':
      return <path {...strokeProps} d="M3 12c2.7-5.7 5.2-5.7 7.9 0s5.2 5.7 7.9 0 5.2-5.7 7.9 0" />;
    case 'orbit':
      return <><ellipse {...strokeProps} cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-24 12 12)" /><circle cx="17.7" cy="8.1" r="1.8" fill="currentColor" /></>;
    case 'battery':
      return <><rect {...strokeProps} x="3" y="7" width="17" height="10" rx="2" /><path {...strokeProps} d="M20 10h2v4h-2M7 10v4m4-4v4m4-4v4" /></>;
    case 'weight':
      return <><path {...strokeProps} d="M8 8a4 4 0 1 1 8 0M6.5 20h11l-1.1-9H7.6z" /><path {...strokeProps} d="M12 12v4m-2 0h4" /></>;
    case 'link':
      return <path {...strokeProps} d="m9.2 14.8-1.5 1.5a3.6 3.6 0 0 1-5.1-5.1l3.1-3.1a3.6 3.6 0 0 1 5.1 0M14.8 9.2l1.5-1.5a3.6 3.6 0 0 1 5.1 5.1l-3.1 3.1a3.6 3.6 0 0 1-5.1 0M8.2 15.8l7.6-7.6" />;
    case 'repair':
      return <><path {...strokeProps} d="M14 5.5a4.2 4.2 0 0 0 4.5 5L10 19a2.1 2.1 0 1 1-3-3l8.5-8.5A4.2 4.2 0 0 0 14 5.5z" /><path {...strokeProps} d="m16.5 3.5 4 4M5 19l2 2" /></>;
    case 'arrow':
      return <path {...strokeProps} d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" />;
    case 'moon':
      return <path {...strokeProps} d="M19.3 15.2A7.8 7.8 0 0 1 8.8 4.7 8.3 8.3 0 1 0 19.3 15.2z" />;
    case 'sun':
      return <><circle {...strokeProps} cx="12" cy="12" r="3.7" /><path {...strokeProps} d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>;
    case 'play':
      return <path d="m9 6 8 6-8 6z" fill="currentColor" />;
    case 'pause':
      return <><rect x="7" y="6" width="3" height="12" rx="1" fill="currentColor" /><rect x="14" y="6" width="3" height="12" rx="1" fill="currentColor" /></>;
    case 'plus':
      return <path {...strokeProps} d="M12 5v14M5 12h14" />;
    case 'close':
      return <path {...strokeProps} d="m6 6 12 12M18 6 6 18" />;
    case 'sound':
      return <><path {...strokeProps} d="M4 10v4h3l4 3V7l-4 3z" /><path {...strokeProps} d="M15 9.2a4 4 0 0 1 0 5.6M17.5 6.7a7.2 7.2 0 0 1 0 10.6" /></>;
    case 'chevron':
      return <path {...strokeProps} d="m7 9 5 5 5-5" />;
    case 'return':
      return <path {...strokeProps} d="M9 7 4 12l5 5M5 12h9a5 5 0 0 1 5 5v1" />;
    default:
      return <circle {...strokeProps} cx="12" cy="12" r="8" strokeDasharray="2 4" />;
  }
}

export function Icon({ name, size = 24, label, className, ...svgProps }: IconProps) {
  const isDecorative = !label && svgProps['aria-hidden'] === undefined;

  return (
    <svg
      {...svgProps}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={isDecorative ? true : svgProps['aria-hidden']}
      aria-label={label}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <IconArtwork name={name} />
    </svg>
  );
}

export default Icon;
