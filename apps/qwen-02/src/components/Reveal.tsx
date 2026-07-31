import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealProps {
  children: ReactNode
  /** atraso em ms para stagger */
  delay?: number
  className?: string
}

/** Wrapper de entrada por scroll: fade + translateY ao entrar na viewport. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties
  const cls = ['reveal', inView ? 'is-in' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <div ref={ref} className={cls} style={style}>
      {children}
    </div>
  )
}
