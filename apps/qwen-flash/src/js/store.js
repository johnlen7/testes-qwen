/* ============================================================
   ÓRBITA — store: estado compartilhado com pub/sub (~30 linhas)
   ============================================================ */

export const COLORS = {
  grafite: { label: 'Grafite', cup: '#262a33', cupLight: '#3a4050', pad: '#101318', ring: '#ff7a45' },
  prata: { label: 'Prata', cup: '#b9bec9', cupLight: '#dfe3ea', pad: '#23262e', ring: '#ff7a45' },
  cobre: { label: 'Cobre', cup: '#7c4a2a', cupLight: '#b06f3f', pad: '#22130a', ring: '#e8b44a' },
  meianoite: { label: 'Meia-noite', cup: '#1b2947', cupLight: '#2d4a7d', pad: '#0c111e', ring: '#7fd1ff' },
  perolado: { label: 'Perolado', cup: '#e6e3da', cupLight: '#f5f3ec', pad: '#3a3d44', ring: '#c9a86a' },
};

export const EQ_MODES = {
  balanced: { label: 'Equilibrado', led: '#ff7a45', curve: 'M0,70 C60,66 90,54 140,50 C200,45 240,58 300,44' },
  warm: { label: 'Quente', led: '#e8b44a', curve: 'M0,70 C60,62 90,46 140,42 C200,36 240,44 300,34' },
  grave: { label: 'Grave+', led: '#ff9d5c', curve: 'M0,88 C60,84 90,64 140,58 C200,52 240,60 300,56' },
  aereo: { label: 'Aéreo', led: '#7fd1ff', curve: 'M0,52 C60,50 90,54 140,56 C200,58 240,52 300,40' },
};

export const BASE_PRICE = 2499;
export const PRO_PRICE = 300;

const state = {
  color: 'grafite',
  eq: 'balanced',
  pro: false,
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setState(patch) {
  const changed = Object.keys(patch).some((k) => patch[k] !== state[k]);
  if (!changed) return;
  Object.assign(state, patch);
  listeners.forEach((fn) => fn(getState()));
}

export function totalPrice() {
  return BASE_PRICE + (state.pro ? PRO_PRICE : 0);
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR');
}
