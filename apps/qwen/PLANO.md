# PLANO — ÓRBITA · Experiência Frontend Imersiva

> Escrito antes de qualquer código, conforme exigido pelo PROMPT.md.

---

## 1. Framework e justificativa

**Vanilla TypeScript + Vite.** Três razões: (1) o desafio mede capacidade crua de escrever animação e componentes à mão — um runtime de framework seria peso morto e abstração sobre o próprio DOM que preciso controlar; (2) o orçamento de JS ≤ 200KB gzip vira consequência trivial, não meta suada; (3) Vite entrega dev server com HMR e `vite build` com saída 100% estática, satisfazendo o requisito de build sem adicionar opinião arquitetural.

Estado compartilhado (configurador → CTA final) é resolvido com um micro-store pub/sub de ~20 linhas — reatividade sem framework.

---

## 2. Arquitetura de pastas

```
qwen/
├── index.html               # página única, landmarks semânticos, script anti-FOUC de tema
├── package.json             # vite + typescript apenas
├── vite.config.ts
├── src/
│   ├── main.ts              # bootstrap: registra todos os módulos de seção
│   ├── lib/
│   │   ├── store.ts         # createStore<T> genérico (pub/sub)
│   │   ├── raf.ts           # scheduler rAF único + lerp/clamp/damp helpers
│   │   └── media.ts         # matchMedia reativos (reduced-motion, touch)
│   ├── sections/
│   │   ├── hero.ts          # parallax + entrada orquestrada
│   │   ├── orbits.ts        # canvas 2D — campo de partículas orbitais
│   │   ├── scrolltell.ts    # scrubbing rAF → CSS vars de progresso
│   │   ├── configurator.ts  # cores, modo, preço, store do produto
│   │   ├── features.ts      # tilt + glow + reveal stagger
│   │   ├── testimonials.ts  # marquee infinito com drag
│   │   ├── faq.ts           # accordion acessível
│   │   ├── cta.ts           # botão magnético + consumo do store
│   │   └── theme.ts         # toggle + View Transition circular reveal
│   ├── components/
│   │   └── headphone.ts     # fábrica do SVG do fone (usada 3× na página)
│   └── styles/
│       ├── tokens.css       # design system completo
│       ├── base.css         # reset, tipografia, focus, seleção, layout
│       ├── hero.css
│       ├── scrolltell.css
│       ├── configurator.css
│       ├── features.css
│       ├── testimonials.css
│       ├── faq.css
│       ├── cta.css
│       └── theme.css        # toggle de tema + view-transition
├── PLANO.md  README.md  PRD.md  PROMPT.md
```

---

## 3. Sistema de design

### Paleta (2 temas, contraste AA)

| Token | Dark (padrão) | Light |
|---|---|---|
| `--bg` | `#07080c` (espaço profundo) | `#f2efe8` (papel quente) |
| `--bg-elevated` | `#0d0f16` | `#ffffff` |
| `--ink` | `#e9eaf1` | `#15171d` |
| `--ink-muted` | `#8d90a3` | `#5c6070` |
| `--line` | `#22253180` | `#15171d1a` |
| `--accent` | `#ff5c1a` (flare solar) | `#d9420a` |
| `--accent-2` | `#57e6c0` (ion — só HUD/dados) | `#0c7a63` |

Direção: laranja solar sobre preto-espacial, teal ionizado apenas como cor de instrumento (readouts de HUD, linhas de cota do exploded view). Foge deliberadamente do gradiente roxo/azul "template SaaS".

### Tipografia

- **Display:** Syne 700/800 — geométrica com excentricidade nos terminais; voz de estúdio, não de template.
- **Texto:** Inter 400/500/600 — leitura impecável.
- **Mono/HUD:** Space Mono 400/700 — micro-labels, preços, telemetria ("Ø 40mm · ANC 3.2").

Escala fluida: `--fs-display: clamp(2.75rem, 7vw, 5.5rem)` etc. `font-display: swap` + `preconnect` no Google Fonts.

### Espaçamento

Base 4px, escala `--sp-1..--sp-12` (4→96). Padding de seção fluido: `clamp(5rem, 10vw, 9rem)`. Container: `min(72rem, 100% - clamp(2rem,6vw,4rem))`.

### Motion tokens

| Token | Valor | Uso |
|---|---|---|
| `--t-instant` | 150ms | hover, press, toggles pequenos |
| `--t-base` | 300ms | reveals, acordeão, transições de estado |
| `--t-slow` | 600ms | troca de cor do produto, tema |
| `--t-cinema` | 1200ms | entrada do hero, transições narrativas |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | tudo que "chega" (expo-out) |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | loops, marquee reverso |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | overshoot físico (botões, cards) |
| `--ease-scrub` | linear via rAF | scrubbing é dirigido, não easeado |

Física: entradas = expo-out (rápido, assenta suave); interação = spring com overshoot ~8%; scrubbing = mapeamento direto scroll→transform (o usuário é o easing).

---

## 4. Estratégia técnica por seção

### 4.1 Hero
- **Entrada orquestrada:** keyframe único `rise` (translateY+opacity+blur→0) aplicado com `--delay` crescente por elemento (`--d: 1..6`), disparado no load via classe `.is-loaded`. Blur animado só na entrada (não contínua).
- **Movimento contínuo:** canvas 2D — partículas em órbitas elípticas ao redor do fone (coerente com "ÓRBITA"), brilho aditivo, velocidade angular ∝ 1/raio. Loop rAF com `dt`. DPR capped em 2.
- **Parallax:** pointer move → alvo normalizado [-1,1]; rAF com `damp()` aplica `translate3d` em camadas (visual: forte, texto: fraco, canvas: médio). Desligado em `pointer: coarse` e reduced-motion.

### 4.2 Scroll-telling ("como funciona")
- Container `.track` de **320vh** com `.stage` em `position: sticky; top:0; height:100vh`.
- Scroll listener passivo + rAF: `p = clamp((scrollY - trackTop) / (trackH - vh), 0, 1)`. Publica `--p` na stage; JS também aplica transform diretos nos grupos do SVG.
- **3 etapas com scrubbing real:**
  1. `0 → ⅓` **Órbita fechada** — fone rotaciona (rotateY simulado via scaleX + skew de camadas) e escala respira; texto "Adaptive Spatial ANC".
  2. `⅓ → ⅔` **Vista explodida** — grupos do SVG (concha, driver, arco, almofada) se afastam por eixo próprio, linhas de cota + labels mono aparecem com `clip-path`.
  3. `⅔ → 1` **Campo de cancelamento** — ondas SVG concêntricas nascem e um waveform de ruído é achatado por `p` (metáfora do ANC); readout "−42 dB" conta junto.
- Textos das 3 etapas: opacity/translate derivados de sub-progresso (triângulo de visibilidade por etapa). Só `transform`/`opacity`/`clip-path`.

### 4.3 Configurador
- **Store compartilhado** (`store.ts`): `productStore = { color, mode, price }`, `subscribe(fn)`. Hero-visual, configurador e CTA final assinam.
- **4 cores:** Grafite `#2a2d34`, Areia Lunar `#d8cfc0`, Azul Abissal `#1d3a5f`, Flare `#ff5c1a`. Cor = CSS vars (`--hp-shell`, `--hp-cushion`, `--hp-ring`) no wrapper do SVG; `transition: fill 600ms` nas partes (fill transiciona via `transition` no elemento SVG).
- **Atributo 2 — Modo de som:** Estúdio (flat, anel EQ discreto) vs Imersivo (+R$ 300, anel de partículas ativo, waveform no shell). Muda visual + preço.
- **Preço com count-up:** dígito-rolô — cada dígito é uma coluna com strip `0–9`, `translateY` easeado ao valor alvo. Mais premium que contador numérico e não regride (só sobe/desce ao dígito certo).
- **CTA refletido:** botão assina o store → "Comprar ÓRBITA Grafite · R$ 2.499".

### 4.4 Features
- 6 cards, ícones SVG autorais (ANC, 40h bateria, driver Ø40, spatial, USB-C, low-latency).
- **Micro-interação:** tilt 3D — pointer local → `--rx/--ry` (máx 6°), rAF damp; brilho radial em `--mx/--my` via `background: radial-gradient`; ícone desenha traço (`stroke-dashoffset`) no primeiro hover.
- **Reveal:** IntersectionObserver adiciona `.in`; delay `calc(var(--i) * 70ms)`.

### 4.5 Depoimentos
- Marquee **dirigido por rAF** (não keyframe): `x -= v·dt`, wrap em `-50%` com conteúdo duplicado → loop sem emenda.
- Pausa em hover/focus-within; **drag** com Pointer Events: captura, segue o dedo, ao soltar devolve velocidade (inércia simples). Acessível: `role="region"`, teclado alcança cards (pausa automática em focus).

### 4.6 FAQ
- Altura animada sem `height:auto`: `display:grid; grid-template-rows: 0fr → 1fr` + `overflow:hidden` no interno. Transição de `grid-template-rows` é interpolável e barata (compositor-friendly na prática, sem thrash de layout global).
- Teclado: padrão accordion WAI-ARIA — `Enter/Space` toggle, `↑↓` navega, `Home/End` pontas; `aria-expanded`, `aria-controls`, `id` nos painéis, headers são `<button>`.

### 4.7 CTA final + rodapé
- Fone em miniatura + headline assinam o `productStore` → seção de fechamento sempre na cor/modo configurados (estado compartilhado exigido).
- **Botão magnético:** raio 140px; dentro dele o botão translada até 30% da distância ao cursor com damp; saída = spring de volta. Click = ripple autoral (anel em `clip-path: circle()` crescente).
- Rodapé: marca, links, "missão" mono com número de série fictício, toggle de tema espelhado.

---

## 5. Estratégia transversal

### 5.1 Motion
Scheduler rAF **único** (`raf.ts`) com lista de callbacks — um frame, N animações. Só `transform/opacity/clip-path/filter` em loop. Scroll listener passivo. `will-change` apenas nos elementos do scrub/parallax, removível após entrada.

### 5.2 Tema
- Script inline no `<head>` antes do CSS (anti-FOUC): `localStorage['orbita-theme']` → senão `matchMedia(prefers-color-scheme)` → `data-theme` no `<html>`.
- Toggle: **View Transition API** — `document.startViewTransition` + `clip-path: circle()` expandindo do botão (reveal circular). Fallback: transição CSS de cores em 600ms. Persiste escolha.

### 5.3 Acessibilidade
- `prefers-reduced-motion: reduce` → CSS mata keyframes/loops (partículas viram estáticas, marquee vira scroll-x nativo com snap), JS pula parallax/drag-inércia/count-up (set instant)/scrub (snap por etapa com fade).
- Skip link, landmarks (`header/main/nav/section[aria-labelledby]/footer`), hierarquia h1→h2→h3, `:focus-visible` autoral (anel accent 2px + offset), `aria-label` em canvas/controles, alt em tudo que é conteúdo.

### 5.4 Responsivo
- **360:** coluna única, hero empilhado, scroll-telling com texto sobre a stage (overlay inferior), features 1 col, marquee full-bleed.
- **768:** features 2 col, configurador em 2 colunas, tipografia no meio da escala fluida.
- **1280+:** scroll-telling split (texto esquerda / visual sticky direita), features 3 col, hero com órbita larga.
- Touch: parallax vira giroscópio-leve desligado (nada de hover-dependente essencial — toda informação de hover tem estado base equivalente).

### 5.5 Performance
Sem dependências runtime. Fontes com swap+preconnect. Canvas DPR≤2 e pausado fora do viewport (IntersectionObserver). JS final projetado: < 30KB gzip (meta interna muito abaixo dos 200KB). Zero CLS: dimensões reservadas (aspect-ratio nos visuais, min-height no hero).

---

## 6. Ordem de implementação

1. Scaffold Vite + TS + index.html (landmarks, head com fontes/anti-FOUC).
2. `tokens.css` + `base.css`.
3. `headphone.ts` (SVG paramétrico — dependência de hero, scrolltell, configurador, cta).
4. Hero + `orbits.ts` + parallax.
5. Scroll-telling (o mais arriscado — cedo).
6. `store.ts` + configurador (count-up, cores, modos).
7. Features.
8. Depoimentos.
9. FAQ.
10. CTA final + rodapé.
11. Tema (View Transition).
12. Passo a11y + reduced-motion + responsivo.
13. `npm run build` verde → README → autoavaliação contra o checklist.

---

## 7. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Scrubbing com jank | rAF único, leitura de `getBoundingClientRect` cacheada por resize/scroll com `IntersectionObserver` + cálculo de offset só quando necessário, transforms compostos. |
| SVG do fone "feio" | construção por primitivas geométricas intencionais (arcos grossos, gradientes sutis, sombra de contato) — estilo "blueprint premium", não tentativa de foto. |
| View Transition em navegador sem suporte | feature-detect; fallback cross-fade já é animação válida. |
| `grid-template-rows` sem suporte (antigo) | fallback `max-height` em `@supports not`. |
