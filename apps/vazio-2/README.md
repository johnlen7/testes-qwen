# ÓRBITA — Experiência de lançamento

Site imersivo de lançamento do **ÓRBITA**, fone de ouvido fictício com cancelamento de ruído "adaptativo espacial". Frontend 100% estático, sem backend, sem nenhuma biblioteca de componentes ou de animação — toda animação é CSS, Web Animations API e `requestAnimationFrame` escritos à mão.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento — http://localhost:5173
npm run build    # build de produção em dist/ (tsc + vite build)
npm run preview  # serve o build de produção
```

Requer **Node 20+**. Porta padrão do dev server: **5173** (Vite).

## Stack e decisões principais

- **Vite + TypeScript vanilla + CSS puro.** A página é dirigida por scroll e rAF; sem framework, cada frame fica sob controle direto e o JS final fica minúsculo (~13KB gzip). Componentização por módulos com funções `mount*` e CSS co-localizado por seção.
- **Design system em `src/styles/tokens.css`**: paleta "painel de voo / VU meter" — tinta espacial `#090d16`, âmbar `#f5a524`, osso `#eae6dc`, telemetria menta — com tema claro via `[data-theme="light"]`; tipografia Unbounded (display) + Space Grotesk (texto) + IBM Plex Mono (telemetria); durações 150/300/600/1200ms e 3 curvas de easing customizadas.
- **O fone é um SVG autoral parametrizado** (`src/product/headphone.ts`): 4 acabamentos, 3 tamanhos de concha e modo "explodido" controlável — usado pelo hero, pelo scroll-telling, pelo configurador e pelo CTA final com estado compartilhado via uma micro-store (`src/lib/store.ts`).
- **Scroll-telling com scrubbing real** (`src/sections/scrolly.ts`): seção de 400vh com sticky, progresso suavizado por frame (`lerp` com decaimento exponencial) e render pura do progresso — rotação 3D, explode das partes e cancelamento de ondas em canvas.
- **Tema claro/escuro** com reveal circular animado a partir do botão (clip-path via WAAPI), `prefers-color-scheme` como padrão e persistência em `localStorage` (anti-FOUC inline no `<head>`).
- **Acessibilidade**: `prefers-reduced-motion` desliga toda animação decorativa (o scroll-telling vira fluxo estático legível), navegação completa por teclado (radiogroups, accordion com setas/Home/End), focus visible autoral, landmarks e headings hierárquicos.
- **Assinatura visual**: o motivo do anel orbital — o satélite que circula o fone no hero reaparece no indicador de progresso de scroll (canto inferior direito), percorrendo a órbita conforme a página rola.

## Estrutura

```
index.html              markup semântico completo das 7 seções
src/
  styles/tokens.css     design tokens + tema claro
  styles/base.css       reset, tipografia, botões, a11y, reduced-motion
  lib/                  dom, motion (rAF/easings/tween), scroll (scrub/reveal), store
  product/headphone.ts  o fone em SVG autoral
  sections/             hero, scrolly, configurator, features, faq,
                        testimonials (marquee), chrome (header/tema), cta
```

## O que eu faria com mais tempo

- WebGL puro para o fone (material com reflexos reais) no lugar do SVG.
- Scroll-telling com capítulo extra mostrando o estojo de carga.
- Testes automatizados de regressão visual (Playwright) e de a11y (axe).
- Internacionalização (EN/PT) e versão "manual de voo" do produto em PDF gerado em runtime.
- Lighthouse CI no build para garantir os budgets (Perf ≥ 90, A11y ≥ 95) a cada mudança.

---

ÓRBITA é um produto fictício criado para um desafio de frontend.
