/* ============================================================
   store — estado compartilhado do configurador
   Cor + modo definem o preço, o visual do fone e o acento do site.
   ============================================================ */

export type Colorway = 'ion' | 'grafite' | 'nebulosa' | 'aurora' | 'solar';
export type Mode = 'espacial' | 'silencioso' | 'transparencia';

export const COLORWAY_INFO: Record<Colorway, { name: string; hint: string }> = {
  ion: { name: 'Íon', hint: 'Íon — azul elétrico, edição limitada' },
  grafite: { name: 'Grafite', hint: 'Grafite — o clássico silencioso' },
  nebulosa: { name: 'Nebulosa', hint: 'Nebulosa — violeta profundo' },
  aurora: { name: 'Aurora', hint: 'Aurora — verde mineral, só até setembro' },
  solar: { name: 'Solar', hint: 'Solar — cobre polido, edição limitada' }
};

export const MODE_INFO: Record<Mode, { name: string }> = {
  espacial: { name: 'Espacial' },
  silencioso: { name: 'Silêncio Total' },
  transparencia: { name: 'Transparência' }
};

const BASE_PRICE = 2499;
const COLOR_PREMIUM: Record<Colorway, number> = { ion: 0, grafite: 0, nebulosa: 0, aurora: 0, solar: 200 };
const MODE_PREMIUM: Record<Mode, number> = { espacial: 0, silencioso: 300, transparencia: 150 };

let colorway: Colorway = 'ion';
let mode: Mode = 'espacial';

const subs = new Set<() => void>();

export function getState() {
  return { colorway, mode };
}
export function getPrice() {
  return BASE_PRICE + COLOR_PREMIUM[colorway] + MODE_PREMIUM[mode];
}

export function subscribe(fn: () => void) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function setColorway(c: Colorway) {
  if (c === colorway) return;
  colorway = c;
  document.documentElement.dataset.accent = c;
  document.dispatchEvent(new CustomEvent('orbita:accent'));
  emit();
}

export function setMode(m: Mode) {
  if (m === mode) return;
  mode = m;
  emit();
}

function emit() {
  subs.forEach((fn) => fn());
}

/* ---- formatação de moeda (pt-BR) ---- */
const money0 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
const money2 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const fmtPrice = (v: number) => money0.format(v);
export const fmtInstallment = (v: number) => money2.format(v);

/* aplica o acento inicial */
document.documentElement.dataset.accent = colorway;
