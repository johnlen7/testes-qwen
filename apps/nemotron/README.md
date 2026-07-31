# ÓRBITA — Experiência Frontend Imersiva

Site de lançamento do **ÓRBITA**, um fone de ouvido premium fictício com cancelamento de ruído *adaptativo espacial*. Frontend 100% estático, sem backend, sem bibliotecas de componentes ou de animação — tudo escrito à mão.

## Como rodar

```bash
npm install      # instala dependências (Node 20+)
npm run dev      # dev server → http://localhost:5173 (Vite)
npm run build    # build estático em dist/
npm run preview  # serve o build de produção localmente
```

A porta padrão do Vite é **5173** (ajustável com `--port`). O build de produção é estático — `dist/` pode ser servido por qualquer servidor de arquivos.

## Decisões principais

- **Framework:** React 19 + TypeScript + Vite. O produto exige estado compartilhado entre seções (configurador → CTA final) e sincronização fina de animações com scroll; React resolve a primeira com Context e a segunda com refs + `requestAnimationFrame`, sem re-render por frame.
- **Direção de arte — "satélite solar":** fundo preto quente, acento âmbar (o sol) e tipografia editorial (Fraunces display / Instrument Sans texto / IBM Plex Mono dados). Nada de gradiente roxo/azul, nada de glassmorphism decorativo.
- **Sistema de motion:** easings autorais (`--ease-out-expo`, `--ease-out-quart`, `--ease-spring`…), durações em escala 150/300/600/900ms. Animações contínuas restritas a `transform`/`opacity`/`clip-path`/`filter` — 60fps sem layout thrashing.
- **Produto em SVG autoral:** um único `ProductGraphic` parametrizado por CSS variables. O scroll-telling escreve `--explode`/`--spin2` direto no DOM dentro do rAF (scrubbing real, zero re-render); o configurador troca `--cup`/`--cup-shade`; o modo de som controla as barras de EQ e as ondas espaciais.
- **Scroll-telling com scrub:** seção de 400vh com viewport sticky; o progresso do scroll mapeia a "explosão" do fone em 3 etapas sincronizadas com crossfade de texto (smoothstep) e transição de fundo.
- **Configurador:** 5 cores + 3 modos de som, preço com count-up via rAF, estado persistido em `ProductContext` e refletido no CTA e na seção final.
- **Detalhes autorais:** reveal circular na troca de tema (iris wipe a partir do clique), botão magnético com ripple no CTA final, marquee dirigido por rAF com drag e inércia, tilt 3D com glare nos cards, accordion com `grid-template-rows 0fr→1fr` (altura animada sem medição JS).
- **Acessibilidade:** `prefers-reduced-motion` desliga todas as animações decorativas (verificado em runtime), navegação completa por teclado (FAQ com setas/Home/End, menu mobile com Esc e foco devolvido), `:focus-visible` autoral, landmarks semânticos, `aria-expanded`/`aria-controls`/`aria-pressed` corretos, contraste AA nos dois temas.
- **Tema:** padrão `prefers-color-scheme`, persistência em `localStorage`, bootstrap inline no `index.html` sem FOUC.

## Performance

- JS em produção: **~73 KB gzip** (folgado no teto de 200 KB).
- Sem CLS: fontes com `display=swap` + preconnect; imagens são SVG inline.
- Todos os loops de animação usam apenas `transform`/`opacity`/`clip-path`/`filter` e escrevem direto no DOM via refs.

## O que eu faria com mais tempo

- **Página de produto dedicada** (rota secundária) com visão detalhada e comparador.
- **Checkout simulado de verdade**: fluxo multi-etapa com progresso, validação e confirmação animada.
- **Canvas 2D de ondas sonoras** reativas ao modo de som (o PRD permite Canvas autoral).
- **Scroll-spy** no header com destaque da seção ativa na navegação.
- **Testes automatizados** (Playwright) para as interações-chave: configurador, FAQ, marquee, tema.
- **Web Animations API** em vez de CSS vars em alguns pontos do scrub para easing por etapa.
- Mais profundidade no modo espacial: variação do brilho e das ondas conforme o head-tracking simulado.
