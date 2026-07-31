# ÓRBITA — experiência de lançamento

Site estático imersivo para o fone premium fictício **ÓRBITA** (cancelamento de ruído adaptativo espacial). 100% frontend, sem backend.

## Como rodar

```bash
npm install
npm run dev
```

- Dev server: **http://localhost:5173**
- Build estático: `npm run build` → saída em `dist/`
- Preview do build: `npm run preview`

Requisitos: **Node 20+**.

## Stack

- **Vite 5 + React 18 + TypeScript**
- **CSS puro** com design tokens (custom properties)
- Animações: CSS keyframes/transitions, Web Animations (ripple), `requestAnimationFrame` (scroll scrub, marquee, parallax, count-up)
- **Zero** libs de componentes ou animação (GSAP, Framer, shadcn, etc.)

## Decisões de design

| Eixo | Escolha |
|---|---|
| Tom | Espacial cinematográfico, premium consumer |
| Display | **Syne** — geométrica, presença de marca |
| Body | **Manrope** — legível, moderna |
| Dark | Void `#07080c` + cobre `#e8a05c` + ciano `#3dcdc0` |
| Light | Creme quente `#f4f1ea` + terracota `#c45c26` |
| Assinatura | Fone SVG paramétrico que explode no scroll + órbitas contínuas |

## Seções

1. **Hero** — entrada staggered, órbitas CSS, parallax no pointer  
2. **Scroll-telling** — track `320vh`, sticky stage, scrub 0→1 no explode do fone (3 etapas)  
3. **Configurador** — 5 cores, 2 conchas, preço count-up, CTA dinâmico  
4. **Features** — 6 cards, ícones SVG, stagger + tilt hover  
5. **Depoimentos** — marquee infinito rAF, pause hover, drag  
6. **FAQ** — accordion `grid-template-rows` 0fr→1fr, teclado  
7. **CTA final** — reutiliza cor/shell/preço do configurador + botão magnético  

## Acessibilidade & motion

- `prefers-color-scheme` + `localStorage` (`orbita-theme`)
- `prefers-reduced-motion` desliga órbitas, parallax, marquee, scrubs contínuos
- Focus visible autoral, landmarks, FAQ com setas/Home/End
- Contraste AA nos dois temas

## O que faria com mais tempo

- Equalizer visual no scroll-telling (Canvas 2D)
- View Transition circular no toggle de tema (já usa VT API quando existe)
- Testes Playwright do scrub mid-scroll
- Lighthouse CI no pipeline
- Microcopy A/B e i18n en-US

## Estrutura

Ver `PLANO.md` para arquitetura completa e tokens de motion.
