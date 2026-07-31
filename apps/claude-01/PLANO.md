# PLANO — ÓRBITA (claude-01)

## 1. Framework e justificativa

**Vite + TypeScript vanilla**, sem framework de UI. Três razões:

1. Controle total sobre `requestAnimationFrame`/WAAPI sem a camada de reconciliação de um framework por cima — para 25pts de "qualidade de animação" isso importa mais que produtividade de componentes.
2. Bundle mínimo por construção: sem runtime de framework, o orçamento de 200KB gzip (seção 5.5) fica folgado mesmo com 7 seções + engine de animação própria.
3. O desafio mede a capacidade **crua** de escrever componente e animação — vanilla remove qualquer dúvida sobre "quanto foi o framework vs. quanto fui eu".

## 2. Arquitetura de pastas

```
src/
  main.ts                 — bootstrap: monta seções, nav, skip-link, theme toggle
  global.d.ts              — augmentation p/ View Transitions API
  lib/                      — engine compartilhada, sem dependência de seção nenhuma
    store.ts                 — pub/sub genérico
    reduced-motion.ts        — fonte única de verdade prefers-reduced-motion
    raf-loop.ts               — UM rAF global, subscribers entram/saem de um Set
    easing.ts                 — 8 easings customizados (CSS string + função numérica)
    lerp.ts                    — lerp/clamp/smoothDamp
    scroll-progress.ts         — scrubbing real (wrapper alto + sticky) + onEnterView
    theme.ts                   — store de tema + toggle com View Transitions
    count-up.ts                 — tween numérico via rAF + formatBRL
    roving-tabindex.ts          — radiogroup acessível (setas/Home/End)
    drag.ts                      — pointer drag com velocidade p/ inércia
  state/
    productState.ts          — cor + modo + preço, única fonte de verdade do produto
  svg/
    headphone.ts              — SVG autoral do fone, partes nomeadas via data-part
    icons.ts                   — 6 ícones autorais (orbit/wave/feather/battery/drop/touch)
  styles/
    tokens.css                 — cor, tipografia, espaçamento, duração, easing (dark+light)
    base.css                    — reset, skip-link, focus-visible, reveal de tema
    product.css                  — estilo compartilhado do SVG do fone
  sections/
    hero.ts + hero.css
    scrollTelling.ts + scrollTelling.css
    configurator.ts + configurator.css
    features.ts + features.css
    testimonials.ts + testimonials.css
    faq.ts + faq.css
    ctaFooter.ts + ctaFooter.css
```

Cada seção exporta `mount(container: HTMLElement): void` e é responsável só pelo próprio DOM/CSS/listeners — zero acoplamento entre seções, tudo que é compartilhado passa por `lib/`, `state/` ou `svg/`.

## 3. Sistema de design

- **Direção**: "calor no vazio" — void quase-preto profundo + acento cobre/âmbar (energia/campo sonoro) + um sinal ciano pontual (telemetria/anéis orbitais). Deliberadamente **não** roxo/azul-gradiente (proibido pela seção 6 do PRD).
- **Tipografia**: `Fraunces Variable` (display, serifada expressiva, weight ~460 nos títulos) + `Manrope Variable` (corpo, grotesca legível) — self-hosted via `@fontsource-variable`, sem chamada de rede em runtime (evita CLS/flash e funciona offline).
- **Paleta**: tokens `--color-bg/--color-text/--color-accent/--color-signal` com override completo em `[data-theme='light']`, ambos com contraste AA verificado nos pares texto/fundo.
- **Espaçamento**: escala de 4px (`--space-1` a `--space-48`).
- **Motion**: 8 easings customizados nomeados (nunca `ease`/`linear` cru), 6 durações num sistema coerente (100/200/350/600/900/700ms — a última reservada pra transição de tema).

## 4. Estratégia técnica por seção

- **4.1 Hero**: entrada orquestrada via WAAPI (`Element.animate` com `delay` escalonado por elemento — título, subtítulo, CTA, SVG do produto). Movimento contínuo: anéis orbitais do SVG giram via `@keyframes` CSS (barato, GPU). Paralaxe de ponteiro: `smoothDamp` no loop de rAF único, só em `(hover: hover) and (pointer: fine)`.
- **4.2 Scroll-telling**: `createScrollScrub` — wrapper de `N * 100vh`, filho `position: sticky; top:0; height:100vh`. Progresso 0..1 do wrapper dirige diretamente `transform`/`opacity` das partes nomeadas do SVG (`data-part`) via `style.setProperty`, sem `IntersectionObserver` de entrada/saída — scrubbing real, não trigger. Mínimo 3 etapas com texto sincronizado por faixa de progresso.
- **4.3 Configurador**: `productState` (store) como única fonte de verdade; `createRovingTabindex` no radiogroup de cores; troca de cor só reatribui custom properties (`applyProductColor`) — o SVG recolore via CSS transition, sem re-render. Segundo atributo (Modo: Adaptativo/Estúdio) altera preço; `countUp` anima o valor, dígitos trocam com WAAPI slide-in por dígito. Estado é reaproveitado no CTA final via o mesmo store.
- **4.4 Features**: grade com `onEnterView` para stagger de entrada; micro-interação de hover/focus via `transform: translateY + rotate` leve (tilt) + glow (`filter: drop-shadow`) — só `transform`/`opacity`/`filter`.
- **4.5 Depoimentos**: marquee autoral — trilha duplicada (`aria-hidden` na cópia) com `transform: translateX` avançando no loop de rAF; `createDraggable` soma o delta do ponteiro à posição; ao soltar, decai por `velocityX * fricção` até parar; pausa em hover/focus/drag.
- **4.6 FAQ**: accordion com `grid-template-rows: 0fr → 1fr` (técnica que evita o `height:auto` quebrado) + `transition-timing-function` customizado; navegação por setas/Home/End via a mesma `createRovingTabindex`; `aria-expanded`/`aria-controls` corretos.
- **4.7 CTA final**: renderiza o SVG do produto na cor atual de `productState` (assinatura visual reaproveitada), botão com efeito magnético (`smoothDamp` do offset do ponteiro relativo ao botão) + ripple no clique (WAAPI, `scale`+`opacity`).

## 5. Tema claro/escuro (5.2)

`lib/theme.ts`: `prefers-color-scheme` como padrão inicial (sem flash — script inline no `<head>` aplica `data-theme` antes do primeiro paint), persistência em `localStorage`. Toggle usa `document.startViewTransition` quando disponível: reveal circular a partir do botão de origem via `--theme-origin-x/y` + `clip-path: circle()` em `::view-transition-new(root)`. Sem suporte ou com `prefers-reduced-motion`, troca instantânea sem transição.

## 6. Acessibilidade e performance

- `reducedMotion` (store) checado em toda animação decorativa antes de interpolar — se `true`, aplica-se o estado final direto (sem rAF, sem WAAPI).
- Todas as animações contínuas usam só `transform`/`opacity`/`clip-path`/`filter`.
- Um único loop de `rAF` para a página inteira; ele próprio para quando não há subscribers.
- Fontes self-hosted com `font-display: swap`, sem fetch externo em runtime.

## 7. Ordem de implementação

1. Engine (`lib/`) + tokens + `productState` + SVGs autorais — contrato compartilhado.
2. `PLANO.md` (este arquivo).
3. 7 seções em paralelo (cada uma consome só o contrato acima, sem depender de outra seção).
4. Integração em `main.ts` (nav, skip-link, toggle de tema, montagem em ordem).
5. `npm install && npm run build` — corrigir até passar limpo.
6. `README.md` + checklist final de autoavaliação contra o `PROMPT.md`.
