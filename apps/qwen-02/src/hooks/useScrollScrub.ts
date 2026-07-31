import { useEffect, useRef } from 'react'

/**
 * Scrubbing de scroll: mapeia o progresso de rolagem de um elemento alto
 * (com viewport interno sticky) para `progress ∈ [0,1]` e chama `onProgress`
 * dentro de um requestAnimationFrame — fora do ciclo de render do React.
 *
 * O callback deve aplicar transform/opacity diretamente nos nós do DOM.
 */
export function useScrollScrub<T extends HTMLElement>(onProgress: (progress: number) => void) {
  const ref = useRef<T | null>(null)
  const cbRef = useRef(onProgress)
  cbRef.current = onProgress

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let last = -1

    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        if (last !== 0) {
          last = 0
          cbRef.current(0)
        }
        return
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      const progress = scrolled / total
      if (Math.abs(progress - last) > 0.0004) {
        last = progress
        cbRef.current(progress)
      }
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return ref
}
