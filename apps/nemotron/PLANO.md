# PLANO — ÓRBITA · Experiência Frontend Imersiva

> Plano escrito **antes** do código, conforme PROMPT.md. O sistema anterior foi descartado (visual e funcionamento abaixo do padrão) e reconstruído do zero.

## 1. Framework e justificativa (3 linhas)

**React 19 + TypeScript + Vite** (build estático). A página exige estado compartilhado entre seções (configurador → CTA final) e sincronização fina de animações com scroll — React oferece componentização limpa e contexto global para isso. Vite entrega build estático rápido com runtime mínimo (~50KB gzip), folgado no teto de 200KB. Nenhuma biblioteca de componente ou animação: tudo autoral.

## 2. Arquitetura de pastas

```
src/
  main.tsx / App.tsx              — entrada e composição das seções
  contexts/
    ThemeContext.tsx              — tema + reveal circular animado
    ProductContext.tsx            — cor, modo de som, preço derivado (compartilhado)
  lib/
    motion.ts                     — easings, smoothstep/clamp, count-up, rAF helpers
    useReducedMotion.ts           — hook de prefers-reduced-motion
    useInView.ts                  — IntersectionObserver para reveals
    useScrollProgress.ts          — progresso de scroll (hero + scrub) via rAF
  data/
    site.ts                       — cores, modos, features, depoimentos, FAQ
  components/
    ProductGraphic/               — SVG autoral do fone (Hero, Scroll-telling, Configurador, CTA)
    Header/ ThemeToggle/ Hero/ ScrollTelling/ Configurator/ Features/
    Testimonials/ Faq/ FinalCta/ Footer/
  styles/  tokens.css · globals.css · animations.css
```

`ProductGraphic` é o coração visual: **parametrizado por CSS variables** (`--cup`, `--accent`, `--explode`, `--spin2`, `--eq`). O mesmo SVG serve montado, explodido por scrubbing, com cor trocada e modo de som — o scrub escreve a variável direto no DOM via rAF, **sem re-render por frame**.

## 3. Sistema de design

**Direção de arte: "satélite solar"** — fundo preto quente, um acento âmbar (o sol), tipografia editorial. Anti-template: nada de gradiente roxo/azul, nada de glassmorphism decorativo.

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0d0b08` | `#f5f1e8` |
| `--surface` | `#16130e` | `#fffdf6` |
| `--ink` | `#f4eee1` | `#1c1812` |
| `--muted` | `#a89e8a` | `#6b6150` |
| `--accent` | `#ffb54a` | `#9a5f1e` |
| `--hairline` | `rgba(244,238,225,.14)` | `rgba(28,24,18,.16)` |

- **Tipografia:** Fraunces (display, itálico expressivo) · Instrument Sans (texto) · IBM Plex Mono (eyebrows, specs, preço).
- **Escala:** 4/8/12/16/24/32/48/64/96/128px · **Durações:** 150/300/600/900ms.
- **Easings autorais:** `--ease-out-expo` (0.16,1,0.3,1) · `--ease-out-quart` (0.25,1,0.5,1) · `--ease-in-out` (0.65,0,0.35,1) · `--ease-spring` (0.34,1.56,0.64,1).
- **Animações contínuas:** só `transform`, `opacity`, `clip-path`, `filter` (60fps, sem layout thrashing).

## 4. Estratégia técnica por seção

### 4.1 Hero
Entrada orquestrada: `.hero-reveal` com `animation-delay` em cascata (eyebrow → título → sub → CTA → produto). Movimento contínuo: anel orbital com satélites (CSS rotate) + poeira estelar (rAF, transform/opacity). Paralaxe ao mouse (apenas `pointer: fine`), profundidades por camada; hero esmaece ao rolar (progresso mapeado).

### 4.2 Scroll-telling (scrubbing real)
Seção de `400vh` com viewport sticky. `useScrollProgress` + rAF escrevem `--explode` (0..1) e `--spin2` (0..180deg) direto no SVG. O CSS faz a aritmética: braços separam, conchas transladam e giram, o driver espacial revela com opacity/scale — só transform/opacity. Texto: 3 blocos no viewport com crossfade por janelas de progresso (smoothstep).

### 4.3 Configurador
5 cores (fill com `transition` de 600ms) + modo de som (Imersivo/Focado/Espacial) que muda as barras de EQ animadas e o brilho. Preço derivado com **count-up via rAF** (ease-out). Estado no `ProductContext`, refletido no CTA e reutilizado no CTA final.

### 4.4 Features
6 cards com tilt 3D (CSS vars `--rx/--ry` por mousemove), glare que segue o cursor, ícones SVG autorais, entrada em stagger via IntersectionObserver.

### 4.5 Depoimentos
Marquee **dirigido por rAF** (offset com wrap em −50% = loop sem salto), pausa em hover, drag com pointer events + inércia no release. Reduced-motion: estático (drag mantido).

### 4.6 FAQ
Accordion com `grid-template-rows: 0fr → 1fr` (altura animada sem `height:auto` quebrado e sem medição JS). Teclado: Enter/Espaço, setas, Home/End, `aria-expanded`/`aria-controls`.

### 4.7 CTA final + rodapé
Produto na cor/modo escolhidos (context), botão **magnético** (segue o cursor com mola rAF, limitado) + ripple, resumo da configuração, rodapé coerente.

## 5. Transversais

- **Tema:** toggle com **reveal circular** — overlay `clip-path: circle()` expandindo do ponto do clique; o flip de tema acontece oculto no `transitionend`. Padrão `prefers-color-scheme`, persistência em `localStorage`, bootstrap inline no `index.html` sem FOUC. Contraste AA nos dois temas.
- **Reduced motion:** `prefers-reduced-motion` desliga todas as animações decorativas (CSS + hooks checam `matchMedia`): reveals viram fade simples, órbita/marquee/tilt/parallax off, iris instantâneo.
- **A11y:** skip-link, landmarks, headings hierárquicos, `:focus-visible` autoral (anel + offset), `aria-label` em ícones, toque equivalente ao hover.
- **Responsivo:** 360 / 768 / 1280 intencionais — hero empilha, configurador vira coluna, texto do scrub reposiciona, menu vira overlay.
- **Performance:** só transform/opacity/clip-path/filter em loops; fontes `display=swap` + preconnect; sem CLS; JS ≪ 200KB gzip.

## 6. Ordem de implementação

1. `tokens.css`/`globals.css`/`animations.css` + `lib/` + `contexts/` + `data/`
2. `ProductGraphic` (base visual de tudo)
3. Hero → Scroll-telling → Configurator → Features → Testimonials → FAQ → CTA/Footer → Header/ThemeToggle
4. `App`/`main` → `npm run build` → correções → `README.md` → checklist final
