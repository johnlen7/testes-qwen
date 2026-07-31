import { useEffect, useRef, useState } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type MagneticButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  href?: string;
  className?: string;
  onClick?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick' | 'children'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'onClick' | 'children' | 'href'>;

export function MagneticButton({ children, variant = 'primary', href, className = '', onClick, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!element || reducedMotion || !canHover) return;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    const draw = () => {
      frame = 0;
      element.style.setProperty('--magnetic-x', `${targetX}px`);
      element.style.setProperty('--magnetic-y', `${targetY}px`);
    };
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 6;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const reset = () => {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', reset, { passive: true });
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const style = { '--magnetic-x': '0px', '--magnetic-y': '0px' } as CSSProperties;
  const common = {
    ref,
    className: `button button--${variant} ${className}`,
    style,
    onClick: (event: React.MouseEvent<HTMLButtonElement & HTMLAnchorElement>) => {
      const bounds = ref.current?.getBoundingClientRect();
      if (bounds) {
        setRipple({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          key: Date.now(),
        });
      }
      onClick?.();
    },
  };

  if (href) {
    return (
      <a href={href} {...common} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <span className="button__label">{children}</span>
        {ripple && <span key={ripple.key} className="button__ripple is-active" style={{ left: ripple.x, top: ripple.y }} />}
      </a>
    );
  }

  return (
    <button type="button" {...common} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span className="button__label">{children}</span>
      {ripple && <span key={ripple.key} className="button__ripple is-active" style={{ left: ripple.x, top: ripple.y }} />}
    </button>
  );
}
