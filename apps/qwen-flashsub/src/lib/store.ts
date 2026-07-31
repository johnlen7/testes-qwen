export type ColorwayId = "grafite" | "marfim" | "solar" | "abissal";
export type SizeId = "padrao" | "studio";

export interface Colorway {
  label: string;
  price: number;
  vars: Record<string, string>;
}

export interface Size {
  label: string;
  price: number;
  scale: number;
}

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  grafite: {
    label: "Grafite",
    price: 2499,
    vars: {
      "--hp-shell": "#2e323b",
      "--hp-shell-deep": "#1a1d24",
      "--hp-cushion": "#23262e",
      "--hp-metal": "#8a8f9b",
      "--hp-glow": "rgba(232,161,92,0.14)",
    },
  },
  marfim: {
    label: "Marfim",
    price: 2499,
    vars: {
      "--hp-shell": "#e9e4d8",
      "--hp-shell-deep": "#c8c1b2",
      "--hp-cushion": "#d6d0c2",
      "--hp-metal": "#a09882",
      "--hp-glow": "rgba(185,138,74,0.14)",
    },
  },
  solar: {
    label: "Solar",
    price: 2649,
    vars: {
      "--hp-shell": "#b4622d",
      "--hp-shell-deep": "#8f4a1f",
      "--hp-cushion": "#9c5527",
      "--hp-metal": "#f5c088",
      "--hp-glow": "rgba(245,192,136,0.18)",
    },
  },
  abissal: {
    label: "Abissal",
    price: 2499,
    vars: {
      "--hp-shell": "#1f3b38",
      "--hp-shell-deep": "#142826",
      "--hp-cushion": "#1a3230",
      "--hp-metal": "#8fd8d0",
      "--hp-glow": "rgba(143,216,208,0.14)",
    },
  },
};

export const SIZES: Record<SizeId, Size> = {
  padrao: { label: "Padrão", price: 0, scale: 1 },
  studio: { label: "Studio", price: 300, scale: 1.12 },
};

export interface ConfigState {
  colorway: ColorwayId;
  size: SizeId;
}

type Listener = (state: ConfigState) => void;

const listeners = new Set<Listener>();
let state: ConfigState = { colorway: "grafite", size: "padrao" };

export const store = {
  getState(): ConfigState {
    return { ...state };
  },
  setState(partial: Partial<ConfigState>): void {
    state = { ...state, ...partial };
    for (const fn of listeners) fn({ ...state });
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function totalPrice(s: ConfigState): number {
  return COLORWAYS[s.colorway].price + SIZES[s.size].price;
}
