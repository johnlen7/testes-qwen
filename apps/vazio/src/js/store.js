/* ============================================================
   ÓRBITA · store
   Estado único do configurador { cor, concha, preco } com
   pub/sub. O CTA final (fatia 3) assina subscribe() para
   renderizar o produto na cor escolhida e refletir o preço.
   ============================================================ */

export const BASE_PRICE = 2499;

export const COLORS = [
  {
    id: 'grafite',
    name: 'Grafite',
    shell: '#2A2E3A',
    shellDark: '#1D212C',
    band: '#222634',
    cushion: '#161A24',
    hair: 'rgba(236,239,248,.38)'
  },
  {
    id: 'lunar',
    name: 'Lunar',
    shell: '#D8DBE3',
    shellDark: '#B4B9C6',
    band: '#C4C8D2',
    cushion: '#9AA0AE',
    hair: 'rgba(18,21,31,.40)'
  },
  {
    id: 'helio',
    name: 'Hélio',
    shell: '#E8A33D',
    shellDark: '#B97F27',
    band: '#D18F2E',
    cushion: '#8A5E18',
    hair: 'rgba(18,21,31,.40)'
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    shell: '#3A4A6B',
    shellDark: '#28324C',
    band: '#2E3B57',
    cushion: '#1B2334',
    hair: 'rgba(236,239,248,.38)'
  }
];

export const SIZES = [
  { id: 'M', name: 'M', spec: 'Concha M · 54mm', delta: 0, scale: 0.92 },
  { id: 'G', name: 'G', spec: 'Concha G · 62mm', delta: 200, scale: 1.05 }
];

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
});

export const formatPrice = (v) => brl.format(v);

export const getColor = (id) => COLORS.find((c) => c.id === id) || COLORS[0];
export const getSize = (id) => SIZES.find((s) => s.id === id) || SIZES[0];

function derive(s) {
  return { ...s, preco: BASE_PRICE + getSize(s.concha).delta };
}

let state = derive({ cor: 'grafite', concha: 'M' });
const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(state));
}

export function setCor(id) {
  if (!COLORS.some((c) => c.id === id) || id === state.cor) return;
  state = derive({ ...state, cor: id });
  emit();
}

export function setConcha(id) {
  if (!SIZES.some((s) => s.id === id) || id === state.concha) return;
  state = derive({ ...state, concha: id });
  emit();
}

/* Rótulo pronto para CTAs: "Comprar ÓRBITA — Grafite · R$ 2.499" */
export function ctaLabel(s = state) {
  return `Comprar ÓRBITA — ${getColor(s.cor).name} · ${formatPrice(s.preco)}`;
}
