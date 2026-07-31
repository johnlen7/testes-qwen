# ÓRBITA — Experiência Frontend Imersiva

Site de lançamento do fone de ouvido premium fictício ÓRBITA. 100% frontend estático, sem bibliotecas de componentes ou animação — tudo autoral.

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Para build de produção:

```bash
npm run build
npm run preview
```

A saída estática vai para `build/`.

## Stack

- **SvelteKit 5** + static adapter (runtime JS mínimo, ~50KB gzip total)
- **CSS puro** com custom properties (design tokens)
- **Canvas 2D** para partículas orbitais
- **Web Animations API** para o circular reveal do tema
- **requestAnimationFrame** para scroll-telling e marquee
- **Google Fonts:** Syne (display) + Inter (body)

## Decisões principais

| Decisão | Motivo |
|---|---|
| SvelteKit over React | Compila o framework away → JS mínimo. Stores reativos nativos para estado compartilhado. |
| CSS custom properties para temas | Transição suave entre temas sem JS de repaint. Uma troca de atributo no `<html>` propaga tudo. |
| `grid-template-rows: 0fr → 1fr` no FAQ | Anima altura sem medir DOM — resolve o clássico `height: auto` sem JS. |
| Marquee via rAF + translateX | Loop infinito sem salto, com inércia no drag e pausa suave em hover. |
| Scroll-telling com sticky + progresso | Scrubbing real mapeado a 3 etapas. Container 400vh, inner sticky, progresso via getBoundingClientRect. |
| Partículas em Canvas 2D | 40 partículas orbitais a 60fps sem pesar o DOM. |
| Botão magnético + ripple | translate proporcional à distância do centro + ripple via WAAPI no click. |

## O que faria com mais tempo

- **WebGL shader** no hero para um efeito de distorção gravitacional ao redor do fone
- **Scroll-driven animations CSS** (API nativa) como progressive enhancement no scroll-telling
- **View Transitions API** para transição de tema ainda mais fluida
- **Testes E2E** com Playwright cobrindo acessibilidade e interações
- **OG image** gerada dinamicamente com Canvas para compartilhamento social
- **Easter egg:** modo "espaço profundo" com fundo estrelado e som ambiente (Web Audio API)

## Estrutura

```
src/
├── app.css              ← design tokens, reset, utilitários
├── lib/
│   ├── stores/          ← estado compartilhado (configurador)
│   ├── components/      ← 12 componentes autorais
│   ├── utils/           ← scroll, animation, theme helpers
│   └── data/            ← conteúdo mockado
└── routes/
    ├── +layout.svelte   ← skip-link + header fixo (nav, tema, menu mobile)
    └── +page.svelte     ← composição das 7 seções
```
