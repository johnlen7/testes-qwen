# PLANO — ÓRBITA · Experiência Frontend Imersiva

Documento escrito **antes** do código. Define framework, arquitetura, sistema de design e a estratégia técnica de cada seção.

---

## 1. Framework — Vite + TypeScript vanilla (zero runtime)

Justificativa (3 linhas): o desafio mede capacidade crua de animação e proíbe bibliotecas de componente/animação, então um runtime de framework seria peso morto que não agrega valor a uma SPA de uma rota. Vite vanilla entrega build estático, HMR e TypeScript sem nenhum byte de framework no cliente — o que torna trivial o orçamento de ≤ 200 KB gzip (o JS real da página fica na casa dos ~15 KB). Controle total do DOM também elimina qualquer atrito entre abstrações e o scrubbing de scroll dirigido por `requestAnimationFrame`.

## 2. Arquitetura de pastas

```
index.html                 # shell semântico + SVG symbol do fone (sprite)
src/
  main.ts                  # bootstrap: registra todas as seções
  styles/
    tokens.css             # design tokens (cor, tipo, espaço, motion)
    base.css               # reset, layout, tipografia, focus, reduced-motion
    header.css             # nav + theme toggle
    hero.css
    scrolltell.css
    configurator.css
    features.css
    marquee.css
    faq.css
    cta.css
    footer.css
  lib/
    store.ts               # estado compartilhado do configurador (EventTarget)
    motion.ts              # prefers-reduced-motion, scroll progress, lerp, rAF loop
    theme.ts               # tema claro/escuro + reveal circular
  sections/
    hero.ts
    scrolltell.ts
    configurator.ts
    features.ts
    marquee.ts
    faq.ts
    cta.ts
```

Cada seção é um módulo que exporta `init()`. `main.ts` só orquestra. Estado do produto (cor + modo + preço) vive em `store.ts` e é consumido pelo configurador e pelo CTA final — fonte única de verdade.

## 3. Sistema de design

### 3.1 Paleta
Direção: "amanhecer visto da órbita" — preto-cósmico profundo com um acento solar quente (âmbar→laranja), fugindo do clichê roxo/azul SaaS.

| Token | Dark | Light |
|---|---|---|
| `--bg-0` | `#06070c` | `#f3efe6` (osso quente) |
| `--bg-1` | `#0b0d16` | `#ece7db` |
| `--bg-2` | `#131624` | `#e2dccd` |
| `--ink-0` (texto) | `#f2efe8` | `#12141d` |
| `--ink-1` (mudo) | `#a4a9ba` | `#565b6b` |
| `--ink-2` (fantasma) | `#5b6175` | `#8b8f9d` |
| `--accent` | `#ff9e4a` | `#c25a1f` (escurecido p/ contraste AA) |
| `--accent-hot` | `#ff5e3a` | `#e0431f` |
| `--line` | `rgba(242,239,232,.10)` | `rgba(18,20,29,.12)` |

Gradiente assinatura: `--accent-hot → --accent` (flare solar). Ambos os temas testados para contraste AA em texto normal.

### 3.2 Tipografia
- **Display:** *Unbounded* (Google Fonts, variável) — larga, cósmica, nada genérica. Pesos 500/700.
- **Texto:** *Instrument Sans* — humanista, legível. 400/500/600.
- **Números/labels:** tabular-nums + tracking amplo em micro-labels uppercase.
- Escala fluida (`clamp`): display `clamp(2.75rem, 8vw, 6.5rem)`, h2 `clamp(2rem, 4.5vw, 3.5rem)`, h3 `clamp(1.25rem, 2vw, 1.75rem)`, body `clamp(1rem, 1.1vw, 1.125rem)`, micro `0.75rem`.
- `font-display: swap` + `preconnect` para o Google Fonts.

### 3.3 Espaçamento
Escala de 4 px: `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192` exposta como `--sp-*`. Seções usam `--sp-96..192` de ritmo vertical.

### 3.4 Motion tokens
| Token | Valor | Uso |
|---|---|---|
| `--dur-1` | 150ms | micro (hover, toggle) |
| `--dur-2` | 300ms | padrão |
| `--dur-3` | 600ms | entradas, revelações |
| `--dur-4` | 1000ms | orquestração hero |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | expo-out, entradas |
| `--ease-inout` | `cubic-bezier(.65,0,.35,1)` | transições de estado |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | overshoot lúdico |
| `--ease-smooth` | `cubic-bezier(.4,0,.2,1)` | scrub/contínuo |

Regra de performance: animações contínuas usam **apenas** `transform / opacity / clip-path / filter`. Nada que dispare layout.

## 4. Estratégia técnica por seção

### 4.1 Hero
- Entrada orquestrada: cada elemento (`h1`, sub, CTA, produto) com `animation-delay` escalonado via `--i`, curva `--ease-out`, `opacity + translateY`.
- Movimento contínuo: anéis de órbita (SVG) girando em `rotate` com durações diferentes + partículas pontuais — coerente com o nome.
- Paralaxe: `pointermove` → lerp → `translate3d` nas camadas (produto mais lento que anéis). Desligado em touch (`pointer: coarse`) e reduced-motion.

### 4.2 Scroll-telling (scrubbing real)
- **Container com altura explícita de `300vh`** e cena interna `position: sticky; top: 0; height: 100vh`. *(Lição registrada: sem altura definida o progresso dá zero e a seção morre — aqui a altura é fixa e verificada.)*
- Progresso `p ∈ [0,1]` = `scrollTop / (height - innerHeight)`, lido em rAF com lerp para suavidade (60 fps).
- 3 etapas mapeadas em `p`: `[0,.33]` intacto → `[.33,.66]` explode (conchas se afastam, arco sobe) → `[.66,1]` revela driver/internos. Cada peça do SVG é um grupo com transform dirigido por `p` (interpolação por trecho).
- Textos das 3 etapas com `opacity/translate` sincronizados ao mesmo `p`.

### 4.3 Configurador
- 4 cores (Grafite, Marfim, Eclipse, Solar) → trocam CSS vars `--hp-shell/--hp-shell-2/--hp-cushion` do SVG com transição.
- 2º atributo: **modo de som** (Imersivo / Estúdio) → altera visualmente a intensidade dos anéis de órbita + label.
- Preço com **count-up** (rolagem de dígitos via rAF + easing).
- Estado vai para `store.ts`; CTA reflete ("Comprar ÓRBITA — Grafite · R$ 2.499") e o CTA final reusa o mesmo estado.

### 4.4 Features
- 6 cards, ícones SVG autorais (traço, não emoji).
- Micro-interação: tilt 3D (`rotateX/rotateY` no `pointermove`) + glow radial que segue o cursor (`--mx/--my`).
- Entrada stagger por `IntersectionObserver` + `--i`.

### 4.5 Depoimentos (marquee autoral)
- Track duplicado, loop por `translateX` em CSS animation. Pausa em hover (`animation-play-state`).
- Drag com Pointer Events: captura o ponteiro, desloca o track, solta com inércia leve. Loop infinito sem salto (conteúdo clonado).

### 4.6 FAQ
- Accordion com animação de altura via **`grid-template-rows: 0fr → 1fr`** (resolve o clássico `height: auto` sem JS de medição, suave e barato).
- Teclado: setas movem foco entre cabeçalhos (roving tabindex), Enter/Espaço abrem, `aria-expanded`/`aria-controls` corretos.

### 4.7 CTA final + rodapé
- Produto renderizado na cor escolhida (mesmas CSS vars do store).
- Botão **magnético** (translate em direção ao cursor dentro de um raio) + brilho.
- Rodapé simples, coerente.

## 5. Transversais
- **Tema:** toggle com **reveal circular** via View Transitions API (`clip-path: circle()`), fallback cross-fade. Início por `prefers-color-scheme`, persiste em `localStorage`. Script inline no `<head>` aplica o tema antes do paint (sem FOUC).
- **Reduced-motion:** media query mata animações decorativas; JS checa `matchMedia` e pula loops de rAF/paralaxe/tilt.
- **Acessibilidade:** landmarks, hierarquia de headings, focus-visible autoral (anel duplo com accent), `aria-*` corretos.
- **Responsivo:** breakpoints 360 / 768 / 1280+ intencionais (grids colapsam, tipo escala, interações touch equivalentes).

## 6. Ordem de implementação
1. Scaffold (package.json, tsconfig, index.html, vite).
2. Tokens + base + tema.
3. Sprite SVG do fone (peças nomeadas para o explode).
4. Hero → Scroll-telling → Configurador (+ store).
5. Features → Marquee → FAQ.
6. CTA final + footer + header/nav.
7. `npm run build`, corrigir, verificar checklist, README.
