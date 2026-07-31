const BASE_PRICE = 2499;

export const COLOR_MAP = {
  grafite: '#2A2E36',
  lunar: '#E8E4DA',
  ambar: '#FFAE3D',
  oceano: '#1E3A4C'
};

export const COLOR_NAMES = {
  grafite: 'Grafite',
  lunar: 'Lunar',
  ambar: 'Âmbar',
  oceano: 'Oceano'
};

export const SIZE_NAMES = {
  p: 'Concha P',
  m: 'Concha M',
  g: 'Concha G'
};

let state = {
  color: 'grafite',
  size: 'm'
};

const listeners = new Set();

export function get() {
  return { ...state };
}

export function set(patch) {
  const next = { ...state, ...patch };
  if (next.color === state.color && next.size === state.size) return;
  state = next;
  listeners.forEach((fn) => fn(get()));
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(get());
  return () => listeners.delete(fn);
}

export function priceOf(stateObj) {
  let price = BASE_PRICE;
  if (stateObj.size === 'g') price += 200;
  if (stateObj.size === 'p') price -= 100;
  return price;
}

export function labelOf(stateObj) {
  return `${COLOR_NAMES[stateObj.color]} · ${SIZE_NAMES[stateObj.size]}`;
}

export function formatBRL(n) {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
