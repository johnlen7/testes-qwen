import { useRef } from 'react'
import { useTheme } from '../hooks/useTheme'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './theme-toggle.css'

type StartViewTransition = (cb: () => void) => { ready: Promise<void>; finished: Promise<void> }

/**
 * Toggle claro/escuro. A transição de tema é um reveal circular que expande do
 * botão (View Transitions API), com fallback para cross-fade do CSS.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const reduced = usePrefersReducedMotion()

  const onClick = () => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    // extrai e tipa; o `.call(document, …)` abaixo preserva o `this`
    // (chamar startViewTransition solto dispara "Illegal invocation").
    const startVT = (document as unknown as { startViewTransition?: StartViewTransition })
      .startViewTransition

    if (reduced || coarse || typeof startVT !== 'function') {
      toggle()
      return
    }

    const rect = btnRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth
    const y = rect ? rect.top + rect.height / 2 : 0
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const transition = startVT.call(document, () => toggle())
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 650,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      })
      .catch(() => {
        /* transição cancelada — o tema já foi aplicado */
      })
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
    >
      <svg className="icon-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="icon-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19" />
        </g>
      </svg>
    </button>
  )
}
