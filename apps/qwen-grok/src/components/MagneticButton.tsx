import {
  useCallback,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

export function MagneticButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (reduced || !ref.current) return
      if (window.matchMedia('(pointer: coarse)').matches) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      ref.current.style.setProperty('--btn-x', `${x * 0.22}px`)
      ref.current.style.setProperty('--btn-y', `${y * 0.28}px`)
    },
    [reduced],
  )

  const onLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--btn-x', '0px')
    ref.current.style.setProperty('--btn-y', '0px')
  }, [])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const btn = ref.current
      if (btn && !reduced) {
        const rect = btn.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height) * 2.2
        const ripple = document.createElement('span')
        ripple.className = 'btn__ripple'
        ripple.style.width = `${size}px`
        ripple.style.height = `${size}px`
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`
        btn.appendChild(ripple)
        window.setTimeout(() => ripple.remove(), 700)
      }
      onClick?.(e)
    },
    [onClick, reduced],
  )

  return (
    <button
      ref={ref}
      type="button"
      className={`btn btn--${variant} ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  )
}
