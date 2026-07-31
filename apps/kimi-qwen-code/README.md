# ÓRBITA — Experiência de lançamento

Site imersivo de lançamento do **ÓRBITA**, fone de ouvido premium fictício com
cancelamento de ruído "adaptativo espacial". 100% frontend estático, sem nenhuma
biblioteca de componentes ou de animação — tudo (componentes, animações,
carrossel, accordion, configurador) é autoral.

## Como rodar

```bash
npm install
npm run dev       # desenvolvimento em http://localhost:4321
npm run build     # gera saída estática em dist/
npm run preview   # serve o build em http://localhost:4321
```

Requer Node 20+.

## Stack

- **Astro** (output estático) + **CSS puro** + **JS vanilla em módulos**.
- Zero runtime de framework no cliente: o JS total enviado é **~4 KB gzip**
  (orçamento do desafio: 200 KB).
- Animações exclusivamente com CSS (transitions/keyframes), Web Animations API
  e `requestAnimationFrame` escritos à mão.
- Produto desenhado em **SVG autoral** (`src/components/OrbitaSVG.astro`),
  reusado em Hero, scroll-telling, configurador e CTA final.

## O que tem na página

1. **Hero** — entrada orquestrada (stagger com `clip-path` no título), anéis
   orbitais em rotação contínua, partículas, glow respirando e paralaxe de mouse
   por camadas com lerp (desligado em touch e reduced-motion).
2. **Scroll-telling** — seção de 430vh com palco sticky e **scrubbing real**:
   o progresso do scroll é mapeado por frame para o explode das 7 partes do
   fone, ondas de ANC, rotação de remontagem e crossfade dos 4 textos. Rail de
   progresso lateral.
3. **Configurador** — 4 cores (transição animada de `fill` via CSS vars),
   tamanho de concha que escala o produto, preço com **count-up** por rAF,
   CTA com estado refletido ("Comprar ÓRBITA — Solar · R$ 2.849").
4. **Features** — 6 cards com ícones SVG autorais, tilt 3D + glow que segue o
   cursor, entrada staggered por IntersectionObserver.
5. **Depoimentos** — marquee infinito autoral (wrap por módulo, sem salto),
   pausa em hover/focus, drag por pointer events com inércia.
6. **FAQ** — accordion com altura animada via `grid-template-rows: 0fr → 1fr`,
   navegação por setas/Home/End, `aria-expanded`.
7. **CTA final** — consome o estado do configurador via store compartilhado
   (`CustomEvent`), botão **magnético** com ripple, anéis de "sonar" de fundo.

## Transversais

- **Tema claro/escuro**: toggle com reveal circular a partir do clique (WAAPI
  `clip-path: circle()`), `prefers-color-scheme` como padrão, persistência em
  `localStorage`, script inline anti-FOUC. Ambos os temas com contraste AA.
- **Reduced motion**: todas as animações decorativas desligam (CSS + todos os
  módulos JS checam `prefers-reduced-motion`); o scroll-telling vira conteúdo
  estático e o marquee vira lista rolável.
- **Acessibilidade**: landmarks, headings hierárquicos, skip-link, focus
  visible autoral, radios reais no configurador, preço com região
  `visually-hidden` para leitores de tela (o count-up não spamma aria-live).
- **Motion system**: durações 150/300/600/1200ms e easings autorais
  (`cubic-bezier(0.16,1,0.3,1)` etc.) em tokens CSS; animações contínuas só em
  `transform`/`opacity`/`clip-path`/`filter`.
- **Responsivo**: 360 / 768 / 1280+ com layouts intencionais (hero empilha,
  story reordena palco/texto, grids colapsam).

## QA

`qa/func.py` — 22 asserções funcionais automatizadas (Playwright): scrubbing do
scroll-telling, count-up, sync de estado entre CTAs, teclado do FAQ, pausa do
marquee, toggle/persistência de tema, `prefers-color-scheme`, reduced-motion e
overflow em 360px. `qa/shots.py` gera screenshots das seções.

## Decisões principais

- **Astro** pelo HTML estático com zero JS por padrão: o teto de performance
  fica altíssimo e toda interatividade é código nosso.
- **Um único SVG paramétrico** do produto, colorido por CSS vars — é o que
  permite a troca de cor animada e o estado compartilhado sem duplicar arte.
- **Store mínimo com `CustomEvent`** em vez de framework de estado.
- Scroll-telling com rAF + `getBoundingClientRect` (1 leitura/frame) em vez de
  scroll-driven animations, para controle fino das curvas por etapa.

## Com mais tempo eu faria

- View Transitions entre tema/seções e `animation-timeline: scroll()` com
  fallback progressivo.
- Variação de "modo de som" alterando o padrão das ondas de ANC no story.
- Testes de contraste automatizados (axe) no pipeline de QA.
- Seção de especificações técnicas com tabela comparativa animada.
- Service worker para cache offline do build estático.

---

ÓRBITA é um produto fictício criado para um desafio de frontend.
