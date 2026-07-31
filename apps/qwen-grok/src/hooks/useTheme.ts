import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'orbita-theme'

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readInitial)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement
    const apply = () => {
      root.setAttribute('data-theme', next)
      setThemeState(next)
    }

    // View Transitions API — circular-ish theme swap when available
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> }
    }

    if (typeof doc.startViewTransition === 'function') {
      root.classList.add('theme-animating')
      const vt = doc.startViewTransition(() => apply())
      vt.finished.finally(() => root.classList.remove('theme-animating'))
      return
    }

    root.classList.add('theme-animating')
    apply()
    window.setTimeout(() => root.classList.remove('theme-animating'), 900)
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return { theme, setTheme, toggle }
}
