# ÓRBITA X1 — O silêncio, em órbita

Site de lançamento imersivo do **ÓRBITA X1**, um fone de ouvido premium fictício com cancelamento
adaptativo espacial. Frontend 100% estático — sem backend, sem bibliotecas de componentes,
sem bibliotecas de animação. Tudo escrito à mão: SVG do produto, Canvas, Web Animations API e
`requestAnimationFrame`.

> Direção de arte: **instrumento de precisão em órbita** — espaço profundo, hairlines frias,
> display grotesca com acentos em itálico serifado, e um **acento dinâmico que reage à cor
> escolhida do fone** no configurador.

---

## Como rodar

```bash
npm install      # instala vite + typescript (nada mais)
npm run dev      # dev server → http://localhost:5173
npm run build    # tsc --noEmit + vite build → dist/ estático
npm run preview  # serve o build em http://localhost:4173
npm run qa       # QA automatizado (Playwright/Edge): 1280/768/360 + reduced-motion
```

Node 20+ (testado em Node 24).

---

## Stack e decisões

| Decisão | Escolha | Por quê |
|---|---|---|
| Framework | **Vite + TypeScript vanilla** | O scroll-telling exige scrubbing frame-a-frame com controle direto do DOM via rAF. Sem reconciliação de framework no caminho = 60fps garantido no hardware médio. Zero runtime → **8,3 KB gzip de JS** (teto: 200 KB). |
| Animações | CSS + Web Animations API + rAF | Nada de GSAP/Framer: easings tokenizados, um único `seq()` de keypoints para o scrub, loop global de rAF com callbacks registrados. |
| Visual do produto | **SVG autoral injetado por TS** (1 instância por seção, 4 no total) | Mesmo builder alimenta hero, scroll-telling, configurador e CTA final; cor e modo dirigidos por `data-attributes` + CSS vars (`--cw-*`, `--shell-fill`), então a troca de cor é uma transição CSS pura (`stop-color`/`fill` + pop elástico). |
| Tema | `<html data-theme>` + CSS vars | `prefers-color-scheme` como padrão, `localStorage['orbita:theme']` persistindo a escolha; o toggle usa um **reveal circular** (clip-path + WAAPI) que pinta o novo tema do botão para fora. |
| Acento dinâmico | `data-accent` no `<html>` | A cor escolhida no configurador tinge o site inteiro (glows, links, botões, fone) com transição de 600 ms. |

## Arquitetura

```
index.html            → markup semântico das 7 seções (landmarks, headings, skip-link)
src/styles/           → tokens.css (sistema de design) + um CSS por seção
src/js/
  motion.ts           → easings (expo/quart/elastic), lerp, seq() de keypoints, loop rAF global, RM/pointer
  store.ts            → estado compartilhado (cor + modo → preço, acento) + subscribers
  theme.ts            → tema com reveal circular
  headphone.ts        → builder do SVG do fone (parts com ids estáveis p/ o scrub)
  starfield.ts        → céu profundo em Canvas 2D (drift, twinkle, paralaxe)
  hero.ts             → entrada orquestrada + paralaxe de mouse (desktop)
  story.ts            → scroll-telling: 4 etapas, progresso p ∈ [0,1] → transformações por rAF
  config.ts           → configurador (count-up com token anti-race)
  features.ts         → tilt 3D por CSS vars + glow guiado pelo mouse
  marquee.ts          → loop infinito WAAPI + pause no hover + drag com física (flick)
  faq.ts              → accordion com altura via WAAPI (0 → scrollHeight → auto) + roving tabindex
  cta.ts              → CTA final magnético + estado compartilhado
  cursor.ts           → follower orbital (pointer:fine, RM-safe)
scripts/qa.mjs        → QA automatizado (dev tool)
```

## As seções

1. **Hero** — entrada em cascata (eyebrow → título por linhas → sub → CTAs → fone), órbitas girando
   com satélites, starfield em Canvas, paralaxe 3D sutil no fone (desktop), chip de status flutuante.
2. **Engenharia (scroll-telling)** — palco `position: sticky` em 420vh; o scroll é mapeado
   **continuamente** ao progresso (scrubbing real, sem triggers): rotação de entrada → o arco sobe →
   explosão em partes com callouts (linhas de âncora) → remontagem revelando a **cor escolhida no
   configurador** + anel de sintonia. Rail de progresso, contador 01–04, textos sincronizados por janela.
3. **Configurador** — 5 cores com transição animada + pop elástico, 3 modos de som que mudam o visual
   do fone (Espacial = anéis; Silêncio Total = ondas ANC; Transparência = concha translúcida revelando
   o driver planar), preço com **count-up** (e parcela 12× animada), CTA refletindo o estado.
4. **Recursos** — 6 cards com ícones SVG autorais (traço 1.5, grade 24), tilt 3D + glow que segue o
   cursor, reveal com stagger.
5. **Prova social** — 2 marquees infinitos em direções opostas (WAAPI, sem salto visível), pausa no
   hover, drag com pointer events e física de flick no soltar.
6. **FAQ** — accordion com altura animada corretamente (0 → scrollHeight → auto via WAAPI), setas /
   Home / End / Enter, `aria-expanded`/`aria-controls`.
7. **CTA final + rodapé** — o fone na cor/modo escolhidos (estado compartilhado), botão magnético que
   segue o cursor com mola, toast de pré-pedido, rodapé com wordmark orbital.

## Detalhes "que ninguém pediu"

- O **acento do site muda** conforme a cor do fone escolhida — glows, links, LED e satélites seguem.
- **Wordmark** "ÓRBITA" com um ponto que orbita a letra A.
- **Cursor-follower orbital** (anel em atraso + ponto) em desktop, RM-safe.
- Contador de etapa + rail no scroll-telling; hairline de progresso de página no topo.
- Parcela 12× no configurador anima junto com o preço.
- Modo "Transparência" no configurador revela o driver planar interno do fone (e a FAQ brinca com isso).

## Acessibilidade

- `prefers-reduced-motion`: CSS mata todas as animações (`.01ms`) **e** o JS desliga loops, paralaxe e
  o scrub — o scroll-telling colapsa para um palco estático com os 4 textos empilhados.
- Contraste AA nos dois temas, inclusive tons mutados e acentos (verificado por cálculo de luminância).
- Navegação completa por teclado com foco visível autoral (outline + glow no acento); skip-link;
  landmarks; hierarquia h1→h3; `aria-expanded`, `aria-live` no preço/toast.

## Performance

- **8,3 KB gzip de JS** + 9 KB de CSS (fontes via Google Fonts com `display=swap`).
- Animações contínuas apenas em `transform`/`opacity`/`clip-path`/`filter` (FAQ usa `height`, mas é
  interação discreta, não contínua).
- `content-visibility: auto` nas seções abaixo da dobra; glow via gradientes (sem blur caro).
- Starfield desenhado por frame em Canvas com `devicePixelRatio` limitado a 2.

## O que eu faria com mais tempo

- Um **preloader** de 600 ms com o wordmark girando (a entrada do hero já sugere esse ritmo).
- **Áudio de interface** (clique orbital sintetizado em WebAudio — sem assets).
- Uma etapa extra no scroll-telling mostrando o **interior da concha** em corte.
- Testes de Lighthouse rodando num CI com thresholds fixados (o QA atual cobre layout/interação;
  Lighthouse exige o binário local).
- Suporte a compartilhamento de configuração via URL (`?cor=aurora&modo=silencioso`).

---

Feito para o desafio — sem templates, sem bibliotecas de UI, sem GSAP. Só CSS, SVG, Canvas e física
de easing.
