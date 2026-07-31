import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { COLORS, SIZES, type ColorOption, type SizeOption } from '../lib/product'

interface ConfiguratorValue {
  color: ColorOption
  size: SizeOption
  setColorId: (id: string) => void
  setSizeId: (id: string) => void
}

const ConfiguratorContext = createContext<ConfiguratorValue | null>(null)

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [colorId, setColorId] = useState(COLORS[0].id)
  const [sizeId, setSizeId] = useState(SIZES[0].id)

  const value = useMemo<ConfiguratorValue>(() => {
    const color = COLORS.find((c) => c.id === colorId) ?? COLORS[0]
    const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[0]
    return { color, size, setColorId, setSizeId }
  }, [colorId, sizeId])

  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>
}

export function useConfigurator(): ConfiguratorValue {
  const ctx = useContext(ConfiguratorContext)
  if (!ctx) throw new Error('useConfigurator deve ser usado dentro de <ConfiguratorProvider>')
  return ctx
}
