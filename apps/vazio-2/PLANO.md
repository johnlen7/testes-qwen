# PLANO — ÓRBITA · Experiência de lançamento

## 1. Framework e justificativa

**Vite + TypeScript vanilla, CSS puro.** A página é uma experiência de animação dirigida por scroll e rAF: sem framework no caminho, cada frame fica sob controle direto (sem reconciliação, sem runtime). Componentização por módulos TS com funções `mount*` e CSS por seção importado pelo próprio módulo. Resultado: JS mínimo (orçamento de 200KB gzip vira trivial), build estático garantido, zero tentação de puxar biblioteca.

## 2. Arquitetura de pastas

```
├── index.html              ← markup semântico completo das 7 seções (contrato de hooks)
├── package.json / tsconfig.json / vite.config.ts
├── public/favicon.svg
└── src/
    ├── main.ts             ← bootstrap: importa estilos globais, monta as seções
    ├── styles/
    │   ├── tokens.css      ← design tokens (cor, tipo, espaço, motion) + tema claro
    │   └── base.css        ← reset, tipografia base, focus, reduced-motion, utilitários
    ├── lib/
    │   ├── dom.ts          ← qs/qsa/on
    │   ├── motion.ts       ← easings, DUR, onFrame (rAF global), tween, reduced-motion
    │   ├── scroll.ts       ← onScrub (scrubbing), reveal (IO), pageProgress
    │   └── store.ts        ← estado do produto (cor, concha, preço) + subscribe
    ├── product/
    │   └── headphone.ts    ← o fone: SVG autoral parametrizado (cor, concha, explode)
    └── sections/
        ├── hero.ts/.css            ← 4.1
        ├── scrolly.ts/.css         ← 4.2
        ├── configurator.ts/.css    ← 4.3
        ├── features.ts/.css        ← 4.4
        ├── faq.ts/.css             ← 4.6
        ├── testimonials.ts/.css    ← 4.5
        ├── chrome.ts/.css          ← header, tema, progresso orbital
        └── cta.ts/.css             ← 4.7 CTA final + rodapé
```

## 3. Sistema de design

**Direção de arte:** painel de voo / VU meter de estúdio. Tinta espacial azul-profundo (não preto neutro, não gradiente roxo de SaaS), âmbar fosforoso de instrumento analógico como sinal, texto cor de osso, labels de telemetria em mono. A assinatura visual é o **anel orbital com satélite**: o fone é tratado como corpo celeste no hero e o mesmo anel reaparece como indicador de progresso de scroll (o satélite percorre a órbita conforme a página rola). Um motivo, usado com disciplina.

### Paleta (hex nomeados — ver `src/styles/tokens.css`)

| Token | Escuro (padrão) | Claro | Uso |
|---|---|---|---|
| `bg` | `#090d16` tinta espacial | `#f3efe7` papel osso | fundo |
| `bg-2` / `bg-3` | `#0e1420` / `#141c2b` | `#ebe6da` / `#faf8f2` | superfícies |
| `ink` / `ink-2` | `#eae6dc` / `#8e96a6` | `#12161f` / `#5c6270` | texto |
| `accent` | `#f5a524` âmbar VU | `#8a5704` âmbar queimado (AA) | sinal, CTAs |
| `signal` | `#6fe3c1` menta telemetria | `#0b7c62` | dados/ANC — parcimonioso |

### Tipografia (Google Fonts, `display=swap`, preconnect)

- **Display:** Unbounded (500/700) — só hero, H2 e números grandes. Larga e espacial; com moderação.
- **Texto/UI:** Space Grotesk (400/500/700).
- **Telemetria/eyebrows/labels:** IBM Plex Mono (400/500), uppercase, tracking largo.
- Escala fluida via `clamp()` (tokens `--fs-*`).

### Espaçamento e forma

Escala 4px: `--space-1..8` (0.25rem → 10.5rem). Container 75rem. Raios: `--radius` 1.25rem, `--radius-sm` 0.75rem. Grão de filme sutil (SVG feTurbulence data-URI, overlay fixo ~4% opacity) para tirar o "plástico digital".

### Motion tokens

- Durações: `--dur-1..4` = 150 / 300 / 600 / 1200ms.
- Easings: `--ease-out: cubic-bezier(.16,1,.3,1)` (padrão), `--ease-snap: cubic-bezier(.22,1.4,.36,1)` (overshoot micro-interações), `--ease-inout: cubic-bezier(.65,0,.35,1)` (tema/loops). Os mesmos valores existem em JS em `lib/motion.ts`.
- **Regra de ouro:** animações contínuas só em `transform`, `opacity`, `clip-path`, `filter`.

## 4. Estratégia técnica por seção

### 4.1 Hero (`sections/hero.ts`)
- Entrada orquestrada via WAAPI: eyebrow → linhas do título (clip reveal com `clip-path: inset`) → subtítulo → CTAs/meta → fone (scale + blur-out). Stagger calculado, easings do sistema.
- Fone (`createHeadphone`) no slot `[data-headphone-slot="hero"]`, flutuando (loop `translateY` senoidal via rAF) entre anéis orbitais SVG com um satélite circulando.
- Canvas `[data-hero-canvas]`: poeira estelar + partículas âmbar em órbitas elípticas ao redor do fone; DPR cap 2, pausa fora da viewport (IO) e em `document.hidden`.
- Paralaxe de mouse: camadas `[data-depth]` transladam com lerp (profundidades diferentes); só em `(pointer: fine)`.
- Reduced-motion: entrada vira fade simples; sem partículas, paralaxe nem flutuação.

### 4.2 Scroll-telling (`sections/scrolly.ts`) — o showpiece
- Seção com 400vh; filho `[data-scrolly-sticky]` `position: sticky; top:0; height:100vh`.
- `onScrub` entrega `progress` 0→1; **scrubbing real**: todo o frame é função pura do progresso suavizado (`current = lerp(current, target, 0.12)` por frame → física de "massa").
- Coreografia em 3 etapas mapeadas a janelas do progresso:
  1. **Escultura** (0→0.33): fone inteiro, rotação `rotate3d` do wrapper mapeada ao progresso; etiqueta 01 ativa.
  2. **Engenharia** (0.33→0.66): `setExplode(svg, t)` separa concha/haste/ponta/malha e revela o chip; labels técnicos (mono) surgem com stagger ligado ao progresso.
  3. **Silêncio** (0.66→1): partes retornam; canvas `[data-anc-canvas]` desenha onda ambiente (ink-2) + antifase (signal) que se anulam até linha plana conforme t→1; anel de ANC pulsa.
- Textos `[data-step]`: crossfade + translate conforme a etapa ativa; indicador `01—03` com barra de progresso.
- Reduced-motion: seção recebe `.is-static` → sticky desmonta, etapas viram blocos em fluxo normal (legível sem scroll-telling).

### 4.3 Configurador (`sections/configurator.ts`)
- 4 acabamentos (Grafite, Lunar, Cobre, Aurora) como swatches com anel de seleção animado (`--ease-snap`); troca chama `store.set` + `updateHeadphone` (cor transiciona via CSS vars no SVG + varredura de brilho para mascarar).
- Segundo atributo: **concha** (Compacta/Padrão/Max) em segmented control autoral; altera escala do grupo `[data-part="bud"]` no SVG e o preço (−100 / 0 / +200).
- Preço: **odômetro** — cada dígito é uma coluna de 0–9 que rola verticalmente (transform), milhar com ponto pt-BR; `aria-live` com o valor por extenso.
- CTA reflete o estado: `Comprar ÓRBITA — {Cor}, R$ {preço}`. Estado no `store`, compartilhado.

### 4.4 Features (`sections/features.ts`)
- 6 cards (markup já no HTML, ícones SVG autorais por `<symbol>`): glow radial que segue o cursor via custom props `--mx/--my`, borda gradiente revelada no hover, tilt 3D sutil via rAF (só pointer fino).
- Entrada por scroll: `reveal()` com stagger.

### 4.5 Depoimentos (`sections/testimonials.ts`)
- Marquee autoral por rAF: track duplicada, `offset = (offset + v·dt) % metade`, sem salto. Pausa em hover/focus-within; drag por pointer events com velocidade e inércia (decaimento exponencial). Bordas esmaecidas com `mask-image`.
- Reduced-motion: vira lista estática com scroll horizontal nativo.

### 4.6 FAQ (`sections/faq.ts`)
- Accordion autoral: painel com `display: grid; grid-template-rows: 0fr → 1fr` (resolve altura sem medir scrollHeight nem `height: auto`), ícone rotaciona, `--ease-out`.
- Teclado completo: ↑/↓ navega entre botões, Home/End, Enter/Espaço alterna; `aria-expanded`/`aria-controls`; um aberto por vez.

### 4.7 CTA final + chrome (`sections/cta.ts`, `sections/chrome.ts`)
- CTA final lê o `store`: fone na cor escolhida (`[data-headphone-slot="final"]`), resumo e botão atualizam ao vivo.
- Botão magnético: atrai até 10px dentro de um raio com lerp elástico, volta com `--ease-snap`; ripple autoral no clique; após clicar, estado "Reservado ✓" por 2,4s (checkout simulado).
- Chrome: header ganha fundo/blur após 24px de scroll; link da seção ativa marcado via IO; **progresso orbital** — satélite percorre o anel `[data-orbit-progress]` conforme `pageProgress()`; toggle de tema (ver 5.2).

### 5.2 Tema claro/escuro
- Anti-FOUC: script inline no `<head>` aplica `data-theme` no `<html>` (localStorage → `prefers-color-scheme` → dark).
- Toggle: **reveal circular** — `.theme-veil` (fixed, cor do novo tema) expande via WAAPI `clip-path: circle(0 at x y) → circle(150% at x y)` a partir do botão; no ponto médio troca-se o `data-theme`; ao fim, o veil recolhe. Fallback sem WAAPI: crossfade. `meta[name=theme-color]` acompanha.

## 5. Contratos internos (APIs verbatim)

```ts
// lib/dom.ts
export function qs<T extends Element = Element>(selector: string, root?: ParentNode): T;
export function qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[];
export function on(el: EventTarget, type: string, cb: (ev: Event) => void, opts?: AddEventListenerOptions): () => void; // retorna cleanup

// lib/motion.ts
export const DUR: { fast: 150; med: 300; slow: 600; lazy: 1200 };
export const ease: Record<'linear'|'outQuad'|'outCubic'|'outQuart'|'outExpo'|'outBack'|'inOutCubic'|'inOutQuart', (t: number) => number>;
export function clamp(v: number, min: number, max: number): number;
export function lerp(a: number, b: number, t: number): number;
export function prefersReducedMotion(): boolean;
export function onReducedMotionChange(cb: (reduced: boolean) => void): () => void;
export function onFrame(cb: (dt: number, elapsed: number) => void): () => void; // dt em segundos, clamp 50ms
export function tween(opts: { from: number; to: number; duration: number; ease?: (t: number) => number; onUpdate: (v: number) => void; onComplete?: () => void }): () => void; // reduced-motion → pula para `to`

// lib/scroll.ts
export function onScrub(section: HTMLElement, cb: (progress: number) => void): () => void; // 0 topo da seção no topo da viewport → 1 fim no fim
export function reveal(target: Element | Element[], opts?: { threshold?: number; stagger?: number; className?: string }): void; // default 'is-in'
export function pageProgress(): number; // 0..1 do documento

// lib/store.ts
export type ColorId = 'grafite' | 'lunar' | 'cobre' | 'aurora';
export type ShellId = 'compact' | 'standard' | 'max';
export interface ColorDef { id: ColorId; name: string; body: string; deep: string; hi: string; }
export const COLORS: ColorDef[];           // 4 — valores no brief da fase 1
export const SHELLS: { id: ShellId; name: string; delta: number; scale: number }[]; // 3
export const BASE_PRICE = 2499;
export interface ProductConfig { color: ColorId; shell: ShellId; price: number; }
export function formatPrice(v: number): string; // "2.499" (pt-BR, sem "R$")
export const store: {
  get(): ProductConfig;
  set(patch: Partial<Pick<ProductConfig, 'color' | 'shell'>>): void; // recomputa price
  subscribe(cb: (cfg: ProductConfig) => void): () => void; // dispara cb imediatamente com o estado atual
};

// product/headphone.ts (autônomo — NÃO importa de lib/)
export type HeadphoneColor = 'grafite' | 'lunar' | 'cobre' | 'aurora';
export type HeadphoneShell = 'compact' | 'standard' | 'max';
export interface HeadphoneOptions { color?: HeadphoneColor; shell?: HeadphoneShell; }
export function createHeadphone(opts?: HeadphoneOptions): SVGSVGElement;
export function updateHeadphone(svg: SVGSVGElement, opts: HeadphoneOptions): void;
export function setExplode(svg: SVGSVGElement, t: number): void; // 0 montado … 1 explodido
```

**Cores do fone (store.COLORS):** grafite `{body:#2b3038, deep:#161a20, hi:#8a93a3}` · lunar `{body:#e6e2d8, deep:#b9b4a6, hi:#ffffff}` · cobre `{body:#b4693b, deep:#6e3b1c, hi:#e8a56c}` · aurora `{body:#3f7d6b, deep:#1e4238, hi:#8fd8be}`.
**Conchas (store.SHELLS):** compact `{delta:-100, scale:0.92}` · standard `{delta:0, scale:1}` · max `{delta:+200, scale:1.08}`.

## 6. Hooks do index.html (contrato DOM)

Global: `[data-header]`, `[data-theme-toggle]`, `[data-orbit-progress]`, `.theme-veil`, `.grain`.
Por seção (markup já existe — os módulos **hidratam**, não criam estrutura):
- hero: `#hero`, `[data-hero-canvas]`, `[data-hero-enter]` (ordem de entrada), `[data-depth]`, `[data-headphone-slot="hero"]`
- scrolly: `[data-scrolly]`, `[data-scrolly-sticky]`, `[data-scrolly-hp]`, `[data-headphone-slot="scrolly"]`, `[data-anc-canvas]`, `[data-step="0|1|2"]`, `[data-part-label]`, `[data-scrolly-progress]`, `[data-scrolly-bar]`, `[data-scrolly-num]`
- configurador: `[data-configurator]`, `[data-headphone-slot="config"]`, `[data-color]`, `[data-shell]`, `[data-price]`, `[data-config-cta]`
- features: `[data-features]`, `[data-feature]`
- depoimentos: `[data-marquee]`, `[data-marquee-track]`
- faq: `[data-faq]`, `[data-faq-item]`, `[data-faq-button]`, `[data-faq-panel]`
- final: `[data-headphone-slot="final"]`, `[data-final-summary]`, `[data-final-cta]` (com `[data-magnetic]`)
- Cada seção exporta `mount<Name>(): void` e importa seu CSS (`import './hero.css'`).

## 7. Regras de implementação (valem para todos os módulos)

1. **PROIBIDO** qualquer dependência nova — `package.json` já está fechado (só vite + typescript, devDeps). Nada de GSAP/Framer/Three/shadcn.
2. Animações contínuas apenas com `transform`/`opacity`/`clip-path`/`filter`.
3. Toda animação decorativa respeita `prefers-reduced-motion` (CSS: media query em `base.css`; JS: `prefersReducedMotion()`).
4. Comentários e copy em PT-BR; código limpo, TS strict passando.
5. Não editar `index.html`, `main.ts`, `tokens.css` nem arquivos de outras seções; hidratar os hooks existentes.
6. Verificação: `npx tsc --noEmit` limpo para os arquivos criados (rodar após `npm install` já concluído na raiz).

## 8. Ordem de implementação

1. **Fundação (este documento + scaffold):** tokens, index.html, configs — feito.
2. **Fase 1 (paralela):** (a) `lib/*` + `base.css`; (b) `product/headphone.ts` — o fone, peça central do visual.
3. **Fase 2 (paralela, 6 fatias):** hero, scrolly, configurador, features+faq, depoimentos, chrome+cta.
4. **Integração:** `main.ts` monta tudo; `npm run build` até passar sem erro.
5. **QA:** auditoria visual (Playwright) em desktop/mobile/claro/escuro + checklist do PROMPT.md.
6. `README.md`.
