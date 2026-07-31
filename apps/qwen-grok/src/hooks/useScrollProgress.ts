import { useEffect, useRef, useState } from 'react'
import { clamp } from '../utils/easings'

/**
 * Maps scroll position through a tall track element to progress 0→1.
 * Uses rAF coalescing for 60fps scrubbing.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      raf.current = 0
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        setProgress(0)
        return
      }
      // When top is at viewport top, progress 0; when bottom hits bottom, 1
      const scrolled = -rect.top
      setProgress(clamp(scrolled / total))
    }

    const onScroll = () => {
      // Always reschedule so the latest scroll position wins
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return { ref, progress }
}
