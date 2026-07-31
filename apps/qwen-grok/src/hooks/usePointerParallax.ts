import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Subtle pointer parallax. Writes CSS vars --px / --py on the element.
 * Disabled on touch / reduced motion.
 */
export function usePointerParallax<T extends HTMLElement>(strength = 18) {
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) {
      if (el) {
        el.style.setProperty('--px', '0px')
        el.style.setProperty('--py', '0px')
      }
      return
    }

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    if (isCoarse) return

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      target.current = { x: nx * strength, y: ny * strength }
    }

    const onLeave = () => {
      target.current = { x: 0, y: 0 }
    }

    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.08
      current.current.y += (target.current.y - current.current.y) * 0.08
      el.style.setProperty('--px', `${current.current.x.toFixed(2)}px`)
      el.style.setProperty('--py', `${current.current.y.toFixed(2)}px`)
      raf.current = requestAnimationFrame(loop)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    raf.current = requestAnimationFrame(loop)

    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [reduced, strength])

  return ref
}
