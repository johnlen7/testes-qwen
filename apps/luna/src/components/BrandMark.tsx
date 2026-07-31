import type { CSSProperties } from 'react';

export interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  const style = {
    '--brand-mark-accent': 'var(--accent, #8BE7D4)',
    '--brand-mark-ink': 'var(--text, currentColor)',
  } as CSSProperties;

  return (
    <span
    className={`brand-mark${compact ? ' brand-mark--compact' : ''}${className ? ` ${className}` : ''}`}
    style={style}
    >
      <svg className="brand-mark__glyph" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <ellipse cx="22" cy="22" rx="17" ry="8.5" fill="none" stroke="var(--brand-mark-accent)" strokeWidth="1.5" transform="rotate(-24 22 22)" />
        <circle cx="22" cy="22" r="8.5" fill="none" stroke="var(--brand-mark-ink)" strokeOpacity="0.78" strokeWidth="1.5" />
        <path d="M8.5 27.5 35.5 16.5" stroke="var(--brand-mark-accent)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="33.7" cy="15.5" r="2.2" fill="var(--brand-mark-accent)" />
      </svg>
      <span className="brand-mark__word">ÓRBITA</span>
    </span>
  );
}

export default BrandMark;
