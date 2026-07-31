import { useEffect, useRef, useState } from 'react'

/**
 * Anima um número do valor anterior até `target` (count-up/count-down),
 * com easing cubic-out. Retorna o valor corrente (float) para formatação.
 * Se `enabled` for false (reduced-motion), salta direto para o alvo.
 */
export function useCountUp(target: number, duration = 650, enabled = true) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    if (from === target) return

    const start = performance.now()
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(from + (target - from) * easeOut(t))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled])

  return value
}
