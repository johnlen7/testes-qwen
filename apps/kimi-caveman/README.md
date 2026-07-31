# ÓRBITA — Silêncio em órbita

Site de lançamento imersivo do **ÓRBITA**, fone de ouvido premium fictício com cancelamento de ruído "adaptativo espacial". 100% frontend estático, sem backend, sem bibliotecas de componentes ou de animação — tudo (animações, componentes, ícones, visual do produto) escrito à mão.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Build de produção (saída estática em `dist/`):

```bash
npm run build
npm run preview  # http://localhost:4173
```

Requer Node 20+. Porta padrão do dev server: **5173** (preview: 4173).

## Stack

- **Vite 5 + JavaScript vanilla (ES Modules)** — zero runtime de framework.
- **CSS puro** com custom properties (design tokens) e dois temas.
- Animações: CSS transitions/keyframes, **Web Animations API**, `requestAnimationFrame`, **Canvas 2D** autoral. Nenhuma biblioteca de animação ou componentes.
- Fontes Google Fonts: Unbounded (display), Instrument Sans (texto), IBM Plex Mono (dados/labels).

## Estrutura

```
index.html              # landmarks + script inline de tema (sem FOUC)
src/
  main.js               # boot das seções
  styles/tokens.css     # paleta dark/light, espaçamento, durações, easings
  styles/base.css       # reset, tipografia, focus-visible, reduced-motion
  lib/store.js          # estado compartilhado (cor/tamanho) pub/sub
  lib/motion.js         # reducedMotion, lerp, easings, rAF loop c/ auto-pausa
  lib/reveal.js         # IntersectionObserver de entrada (stagger)
  lib/product.js        # SVG autoral do fone (cor/tamanho/explodido)
  sections/             # header, hero, story, configurator, features,
                        # marquee, faq, outro — cada um com seu .css
```

## Decisões principais

- **Vanilla em vez de framework**: o desafio mede animação escrita à mão; sem runtime o JS total fica em ~14KB gzip (limite era 200KB) e o controle de `requestAnimationFrame` é total. Componentização por módulos ES com contrato `init<Section>(el)`.
- **Direção de arte "instrumento de observatório"**: hairlines, anéis graduados com ticks, labels mono com telemetria, paleta ink profundo + âmbar solar (dark) e papel quente + âmbar profundo (light). Assinatura: sistema de anéis orbitais que reaparece no hero, configurador e CTA final.
- **Scroll-telling com scrubbing real**: wrapper de 400vh + palco sticky; o progresso do scroll é suavizado com lerp em rAF e mapeado como função pura para transform/opacity das 3 etapas (CAPTAR → MEDIR → CANCELAR, com produto explodido no final).
- **Estado compartilhado**: configurador escreve num store pub/sub de ~30 linhas; o CTA final assina o store e renderiza o produto na cor/tamanho escolhidos.
- **Marquee autoral**: track duplicado + translateX em rAF (pausa suave em hover, drag com momentum), em vez de keyframes CSS — keyframes não permitem controle de drag.
- **Tema**: `data-theme` no `<html>` setado por script inline antes do paint (respeita `prefers-color-scheme`, persiste em `localStorage`), transição de 600ms nos tokens.
- **Acessibilidade**: `prefers-reduced-motion` desliga scrub/parallax/marquee/magnético (conteúdo sempre visível em estado final), FAQ com arrow-key nav + `aria-expanded`, focus-visible autoral, landmarks e headings hierárquicos.

## O que faria com mais tempo

- View Transitions API para o reveal circular da troca de tema (hoje: cross-fade de tokens).
- WebGL puro para o produto (shader com reflexos) no hero.
- Som ambiente generativo (WebAudio) sincronizado ao scroll-telling.
- Testes automatizados de a11y (axe) no CI e Lighthouse budget enforced.
- Internacionalização (pt-BR/en) com seletor no rodapé.

---

Produto fictício — desafio frontend. ÓRBITA © 2026.
