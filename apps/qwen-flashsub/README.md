# ÓRBITA — Experiência Frontend Imersiva

Site de lançamento do fone de ouvido premium fictício **ÓRBITA**. 100% frontend estático, zero bibliotecas de UI ou animação — tudo escrito à mão.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # saída estática em dist/
npm run preview  # serve o build localmente
```

Requer Node 20+.

## Stack

- **Vite 6** + **TypeScript 5.8** (vanilla, sem framework)
- CSS puro com design tokens (custom properties)
- Animações: CSS keyframes/transitions, Web Animations API, requestAnimationFrame
- SVG autoral para o fone, Canvas 2D para partículas orbitais

## Decisões principais

### Framework: vanilla TS
Zero runtime de framework → bundle de ~9 KB gzip (teto do PRD: 200 KB). Controle absoluto de frame para scroll-scrubbing a 60 fps.

### Direção de arte: "Mecânica Celeste"
Dois acentos (cobre quente + gelo frio) sobre fundo profundo. Tipografia display larga (Unbounded) + corpo legível (Instrument Sans) + labels técnicos (Space Mono). Superfícies foscas, linhas de diagrama técnico.

### Scroll-telling
Trilho de 400 vh com palco sticky. Progresso suavizado por lerp no ticker rAF, publicado em custom properties. Curva de sino para o explode (sobe e desce ao longo do scroll). Uma escrita de estilo por frame.

### Configurador
Store pub/sub de ~40 linhas. Estado compartilhado entre configurador e CTA final. Odômetro mecânico (colunas de dígitos com translateY).

### Tema claro/escuro
Reveal circular via View Transitions API (`clip-path: circle()`), com fallback para cross-fade CSS. Respeita `prefers-color-scheme` e persiste em `localStorage`.

### Acessibilidade
- `prefers-reduced-motion` desliga todas as animações decorativas
- Navegação completa por teclado (accordion com setas, focus visible autoral)
- Landmarks semânticos, hierarquia de headings, `aria-expanded`/`aria-controls`
- Contraste AA em ambos os temas

## O que faria com mais tempo

- Testes automatizados (Playwright para E2E, Vitest para as libs)
- Otimização de Lighthouse (lazy-load do canvas, preload de fontes críticas)
- Mais etapas no scroll-telling (animação de montagem final com anéis orbitais)
- Suporte a `prefers-contrast` e `forced-colors`
- Internacionalização (i18n)

## Estrutura

```
src/
├── main.ts              # boot
├── lib/                 # store, raf, motion, theme, reveal, odometer
├── components/          # headphone (SVG), orbit-canvas, marquee, accordion, tilt-card, magnetic
├── sections/            # nav, hero, story, configurator, features, voices, faq, finale
└── styles/              # tokens, base + 8 CSS de seção
```

---

*Exercício de design e engenharia frontend. Nenhum fone foi ferido.*
