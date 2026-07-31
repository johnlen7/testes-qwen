# ÓRBITA One — landing imersiva de lançamento

Fone de ouvido fictício com cancelamento de ruído adaptativo espacial. Frontend 100% estático, zero backend, zero bibliotecas de componentes ou animação — tudo escrito à mão (SVG, CSS, Web Animations API e `requestAnimationFrame`).

## Rodar

```bash
npm install     # Node 20+
npm run dev     # dev server → http://localhost:5173
npm run build   # gera dist/ estático (sem erro)
npm run preview # serve o build → http://localhost:4173
```

## Decisões principais

| Decisão | Por quê |
|---|---|
| **Vanilla JS + Vite** | JS enviado ao cliente: **7,2 KB gzip** (meta do PRD: ≤ 200 KB). Controle total sobre cada animação escrita à mão; SPA de rota única não justifica runtime de framework. |
| **Fone em SVG parametrizável** | `src/js/headphones.js` é uma fábrica: cada parte (arco, hastes, almofadas, conchas, núcleo) tem classe própria e cores via custom properties registradas (`@property`) — troca de cor transiciona de verdade, e o "explode" do scroll-telling anima peça por peça. |
| **Scroll-telling com scrub em rAF** | Contêiner `400vh` + stage `sticky`; a cada frame: `progress = -rect.top / (trackHeight − viewportH)` → transforms por parte (só `transform`/`opacity`). A altura do contêiner é **explícita no CSS** — a falha clássica (contêiner com altura zero matando o scrub) é estruturalmente impossível aqui. |
| **Tema com View Transitions API** | `prefers-color-scheme` como padrão, escolha pinada em `localStorage` por script inline anti-FOUC; o toggle usa `document.startViewTransition` com reveal circular (`clip-path`) e fallback de troca direta. |
| **Marquee com Web Animations API** | Loop infinito sem salto (duplica conteúdo com `aria-hidden`), pausa em hover e **drag por pointer events** com retomada contínua via `currentTime`. |
| **FAQ com `grid-template-rows: 0fr↔1fr`** | Altura animada sem hack de `max-height`; navegação por setas (roving tabindex), `aria-expanded`/`aria-controls`. |
| **Estado compartilhado** | Store pub/sub de ~30 linhas (`store.js`): cor, equalização e acabamento fluem do configurador até o CTA final — "Comprar agora — R$ 2.799 · Pro". |
| **Reduced motion** | Media query global + checks em JS: scrub vira lista estática legível, marquee para, órbitas congelam, reveals viram fades. |

## Arquitetura

```
index.html                 # semântica das 7 seções (contrato dos módulos)
src/
├── main.js                # boot: tema (anti-FOUC) + init de cada seção
├── js/
│   ├── store.js           # estado compartilhado (cor, EQ, Pro) + pub/sub
│   ├── utils.js           # easing autorais, rAF loop, count-up, IO reveal
│   ├── headphones.js      # fábrica SVG do fone (cores, partes, explode)
│   └── sections/          # hero · scrolltelling · configurator · features
│                          # marquee · faq · cta · theme
└── styles/
    ├── tokens.css         # paleta, tipo, espaço, duração, easing, @property
    ├── base.css           # reset, foco autoral, reduced-motion
    ├── theme.css          # toggle + reveal circular do tema
    └── sections/          # um CSS por seção
```

## Design system

- **Direção:** "instrumento orbital de áudio" — o fone tratado como relógio de luxo/mesa hi-fi em órbita; assinatura = **Anel de Ressonância** (escala de mostrador girando em torno do produto).
- **Paleta:** Observatório noturno — preto profundo `#05060A`, cobre `#FF7A45`, dourado técnico `#E8B44A`; tema claro perolado frio ("lua"), não cream.
- **Tipografia:** Unbounded (display, restrita a headlines/números) + Space Grotesk (corpo/labels).
- **Motion:** durações 90/150/300/600/900 ms; easings autorais (`--e-expo`, `--e-spring`, `--e-io`).
- **Só propriedades compositor** (`transform`/`opacity`/`clip-path`/`filter`) em animações contínuas.

## Verificação

- `npm run build` passa sem erro; JS total 7,2 KB gzip + CSS 7,1 KB.
- Verificação visual em browser (Playwright): hero, scroll-telling em 4 pontos do scrub (valores de transform confirmados por `getComputedStyle`), configurador interativo (cor/EQ/Pro/preço/CTA), tema claro/escuro, responsivo 360px sem overflow.

## O que faria com mais tempo

- **Áudio real**: um microfone animado de "teste ANC" que reage a `getUserMedia` (com opt-in), mostrando o ruído sendo invertido ao vivo no scroll-telling.
- **Persistência da configuração** em `localStorage` (cor/EQ/Pro sobrevivendo ao reload).
- **Canvas 2D** para o visualizador de espectro no hero (escrito à mão, como permitido) com reação à música via Web Audio.
- **Testes de unidade** (Vitest) para a lógica de scrub e do store.
- **Pré-carregamento otimizado** das fontes (subsets) e `content-visibility` nas seções abaixo da dobra.
