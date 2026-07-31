import { useRef, type PointerEvent, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './magnetic.css'

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

/**
 * Envolve um elemento e o atrai em direção ao cursor (micro-interação premium).
 * O transform é aplicado direto no DOM; o reset usa easing spring via CSS.
 */
export function Magnetic({ children, strength = 0.32, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    el.style.transform = `translate(${(x * strength).toFixed(1)}px, ${(y * strength).toFixed(1)}px)`
  }

  const onLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ''
  }

  return (
    <div ref={ref} className={`magnetic ${className ?? ''}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  )
}
