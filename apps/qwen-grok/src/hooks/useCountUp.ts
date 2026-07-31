import { useEffect, useRef, useState } from 'react'
import { easeOutExpo } from '../utils/easings'

export function useCountUp(target: number, duration = 680, enabled = true): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const raf = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      fromRef.current = target
      return
    }

    const from = fromRef.current
    if (from === target) return

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = easeOutExpo(t)
      const next = Math.round(from + (target - from) * eased)
      setValue(next)
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      fromRef.current = target
    }
  }, [target, duration, enabled])

  return value
}
