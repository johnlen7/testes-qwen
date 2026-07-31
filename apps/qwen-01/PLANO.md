# PLANO — ÓRBITA · Experiência Frontend Imersiva

## 1. Framework: SvelteKit (static adapter)

**Justificativa:** Svelte compila o framework away — o runtime JS enviado ao cliente é mínimo (~2KB vs ~40KB+ do React), garantindo o budget de ≤200KB gzip com folga. Stores reativos nativos tornam trivial o estado compartilhado configurador→CTA. CSS scoping embutido elimina conflitos de classe sem utilitários. O static adapter gera HTML/CSS/JS puros, sem servidor.

## 2. Arquitetura de pastas

```
qwen-01/
├── PLANO.md / README.md / PRD.md / PROMPT.md
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── static/
│   └── favicon.svg
└── src/
    ├── app.html
    ├── app.css                  ← design tokens + reset + utilitários
    ├── lib/
    │   ├── stores/
    │   │   └── configurator.ts  ← writable: cor, modo, preço derivado
    │   ├── components/
    │   │   ├── Hero.svelte
    │   │   ├── ScrollTelling.svelte
    │   │   ├── Configurator.svelte
    │   │   ├── Features.svelte
    │   │   ├── Testimonials.svelte
    │   │   ├── FAQ.svelte
    │   │   ├── FinalCTA.svelte
    │   │   ├── SiteFooter.svelte
    │   │   ├── ThemeToggle.svelte
    │   │   ├── HeadphoneSVG.svelte
    │   │   ├── MagneticButton.svelte
    │   │   └── OrbitalParticles.svelte
    │   ├── utils/
    │   │   ├── scroll.ts        ← scrollProgress(), useIntersectionObserver
    │   │   ├── animation.ts     ← easing functions, rAF loop, countUp
    │   │   └── theme.ts         ← init/persist/toggle tema
    │   └── data/
    │       ├── features.ts
    │       ├── testimonials.ts
    │       └── faq.ts
    └── routes/
        └── +page.svelte         ← composição das 7 seções
```

## 3. Sistema de design

### Paleta

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0a0a0f` | `#faf9f7` |
| `--bg-elevated` | `#141419` | `#f0eeeb` |
| `--surface` | `#1c1c24` | `#e8e5e1` |
| `--text` | `#f0ede8` | `#1a1a1f` |
| `--text-muted` | `#8a8690` | `#6b6770` |
| `--accent` | `#e8a040` (âmbar orbital) | `#c07820` |
| `--accent-glow` | `#f0b860` | `#d09030` |
| `--ring` | `#2a2a35` | `#d5d0ca` |

Direção: espaço profundo com calor de âmbar — premium audio + brilho orbital. Nada de roxo/azul genérico.

### Tipografia

- **Display:** Syne (700, 800) — geométrica, expressiva, distinta
- **Body:** Inter (400, 500) — legibilidade máxima
- Escala: 14 / 16 / 18 / 24 / 32 / 48 / 72 / 96px (mobile→desktop)
- `font-display: swap` + preload da fonte display

### Espaçamento

Base 4px: `4 8 12 16 24 32 48 64 96 128 192`

### Motion tokens

| Token | Valor | Uso |
|---|---|---|
| `--dur-micro` | 150ms | hover states, focus |
| `--dur-standard` | 300ms | transições de UI |
| `--dur-dramatic` | 600ms | entradas, reveals |
| `--dur-cinematic` | 1200ms | hero, scroll-telling |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | saídas suaves |
| `--ease-out-back` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | spring/bounce |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | scrubbing |

## 4. Estratégia técnica por seção

### 4.1 Hero
- SVG autoral do fone: formas geométricas (arcos, elipses) com gradientes — estilizado, não foto-realista
- Entrada: CSS keyframes com `animation-delay` escalonado (título → sub → CTA → fone)
- Movimento contínuo: partículas orbitais via Canvas 2D + rAF (órbitas elípticas ao redor do fone)
- Paralaxe: `mousemove` → CSS custom props `--mx`/`--my` → `transform: translate3d()` no fone e nas partículas. Em touch: desativado via `matchMedia('(pointer: fine)')`

### 4.2 Scroll-telling
- Container de 400vh com inner `position: sticky; top: 0; height: 100vh`
- `scroll` listener + rAF calcula progresso [0,1] do container
- Progresso mapeado em 3 etapas via CSS custom props:
  - **Etapa 1 (0–0.33):** fone inteiro rotaciona levemente, texto "Cancelamento Adaptativo"
  - **Etapa 2 (0.33–0.66):** ear cups se separam (exploded view), componentes internos aparecem
  - **Etapa 3 (0.66–1):** reassemble com glow, texto "Som Espacial 360°"
- Indicador de progresso lateral (barra vertical com fill)
- Tudo via `transform`/`opacity` — zero layout thrashing

### 4.3 Configurador
- Store Svelte `configurator`: `{ color: ColorOption, mode: ModeOption }`
- 4 cores: Grafite (#2a2a2e), Prata Lunar (#c8c4be), Azul Abissal (#1a3a5c), Âmbar Solar (#b87020)
- 2º atributo: Modo de som (Imersivo / Estúdio / Ambiente) — altera visualização de ondas sonoras no SVG
- Preço: base R$2.499 + R$200 se modo Estúdio. Count-up via rAF interpolando dígitos
- CTA reflete: "Comprar ÓRBITA — Grafite, R$ 2.499"
- Transição de cor: CSS `transition` nos fills do SVG (600ms, ease-out-expo)

### 4.4 Features
- Grid 3×2 (desktop) → 2×3 (tablet) → 1×6 (mobile)
- Micro-interação: tilt 3D via `mousemove` no card → `transform: perspective(800px) rotateX/Y`
- Ícones SVG autorais inline (ANC, bateria, bluetooth, driver, mic, peso)
- Entrada: IntersectionObserver + stagger via `transition-delay` calculado

### 4.5 Depoimentos
- Marquee infinito: track com conteúdo duplicado, `translateX` animado via rAF
- Pausa em hover: flag que zera a velocidade (com easing, não stop abrupto)
- Drag: pointer events → offset manual + inércia ao soltar
- Cards com quote, nome, cargo, avatar geométrico (SVG)

### 4.6 FAQ
- Accordion: `grid-template-rows: 0fr → 1fr` (anima altura sem JS de medição)
- Teclado: `ArrowUp/Down` navega entre headers, `Enter/Space` toggle, `aria-expanded`
- Ícone +/− rotaciona com a abertura

### 4.7 CTA Final + Footer
- Fone na cor do configurador (mesmo store)
- Botão magnético: `mousemove` no wrapper → translate proporcional à distância do centro
- Ripple autoral no click via Web Animations API
- Footer: links fictícios, nota "produto fictício"

### 5.2 Tema claro/escuro
- Toggle: circular reveal — overlay com `clip-path: circle()` animado via WAAPI
- `prefers-color-scheme` como default; override persiste em `localStorage('orbita-theme')`
- Todas as cores via CSS custom properties no `:root` / `[data-theme="light"]`
- Transição de 600ms nos elementos (background, color) — desligada em reduced-motion

## 5. Ordem de implementação

1. Scaffold SvelteKit + tokens + reset + fontes
2. Theme system (necessário pra todas as seções)
3. HeadphoneSVG (reutilizado em Hero, Scroll-telling, Configurador, CTA)
4. Hero + partículas + paralaxe
5. Scroll-telling
6. Configurador + store
7. Features
8. Depoimentos
9. FAQ
10. CTA final + Footer
11. Reduced-motion + responsivo + polish
12. Build + README
