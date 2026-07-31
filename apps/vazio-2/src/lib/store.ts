/**
 * ÓRBITA — estado do produto
 * Cor, concha e preço; store com get/set/subscribe.
 */

export type ColorId = 'grafite' | 'lunar' | 'cobre' | 'aurora';
export type ShellId = 'compact' | 'standard' | 'max';

export interface ColorDef {
  id: ColorId;
  name: string;
  body: string;
  deep: string;
  hi: string;
}

export const COLORS: ColorDef[] = [
  { id: 'grafite', name: 'Grafite', body: '#2b3038', deep: '#161a20', hi: '#8a93a3' },
  { id: 'lunar', name: 'Lunar', body: '#e6e2d8', deep: '#b9b4a6', hi: '#ffffff' },
  { id: 'cobre', name: 'Cobre', body: '#b4693b', deep: '#6e3b1c', hi: '#e8a56c' },
  { id: 'aurora', name: 'Aurora', body: '#3f7d6b', deep: '#1e4238', hi: '#8fd8be' },
];

export const SHELLS = [
  { id: 'compact' as ShellId, name: 'Compacta', delta: -100, scale: 0.92 },
  { id: 'standard' as ShellId, name: 'Padrão', delta: 0, scale: 1 },
  { id: 'max' as ShellId, name: 'Max', delta: 200, scale: 1.08 },
] as const;

export const BASE_PRICE = 2499;

export interface ProductConfig {
  color: ColorId;
  shell: ShellId;
  price: number;
}

export function formatPrice(v: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);
}

const state: ProductConfig = { color: 'grafite', shell: 'standard', price: BASE_PRICE };
const subscribers = new Set<(cfg: ProductConfig) => void>();

function recomputePrice(): void {
  const shell = SHELLS.find((s) => s.id === state.shell);
  state.price = BASE_PRICE + (shell?.delta ?? 0);
}

export const store = {
  get(): ProductConfig {
    return { ...state };
  },

  set(patch: Partial<Pick<ProductConfig, 'color' | 'shell'>>): void {
    if (patch.color !== undefined) state.color = patch.color;
    if (patch.shell !== undefined) state.shell = patch.shell;
    recomputePrice();

    const snapshot = { ...state };
    subscribers.forEach((cb) => cb(snapshot));
  },

  subscribe(cb: (cfg: ProductConfig) => void): () => void {
    subscribers.add(cb);
    cb({ ...state });
    return () => subscribers.delete(cb);
  },
};
