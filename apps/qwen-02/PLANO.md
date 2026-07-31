# PLANO.md — ÓRBITA · Experiência Frontend Imersiva

> Plano escrito **antes** do código, conforme exigido pelo `PROMPT.md`.

---

## 1. Framework e justificativa (3 linhas)

**React 18 + Vite + TypeScript**, com CSS puro autoral (sem Tailwind, sem lib de componente/animação).
React dá componentização limpa e estado reativo compartilhado (configurador → CTA final), que é o coração da interatividade; Vite gera build estático rápido e confiável em Node 20+.
Toda animação é escrita à mão (CSS + Web Animations API + `requestAnimationFrame`), maximizando controle de física de movimento e mantendo o JS final mínimo (só `react` + `react-dom` de runtime).

**Por que não os outros:** Next/Astro trazem runtime/SSR desnecessários para uma SPA de rota única e estática; vanilla puro dificultaria o estado compartilhado e a componentização avaliadas na rubrica. React+Vite é o menor caminho confiável entre "componentização nota 15" e "performance nota 10".

---

## 2. Arquitetura de pastas

```
qwen-02/
├─ index.html                 # shell HTML, meta SEO/OG, theme-color, noscript
├─ package.json               # só react, react-dom + 2 fontes self-host; zero lib proibida
├─ vite.config.ts
├─ tsconfig.json
├─ src/
│  ├─ main.tsx                # bootstrap + import das fontes self-host
│  ├─ App.tsx                 # composição das seções + providers
│  ├─ styles/
│  │  ├─ tokens.css           # design tokens (cor, tipo, espaço, raio, motion)
│  │  └─ global.css           # reset, base, foco autoral, reduced-motion, utilitários
│  ├─ lib/
│  │  ├─ product.ts           # dados: cores, tamanhos, features, FAQ, depoimentos
│  │  └─ format.ts            # formatação BRL
│  ├─ state/
│  │  └─ ConfiguratorContext.tsx  # estado compartilhado cor/tamanho/preço
│  ├─ hooks/
│  │  ├─ useTheme.ts          # claro/escuro + localStorage + prefers-color-scheme
│  │  ├─ usePrefersReducedMotion.ts
│  │  ├─ useScrollScrub.ts    # progresso 0..1 de um elemento (rAF, passive)
│  │  ├─ useInView.ts         # IntersectionObserver p/ reveals
│  │  ├─ usePointerParallax.ts# reação ao mouse (desktop), nula em touch
│  │  └─ useCountUp.ts        # contagem animada de preço
│  └─ components/
│     ├─ Headphones.tsx       # fone SVG autoral parametrizado (cor/tamanho/explodido)
│     ├─ Starfield.tsx        # canvas: estrelas + órbitas (movimento contínuo)
│     ├─ Nav.tsx  ThemeToggle.tsx  Reveal.tsx  Magnetic.tsx
│     └─ sections/
│        ├─ Hero.tsx  ScrollStory.tsx  Configurator.tsx  Features.tsx
│        ├─ Testimonials.tsx  Faq.tsx  FinalCta.tsx  Footer.tsx
```

---

## 3. Sistema de design

### 3.1 Direção de arte — "Solar no vazio"
O nome evoca órbita/espaço. Fugindo do clichê "gradiente roxo de IA", a paleta é um **vazio azul-petróleo quase preto** com **um único acento âmbar solar** (o sol nascendo na órbita). Um acento só, travado na página inteira (regra de consistência).

### 3.2 Paleta (tokens, dark = padrão)
| Token | Dark | Light |
|---|---|---|
| `--bg-0` | `#06080D` | `#F4F6FA` |
| `--bg-1` | `#0A0E16` | `#FFFFFF` |
| `--bg-2` | `#111725` | `#EDF1F7` |
| `--line` | `rgba(255,255,255,.08)` | `rgba(10,14,22,.10)` |
| `--text-0` | `#F2F5FA` | `#0A0E16` |
| `--text-1` | `#AAB3C5` | `#454E63` |
| `--text-2` | `#6B7488` | `#7A8299` |
| `--accent` | `#F5A83C` | `#C97E12` |
| `--accent-strong` | `#FFBE5C` | `#B26E08` |
| `--accent-text` | `#FFC873` | `#9A6108` |
| `--accent-ink` | `#20140A` | `#FFFFFF` |

Contraste AA auditado: `text-1` sobre `bg-0` ≥ 7:1 (dark); `accent-text` sobre fundo ≥ 4.5:1 em ambos temas; `accent-ink` sobre `accent` ≥ 4.5:1.

### 3.3 Tipografia
- **Display:** Space Grotesk (variable) — técnica, temática, distinta (não é Inter).
- **Body:** Manrope (variable) — grotesca limpa e legível.
- **Mono:** stack de sistema (`ui-monospace…`) — só em micro-labels técnicos (specs, preço).
- Escala fluida (`clamp`): `display-xl 2.75→5.5rem`, `display-lg 2→3.5rem`, `display-md 1.5→2.25rem`, `title 1.375rem`, `body-lg 1.125rem`, `body 1rem`, `small .875rem`, `micro .75rem` (uppercase, tracking amplo).
- Hierarquia forte: hero `display-xl` tracking apertado `leading .98`; subtexto máx. ~20 palavras.

### 3.4 Espaçamento
Escala 4px-base em rem: `--sp-1 .25 … --sp-10 8rem`. Containers `max-width 1200px`, gutter `clamp(1.25rem, 5vw, 4rem)`.

### 3.5 Raios (consistência de forma)
`--r-sm 8px` (inputs), `--r-md 14px`, `--r-lg 22px` (cards), `--r-pill 999px` (botões). Regra: botão sempre pill, card sempre lg, input sm.

### 3.6 Motion — tokens de duração/easing
| Token | Valor | Uso |
|---|---|---|
| `--dur-1` | `150ms` | micro (hover, toggle) |
| `--dur-2` | `300ms` | padrão |
| `--dur-3` | `600ms` | ênfase (reveal, tema) |
| `--dur-4` | `900ms` | cinematográfico (hero, scroll-story) |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | expo-out premium (entradas) |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | transições simétricas |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | overshoot lúdico (CTA, swatches) |

**Regra de performance:** animações contínuas usam **apenas** `transform`/`opacity`/`clip-path`/`filter`. Nada que dispare layout. Scroll-scrub via `requestAnimationFrame` + listener `passive`, valores aplicados direto no `style.transform` (fora do ciclo de render do React).

---

## 4. Estratégia técnica por seção

### 4.1 Hero
- Entrada **orquestrada**: cada elemento (eyebrow → título → subtítulo → CTA → fone) com `animation-delay` escalonado usando `--ease-out` + `--dur-4`; título com máscara `clip-path` revelando linha a linha.
- **Movimento contínuo**: `Starfield` (canvas) com estrelas em profundidade + 2 anéis orbitais e um "satélite" girando via rAF; respeita reduced-motion (vira estático).
- **Parallax/mouse**: `usePointerParallax` translada fone e starfield em camadas (fatores diferentes). Em touch/reduced-motion, desligado.
- Layout **assimétrico** (copy à esquerda, fone à direita) — anti-hero-centralizado.

### 4.2 Scroll-telling ("como funciona") — o ponto central de animação
- Container `height: 320vh` com viewport interno `position: sticky; height: 100vh`.
- `useScrollScrub` mapeia o progresso do container → `p ∈ [0,1]` (rAF, sem setState por frame).
- **3+ etapas** mapeadas por faixas de `p`, com **scrubbing real** (não trigger):
  1. `0.00–0.33` fone montado rotaciona levemente; texto "Cancelamento adaptativo".
  2. `0.33–0.66` **explode em partes** (headband, conchas, almofadas, driver se afastam em `translate`/`rotate` por grupo SVG); labels técnicos aparecem; texto "Engenharia espacial".
  3. `0.66–1.00` partes recombinam + anel de onda ANC pulsa; texto "Áudio que orbita você".
- Função `lerp` + easing por segmento; cada grupo SVG recebe `transform` calculado. Texto cross-fade (`opacity`+`translateY`) por etapa.
- Reduced-motion: etapas viram blocos estáticos empilhados (sem sticky, sem scrub).

### 4.3 Configurador
- **4 cores** (Grafite, Prata Lunar, Meia-noite, Areia Solar) — swatches com estado ativo animado (`--ease-spring`); cor do fone transiciona via CSS `transition` nas fills SVG.
- **2º atributo: tamanho de concha** (Over-ear / On-ear) — escala as conchas do SVG visivelmente e muda o preço base.
- **Preço count-up**: `useCountUp` anima do valor anterior ao novo (rAF, `--ease-out`), formato BRL.
- **CTA refletido**: "Comprar ÓRBITA — Grafite · Over-ear · R$ 2.499". Estado em `ConfiguratorContext` **reutilizado no CTA final** (4.7).

### 4.4 Features
- 5 cards, **ícones SVG autorais** (ANC/onda, bateria, órbita/spatial, bluetooth, carga rápida).
- Micro-interação: **tilt 3D** por pointer (`rotateX/rotateY` + glow que segue o cursor) e ícone que anima no hover; `:active` com push `scale(.98)`.
- Entrada stagger por scroll via `useInView` + `transition-delay` escalonado.

### 4.5 Depoimentos
- **Marquee infinito autoral**: duas filas (direções opostas), conteúdo duplicado, loop por `translateX` (CSS keyframe linear) — sem salto visível.
- **Pausa em hover** (`animation-play-state`) e **drag** com Pointer Events (offset acumulado; ao soltar, retoma). Touch funciona via pointer events.

### 4.6 FAQ
- Accordion autoral; altura animada pelo truque **`grid-template-rows: 0fr → 1fr`** (anima "auto" sem JS de medição, só `transform`-free e suave).
- Teclado: `↑/↓` move foco entre cabeçalhos, `Home/End`, `Enter/Space` alterna; `aria-expanded`, `aria-controls`, `role=region`, foco visível autoral.

### 4.7 CTA final + rodapé
- Fone renderizado na **cor/tamanho do estado compartilhado** (mesmo `Headphones` + context).
- Botão **magnético** (`Magnetic.tsx`: translate em direção ao cursor com spring, reset suave) — micro-interação premium.
- Rodapé coerente: wordmark, links, nota "produto fictício".

---

## 5. Requisitos transversais

- **Tema claro/escuro** (`useTheme`): inicial por `prefers-color-scheme`, persiste em `localStorage`, aplica `data-theme` no `<html>`. Toggle com **reveal circular** via View Transitions API (`clip-path` circular expandindo do botão) + fallback cross-fade. Ambos temas AA.
- **`prefers-reduced-motion`**: CSS desliga keyframes/transições decorativas; hooks JS (parallax, starfield, scrub, count-up) checam `usePrefersReducedMotion` e viram estado final estático.
- **Acessibilidade**: landmarks (`header/nav/main/section/footer`), headings hierárquicos, `alt`/`aria-label`, foco visível autoral (anel `accent` com offset), contraste AA, `100dvh` (sem CLS de barra mobile).
- **Responsivo**: breakpoints `768px` e `1280px` (+ base mobile 360px). Hero vira stack em mobile; scroll-story mantém sticky; grids colapsam; nav condensa.
- **Performance**: só `transform/opacity/clip-path/filter` em contínuo; canvas com `devicePixelRatio` limitado a 2; listeners passive; rAF coalescido; fontes self-host variable com `font-display: swap`; zero dependência proibida; JS ≈ react+react-dom + código autoral (bem < 200KB gzip).

---

## 6. Criatividade extra (os 5 pts "delight")
- **Wordmark ÓRBITA**: o acento do "Ó" é um **satélite que orbita** a letra continuamente.
- **Magnetic CTA** no fechamento + ripple sutil autoral.
- **Anel de progresso orbital** discreto no nav refletindo o scroll da página.
- **Ondas ANC** animadas (SVG stroke-dash) na etapa 3 do scroll-telling.
- Starfield com **profundidade/parallax** real (3 camadas).

---

## 7. Ordem de implementação
1. Config base (package.json, vite, tsconfig, index.html, .gitignore).
2. Design system (`tokens.css`, `global.css`).
3. `lib/` (dados + format) e `state/` (context do configurador).
4. `hooks/` (theme, reduced-motion, scroll-scrub, inView, parallax, countUp).
5. `Headphones.tsx` (SVG parametrizado) e `Starfield.tsx` (canvas).
6. Componentes de UI (Nav, ThemeToggle, Reveal, Magnetic).
7. Seções na ordem da página: Hero → ScrollStory → Configurator → Features → Testimonials → Faq → FinalCta → Footer.
8. `App.tsx` / `main.tsx` integrando.
9. `npm install && npm run build`; corrigir até passar; rodar dev e revisar checklist.
10. `README.md` + autoavaliação final.
