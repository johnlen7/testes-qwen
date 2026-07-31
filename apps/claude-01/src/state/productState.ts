import { Store } from '../lib/store';
import { formatBRL } from '../lib/count-up';

export interface ProductColor {
  id: string;
  name: string;
  shell: string;
  shellLight: string;
  cushion: string;
  accent: string;
}

export const COLORS: ProductColor[] = [
  { id: 'grafite', name: 'Grafite', shell: '#2a2d38', shellLight: '#3c4051', cushion: '#14161d', accent: '#ff7a45' },
  { id: 'cobre', name: 'Cobre', shell: '#7a3b22', shellLight: '#a5522f', cushion: '#2c150c', accent: '#ffb27a' },
  { id: 'areia', name: 'Areia', shell: '#d8cdb8', shellLight: '#ece3d1', cushion: '#a89d86', accent: '#b8481a' },
  { id: 'musgo', name: 'Musgo', shell: '#31402f', shellLight: '#455a42', cushion: '#161f16', accent: '#5eead4' },
  {
    id: 'meia-noite',
    name: 'Meia-noite',
    shell: '#161a2b',
    shellLight: '#232a45',
    cushion: '#0a0c16',
    accent: '#5eead4',
  },
];

export interface ProductMode {
  id: string;
  name: string;
  description: string;
  priceDelta: number;
}

export const MODES: ProductMode[] = [
  {
    id: 'adaptativo',
    name: 'Adaptativo',
    description: 'ANC espacial padrão — equilíbrio entre isolamento e ambiente.',
    priceDelta: 0,
  },
  {
    id: 'estudio',
    name: 'Estúdio',
    description: 'Driver extra + isolamento máximo, para gravação e foco total.',
    priceDelta: 300,
  },
];

export const BASE_PRICE = 2499;

export interface ProductState {
  colorId: string;
  modeId: string;
}

export const productState = new Store<ProductState>({
  colorId: COLORS[0].id,
  modeId: MODES[0].id,
});

export function getColor(id: string): ProductColor {
  return COLORS.find((c) => c.id === id) ?? COLORS[0];
}

export function getMode(id: string): ProductMode {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}

export function getPrice(state: ProductState): number {
  return BASE_PRICE + getMode(state.modeId).priceDelta;
}

export function getCtaLabel(state: ProductState): string {
  const color = getColor(state.colorId);
  return `Comprar ÓRBITA — ${color.name}, ${formatBRL(getPrice(state))}`;
}

/** Aplica a cor escolhida às custom properties globais — o SVG recolore via CSS, sem re-render. */
export function applyProductColor(color: ProductColor): void {
  const root = document.documentElement.style;
  root.setProperty('--product-shell', color.shell);
  root.setProperty('--product-shell-light', color.shellLight);
  root.setProperty('--product-cushion', color.cushion);
  root.setProperty('--product-accent', color.accent);
}

productState.subscribe((state) => {
  applyProductColor(getColor(state.colorId));
});
