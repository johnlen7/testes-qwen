import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ShellSize = 'standard' | 'oversized'

export interface ColorOption {
  id: string
  label: string
  /** Main shell fill */
  body: string
  bodyHi: string
  bodyLo: string
  cushion: string
  ring: string
  metal: string
  priceDelta: number
}

export const COLORS: ColorOption[] = [
  {
    id: 'grafite',
    label: 'Grafite',
    body: '#2a2d35',
    bodyHi: '#3d4250',
    bodyLo: '#15171c',
    cushion: '#1a1c22',
    ring: '#e8a05c',
    metal: '#8a8f9c',
    priceDelta: 0,
  },
  {
    id: 'aurora',
    label: 'Aurora',
    body: '#1e3a3a',
    bodyHi: '#2a5552',
    bodyLo: '#0f2222',
    cushion: '#142828',
    ring: '#3dcdc0',
    metal: '#7a9e9a',
    priceDelta: 100,
  },
  {
    id: 'eclipse',
    label: 'Eclipse',
    body: '#1a1520',
    bodyHi: '#2e2438',
    bodyLo: '#0c0a10',
    cushion: '#141018',
    ring: '#c084fc',
    metal: '#9a8aaa',
    priceDelta: 150,
  },
  {
    id: 'cobre',
    label: 'Cobre',
    body: '#3a2418',
    bodyHi: '#5a3824',
    bodyLo: '#1c100c',
    cushion: '#241610',
    ring: '#f0a060',
    metal: '#c4a078',
    priceDelta: 200,
  },
  {
    id: 'neve',
    label: 'Neve',
    body: '#e8e4dc',
    bodyHi: '#f5f2ea',
    bodyLo: '#c8c4bc',
    cushion: '#d4d0c8',
    ring: '#c45c26',
    metal: '#a8a49c',
    priceDelta: 50,
  },
]

export const BASE_PRICE = 2499
export const OVERSIZED_DELTA = 300

interface ConfigState {
  colorId: string
  shell: ShellSize
  color: ColorOption
  price: number
  setColorId: (id: string) => void
  setShell: (s: ShellSize) => void
  ctaLabel: string
}

const ConfigContext = createContext<ConfigState | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [colorId, setColorIdState] = useState('grafite')
  const [shell, setShell] = useState<ShellSize>('standard')

  const color = useMemo(
    () => COLORS.find((c) => c.id === colorId) ?? COLORS[0],
    [colorId],
  )

  const price = BASE_PRICE + color.priceDelta + (shell === 'oversized' ? OVERSIZED_DELTA : 0)

  const setColorId = useCallback((id: string) => {
    if (COLORS.some((c) => c.id === id)) setColorIdState(id)
  }, [])

  const priceFmt = price.toLocaleString('pt-BR')
  const shellLabel = shell === 'oversized' ? 'Oversized' : 'Standard'
  const ctaLabel = `Comprar ÓRBITA — ${color.label}, ${shellLabel}, R$ ${priceFmt}`

  const value = useMemo(
    () => ({
      colorId,
      shell,
      color,
      price,
      setColorId,
      setShell,
      ctaLabel,
    }),
    [colorId, shell, color, price, setColorId, ctaLabel],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig(): ConfigState {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
