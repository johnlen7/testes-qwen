# PLANO — ÓRBITA · Landing imersiva

## Framework

**Vanilla JS + Vite.** Zero runtime de framework → JS enviado ao cliente fica em ~20KB gzip (meta: ≤ 200KB), controle total sobre cada animação escrita à mão (exigência do desafio), e uma SPA de rota única não justifica o peso de React/Svelte. Componentização via módulos ES + um store pub/sub de 30 linhas. Vite entrega dev server e build estático sem configuração.

## Arquitetura de pastas

```
qwen-flash/
├── index.html            # Toda a semântica das 7 seções (IDs/classes canônicos)
├── package.json / vite.config.js
├── PLANO.md / README.md
├── public/favicon.svg
└── src/
    ├── main.js           # Boot: injeção do tema anti-FOUC + init dos módulos
    ├── js/
    │   ├── store.js      # Estado compartilhado (cor, equalização, tema) com pub/sub
    │   ├── utils.js      # easing autorais, rAF loop, reducedMotion, count-up
    │   ├── headphones.js # Fábrica do SVG do fone (parametrizável: cor, modo, explode)
    │   └── sections/     # Um módulo por seção, auto-init se o elemento existe
    │       ├── hero.js  scrolltelling.js  configurator.js
    │       ├── features.js  marquee.js  faq.js  cta.js  theme.js
    └── styles/
        ├── tokens.css    # Paleta, tipografia, espaço, duração, easing
        ├── base.css      # Reset, tipo base, focus visible autoral, reduced-motion
        ├── theme.css     # Claro/escuro + transição (View Transitions)
        └── sections/     # hero.css scrolltelling.css configurator.css
                          # features.css testimonials.css faq.css cta.css
```

## Sistema de design — "Instrumento orbital de áudio"

O ÓRBITA é tratado como um instrumento de precisão (relógio de luxo / mesa de som hi-fi) em órbita — não como "gadget espacial genérico".

### Paleta — Observatório noturno

| Token | Dark | Light | Uso |
|---|---|---|---|
| `--bg-0` | `#05060A` | `#E9EBF0` | fundo raiz |
| `--bg-1` | `#0A0C13` | `#F6F7FA` | superfície |
| `--bg-2` | `#11141E` | `#FFFFFF` | elevada |
| `--line` | `#1E2330` | `#D6DAE3` | hairlines |
| `--text-1` | `#F2F3F7` | `#15171D` | texto primário |
| `--text-2` | `#A4AAB9` | `#565D70` | texto secundário |
| `--accent` | `#FF7A45` | `#C94A1B` | cobre (CTA, anel, foco) |
| `--accent-2` | `#E8B44A` | `#8A5A00` | dourado (ticks, dados) |
| `--glow` | `rgba(255,122,69,.28)` | `rgba(201,74,27,.16)` | brilho do anel |

Cobre quente em vez de ciano/roxo — remete a áudio hi-fi, foge do "tech template". Tema claro é perolado frio ("lua"), não cream.

### Tipografia

- **Display: Unbounded** (Google Fonts, pesos 400/600/800) — wide, técnica, espacial; usada só em headlines e números (restrição).
- **Body: Space Grotesk** (400/500/700) — geométrica, combina com a display; labels técnicos com `letter-spacing` e `tabular-nums`.
- Escala fluida via `clamp()`: 13→16 corpo, 18→24 sub, 28→44 seção, 44→88 display. `font-display: swap`.

### Espaço, duração, easing

- Espaçamento: escala 4px (4/8/12/16/24/32/48/64/96/128); grid 12 col, max 1200px, gutter 24.
- Durações: 90 / 150 / 300 / 600 / 900 ms.
- Easing autorais: `--e-out` `cubic-bezier(.25,1,.5,1)` · `--e-expo` `cubic-bezier(.16,1,.3,1)` · `--e-spring` `cubic-bezier(.34,1.56,.64,1)` · `--e-io` `cubic-bezier(.65,0,.35,1)`.

### Assinatura (elemento memorável)

**Anel de Ressonância**: um anel fino de escala (ticks de mostrador de instrumento) que orbita o fone no hero e no scroll-telling. Gira continuamente, responde ao mouse com leve inclinação, e no scroll-telling vira o "eixo" da explosão do produto — as camadas do fone saem radialmente dele. Tudo o mais fica quieto e disciplinado em volta.

## Estratégia técnica por seção

| Seção | Técnica |
|---|---|
| **Hero (4.1)** | Entrada staggered por CSS (delays escalonados, `animation` com `--e-expo`); órbitas em `keyframes` (rotação de wrapper, só `transform`); paralaxe/mouse via rAF + `translate3d` com `media (hover:hover)` (desligado em touch); particulas de poeira de luz em SVG com drift lento. |
| **Scroll-telling (4.2)** | Contêiner `height: 400vh` + `position: sticky` stage (altura real definida — lição do build minimax: altura zero mata o scrub). Scrub JS com `requestAnimationFrame`: `progress = (scrollY - top) / (height - vh)`, clamp 0–1, atualiza só `transform/opacity/clip-path`. 4 etapas: **concha → driver → espuma → núcleo**, o fone explode radialmente a partir do Anel de Ressonância com callouts "blueprint" (freq, dB). Texto das etapas em `opacity` cruzado por faixa de progresso. Sem lib: rAF nativo. |
| **Configurador (4.3)** | 5 cores (Grafite, Prata, Cobre, Meia-noite, Perolado) + 4 modos de equalização (Equilibrado, Quente, Grave+, Aéreo) que mudam a cor do LED e a curva do equalizador. Transição de cor do produto com **wipe circular** (`clip-path: circle()` animado) + rotação sutil. Preço com count-up rAF + easing (base R$ 2.499; modo Pro soma R$ 300). CTA reflete estado via store. |
| **Features (4.4)** | 5 cards: tilt 3D no hover (rAF + `perspective`), glow spotlight (gradiente radial seguindo o mouse via custom props), ícones SVG autorais com desenho de stroke no hover. Entrada staggered via IntersectionObserver. |
| **Depoimentos (4.5)** | Marquee infinito autoral: conteúdo duplicado, `translateX` em `keyframes`, pausa em hover (`animation-play-state`), drag por pointer events (delta aplicado com rAF; ao soltar retoma o loop sem salto). Duas faixas em direções opostas. |
| **FAQ (4.6)** | Accordion com animação de altura via `grid-template-rows: 0fr ↔ 1fr` (sem hack de max-height; `overflow:hidden` no filho). Teclado: setas (roving tabindex), Enter/Espaço, `aria-expanded`/`aria-controls` sincronizados. |
| **CTA final (4.7)** | Produto re-renderizado na cor escolhida (estado compartilhado). Botão magnético (rAF spring em direção ao cursor) + ripple no click. Rodapé coerente com hairlines. |

## Requisitos transversais

- **Tema (5.2)**: `prefers-color-scheme` como padrão (CSS puro via `color-scheme: light dark` + custom props por media query); toggle com **View Transitions API** (`document.startViewTransition` com reveal circular `clip-path`) e fallback de troca direta; escolha persistida em `localStorage` por script inline anti-FOUC no `<head>`.
- **Reduced motion (5.3)**: media query global zera animações contínuas; JS lê `matchMedia` e troca scrub→estado estático, marquee→estático, órbita→parada. Conteúdo sempre legível.
- **Responsivo (5.4)**: mobile-first; 360px (empilha, fone menor, config em coluna), 768px (2 col), 1280px+ (grade cheia); parallax e tilt desligados em touch (`hover:none`/`pointer:coarse`).
- **Performance (5.5)**: apenas `transform/opacity/clip-path/filter` em loops; `will-change` pontual; zero dependências runtime; fontes com `font-display: swap` + preload.

## Ordem de implementação

1. PLANO.md (este) → 2. scaffold Vite + tokens/base/theme + store/utils → 3. SVG do fone (fábrica) → 4. index.html com as 7 seções → 5. hero → 6. scroll-telling → 7. configurador → 8. features + marquee → 9. FAQ + CTA + footer → 10. tema + reduced-motion + responsivo → 11. `npm run build` + verificação visual (screenshots mid-scroll) + review → 12. README.md.

## Risco principal

Scroll-telling morto por altura zero (aconteceu no minimax na rodada anterior). Mitigação: contêiner com `height: 400vh` explícito no CSS e verificação visual **obrigatória em mid-scroll** com screenshot antes de encerrar.
