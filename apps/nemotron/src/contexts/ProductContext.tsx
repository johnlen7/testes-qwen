import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { COLORS, SOUND_MODES, getPrice } from '../data/site';

interface ProductCtx {
  colorId: string;
  modeId: string;
  setColorId: (id: string) => void;
  setModeId: (id: string) => void;
  price: number;
}

const Ctx = createContext<ProductCtx | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [colorId, setColorId] = useState(COLORS[0].id);
  const [modeId, setModeId] = useState(SOUND_MODES[0].id);
  const price = useMemo(() => getPrice(colorId, modeId), [colorId, modeId]);

  const value = useMemo(
    () => ({ colorId, modeId, setColorId, setModeId, price }),
    [colorId, modeId, price],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProduct() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProduct deve ser usado dentro de ProductProvider');
  return ctx;
}
