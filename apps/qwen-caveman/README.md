# ÓRBITA — Experiência Frontend Imersiva

Site de lançamento de uma página para o fone fictício **ÓRBITA**. Frontend 100% estático, sem backend, sem bibliotecas de componente ou de animação — tudo escrito à mão (CSS, Web Animations/`requestAnimationFrame` e SVG autoral).

## Como rodar

Requer **Node 20+**.

```bash
npm install
npm run dev      # ambiente de desenvolvimento (Vite) — http://localhost:5173
npm run build    # build estático para /dist
npm run preview  # serve o build — http://localhost:4173
```

A porta do `dev` é a padrão do Vite (**5173**); o `preview` usa **4173**.

## Stack e decisões principais

- **Vite + TypeScript vanilla (zero runtime de framework).** O desafio proíbe libs de animação/componente e mede capacidade crua; um runtime seria peso morto numa SPA de uma rota. Resultado: **~6 KB de JS gzip** no cliente (orçamento era ≤ 200 KB).
- **CSS puro com design tokens** (`src/styles/tokens.css`): paleta, tipografia fluida (`clamp`), escala de espaço de 4 px e um sistema de motion (durações 150/300/600/1000 ms + curvas de easing customizadas, nada de `ease` genérico).
- **O fone é um SVG autoral** (`src/lib/headphone.ts`) com peças nomeadas (`.hp-band`, `.hp-asm-l/r`, `.hp-driver-*`) para o scroll-telling poder transformá-las, e cores via CSS custom properties — recolorir o produto = trocar variáveis.
- **Estado compartilhado** do configurador via `EventTarget` (`src/lib/store.ts`): cor + modo + preço fluem para o CTA da seção e para o CTA final sem prop-drilling.
- **Tema claro/escuro** com reveal circular pela View Transitions API (fallback cross-fade), `prefers-color-scheme` como padrão e `localStorage` para persistir; script inline no `<head>` aplica o tema antes do paint (sem FOUC).

## O que cada seção faz

| Seção | Técnica |
|---|---|
| Hero | Entrada orquestrada (stagger), órbitas contínuas em SVG, paralaxe de mouse com lerp (desligada em touch/reduced-motion). |
| Scroll-telling | **Scrubbing real**: o progresso do scroll (0→1) dirige a explosão do produto em 3 etapas (intacto → explode → revela drivers). O container tem altura fixa de `320vh` — é isso que dá curso à animação. |
| Configurador | 4 acabamentos + modo de som, transição de cor do SVG, **count-up** do preço e CTA que reflete o estado. |
| Features | Cards com tilt 3D + glow que segue o cursor, ícones SVG autorais, entrada stagger por `IntersectionObserver`. |
| Depoimentos | Marquee **autoral** dirigido por rAF (loop por clone), pausa em hover/focus e arraste com Pointer Events + inércia. |
| FAQ | Accordion com animação de altura via `grid-template-rows: 0fr→1fr` (sem medir `scrollHeight`), navegação por setas/Home/End e `aria-expanded`. |
| CTA final | Produto na cor escolhida (estado compartilhado) + botão magnético. |

## Acessibilidade e performance

- `prefers-reduced-motion` desliga todas as animações decorativas (CSS + os loops de JS checam `matchMedia`).
- Focus-visible autoral, skip-link, landmarks semânticos, hierarquia de headings, `aria-*` nos controles.
- Animações contínuas usam só `transform`/`opacity`/`clip-path`/`filter` (sem layout thrashing).
- Fontes com `display=swap` + `preconnect`; favicon em data-URI (zero pedidos extras).

## Estrutura

```
index.html              shell semântico + script de tema pré-paint
src/
  main.ts               bootstrap (monta o fone e inicia as seções)
  styles/               tokens + base + uma folha por seção
  lib/                  headphone, store, theme, magnetic, motion
  sections/             hero, scrolltell, configurator, features, marquee, faq, cta
```

## O que eu faria com mais tempo

- **WebGL/Canvas** para um campo de partículas reativo ao áudio simulado no hero (mantendo tudo à mão).
- **Scroll-telling com mais etapas** e callouts apontando para as peças (linhas-guia animadas).
- **Preload de fonte crítica** e subset próprio da Unbounded para cortar ainda mais o peso.
- Testes de regressão de animação (snapshot de `transform` em `p=0.3/0.5/0.8`) para garantir o scrub.
- Um segundo atributo no configurador com impacto visual maior (ex.: conchas que mudam de forma).

## Restrições respeitadas

Nenhuma biblioteca de componente (shadcn/MUI/Radix/…) nem de animação (GSAP/Framer Motion/…) foi usada. Nenhum asset externo é baixado em runtime (o fone e os ícones são SVG/CSS autorais; só as fontes vêm do Google Fonts via `<link>`). `npm run build` gera saída estática sem erros.
