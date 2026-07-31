import { useEffect, useRef } from 'react'

/**
 * Parallax por ponteiro (desktop). Chama `onMove` com coordenadas normalizadas
 * x,y ∈ [-1,1] relativas ao centro da viewport, coalescido em rAF.
 * Desligado em ponteiros coarse (touch) ou quando `enabled` é false.
 */
export function usePointerParallax(onMove: (x: number, y: number) => void, enabled = true) {
  const cbRef = useRef(onMove)
  cbRef.current = onMove

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let raf = 0
    let px = 0
    let py = 0

    const handle = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1
      py = (e.clientY / window.innerHeight) * 2 - 1
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          cbRef.current(px, py)
        })
      }
    }

    window.addEventListener('pointermove', handle, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handle)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled])
}
