# PLANO — ÓRBITA · Experiência Frontend Imersiva

> Escrito ANTES do código, conforme exigido pelo PROMPT.md.

## 1. Framework — Vite + TypeScript vanilla

1. **Orçamento de JS trivialmente vencido**: zero runtime de framework — o bundle inteiro fica em ~20 KB gzip contra o teto de 200 KB, e cada byte enviado existe por mérito próprio.
2. **Controle de frame absoluto**: scroll-scrubbing a 60 fps exige que nada (reconciler, scheduler) se interponha entre o `scroll` e o pixel — rAF/WAAPI puros operam direto no compositor.
3. **Componentização sem muleta**: módulos ES + um store pub/sub de ~40 linhas + CSS por seção provam a engenharia crua que o desafio mede, sem abstração pronta.

## 2. Arquitetura de pastas

```
qwen-flashsub/
├── index.html                 # marcação semântica completa + copy (nada gerado por JS)
├── package.json / vite.config.ts / tsconfig.json
├── PLANO.md / README.md / PRD.md / PROMPT.md
└── src/
    ├── main.ts                # importa CSS + seções, boot
    ├── lib/
    │   ├── store.ts           # estado do configurador (pub/sub)
    │   ├── theme.ts           # tema claro/escuro + reveal circular (View Transitions)
    │   ├── raf.ts             # ticker rAF compartilhado + lerp/clamp/smoothstep
    │   ├── motion.ts          # flag prefers-reduced-motion
    │   ├── reveal.ts          # IntersectionObserver [data-reveal]
    │   └── odometer.ts        # preço com rolagem de dígitos
    ├── components/
    │   ├── headphone.ts       # SVG do fone, parametrizado (cor, tamanho, explode, tilt)
    │   ├── orbit-canvas.ts    # partículas orbitais (Canvas 2D)
    │   ├── marquee.ts         # loop infinito + pausa hover + drag
    │   ├── accordion.ts       # FAQ (grid-rows, teclado, ARIA)
    │   ├── tilt-card.ts       # tilt + glow nos cards
    │   └── magnetic.ts        # botão magnético + ripple WAAPI
    ├── sections/
    │   ├── nav.ts  hero.ts  story.ts  configurator.ts
    │   ├── features.ts  voices.ts  faq.ts  finale.ts
    └── styles/
        ├── tokens.css  base.css
        └── nav.css hero.css story.css configurator.css
            features.css voices.css faq.css finale.css
```

**Regra de integração**: o `index.html` carrega TODA a marcação e copy; os módulos TS apenas anexam comportamento aos seletores existentes. Cada seção tem seu CSS com prefixo próprio (`.hero__*`, `.story__*`…), eliminando colisão entre módulos.

## 3. Sistema de design

### Direção de arte — "Mecânica Celeste"
O ÓRBITA não é um gadget; é um instrumento de precisão que cria um campo gravitacional privado de som. Linguagem visual: diagramas de mecânica orbital, metal aquecido por luz solar, vácuo profundo — **não** o dark-neon genérico de SaaS. Dois acentos (cobre quente + gelo frio) em vez de um neon único; superfícies foscas, linhas de diagrama técnico, tipografia display larga.

### Paleta (tokens)
| Token | Dark | Light | Uso |
|---|---|---|---|
| `--bg` | `#0A0C12` | `#F4F1EA` | fundo base |
| `--bg-2` | `#0E1119` | `#ECE8DD` | fundo alternado de seção |
| `--surface` | `#141824` | `#FFFFFF` | cards |
| `--line` | `rgba(237,234,227,.10)` | `rgba(20,22,28,.12)` | bordas/diagramas |
| `--ink` | `#EDEAE3` | `#14161C` | texto primário |
| `--ink-2` | `#9BA0AD` | `#5A5F6B` | texto secundário |
| `--copper` | `#E8A15C` | `#B4622D` | acento primário (ação, metal) |
| `--copper-hi` | `#F5C088` | `#C97A3E` | hover/brilho |
| `--ice` | `#8FD8D0` | `#2E7D74` | acento secundário (campo ANC, órbitas) |
| `--glow` | `rgba(232,161,92,.14)` | `rgba(180,98,45,.10)` | halos |

Contraste AA verificado: `--ink` sobre `--bg` ≈ 15:1; `--copper` sobre `--bg` ≈ 7.5:1; light theme idem com cobre escurecido.

### Tipografia (Google Fonts, `display=swap` + preconnect)
- **Unbounded** 500/700 — display (H1/H2, preço). Geométrica, larga, orbital.
- **Instrument Sans** 400/500/600 — corpo e UI.
- **Space Mono** 400/700 — eyebrows, specs, labels técnicos, numeração de etapas.

Escala fluida: `--fs-h1: clamp(3rem, 9vw, 7rem)` · `--fs-h2: clamp(2rem, 4.5vw, 3.5rem)` · `--fs-h3: 1.375rem` · `--fs-body: 1.0625rem` · `--fs-small: .875rem` · `--fs-micro: .72rem` (mono, uppercase, tracking .18em).

### Espaçamento
Base 4 px: `--sp-1..--sp-12` (4/8/12/16/24/32/48/64/96/128). Gutters de seção: `--section-pad: clamp(4.5rem, 10vw, 8.5rem)`. Container: `--container: 1200px`.

### Movimento (tokens)
- Durações: `--dur-1: 150ms` (micro) · `--dur-2: 300ms` (padrão) · `--dur-3: 600ms` (seção) · `--dur-4: 1000ms` (orquestração).
- Easings autorais: `--ease-out: cubic-bezier(.16,1,.3,1)` · `--ease-in-out: cubic-bezier(.83,0,.17,1)` · `--ease-spring: cubic-bezier(.34,1.56,.64,1)`.
- Regra de performance: animações contínuas usam exclusivamente `transform`/`opacity`/`clip-path`/`filter`. Scrubbing seta **uma** custom property (`--story-p`) e o CSS deriva os transforms via `calc()` — uma escrita de estilo por frame.

## 4. Estratégia técnica por seção

### 4.1 Hero
- Entrada orquestrada: letras do título entram em stagger com trajetória em arco (`translateY` + `rotate` por letra, delay escalonado), depois subtítulo, CTAs, e o fone escala de baixo com os anéis orbitais "desenhando" (`stroke-dashoffset`).
- Movimento contínuo: `orbit-canvas.ts` (partículas em órbitas elípticas ao redor do fone, Canvas 2D, DPR-aware, pausa com `IntersectionObserver`/`visibilitychange`) + anéis SVG tracejados em rotação lenta + flutuação sutil do fone.
- Detalhe-assinatura: o ponto do "Ó" de ÓRBITA é um satélite que orbita a letra continuamente.
- Paralaxe de mouse: camadas (canvas, anéis, fone, chips) com fatores distintos, interpoladas no ticker rAF; desligado em touch e `prefers-reduced-motion`.

### 4.2 Scroll-telling ("Como funciona")
- Trilho de 400 vh com palco `position: sticky` de 100 vh.
- Scrubbing real: `p = clamp((scrollY - top) / (height - vh))`, suavizado por `lerp(p, .12)` no ticker, publicado em `--story-p`.
- 4 etapas: (1) **A concha** — fone íntegro, leve rotação; (2) **O driver** — vista explodida (cushions, conchas e driver se separam ao longo do eixo, driver ganha anel de destaque); (3) **O campo** — remontagem + anéis ANC pulsando em ondas; (4) **A órbita** — produto completo com anéis orbitais + link para o configurador.
- Explode = curva de sino sobre `p` (`smoothstep` de subida e descida) aplicada via `hp.setExplode(t)`; textos com `opacity/transform` por janela de progresso; trilho lateral com 4 pontos de estágio.

### 4.3 Configurador
- Estado em `store.ts`: `{ colorway, size }` → preço derivado. Pub/sub; CTA final assina o mesmo store.
- 4 cores (Grafite, Marfim, Solar +R$ 150, Abissal) trocam **CSS custom properties do SVG** (`--hp-shell`, `--hp-cushion`, `--hp-metal`, `--hp-glow`) com transição de 600 ms — o próprio fone anima a cor.
- 2º atributo: concha Padrão vs. Studio (+R$ 300, escala visível das conchas via `--hp-scale`).
- Preço em odômetro: coluna de dígitos translada `translateY(-d × 1em)` com `--ease-out` 600 ms.
- CTA espelhado: "Comprar ÓRBITA — Grafite · R$ 2.499", atualizado a cada mudança.

### 4.4 Features
- 6 cards, ícones SVG autorais traço-cobre (ondas ANC, waveform, bateria-orbital, multiponto, contorno de espuma, modo ambiente).
- Micro-interação: tilt 3-D (`--rx/--ry` máx. 6°) + brilho radial que segue o ponteiro (`--mx/--my`) + micro-animação do ícone no hover; desligado em touch/reduced.
- Entrada stagger por scroll via `reveal.ts`.

### 4.5 Depoimentos
- Marquee autoral: trilha duplicada, posição = `(x + v·dt) % meiaLargura` no ticker (loop sem emenda).
- Pausa em hover com desaceleração suave (lerp da velocidade); drag com pointer events + inércia na soltura.
- Reduced motion: vira trilho com scroll horizontal nativo.

### 4.6 FAQ
- Altura animada pelo truque `grid-template-rows: 0fr → 1fr` (transição suave, sem medir `height` em JS).
- Teclado: `↑/↓/Home/End` movem foco entre botões, `Enter/Espaço` nativos; `aria-expanded`, `aria-controls`, `role=region` com label do título.

### 4.7 CTA final + rodapé
- Assina o store: fone na cor escolhida (mesmo `headphone.ts`) + preço + rótulo do CTA sincronizados.
- Botão magnético (translada até 30% da distância do ponteiro, mola na saída) + ripple via WAAPI no clique.
- Rodapé: logo, navegação, nota "produto conceito", sem peso visual.

## 5. Transversais

### 5.1 Tema claro/escuro
- Inicial: `localStorage['orbita-theme']` → senão `prefers-color-scheme` → senão dark.
- Toggle com **reveal circular**: `document.startViewTransition()` + `clip-path: circle()` ancorado no botão (coords em `--vt-x/--vt-y`); fallback = cross-fade CSS de 300 ms. `::view-transition` estilizado à mão.
- `meta[name=theme-color]` atualizado; todos os tokens têm variante light com contraste AA.

### 5.2 Acessibilidade
- `prefers-reduced-motion`: `motion.ts` expõe flag; canvas vira frame estático, paralaxe/tilt/magnético/marquee-auto desligam, scrubbing perde a suavização (resposta direta), entradas viram fade mínimo. Kill-switch global em CSS.
- Foco visível autoral: anel duplo (`outline` cobre + offset) em `:focus-visible`.
- Landmarks (`header/nav/main/section[aria-labelledby]/footer`), hierarquia h1→h3, `alt`/`aria-label` em tudo que importa.

### 5.3 Responsivo
- 360 px: coluna única, título ~3 rem, marquee drag-first, configurador empilhado (produto acima).
- 768 px: grids 2 colunas, story com texto sobreposto inferior.
- 1280 px+: layouts assimétricos completos, paralaxe ativo.
- Touch: drag no marquee, swipe não conflita com scroll vertical (`touch-action: pan-y`).

### 5.4 Performance
- Uma escrita de estilo por frame no scrub; só `transform/opacity`; canvas com `alpha: true` e limite de DPR em 2; fontes com `font-display: swap` + preconnect; zero CLS (dimensões reservadas).

## 6. Ordem de implementação
1. **Scaffold** — Vite/TS config, `index.html` completo (marcação + copy), tokens/base, libs core (store, raf, motion, theme, reveal, odometer), nav.
2. **Núcleo visual** — `headphone.ts` (SVG parametrizado) e `orbit-canvas.ts`.
3. **Seções em paralelo** — hero · story · configurador · features+vozes+faq · finale.
4. **Integração e auditoria** — build, QA visual, polish de coreografia, README.

## 7. Criatividade extra (além do pedido)
1. Satélite orbitando a letra "Ó" do título — assinatura literal do nome.
2. Indicador de progresso do scroll = satélite completando uma órbita no logo do nav.
3. Troca de tema por eclipse (reveal circular) via View Transitions.
4. Odômetro mecânico no preço.
5. "Diagrama técnico" no scroll-telling: linhas de cota e labels mono surgem na vista explodida.
