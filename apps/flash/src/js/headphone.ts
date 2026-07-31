/* ============================================================
   headphone — builder do SVG autoral do ÓRBITA X1
   Duas vistas: 'side' (perfil, cinematográfica — hero/story) e
   'front' (frontal, conchas de frente — configurador/finale).
   Estrutura por partes (rig/band/cups) para o scroll-telling.
   Cor e modo são dirigidos por data-attributes no contêiner;
   a transição de cor é feita por CSS (stop-color/fill + pop).
   ============================================================ */

import type { Colorway, Mode } from './store';

export interface HPInstance {
  container: HTMLElement;
  svg: SVGSVGElement;
  rig: SVGGElement;
  band: SVGGElement;
  cupL: SVGGElement;
  cupR: SVGGElement;
  setColorway: (c: Colorway, pop?: boolean) => void;
  setMode: (m: Mode) => void;
  setTuned: (on: boolean) => void;
}

export type HPView = 'side' | 'front';

/* ============================================================
   VISTA LATERAL (perfil) — hero e scroll-telling
   ============================================================ */
function cupSide(): string {
  return `
    <path class="hp-arm" d="M 246 458 L 246 486"/>
    <circle class="hp-pivot" cx="246" cy="486" r="9.5"/>
    <circle class="hp-pivot-dot" cx="246" cy="486" r="3.2"/>
    <rect class="hp-cushion" x="166" y="466" width="160" height="210" rx="68"/>
    <rect class="hp-cushion-line" x="178" y="478" width="136" height="186" rx="60"/>
    <g class="hp-inner">
      <path class="hp-cone" d="M 246 648 C 208 626 194 578 194 542 L 298 542 C 298 578 284 626 246 648 Z"/>
      <circle class="hp-magnet" cx="246" cy="552" r="32"/>
      <circle class="hp-coil" cx="246" cy="552" r="18"/>
      <rect class="hp-chip" x="214" y="604" width="64" height="28" rx="7"/>
      <text class="hp-chip-txt" x="246" y="623" text-anchor="middle">S2</text>
    </g>
    <rect class="hp-shell-paint" x="178" y="468" width="136" height="206" rx="62"/>
    <rect class="hp-shell-hi" x="178" y="468" width="136" height="206" rx="62"/>
    <rect class="hp-shell-edge" x="179.5" y="469.5" width="133" height="203" rx="60"/>
    <path class="hp-shell-spec" d="M 196 494 C 196 482 204 473 214 471"/>
    <path class="hp-wave" d="M 246 517 A 54 54 0 0 1 300 571"/>
    <path class="hp-wave" d="M 246 509 A 62 62 0 0 1 308 571"/>
    <path class="hp-wave" d="M 246 501 A 70 70 0 0 1 316 571"/>
    <circle class="hp-orbit-ring" cx="246" cy="571" r="50"/>
    <circle class="hp-orbit-ring" cx="246" cy="571" r="60"/>
    <circle class="hp-orbit-dot" cx="296" cy="571" r="4.5"/>
    <circle class="hp-orbit-dot hp-orbit-dot2" cx="306" cy="571" r="3.8"/>
    <circle class="hp-dial-rim" cx="246" cy="571" r="44"/>
    <circle class="hp-dial" cx="246" cy="571" r="40"/>
    <circle class="hp-dial-ring" cx="246" cy="571" r="31"/>
    <circle class="hp-dial-detail" cx="246" cy="571" r="24"/>
    <circle class="hp-led" cx="246" cy="539" r="4"/>
    <circle class="hp-sat" cx="286" cy="571" r="5"/>
    <circle class="hp-sat hp-sat-2" cx="206" cy="571" r="4"/>`;
}

/* ============================================================
   VISTA FRONTAL — configurador e CTA final
   Conchas de frente: cores visíveis + núcleo orbital central.
   ============================================================ */
function cupFront(): string {
  const cx = 246;
  const cy = 470;
  return `
    <circle class="hp-cushion" cx="${cx}" cy="${cy}" r="86"/>
    <circle class="hp-cushion-line" cx="${cx}" cy="${cy}" r="72"/>
    <g class="hp-inner">
      <circle class="hp-cone" cx="${cx}" cy="${cy}" r="54"/>
      <circle class="hp-magnet" cx="${cx}" cy="${cy}" r="34"/>
      <circle class="hp-coil" cx="${cx}" cy="${cy}" r="19"/>
      <rect class="hp-chip" x="${cx - 32}" y="${cy + 26}" width="64" height="26" rx="7"/>
      <text class="hp-chip-txt" x="${cx}" y="${cy + 44}" text-anchor="middle">S2</text>
    </g>
    <circle class="hp-shell-paint" cx="${cx}" cy="${cy}" r="80"/>
    <circle class="hp-shell-hi" cx="${cx}" cy="${cy}" r="80"/>
    <circle class="hp-shell-edge" cx="${cx}" cy="${cy}" r="80.5"/>
    <path class="hp-shell-spec" d="M ${cx - 56} ${cy - 36} A 46 46 0 0 1 ${cx - 20} ${cy - 62}"/>
    <path class="hp-wave" d="M ${cx - 38} ${cy - 68} A 56 56 0 0 1 ${cx + 38} ${cy - 68}"/>
    <path class="hp-wave" d="M ${cx - 44} ${cy - 74} A 63 63 0 0 1 ${cx + 44} ${cy - 74}"/>
    <circle class="hp-orbit-ring" cx="${cx}" cy="${cy}" r="58"/>
    <circle class="hp-orbit-ring" cx="${cx}" cy="${cy}" r="66"/>
    <circle class="hp-orbit-dot" cx="${cx + 58}" cy="${cy}" r="4.5"/>
    <circle class="hp-orbit-dot hp-orbit-dot2" cx="${cx - 66}" cy="${cy}" r="3.8"/>
    <circle class="hp-dial-rim" cx="${cx}" cy="${cy}" r="40"/>
    <circle class="hp-dial" cx="${cx}" cy="${cy}" r="36"/>
    <circle class="hp-dial-ring" cx="${cx}" cy="${cy}" r="27"/>
    <circle class="hp-dial-detail" cx="${cx}" cy="${cy}" r="20"/>
    <circle class="hp-led" cx="${cx}" cy="${cy - 23}" r="3.8"/>
    <circle class="hp-sat" cx="${cx + 62}" cy="${cy}" r="5"/>
    <circle class="hp-sat hp-sat-2" cx="${cx - 62}" cy="${cy}" r="4"/>`;
}

export function buildHeadphone(
  mount: HTMLElement,
  opts: { prefix: string; colorway?: Colorway; mode?: Mode; tuned?: boolean; view?: HPView }
): HPInstance {
  const p = opts.prefix;
  const view = opts.view ?? 'side';
  const cups = view === 'front' ? cupFront() : cupSide();

  const markup = `
  <svg class="hp-svg" viewBox="0 0 800 720" role="img" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${p}-shell" x1="0" y1="0" x2="1" y2="1">
        <stop class="hp-shell-grad-a" offset="0"/>
        <stop class="hp-shell-grad-b" offset="0.55"/>
        <stop class="hp-shell-grad-c" offset="1"/>
      </linearGradient>
      <radialGradient id="${p}-shell-hi" cx="0.3" cy="0.18" r="0.9">
        <stop offset="0" stop-color="#fff" stop-opacity="0.4"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${p}-cone" cx="0.35" cy="0.3" r="0.95">
        <stop offset="0" stop-color="#59677A"/>
        <stop offset="0.55" stop-color="#333D4C"/>
        <stop offset="1" stop-color="#171C26"/>
      </radialGradient>
      <linearGradient id="${p}-gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.22"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="0.05"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g id="${p}-rig" class="hp-rig">
      <circle class="hp-glow-ring" cx="400" cy="430" r="288"/>
      <g id="${p}-band" class="hp-part hp-band-g">
        ${view === 'front'
          ? `
            <path class="hp-band-metal" d="M 172 470 A 296 296 0 0 1 628 470"/>
            <path class="hp-band-gloss" d="M 172 470 A 296 296 0 0 1 628 470" fill="none"/>
            <path class="hp-band-edge" d="M 176 470 A 292 292 0 0 1 624 470"/>
            <path class="hp-band-pad" d="M 200 470 A 270 270 0 0 1 600 470"/>`
          : `
            <path class="hp-band-metal" d="M 246 452 A 252 252 0 0 1 554 452"/>
            <path class="hp-band-gloss" d="M 258 452 A 240 240 0 0 1 542 452" fill="none"/>
            <path class="hp-band-edge" d="M 248 452 A 250 250 0 0 1 552 452"/>
            <path class="hp-band-pad" d="M 268 452 A 234 234 0 0 1 532 452"/>`}
      </g>
      <g id="${p}-cup-l" class="hp-part hp-cup-g">${cups}</g>
      <g id="${p}-cup-r" class="hp-part hp-cup-g" transform="translate(800,0) scale(-1,1)">${cups}</g>
    </g>
  </svg>`;

  mount.insertAdjacentHTML('beforeend', markup);
  const svg = mount.querySelector<SVGSVGElement>('svg')!;
  svg.setAttribute('aria-hidden', 'true');
  svg.dataset.hp = p;

  const rig = svg.querySelector<SVGGElement>(`#${p}-rig`)!;
  const band = svg.querySelector<SVGGElement>(`#${p}-band`)!;
  const cupL = svg.querySelector<SVGGElement>(`#${p}-cup-l`)!;
  const cupR = svg.querySelector<SVGGElement>(`#${p}-cup-r`)!;

  // CSS vars apontam para os gradientes desta instância
  mount.style.setProperty('--shell-fill', `url(#${p}-shell)`);
  mount.style.setProperty('--shell-hi-fill', `url(#${p}-shell-hi)`);
  mount.style.setProperty('--cone-fill', `url(#${p}-cone)`);
  mount.style.setProperty('--gloss-fill', `url(#${p}-gloss)`);

  const container = mount;
  container.classList.add('hp-root');
  container.dataset.view = view;
  container.dataset.colorway = opts.colorway ?? 'ion';
  container.dataset.mode = opts.mode ?? 'espacial';
  if (opts.tuned) container.classList.add('is-tuned');

  return {
    container,
    svg,
    rig,
    band,
    cupL,
    cupR,
    setColorway(c, pop = true) {
      container.dataset.colorway = c;
      if (pop) {
        container.classList.remove('cw-pop');
        // força reflow para reiniciar a animação do pop
        void container.offsetWidth;
        container.classList.add('cw-pop');
        window.setTimeout(() => container.classList.remove('cw-pop'), 700);
      }
    },
    setMode(m) {
      container.dataset.mode = m;
    },
    setTuned(on) {
      container.classList.toggle('is-tuned', on);
    }
  };
}
