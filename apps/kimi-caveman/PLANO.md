# PLANO — ÓRBITA · Site de lançamento imersivo

## 1. Framework e justificativa (3 linhas)

**Vite + vanilla JS (ES Modules) + CSS puro.** Zero runtime de framework = JS enviado mínimo (meta ≤200KB gzip sobra), controle total sobre `requestAnimationFrame`, Web Animations API e CSS scroll-driven — exatamente o que o desafio mede. Componentização via módulos ES (uma factory por seção), estado compartilhado via store pub/sub de ~30 linhas.

## 2. Direção de arte

Vernacular: **instrumento de observatório / telemetria orbital**. O fone não é produto de prateleira, é equipamento de precisão — hairlines, anéis graduados, labels mono com coordenadas, crosshairs nos cantos do grid. Ousadia: tipografia display **Unbounded** (formas orbitais arredondadas, cara própria) contra o rigor de **IBM Plex Mono** nos metadados. Nada de gradiente roxo/azul, nada de glassmorphism.

### Paleta (tokens)

| Token | Dark (default) | Light | Uso |
|---|---|---|---|
| `--bg` | `#0D1015` (void ink) | `#F5F2EB` (papel quente) | fundo |
| `--bg-raise` | `#141821` | `#ECE8DE` | cards, superfícies |
| `--ink` | `#EEF1F4` | `#15181D` | texto |
| `--ink-dim` | `#9AA4B0` | `#5A616B` | texto secundário (AA nos dois) |
| `--line` | `#262C38` | `#D8D2C4` | hairlines, anéis |
| `--accent` | `#FFAE3D` (solar amber) | `#C77400` (âmbar profundo, AA) | acento, focus, CTA |
| `--accent-ink` | `#1A1206` | `#FFF8EC` | texto sobre acento |

### Tipografia (Google Fonts, `font-display: swap`, preload)

- Display: **Unbounded** 600/700 — hero, títulos de seção. Tracking levemente negativo.
- Texto: **Instrument Sans** 400/500 — corpo, UI.
- Utilitária: **IBM Plex Mono** 400/500 — eyebrows (`SYS.01 — ANC ESPACIAL`), dados, labels de spec, ticks.
- Escala: 12 / 14 / 16 / 18 / 24 / 32 / 48 / clamp(48→96) display.

### Espaçamento e motion

- Escala de espaço: `--s1..--s8` = 4 / 8 / 16 / 24 / 40 / 64 / 104 / 168px. Seções respiram `--s8` vertical.
- Durações: `--dur-1: 150ms` (micro), `--dur-2: 300ms` (UI), `--dur-3: 600ms` (entrada), `--dur-4: 1000ms` (coreografia).
- Easings autorais: `--ease-out: cubic-bezier(.16,1,.3,1)` · `--ease-spring: cubic-bezier(.34,1.4,.64,1)` · `--ease-inout: cubic-bezier(.65,0,.35,1)`.
- Regra de ouro: animações contínuas só em `transform` / `opacity` / `clip-path` / `filter`.

### Assinatura

**Sistema de anéis orbitais graduados** atrás do produto: 3 anéis hairline concêntricos com ticks (como escala de instrumento), rotação lenta contínua em velocidades distintas, reagem a mouse (paralaxe) e ao scroll-telling (expandem/contraem). Reaparece menor no configurador e no CTA final. É o motivo que amarra a página.

## 3. Arquitetura de pastas

```
├── index.html                  # placeholders <section id>, header, fontes
├── package.json  vite.config.js
├── src/
│   ├── main.js                 # boot: importa e inicia cada seção
│   ├── styles/
│   │   ├── tokens.css          # custom props, temas [data-theme]
│   │   └── base.css            # reset, tipografia, focus-visible, reduced-motion
│   ├── lib/
│   │   ├── store.js            # pub/sub: { color, size } + COLOR_MAP, PRICE
│   │   ├── motion.js           # prefersReducedMotion(), lerp, clamp, easings, raf loop
│   │   ├── reveal.js           # IntersectionObserver stagger (.is-in, --i)
│   │   └── product.js          # renderProduct({color,size,progress}) → SVG autoral
│   └── sections/
│       ├── header.js/.css      # nav + theme toggle (clip-path reveal)
│       ├── hero.js/.css        # 4.1
│       ├── story.js/.css       # 4.2 scroll-telling
│       ├── configurator.js/.css# 4.3
│       ├── features.js/.css    # 4.4
│       ├── marquee.js/.css     # 4.5 depoimentos
│       ├── faq.js/.css         # 4.6
│       └── outro.js/.css       # 4.7 CTA final + rodapé
```

### Contratos entre módulos

- Cada seção exporta `export function init<Name>(el: HTMLElement): void` e importa o próprio `.css` (Vite bundla). Markup renderizado pela factory dentro do placeholder — HTML semântico completo (landmarks, headings hierárquicos).
- `store.js`: `get()`, `set(patch)`, `subscribe(fn)`. Estado: `{ color: 'grafite'|'lunar'|'ambar'|'oceano', size: 'p'|'m'|'g' }`. `COLOR_MAP` com hex do fone por cor; `priceOf(state)`; `labelOf(state)` → `"Grafite · Concha M"`.
- `product.js`: `renderProduct({ color, size, exploded = 0 })` retorna string SVG do fone (headband + 2 conchas + driver), partes com `data-part`, preenchimentos via `currentColor`/var para transição animada de cor. `size` altera raio das conchas. `exploded` 0→1 separa partes (usado no scroll-telling).
- `motion.js`: `reducedMotion(): boolean`, `lerp`, `clamp`, `easeOutExpo(t)`, `createRafLoop(fn)` (start/stop, auto-pausa fora da viewport via IO).

## 4. Estratégia por seção

### 4.1 Hero
Canvas 2D autoral: starfield sutil com deriva + 2 partículas orbitando (lerp). Anéis SVG graduados em rotação contínua (CSS keyframes, velocidades 40s/70s/110s). Produto central (`renderProduct`). Entrada orquestrada: eyebrow → título (chars com stagger via WAAPI) → subtítulo → CTAs → produto sobe com `--ease-spring`. Paralaxe de mouse: camadas com profundidades distintas via rAF lerp; desligado em touch (`pointer: fine` media) e reduced-motion.

### 4.2 Scroll-telling (sticky + scrub)
Container com altura `400vh`, palco `position: sticky`. Progresso = `scrollY` mapeado 0→1 via rAF (sem listener passivo pesado — lerp suaviza a 60fps). 3 etapas:
1. **Captar** (0–.33): produto inteiro, anéis pulsando — malha captura o som.
2. **Medir** (.33–.66): produto rotaciona 35°, anéis expandem, linhas de medição saem das conchas com leituras mono (`-42dB`, `20Hz–20kHz`) animadas.
3. **Cancelar** (.66–1): `exploded` 0→1, partes se separam com labels (driver, malha, espuma) em callouts hairline.
Texto de cada etapa cross-fade sincronizado (opacity/translate por faixa de progresso). Barra de progresso lateral com 3 ticks. Tudo `transform`/`opacity`.

### 4.3 Configurador
Produto grande com anéis menores. 4 swatches (Grafite `#2A2E36`, Lunar `#E8E4DA`, Âmbar `#FFAE3D`, Oceano `#1E3A4C`) — troca anima `fill` via CSS transition 600ms + anel de seleção `--ease-spring`. Segundo atributo: concha P/M/G — altera escala das conchas no SVG (transition transform) e specs. Preço com count-up por rolagem de dígitos (colunas 0–9, translateY). CTA: `Comprar ÓRBITA — {label}, R$ {preço}`. Escreve no `store`; outro lê.

### 4.4 Features
6 cards: ANC Espacial, 60h de bateria, Driver de grafeno, Bluetooth 5.4 multiponto, IPX5, App com EQ paramétrico. Ícones SVG autorais (stroke hairline, geometria de instrumento). Hover/focus: glow radial que segue o cursor (custom props `--mx/--my`) + tilt 3D sutil (transform). Entrada stagger via `reveal.js`.

### 4.5 Depoimentos
Marquee infinito autoral: track duplicado, `translateX` via rAF, loop perfeito (largura medida, modulo). Pausa em hover/focus-within. Drag com pointer events: captura, velocidade, momentum com decaimento; volta ao drift ao soltar. Cards com aspas mono e nome/cargo.

### 4.6 FAQ
Accordion: altura animada medindo `scrollHeight` e transicionando valor explícito (resolve `height: auto`), depois libera. `aria-expanded`, `aria-controls`, setas ↑↓ navegam entre perguntas, Home/End, Enter/Espaço alterna. Ícone + gira 45°.

### 4.7 CTA final + rodapé
Lê `store` (subscribe): produto renderizado na cor/tamanho escolhidos, texto reflete seleção. Botão magnético (translate em direção ao cursor com lerp, raio 120px) + ripple autoral no click. Rodapé: wordmark, links fictícios, hairline, mono "ÓRBITA © 2026 — produto fictício".

### 5.2 Tema
Toggle no header: reveal circular `clip-path: circle()` a partir do botão (view-transition-like feito à mão: overlay clone? — solução simples: transição de `background-color`/`color` nos tokens + cross-fade coreografado de 600ms com `::before` radial). Default `prefers-color-scheme`, persiste `localStorage('orbita-theme')`, script inline no `<head>` antes de tudo (sem FOUC).

### Transversais
- `prefers-reduced-motion`: query em CSS desliga keyframes/transições decorativas; em JS, `reducedMotion()` troca scrub por estados finais e fades.
- Focus visible autoral: anel `--accent` offset 3px + hairline dupla.
- Responsivo: 360/768/1280 com layouts intencionais (hero empilha, configurador vira coluna, marquee full-bleed).

## 5. Ordem de implementação

1. Scaffold: package.json/vite/index.html/tokens/base + libs (store, motion, reveal, product) + header com theme toggle.
2. Seções em paralelo (arquivos isolados, contratos acima): A=hero+story · B=configurator+outro · C=features+marquee · D=faq.
3. Integração: `npm run build` até verde, QA visual em 360/768/1280, checklist do PROMPT.md, README.md.
