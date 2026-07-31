# PLANO — ÓRBITA X1

> Plano escrito **antes** do código, conforme o PROMPT.md. Cada decisão abaixo tem razão explícita ligada à rubrica (seção 8 do PRD).

---

## 1. Escolha de framework — e justificativa (3 linhas)

**Vite + TypeScript vanilla.** O scroll-telling (4.2) exige scrubbing frame-a-frame com manipulação direta do DOM via `requestAnimationFrame` — um framework re-renderizador (React/Vue) adicionaria fricção e risco de jank exatamente onde o desafio mais pesa. Zero runtime de framework mantém o JS enviado muito abaixo do teto de 200KB gzip, e `vite build` gera saída estática pura.

## 2. Arquitetura de pastas

```
flash/
├── PLANO.md / README.md / PRD.md / PROMPT.md
├── index.html              — markup semântico das 7 seções (SSR-free, estático)
├── package.json / tsconfig.json / vite.config.ts
└── src/
    ├── main.ts             — boot: tema → módulos → build do SVG do fone → mãos ao trabalho
    ├── styles/
    │   ├── tokens.css      — paleta, tipografia, espaçamento, tokens de motion
    │   ├── base.css        — reset, typography utilitária, foco visível autoral, scrollbar
    │   ├── nav.css         — header fixo + toggle de tema (reveal circular)
    │   ├── hero.css        — entrada orquestrada, órbitas, paralaxe
    │   ├── story.css       — scroll-telling pinado
    │   ├── config.css      — configurador
    │   ├── features.css    — grade com tilt/glow
    │   ├── marquee.css     — carrossel infinito
    │   ├── faq.css         — accordion
    │   ├── cta.css         — fechamento + footer
    │   └── responsive.css  — breakpoints intencionais 360/768/1280
    └── js/
        ├── motion.ts       — easings, lerp, smoothstep, helper seq(), rAF loop, RM check
        ├── store.ts        — estado compartilhado (cor, modo, preço) + subscribers
        ├── theme.ts        — prefers-color-scheme + localStorage + transição circular
        ├── headphone.ts    — builder do SVG do fone (parts, colorways, modos)
        ├── starfield.ts    — canvas de partículas (céu profundo) com paralaxe
        ├── hero.ts         — coreografia de entrada + órbita contínua + mouse parallax
        ├── story.ts        — scrubbing do scroll-telling (4 etapas, pin 420vh)
        ├── config.ts       — configurador: swatches, modos, count-up, CTA
        ├── features.ts     — IO reveal com stagger + tilt 3D por CSS vars
        ├── marquee.ts      — loop infinito WAAPI + pause hover + drag com física
        ├── faq.ts          — accordion com height via WAAPI + roving tabindex
        ├── cta.ts          — CTA final magnético + toast + footer
        ├── cursor.ts       — follower de órbita (pointer:fine, RM-safe)
        └── toast.ts        — notificação de pré-pedido
```

## 3. Sistema de design

### 3.1 Direção de arte
"**Instrumento de precisão em órbita**": espaço profundo (navy quase-preto, não preto puro) com hairlines frias, tipografia display grotesca + acentos em itálico serifado editorial, e um **acento que reage à cor escolhida do fone** — o site inteiro muda de "temperatura" conforme o configurador. Assinatura: o **núcleo orbital** — dial circular no centro de cada concha com um ponto-satélite que orbita; ecoado no wordmark, no cursor, nos divisores e no progresso do scroll-telling. (Decisão contra o default "preto + um neon": o acento é vivo mas **mutável e espacial**, e há sempre um tom complementar quente nos detalhes.)

### 3.2 Paleta (tokens)
| Papel | Dark | Light |
|---|---|---|
| bg | `#070B12` (espaço) | `#F4F6F9` |
| bg-elevated | `#0D131E` | `#FFFFFF` |
| surface | `#121A28` | `#EDF0F5` |
| text | `#E9EDF5` | `#151A24` |
| text-secondary | `#9AA6BC` | `#4A5568` |
| text-muted | `#5E6A82` | `#7A8699` |
| hairline | `rgba(150,170,210,.14)` | `rgba(20,30,60,.12)` |
| glow | `radial-gradient` var por cor | idem mais suave |

**Acento dinâmico por colorway** (dark → light):
- `ion` `#5BA8FF` → `#1D63C9` (default do site)
- `grafite` `#7FD4FF` → `#0E76B8`
- `nebulosa` `#9D8CFF` → `#5A3FD6`
- `aurora` `#3FE0B4` → `#0B8F6E`
- `solar` `#FFB25E` → `#B4640B`

### 3.3 Tipografia
- **Display:** Space Grotesk 500/600/700, tracking −0.03em
- **Acento editorial:** Instrument Serif 400 *italic* (uma palavra-chave por headline)
- **Texto:** Inter 400/500/600
- **Dados/labels:** mono de sistema (`ui-monospace, SF Mono, Cascadia, Consolas`), uppercase, letter-spacing .14em
- Escala: `--text-2xs .6875rem / xs .75 / sm .875 / base 1 / md 1.125 / lg 1.375 / xl clamp(1.75,3vw,2.5rem) / 2xl clamp(2.25,4.5vw,3.5rem) / display clamp(3rem,7.5vw,6.25rem)`

### 3.4 Espaçamento
Escala de 4px: 4/8/12/16/20/24/32/40/48/64/80/96/120/160. Raios: 10/14/20/28. Grid de seção: `max-width: 1200px`, gutter `clamp(20px, 5vw, 48px)`.

### 3.5 Motion tokens
- Duração: 120/240/480/800/1200ms
- Easings: `--ease-out-expo: cubic-bezier(.16,1,.3,1)` · `--ease-out-quart: cubic-bezier(.25,1,.5,1)` · `--ease-in-out-quart: cubic-bezier(.77,0,.18,1)` · `--ease-elastic: cubic-bezier(.34,1.56,.64,1)`
- Regra de ouro: animações contínuas só em `transform`/`opacity`/`clip-path`/`filter`.

## 4. Estratégia técnica por seção

### 4.1 Hero
- Entrada staggered via WAAPI (eyebrow → H1 com split em linhas → sub → CTAs → fone) com `--ease-out-expo`, delays em cascata.
- Movimento contínuo: anéis orbitais girando (CSS), ponto-satélite, starfield em Canvas 2D (~110 estrelas, drift + twinkle, rAF) — tudo `pointer-events:none`.
- Paralaxe: fone inclina 3D sutil (rotateX/rotateY) em `pointer:fine`; starfield desloca por mouse+scroll. Em touch: flutuação suave apenas.

### 4.2 Scroll-telling ("Como funciona")
- Seção de `420vh` com palco `position:sticky; top:0; height:100vh`.
- Scroll handler → rAF → progresso `p ∈ [0,1]` → helper `seq()` interpola transformações por etapas (lerp + smoothstep entre keypoints). **Scrubbing real, contínuo, sem triggers.**
- 4 etapas: (1) rotação −14°→0 com anéis convergindo — "Sensores"; (2) arco levanta e conchas giram levemente — "Chip"; (3) explosão em partes + callouts com linhas SVG — "Matéria"; (4) remontagem com a **cor do configurador** revelada + glow — "Sintonia".
- Textos por etapa com fade in/out por janela de progresso; rail lateral com 4 pontos + contador `01/04`.
- Parts do SVG com IDs estáveis; transformações aplicadas por `style.transform` direto (sem layout thrash).

### 4.3 Configurador
- Instância do mesmo builder do fone. Cor = troca de classe → CSS vars `--cw-*` → transições de `fill`/`stop-color` + pop de escala na concha.
- Segundo atributo: **Modo de som** — Espacial (anéis orbitais), Silêncio Total (arcos de onda pulsando), Transparência (concha fica translúcida revelando o driver interno). Cada modo tem `data-mode` → regras CSS.
- Preço = `2499 + prêmio(cor) + prêmio(modo)`; count-up com `Intl.NumberFormat('pt-BR')` e easing expo (600ms) a cada mudança; parcela 12× também anima.
- CTA reflete estado: "Comprar ÓRBITA — Aurora · Silêncio Total". A cor escolhida vira o acento do site (via `data-accent` no `<html>`, transição de 600ms).

### 4.4 Features
- 6 cards em grid 3×2→2×3→1. Ícones SVG autorais (traço 1.5, grade de 24px, desenhados à mão). Hover/focus: tilt 3D por CSS vars `--mx/--my` (pointermove, `pointer:fine`), glow de borda, ícone acesse. Revelação com stagger via IntersectionObserver.

### 4.5 Depoimentos
- Duas faixas em direções opostas; loop infinito com WAAPI (`animate` linear infinita, base de offset contínua — **sem salto visível**). Hover pausa; drag com pointer events acumula offset e devolve velocidade ao soltar (física de flick). RM: estático.

### 4.6 FAQ
- Accordion com altura via WAAPI: `0 → scrollHeight` e fixa em `auto` ao terminar (resolve o problema clássico sem medir por fora). Roving tabindex + setas + Home/End, `aria-expanded`/`aria-controls`, primeiro item aberto.

### 4.7 CTA final + rodapé
- Fone re-renderizado na cor/modo do configurador (estado compartilhado pelo store), botão magnético (translate em direção ao cursor com mola) + toast de pré-pedido. Rodapé com wordmark, colunas de links mortos, redes sociais em SVG, hairlines.

### 5.1 Motion — física consistente
- Easings tokenizados, durações do sistema, `seq()` único para scrubbing, rAF gerenciado (um loop global, listeners com `passive:true`).

### 5.2 Tema
- `<html data-theme>`; inicial = `prefers-color-scheme`, persistido em `localStorage['orbita:theme']`. Toggle anima reveal circular (div fixa com `clip-path: circle()`, WAAPI, flip do tema no meio da transição). `theme-color` atualizado.

### 5.3 Acessibilidade
- `prefers-reduced-motion`: CSS mata animações (`.01ms`) + JS desliga loops/scrub/paralaxe (scroll-telling vira estático com textos revelados por IO). Skip-link, landmarks, hierarquia h1→h3, `aria-hidden` em decorativos, contraste AA nos dois temas (testado manualmente), foco visível autoral (outline + glow no acento).

### 5.4 Responsivo
- 360: hero empilhado, configurador coluna única, callouts viram chips, marquee com drag como interação primária. 768: 2 colunas em features. 1280: layout cinematográfico completo.

### 5.5 Performance
- JS único ~<80KB raw / <25KB gzip. Fontes com preconnect + `display=swap`. Zero imagens raster; glow via gradientes (sem `filter: blur` em área grande). `content-visibility:auto` em seções abaixo da dobra. Layout animado apenas com transform/opacity.

## 5. Ordem de implementação
1. Scaffold (package.json, tsconfig, vite.config, index.html)
2. tokens.css + base.css + fontes
3. `headphone.ts` (SVG do fone — o coração visual)
4. `store.ts` + `theme.ts` + `motion.ts`
5. Hero + starfield
6. Scroll-telling
7. Configurador
8. Features + marquee + FAQ
9. CTA final + footer + cursor
10. `npm run build` até passar → QA visual no browser → README.md

## 6. Detalhes "que ninguém pediu" (rubrica criatividade)
1. Acento do site inteiro muda com a cor do fone escolhida.
2. Wordmark "ÓRBITA" com ponto orbital que circula a letra A.
3. Cursor-follower orbital (desktop, RM-safe).
4. Parcela 12× no configurador que também anima.
5. Contador de etapa + rail de progresso no scroll-telling.
6. Toast de pré-pedido com check SVG autorai.
7. Hairline de progresso de página no topo.
