# ÓRBITA — claude-01

Landing page de lançamento do fone de ouvido fictício **ÓRBITA**. Frontend puro, sem
backend, sem biblioteca de UI/animação pronta — Vite + TypeScript vanilla, CSS,
Web Animations API e `requestAnimationFrame` autorais.

## Como rodar

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # tsc --noEmit && vite build -> dist/
npm run preview    # serve dist/ localmente
```

Requer Node 20+.

## Decisões principais

Ver `PLANO.md` para o plano completo (framework, arquitetura, sistema de design,
estratégia técnica por seção) escrito antes da implementação.

Resumo: Vite+TS vanilla para controle total sobre a animação; engine própria em
`src/lib/` (rAF único, easings, scroll-scrub, tema, count-up, roving-tabindex, drag)
consumida por 7 seções independentes em `src/sections/`; estado do produto
(`src/state/productState.ts`) compartilhado entre configurador e CTA final; SVG
autoral do fone (`src/svg/headphone.ts`) com partes nomeadas recoloridas via CSS
custom properties, reaproveitado em 4 seções sem duplicar geometria.

Construção assistida por 7 subagentes em paralelo, um por seção (`PROMPT.md`/`PLANO.md`
definiram o contrato compartilhado de antemão — tokens, lib, state, SVGs — para que
as seções integrassem sem conflito).

## O que faria com mais tempo

- Testes automatizados (unitários pros utilitários de `lib/`, E2E pro fluxo do
  configurador e do accordion).
- Canvas/WebGL mais elaborado no hero (hoje é Canvas 2D de partículas + SVG).
- Auditoria de Lighthouse real em CI (hoje só inferido pelo peso do bundle: ~14KB
  JS gzip, bem abaixo do orçamento de 200KB).
- Fallback de scroll-driven animation nativo (`animation-timeline: scroll()`) como
  progressive enhancement por cima do scrubbing via rAF, pra navegadores que já
  suportam nativamente.
- Mais variação de layout por seção em tablet (768px) além do reflow simples
  desktop→mobile.
