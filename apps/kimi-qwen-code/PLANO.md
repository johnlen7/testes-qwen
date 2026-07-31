# PLANO — ÓRBITA · Experiência de lançamento

## Framework

**Astro (output estático) + CSS puro + JS vanilla em módulos.** Astro gera HTML estático com zero JS por padrão, o que casa com o teto de 200KB de JS e o alvo de Lighthouse ≥90; toda interatividade é JS autoral carregado por seção, sem hidratação de framework. Componentes `.astro` dão componentização limpa sem enviar runtime ao cliente.

## Arquitetura de pastas

```
├── astro.config.mjs
├── package.json
├── public/
│   └── fonts/               (wo2 self-hosted se viável; senão Google Fonts + preconnect)
├── src/
│   ├── layouts/Base.astro        (head, fontes, script de tema anti-FOUC)
│   ├── pages/index.astro         (as 7 seções)
│   ├── components/
│   │   ├── Hero.astro            (+ OrbitaSVG.astro — produto em SVG autoral)
│   │   ├── Story.astro           (scroll-telling)
│   │   ├── Configurator.astro
│   │   ├── Features.astro
│   │   ├── Testimonials.astro
│   │   ├── Faq.astro
│   │   └── Finale.astro          (CTA final + rodapé)
│   ├── scripts/                  (JS vanilla, um módulo por feature)
│   │   ├── theme.js hero.js story.js configurator.js features.js
│   │   ├── marquee.js faq.js finale.js reveal.js motion.js (utils: lerp, rAF, reduced-motion)
│   └── styles/global.css         (tokens, temas, base, utilitários)
```

## Sistema de design

**Direção de arte:** "manual de voo espacial" — ink profundo quase-preto com acento solar laranja-vermelho (`#FF4D24`), linhas orbitais finas, grão sutil, tipografia display condensada/expressiva. Tema claro: papel quente (`#F2EFE6`) com o mesmo acento — não um simples invert.

- **Paleta (dark):** bg `#0B0B10`, surface `#14141C`, ink `#F4F2EC`, muted `#9B98A8`, accent `#FF4D24`, accent-2 `#57E6C9` (linhas orbitais/telemetria).
- **Paleta (light):** bg `#F2EFE6`, surface `#FFFFFF`, ink `#15151C`, muted `#5C5A66`, accent `#E83A12`.
- **Tipografia:** display `Unbounded` (700/900, tracking apertado, uppercase p/ kicker), texto `Inter` (400/500). Escala: 12/14/16/20/28/40/64/clamp(3–7rem hero).
- **Espaçamento:** base 4px — 4/8/12/16/24/32/48/64/96/160 (seções: 160px desktop, 96 mobile).
- **Motion tokens:** durações `--d1:150ms --d2:300ms --d3:600ms --d4:1200ms`; easings autorais `--ease-expo: cubic-bezier(.16,1,.3,1)`, `--ease-spring: cubic-bezier(.34,1.4,.4,1)`, `--ease-io: cubic-bezier(.65,0,.35,1)`. Contínuas só em `transform/opacity/clip-path/filter`.

## Estratégia por seção

1. **Hero:** SVG do fone desenhado à mão (concha, arco, anel de luz). Entrada orquestrada via CSS animations com `animation-delay` escalonado (kicker→título com reveal por `clip-path`→sub→CTA→produto subindo com spring). Movimento contínuo: 3 anéis orbitais girando (keyframes, transform) + partículas (CSS) + gradiente de acento respirando. Paralaxe de mouse via rAF com lerp por camada (`data-depth`), desligado em touch (`pointer: coarse`) e reduced-motion.
2. **Scroll-telling:** seção de 400vh com palco `position: sticky`. rAF lê progresso (0–1) da seção e mapeia para 4 etapas com easing por faixa: (1) fone inteiro flutuando; (2) concha desliza e explode em camadas (cushion→driver→PCB→anel); (3) anel de ANC expande com ondas concêntricas; (4) remonta rotacionado. Scrubbing real: transforms calculados por frame a partir do progresso, textos das etapas fazem crossfade por faixas de progresso. Nada de trigger-only.
3. **Configurador:** 4 cores (Grafite, Lunar, Solar, Abissal) aplicadas como CSS vars no SVG (transição de `fill` animada). 2º atributo: tamanho da concha (Compacta/Ampla) que escala/morpha partes do SVG. Preço com count-up por rAF (interpolação + easing, formatação BRL). Estado em um store mínimo (objeto + `CustomEvent`) refletido no CTA e reutilizado no CTA final.
4. **Features:** 6 cards, ícones SVG autorais (stroke 1.5, geométricos). Hover: tilt 3D por rAF (perspective + rotateX/Y com lerp) + glow radial seguindo o cursor via CSS vars. Entrada staggered por IntersectionObserver.
5. **Depoimentos:** marquee infinito autoral — track duplicado, offset em rAF com wrap por módulo (sem salto), velocidade constante; pausa em hover/focus; drag por pointer events com inércia (velocity + atrito).
6. **FAQ:** accordion com animação de altura via `grid-template-rows: 0fr → 1fr` (solução moderna, sem JS de altura). Teclado: Enter/Espaço toggle, setas ↑/↓ navegam entre botões (roving tabindex), `aria-expanded`/`aria-controls`.
7. **CTA final:** consome o store do configurador (produto na cor escolhida + preço). Botão magnético (lerp em direção ao cursor dentro de raio) + ripple autoral no click. Rodapé sóbrio com anéis decorativos.

## Transversais

- **Tema:** script inline no `<head>` (anti-FOUC): localStorage → `prefers-color-scheme` → dark. Toggle animado: overlay fixo com `clip-path: circle()` expandindo do ponto de clique (WAAPI), troca da classe no meio. Contraste AA verificado nos dois temas.
- **Reduced-motion:** media query CSS zera animações decorativas; `motion.js` expõe `prefersReducedMotion()` checado por todos os módulos JS (vira estado final instantâneo).
- **Responsivo:** mobile-first; breakpoints 480/768/1100. Hero empilha, scroll-telling mantém sticky com palco menor, configurador vira coluna única.
- **Performance:** fontes Google com `preconnect` + `display=swap`; SVG inline; JS modular `<script type="module">` defer por padrão; sem libs.

## Ordem de implementação

1. Scaffold + tokens/global.css + tema (Base.astro + theme.js)
2. OrbitaSVG (produto) — base de Hero/Story/Config/Finale
3. Hero → 4. Story → 5. Configurador → 6. Features → 7. Marquee → 8. FAQ → 9. Finale
10. A11y pass + responsivo + `npm run build` + README
