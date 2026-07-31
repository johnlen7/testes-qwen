# PLANO — ÓRBITA

## Framework

**Vite + React 18 + TypeScript + CSS puro (custom properties).**

React cobre o estado compartilhado do configurador (cor → CTA final) sem boilerplate. Vite entrega HMR rápido e build estático (`dist/`) com zero config de servidor. CSS puro evita dependências e mantém o bundle sob controle — tokens em custom properties, zero lib de componentes/animação.

## Arquitetura de pastas

```
/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── PLANO.md
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   ├── tokens.css      # design tokens
    │   ├── reset.css
    │   └── global.css
    ├── context/
    │   └── ConfigContext.tsx
    ├── hooks/
    │   ├── useTheme.ts
    │   ├── useReducedMotion.ts
    │   ├── useScrollProgress.ts
    │   ├── useCountUp.ts
    │   └── usePointerParallax.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── Hero.tsx
    │   ├── ScrollStory.tsx
    │   ├── Configurator.tsx
    │   ├── Features.tsx
    │   ├── Testimonials.tsx
    │   ├── FAQ.tsx
    │   ├── FinalCTA.tsx
    │   ├── Footer.tsx
    │   ├── ThemeToggle.tsx
    │   ├── MagneticButton.tsx
    │   └── headphone/
    │       └── HeadphoneSVG.tsx
    └── utils/
        └── easings.ts
```

## Sistema de design

### Paleta
| Token | Light | Dark | Uso |
|---|---|---|---|
| `--bg` | `#f4f1ea` | `#07080c` | fundo |
| `--bg-elevated` | `#fffdf8` | `#101218` | cards |
| `--fg` | `#12141a` | `#ece8df` | texto |
| `--fg-muted` | `#5c5f6a` | `#9a968c` | secundário |
| `--accent` | `#c45c26` | `#e8a05c` | cobre orbital |
| `--accent-2` | `#1a6b6b` | `#3dcdc0` | ciano espacial |
| `--line` | `rgba(18,20,26,.12)` | `rgba(236,232,223,.1)` | bordas |
| `--glow` | cobre 20% | cobre 35% | highlights |

### Tipografia
- **Display:** Syne (700/800) — geométrica, presença de marca
- **Body:** Manrope (400/500/600) — legível, moderna
- Escala: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 72 / clamp hero

### Espaçamento
Base 4px → 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160

### Motion
| Nome | ms | Easing |
|---|---|---|
| instant | 120 | `cubic-bezier(.2,.8,.2,1)` |
| fast | 220 | `cubic-bezier(.22,1,.36,1)` |
| base | 380 | `cubic-bezier(.16,1,.3,1)` |
| slow | 680 | `cubic-bezier(.16,1,.3,1)` |
| thematic | 900 | `cubic-bezier(.65,0,.35,1)` |

Animações contínuas: **somente** `transform`, `opacity`, `clip-path`, `filter`.

## Estratégia por seção

### 4.1 Hero
- Entrada staggered via CSS `@keyframes` + delays em classes (logo → eyebrow → title → sub → CTA → fone).
- Fone SVG autoral com órbitas CSS (`rotate` infinitas, `prefers-reduced-motion` → estático).
- Paralaxe leve no fone via `requestAnimationFrame` + pointer (desktop only).
- Gradiente radial animado de fundo (opacity pulse).

### 4.2 Scroll-telling
- Seção sticky (`position: sticky; height: 100vh`) dentro de um track com `height: 300vh`.
- `useScrollProgress` lê o progresso 0→1 do track com rAF + Intersection/scroll listener.
- 3 etapas: (0–0.33) fone inteiro + “Escuta o espaço”; (0.33–0.66) explode em conchas/headband/drivers; (0.66–1) anéis de ANC espacial + microfones.
- Progresso mapeia `transform`/`opacity` das partes SVG (scrubbing real, não trigger one-shot).
- Indicador de etapa lateral.

### 4.3 Configurador
- Context React: `{ color, shell, price }` → Header CTA + Final CTA.
- 5 cores com crossfade de fills SVG (`transition` em `fill`/`stop-color`).
- Shell: Standard / Oversized (escala da concha via CSS var).
- Preço com count-up via rAF + easing.
- CTA texto dinâmico.

### 4.4 Features
- Grid 2×3 (mobile 1 col) com 6 cards.
- Ícones SVG autorais.
- Hover: tilt 3D leve (`rotateX/Y` via pointer), glow de borda com accent.
- Entrada: IntersectionObserver + stagger `translateY`/`opacity`.

### 4.5 Depoimentos
- Marquee CSS `translateX` com track duplicado (loop sem salto).
- Pause on hover/`focus-within`.
- Drag via pointer events (offset no transform, resume após release).

### 4.6 FAQ
- Accordion: medir `scrollHeight` do painel, animar `grid-template-rows: 0fr → 1fr` (técnica moderna sem height auto quebrado).
- Teclado: setas cima/baixo entre items, Home/End, Enter/Space, `aria-expanded`/`aria-controls`.

### 4.7 CTA final + Footer
- Consome ConfigContext (cor + preço no botão).
- MagneticButton: desloca com pointer dentro do bounding box.
- Ripple no click (span absoluto + scale).
- Footer minimal com links âncora.

## Transversais

### Tema
- `data-theme="light|dark"` no `<html>`.
- Default: `matchMedia('(prefers-color-scheme)')` → override `localStorage.orbita-theme`.
- Toggle: view-transition API se disponível (`document.startViewTransition`), senão cross-fade de tokens (CSS vars já interpolam em alguns browsers; fallback troca instantânea + fade overlay).

### Reduced motion
- Media query global desliga keyframes infinitos, parallax, marquee, tilt.
- Scroll-telling salta para estados estáticos por etapa (sem scrub interpolado contínuo se necessário — mantém snap por etapa com fade).

### Responsivo
- Mobile-first. Breakpoints 360 / 768 / 1280.
- Hero: fone abaixo do texto em mobile.
- Scroll-telling: layout empilhado, progresso ainda sticky.

## Ordem de implementação

1. Scaffold Vite + tokens + reset + tema
2. HeadphoneSVG paramétrico (cor, shell, explode progress)
3. Header + ThemeToggle
4. Hero
5. ScrollStory
6. Configurator + Context
7. Features
8. Testimonials
9. FAQ
10. FinalCTA + Footer
11. MagneticButton, polish, reduced-motion
12. Build + README

## Fora de escopo consciente
- Checkout real, i18n, CMS, fotos raster, WebGL 3D.
