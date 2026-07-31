# ÓRBITA — O silêncio tem órbita própria

Site de lançamento imersivo para o fone de ouvido premium fictício **ÓRBITA**.
Vanilla JS + CSS puro + Vite. Zero bibliotecas de componentes ou animação:
todas as animações são CSS (transitions/keyframes), Web Animations API e
`requestAnimationFrame` escritos à mão. Nenhum asset externo em runtime —
o produto é um SVG inline autoral; fontes via Google Fonts
(`preconnect` + `display=swap`).

## Como rodar

Requisito: **Node 20+**.

```bash
npm install
npm run dev       # desenvolvimento (porta padrão 5173)
npm run build     # build de produção em dist/
npm run preview   # serve o build de produção localmente
```

## Estrutura

```
index.html                 # marcação de todas as seções + script anti-FOUC de tema
src/
  main.js                  # bootstrap: importa CSS e inicia os módulos
  styles/
    tokens.css             # design tokens (paleta por tema, tipo, espaço, motion)
    base.css               # reset, tipografia, focus visible autoral, landmarks
    sections.css           # estilos das 7 seções + responsivo + reduced-motion
  js/
    motion.js              # easings, lerp, cubicBezier, rAF loop compartilhado
    theme.js               # toggle claro/escuro com reveal circular
    product.js             # SVG autoral do fone (vista frontal, 2 conchas)
    hero.js                # entrada em beats + órbitas contínuas + paralaxe
    scrollstory.js         # scroll-telling com scrubbing real (sticky + rAF)
    store.js               # estado do configurador { cor, concha, preco } + pub/sub
    configurator.js        # swatches, tamanho M/G, count-up de preço
    features.js            # stagger IO+WAAPI, tilt 3D + glow no hover
    marquee.js             # marquee infinito com drag e inércia
    faq.js                 # accordion 0fr→1fr, teclado completo
    cta.js                 # CTA final: cor da store, botão magnético + ripple
```

## Decisões principais

- **Vite + vanilla (sem framework de UI).** O desafio proíbe bibliotecas de
  animação/componentes; um framework só adicionaria runtime. Vanilla dá
  controle total de rAF/WAAPI e mantém o JS em ~5 KB gzip.
- **Sistema de design "painel de observatório".** Escuro profundo + acento
  âmbar (hélio), hairlines, leituras de spec em mono, anéis orbitais com
  tick marks de instrumento. Tipografia: **Unbounded** (display), **Sora**
  (texto), **IBM Plex Mono** (utilitário). Tema claro/escuro com tokens por
  `[data-theme]`, anti-FOUC via script inline e reveal circular em
  `clip-path: circle()` a partir do botão.
- **SVG autoral em camadas.** O fone é desenhado em `product.js` (vista
  frontal, duas conchas) e recolorido por CSS vars
  (`--product-shell`, `--product-cushion`, …) com transição de `fill` —
  usado pelo hero, scroll-telling, configurador e CTA final. Os grupos
  `.layer-shell`/`.layer-cushion`/`.layer-driver` permitem o "explode".
- **Scrubbing real no scroll-telling.** Container de 350vh com palco
  `sticky`; um rAF lê `scrollY`, normaliza (`raw = (scrollY − top) / span`),
  suaviza com `lerp` e escreve transforms direto nos grupos do SVG a cada
  frame — nada de triggers. Layout reads só em init/resize.
- **Store pub/sub.** O configurador (`cor`, `concha`, `preco`) publica; o
  CTA final assina e renderiza o produto na cor escolhida com o preço
  atualizado. Preço com count-up rAF + easing spring (overshoot).
- **Marquee autoral.** Trilha duplicada, largura medida uma vez, wrap por
  módulo (loop sem salto), pausa em hover/focus, drag com pointer events e
  inércia que decai por lerp de volta ao drift.
- **Botão magnético + ripple.** Integrador de mola (stiffness/damping)
  puxa o botão na direção do cursor; ripple em `clip-path: circle()` via
  WAAPI a partir do ponto de clique.
- **Regra dura de motion.** Animações contínuas só em `transform`,
  `opacity`, `clip-path` e `filter`. `prefers-reduced-motion`: órbitas e
  paralaxe off, scrub vira estado estático, entradas viram fade, marquee
  vira scroll nativo, accordion instantâneo.
- **Acessibilidade.** Landmarks semânticos, um `h1` + hierarquia
  `h2`/`h3`, focus visible autoral (anel hélio, nunca removido sem
  substituto), `aria-pressed`/`aria-expanded`/`radiogroup` onde cabe,
  teclado completo no FAQ (↑/↓/Home/End) e nos radiogroups (←/→),
  contraste AA nos dois temas.

## Com mais tempo

- WebGL puro (sem Three.js) para partículas de poeira estelar no hero
- Testes e2e (Playwright) cobrindo scrub, tema e accordion
- i18n (pt-BR/en) com tokens de copy separados
- PWA: manifest, ícones, cache offline do build
- `prefers-contrast` e forced-colors (Windows HCM) auditados
