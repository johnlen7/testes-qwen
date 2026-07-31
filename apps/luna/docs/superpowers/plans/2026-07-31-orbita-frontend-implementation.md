# ÓRBITA Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a landing page estática completa do fone ÓRBITA com narrativa por scroll, configurador, prova social, FAQ, tema dual e build Vite confiável.

**Architecture:** React + Vite + TypeScript em uma única rota. `App` mantém seleção de produto e tema; componentes de seção recebem dados e callbacks. SVG e CSS fazem os visuais; hooks imperativos escrevem somente propriedades transformacionais para movimento contínuo.

**Tech Stack:** React 18, React DOM, Vite, TypeScript, CSS puro, SVG autoral, Web APIs (`requestAnimationFrame`, `ResizeObserver`, Pointer Events, `matchMedia`, `localStorage`).

## Global Constraints

- Node 20+.
- `npm install && npm run dev` deve funcionar.
- `npm run build` deve terminar sem erro.
- Nenhuma biblioteca de componentes.
- Nenhuma biblioteca de animação.
- Nenhum asset externo baixado em runtime.
- Animações contínuas somente em `transform`, `opacity`, `clip-path` e `filter`.
- `prefers-reduced-motion` remove movimento decorativo.
- Layout intencional em 360, 768 e 1280px.

### Task 1: Scaffold, tokens e dados de produto

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`
- Create: `src/main.tsx`, `src/App.tsx`, `src/types.ts`, `src/data/content.ts`, `src/styles.css`

**Interfaces:**
- `ProductSelection = { colorId: string; attributeId: string }`.
- `ProductColor = { id: string; label: string; shortLabel: string; hex: string; shadow: string; priceDelta: number }`.
- `ProductAttribute = { id: string; label: string; description: string; priceDelta: number; visual: string }`.
- `productCatalog` exporta `basePrice`, `colors`, `attributes`, `features`, `testimonials`, `faqs`.
- `App` deriva `selectedColor`, `selectedAttribute` e `currentPrice` a partir da seleção.

- [ ] Escrever package scripts `dev`, `build`, `preview`, `typecheck`.
- [ ] Criar tokens dos dois temas e breakpoints `640`, `768`, `1024`, `1280`.
- [ ] Criar dados concretos em português, sem números falsamente precisos além dos preços necessários ao configurador.
- [ ] Montar shell semântico com skip link, header, main e footer.
- [ ] Rodar `npm run typecheck` para confirmar a base.

### Task 2: Product SVG, hooks de movimento e Hero

**Files:**
- Create: `src/components/BrandMark.tsx`, `src/components/Icon.tsx`, `src/components/ProductVisual.tsx`, `src/components/MagneticButton.tsx`, `src/components/Header.tsx`, `src/components/ThemeToggle.tsx`, `src/components/Hero.tsx`
- Create: `src/hooks/useReducedMotion.ts`, `src/hooks/usePointerParallax.ts`, `src/hooks/useTheme.ts`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- `ProductVisualProps = { color: ProductColor; attribute: ProductAttribute; stage?: number; progress?: number; size?: 'hero' | 'story' | 'compact' }`.
- `MagneticButtonProps = { href?: string; children: React.ReactNode; variant?: 'primary' | 'ghost'; onClick?: () => void }`.
- `usePointerParallax(ref, enabled)` escreve `--pointer-x` e `--pointer-y` sem re-render.
- `useTheme()` retorna `{ theme, toggleTheme }` e sincroniza `data-theme`.

- [ ] Desenhar arco, conchas, anéis, sensores, sombra e trajetórias do fone como SVG inline.
- [ ] Fazer a cor e o atributo alterarem preenchimentos, escala de arco e halo do SVG.
- [ ] Implementar entrada staggered por classes CSS e movimento orbital contínuo com fallback reduzido.
- [ ] Implementar parallax apenas quando `(hover: hover) and (pointer: fine)` for verdadeiro.
- [ ] Implementar toggle de tema com localStorage, preferência do sistema e camada de reveal.
- [ ] Garantir labels e focus-visible do header e CTAs.
- [ ] Rodar `npm run build`.

### Task 3: Scroll-telling com scrubbing

**Files:**
- Create: `src/hooks/useScrollScrub.ts`, `src/components/StorySection.tsx`
- Modify: `src/components/ProductVisual.tsx`, `src/App.tsx`, `src/styles.css`

**Interfaces:**
- `useScrollScrub(ref, onStepChange): { progress: number; reducedMotion: boolean }`.
- O wrapper da história recebe `--story-progress` e o `ProductVisual` recebe a progressão calculada.

- [ ] Medir `sectionTop`, `sectionHeight` e `viewportHeight` no início e em `ResizeObserver`.
- [ ] Usar listener passivo document-level que agenda um único RAF; remover listener e cancelar RAF no cleanup.
- [ ] Mapear progresso para três etapas: isolamento, separação e recomposição.
- [ ] Aplicar apenas transform, opacity, clip-path e filter no SVG e no indicador de progresso.
- [ ] Manter copy sequencial no DOM e trocar somente `aria-current`/estado ativo em limiares discretos.
- [ ] Com reduced-motion, mostrar três painéis estáticos sem scrubbing ou rotação.
- [ ] Verificar manualmente que o indicador percorre 0 a 100% ao atravessar a seção.

### Task 4: Configurador, preço e CTA final

**Files:**
- Create: `src/hooks/useCountUp.ts`, `src/components/Configurator.tsx`, `src/components/FinalCTA.tsx`
- Modify: `src/App.tsx`, `src/components/ProductVisual.tsx`, `src/styles.css`

**Interfaces:**
- `ConfiguratorProps = { selection: ProductSelection; colors: ProductColor[]; attributes: ProductAttribute[]; price: number; onColorChange(id: string): void; onAttributeChange(id: string): void }`.
- `useCountUp(target, reducedMotion): number` retorna preço inteiro exibível.
- `formatPrice(value: number): string` usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })`.

- [ ] Renderizar quatro swatches nomeados com seleção semântica e alvos de pelo menos 44px.
- [ ] Renderizar três opções de perfil que alteram a forma visível e o delta de preço.
- [ ] Fazer o preço contar entre estados, sem animar layout; reduced-motion troca instantaneamente.
- [ ] Atualizar CTA com cor e preço atuais.
- [ ] Reutilizar a mesma seleção e visual no CTA final.
- [ ] Implementar ripple e magnetismo limitado no CTA sem impedir teclado ou touch.
- [ ] Testar alteração de cor, perfil e preço em sequência.

### Task 5: Features, depoimentos e FAQ

**Files:**
- Create: `src/components/FeatureGrid.tsx`, `src/components/TestimonialRail.tsx`, `src/components/FAQ.tsx`
- Modify: `src/App.tsx`, `src/components/Icon.tsx`, `src/styles.css`

**Interfaces:**
- `FeatureGridProps = { features: Feature[] }`.
- `TestimonialRailProps = { testimonials: Testimonial[] }`.
- `FAQProps = { items: FAQItem[] }`.

- [ ] Criar cinco cards com ícones SVG autorais, stagger via IntersectionObserver e tilt limitado em pointer fine.
- [ ] Duplicar depoimentos para loop contínuo, pausar em hover/foco e permitir drag com `setPointerCapture`.
- [ ] Adicionar botões anterior/próximo como alternativa ao arraste e como fallback reduced-motion.
- [ ] Implementar accordion com `grid-template-rows`, `aria-expanded`, `aria-controls`, Enter/Espaço nativos e setas/Home/End.
- [ ] Confirmar que respostas têm leitura sequencial e não desaparecem apenas visualmente.

### Task 6: Responsividade, acessibilidade, documentação e verificação

**Files:**
- Modify: `src/styles.css`, `src/App.tsx`, `README.md`
- Create: `scripts/verify-orbita.mjs`

- [ ] Revisar 360px: fluxo vertical, controles roláveis com alvos grandes, sem overflow horizontal.
- [ ] Revisar 768px: grids de duas colunas e story com composição sticky simplificada.
- [ ] Revisar 1280px: split hero, configurador de duas colunas e grade irregular.
- [ ] Adicionar estados `:focus-visible`, skip link, landmarks e `aria-live` para preço.
- [ ] Revisar `prefers-reduced-motion`, tema claro/escuro e contraste de botões.
- [ ] Fazer script Playwright validar título, seções, seleção de cor, FAQ, tema e CTA final.
- [ ] Rodar `npm run typecheck`, `npm run build` e `node scripts/verify-orbita.mjs`.
- [ ] Registrar no README como rodar, porta, decisões e próximos passos.
