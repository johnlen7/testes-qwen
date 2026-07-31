# PLANO — ÓRBITA · Experiência de lançamento

## Framework e justificativa (3 linhas)
**Vite + vanilla JS (ES modules) + CSS puro.** O desafio proíbe bibliotecas de animação e componentes, então um framework de UI só adicionaria runtime sem benefício; vanilla dá controle total de rAF/WAAPI e mantém o JS muito abaixo do teto de 200KB gzip. Vite garante `npm run dev`/`build` estáticos em Node 20+ com zero configuração frágil.

## Arquitetura de pastas

```
vazio/
  package.json  vite.config.js  index.html
  src/
    main.js                  # bootstrap: importa módulos, init condicional
    styles/
      tokens.css             # design tokens (cores, tipo, espaço, motion) + temas
      base.css               # reset, tipografia, focus visible, landmarks
      sections.css           # estilos das 7 seções
    js/
      motion.js              # easings, lerp, rAF loop compartilhado, reduced-motion
      theme.js               # toggle claro/escuro com reveal circular + localStorage
      product.js             # SVG autoral do fone (builder) + recolor via CSS vars
      hero.js                # entrada orquestrada + órbitas contínuas + paralaxe mouse
      scrollstory.js         # scroll-telling com scrubbing (sticky + rAF)
      configurator.js        # estado (cor/acabamento/preço), count-up, CTA
      features.js            # stagger on scroll + micro-interações dos cards
      marquee.js             # marquee infinito com pausa hover + drag (pointer events)
      faq.js                 # accordion com altura animada + teclado
      cta.js                 # botão magnético + ripple autoral
```

## Sistema de design

### Conceito
"Painel de observatório": o fone flutua dentro de um sistema de **anéis orbitais** desenhados à mão (elipses tracejadas SVG com marcas de tick, como instrumento de astronomia), com leituras de specs em mono nos vértices. Escuro profundo + acento âmbar de instrumento. Nada de gradiente roxo/azul SaaS, nada de glassmorphism.

### Paleta (tokens por tema)
| Token | Escuro (padrão) | Claro |
|---|---|---|
| `--bg` (vazio) | `#070910` | `#EDEEF2` |
| `--surface` (painel) | `#0D111C` | `#FFFFFF` |
| `--surface-2` | `#131829` | `#E3E5EC` |
| `--ink` (tinta) | `#ECEFF8` | `#12151F` |
| `--muted` (névoa) | `#8B93A9` | `#5A6172` |
| `--accent` (hélio) | `#FFB547` | `#B45309` (AA em fundo claro) |
| `--accent-soft` | `#FFB547` @ 14% | `#B45309` @ 10% |
| `--line` (hairline) | `#ECEFF8` @ 10% | `#12151F` @ 12% |

Cores do produto (configurador): Grafite `#2A2E3A`, Lunar `#D8DBE3`, Hélio `#E8A33D`, Eclipse `#3A4A6B`.

### Tipografia (Google Fonts, `display=swap`, preconnect)
- **Display:** Unbounded (500/700) — larga, espacial, usada com contenção (hero, números de etapa, CTA final). Tracking apertado, uppercase pontual.
- **Texto:** Sora (400/500) — geométrica legível que conversa com Unbounded sem competir.
- **Utilitário:** IBM Plex Mono (400/500) — eyebrows, labels de spec, preços, ticks dos anéis.

Escala: 12/14/16/18/21/28/38/56/clamp(44–96) px.

### Espaçamento
Base 4px: 4/8/12/16/24/32/48/64/96/128. Seções com respiro vertical 96–128px desktop, 64px mobile.

### Motion tokens
- Durações: `--d1` 150ms (micro), `--d2` 300ms (transições), `--d3` 600ms (entradas), `--d4` 900ms (hero).
- Easings: `--ease-out-expo: cubic-bezier(.16,1,.3,1)`; `--ease-in-out-quart: cubic-bezier(.76,0,.24,1)`; `--ease-spring: cubic-bezier(.34,1.56,.64,1)` (magnético/count-up).
- Regra dura: animações contínuas só em `transform`/`opacity`/`clip-path`/`filter`.

## Estratégia técnica por seção

1. **Hero** — Entrada em 5 beats (eyebrow → título com clip reveal por linha → subtítulo → CTAs → produto+anéis com scale/fade em `--d4`). Anéis orbitais SVG rotacionam continuamente (CSS keyframes, `transform` apenas). Paralaxe: mouse move → rAF com lerp desloca camadas (anéis, produto, glow) em intensidades diferentes; desligado em touch (`pointer: fine` media query) e reduced-motion.
2. **Scroll-telling** — Container de 350vh com palco `position: sticky`. rAF lê `scrollY`, normaliza progresso 0–1, aplica `lerp` suavizado e escreve transforms direto nos grupos SVG: o fone **explode em 3 camadas** (almofada → driver → concha) ao longo do plano do anel, que abre/alinha. 3 etapas de texto com crossfade por faixas de progresso + barra/indicador de progresso em mono. Scrubbing real: estilo derivado do scroll a cada frame, não triggers.
3. **Configurador** — Estado único `{ cor, concha, preco }` num módulo; o SVG do produto usa `currentColor`/CSS vars para recolorir com transição de `fill` 300ms. Segundo atributo: tamanho de concha (M/G) altera escala/proporção do SVG + label de spec. Preço: count-up com rAF e easing spring. CTA reflete estado ("Comprar ÓRBITA — Grafite · R$ 2.499"). Estado exportado para o CTA final (módulo compartilhado `store.js` com subscribe).
4. **Features** — 6 cards, hairlines, ícones SVG autorais (traço 1.5px). Hover: tilt 3D leve via pointer + glow radial que segue o cursor (variáveis CSS `--mx/--my`). Entrada stagger via IntersectionObserver + WAAPI.
5. **Depoimentos** — Marquee infinito autoral: trilha duplicada, `requestAnimationFrame` com velocidade constante, pausa em hover/focus, drag com pointer events (velocidade vira inércia). Loop sem salto: largura medida, wrap por módulo.
6. **FAQ** — Accordion com o clássico resolvido: mede `scrollHeight`, anima `height` via WAAPI (ou grid-template-rows 0fr→1fr com transição), `aria-expanded`, setas ↑↓ navegam entre botões, Enter/Espaço alterna.
7. **CTA final + rodapé** — Produto renderizado na cor do configurador (subscribe do store). Botão magnético (translate em direção ao cursor com lerp + spring no release) com ripple em `clip-path`. Rodapé com hairlines e mono.

### Tema claro/escuro (5.2)
Toggle dispara reveal circular: `clip-path: circle()` animado de um overlay fixed a partir das coordenadas do botão; no ponto médio troca `data-theme` no `<html>`. Padrão inicial = `prefers-color-scheme`; escolha persiste em `localStorage` (chave `orbita-theme`). Sem FOUC: script inline mínimo no `<head>` define o tema antes do paint.

### Transversais
- `prefers-reduced-motion`: flag global — keyframes decorativos off, scrubbing vira estado final estático, entradas viram fade simples, marquee estático com scroll nativo.
- Focus visible autoral: anel `hélio` com offset, nunca removido sem substituto.
- Responsivo: 360/768/1280 com layouts intencionais (hero empilha, scroll-telling vira blocos sequenciais com animação de entrada em mobile).
- Performance: fontes com preconnect + swap, SVG inline (zero requests de imagem), JS modular com init por IntersectionObserver onde possível.

## Ordem de implementação
1. Scaffold (Vite) + tokens + base + tema + Hero + header.
2. Scroll-telling + Configurador (+ store).
3. Features + Marquee + FAQ + CTA final + rodapé + polish a11y/responsivo.
4. Auditoria: build, screenshots 360/768/1280, README.md.
