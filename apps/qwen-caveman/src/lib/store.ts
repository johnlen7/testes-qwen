/**
 * Estado compartilhado do produto (configurador <-> CTA final).
 * Fonte única de verdade, baseada em EventTarget.
 */

export type ColorId = "grafite" | "marfim" | "eclipse" | "solar";
export type ModeId = "imersivo" | "estudio";

export interface ColorOption {
  id: ColorId;
  name: string;
  price: number;
  /** CSS custom properties do SVG do produto. */
  vars: Record<string, string>;
}

export const COLORS: Record<ColorId, ColorOption> = {
  grafite: {
    id: "grafite",
    name: "Grafite",
    price: 2499,
    vars: {
      "--hp-shell": "#3a3d46",
      "--hp-shell-hi": "#5b5f6c",
      "--hp-shell-2": "#1a1c22",
      "--hp-band": "#2b2e37",
      "--hp-band-hi": "#4c505c",
      "--hp-cushion": "#131419",
      "--hp-metal": "#9298a6",
    },
  },
  marfim: {
    id: "marfim",
    name: "Marfim",
    price: 2499,
    vars: {
      "--hp-shell": "#ece5d6",
      "--hp-shell-hi": "#ffffff",
      "--hp-shell-2": "#c4bba6",
      "--hp-band": "#ded6c4",
      "--hp-band-hi": "#f4efe4",
      "--hp-cushion": "#b2a891",
      "--hp-metal": "#d8d0bd",
    },
  },
  eclipse: {
    id: "eclipse",
    name: "Eclipse",
    price: 2599,
    vars: {
      "--hp-shell": "#33507a",
      "--hp-shell-hi": "#4d6f9e",
      "--hp-shell-2": "#1a2c47",
      "--hp-band": "#2a4368",
      "--hp-band-hi": "#41628f",
      "--hp-cushion": "#16233a",
      "--hp-metal": "#8fa6c4",
    },
  },
  solar: {
    id: "solar",
    name: "Solar",
    price: 2699,
    vars: {
      "--hp-shell": "#ff8a3d",
      "--hp-shell-hi": "#ffb066",
      "--hp-shell-2": "#d8551f",
      "--hp-band": "#f07a2e",
      "--hp-band-hi": "#ff9e57",
      "--hp-cushion": "#c14e1c",
      "--hp-metal": "#ffcf9e",
    },
  },
};

export const MODES: Record<ModeId, { name: string; add: number }> = {
  imersivo: { name: "Imersivo", add: 0 },
  estudio: { name: "Estúdio", add: 200 },
};

export interface ProductState {
  color: ColorId;
  mode: ModeId;
  price: number;
  colorName: string;
  modeName: string;
}

type Listener = (state: ProductState) => void;

class ProductStore {
  private color: ColorId = "grafite";
  private mode: ModeId = "imersivo";
  private bus = new EventTarget();

  get state(): ProductState {
    const c = COLORS[this.color];
    const m = MODES[this.mode];
    return {
      color: this.color,
      mode: this.mode,
      price: c.price + m.add,
      colorName: c.name,
      modeName: m.name,
    };
  }

  setColor(color: ColorId): void {
    if (color === this.color) return;
    this.color = color;
    this.emit();
  }

  setMode(mode: ModeId): void {
    if (mode === this.mode) return;
    this.mode = mode;
    this.emit();
  }

  subscribe(fn: Listener): () => void {
    const handler = () => fn(this.state);
    this.bus.addEventListener("change", handler);
    return () => this.bus.removeEventListener("change", handler);
  }

  private emit(): void {
    this.bus.dispatchEvent(new Event("change"));
  }
}

export const productStore = new ProductStore();

export const formatBRL = (value: number): string =>
  value.toLocaleString("pt-BR");
