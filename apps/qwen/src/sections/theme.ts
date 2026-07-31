/**
 * 5.2 Tema claro/escuro.
 * - Estado inicial: anti-FOUC inline no <head> (localStorage → prefers-color-scheme).
 * - Toggle: View Transition API com reveal circular a partir do botão.
 *   Fallback: cross-fade de cores via CSS transitions.
 * - Persiste em localStorage e anuncia evento 'orbita:theme' para o canvas.
 */

const STORAGE_KEY = 'orbita-theme'

type Theme = 'dark' | 'light'

let manual = false // true após o usuário clicar no toggle

function current(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** persist=true só no clique manual — assim a página continua seguindo o
 *  sistema até o usuário decidir, mesmo que o SO mude de esquema. */
function apply(theme: Theme, persist: boolean): void {
  document.documentElement.dataset.theme = theme
  if (persist) {
    manual = true
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage indisponível — tema vale só na sessão */
    }
  }
  window.dispatchEvent(new CustomEvent('orbita:theme', { detail: theme }))
}

function toggleFrom(x: number, y: number): void {
  const next: Theme = current() === 'dark' ? 'light' : 'dark'
  const vt = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> }
  }

  const run = () => apply(next, true)

  if (vt.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const transition = vt.startViewTransition(run)
    transition.ready
      .then(() => {
        const maxR = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`],
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      })
      .catch(() => {
        /* transição cancelada por toggle rápido — estado já aplicado */
      })
  } else {
    run()
  }
}

export function initTheme(): void {
  const btn = document.getElementById('theme-toggle')
  btn?.addEventListener('click', (e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    toggleFrom(rect.left + rect.width / 2, rect.top + rect.height / 2)
  })

  try {
    manual = localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    manual = true
  }

  // segue o sistema enquanto o usuário não escolheu manualmente
  if (!manual) {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (manual) return // escolha manual tem precedência
      apply(e.matches ? 'dark' : 'light', false)
    })
  }
}
