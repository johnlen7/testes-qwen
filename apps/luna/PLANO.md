# PLANO DE IMPLEMENTAÇÃO

## Framework

Escolha: React 18 + Vite + TypeScript. O produto é uma SPA estática com estado local rico, então React organiza a composição e o Vite mantém o build pequeno e simples. A implementação usa somente APIs do navegador, CSS e SVG autoral: não há biblioteca de componentes ou de animação.

## Direção visual

Leitura do briefing: landing de lançamento para ouvintes atentos a design, com linguagem editorial espacial, precisão industrial e motion cinematográfico controlado.

Dials da direção:

- DESIGN_VARIANCE: 8/10. Assimetria, vazio intencional e composições que mudam entre seções.
- MOTION_INTENSITY: 7/10. Coreografia visível, porém motivada por hierarquia, narrativa e feedback.
- VISUAL_DENSITY: 3/10. Poucos elementos, bastante respiro e leitura rápida.

Assinatura: o fone ÓRBITA é tratado como um objeto de precisão em observação. Um campo orbital SVG, uma sombra defasada e linhas de trajetória acompanham o produto; estrelas e HUD decorativo ficam fora da linguagem.

## Sistema de design

### Cor

Tokens semânticos em `src/styles.css`, com dois mapas de tema:

| Token | Escuro | Claro | Uso |
| --- | --- | --- | --- |
| `--bg` | `#090B0E` | `#EFF2F0` | fundo global |
| `--surface` | `#11161B` | `#F7F9F7` | superfícies elevadas |
| `--surface-2` | `#1B232A` | `#E3E9E6` | áreas de destaque |
| `--text` | `#F1F3EF` | `#151A1B` | texto principal |
| `--text-muted` | `#AEB9B8` | `#53605F` | texto auxiliar |
| `--line` | `rgba(241,243,239,.16)` | `rgba(21,26,27,.16)` | divisores |
| `--accent` | `#8BE7D4` | `#2D9D91` | ação, foco, trajetória |
| `--accent-ink` | `#061311` | `#F4FFFC` | texto sobre ação |
| `--danger` | `#FF8A62` | `#B64D2E` | erro e variação ember |

As quatro opções de produto são funcionais e recebem seus próprios tokens visuais: Graphite, Lunar, Ember e Moss. Elas não criam uma segunda linguagem de UI; o ciano orbital continua sendo o acento de interação.

### Tipografia

- Display: `Space Grotesk`, com fallback `Arial Narrow`, `Helvetica Neue`, sans-serif. Peso 500/600, tracking negativo apenas em títulos grandes.
- Corpo: `DM Sans`, com fallback `Arial`, `Helvetica Neue`, sans-serif. Peso 400/500, line-height de 1.55.
- Utilitária: `SFMono-Regular`, `Cascadia Mono`, `Consolas`, monospace. Apenas para metadados, preço, especificações e estados.
- Escala: 12, 14, 16, 18, 24, 32, 48, 72, 104px. O hero usa `clamp()` e permanece em no máximo duas linhas no desktop.

### Espaçamento e formas

- Escala base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.
- Container: `min(1180px, calc(100% - 40px))`, com gutters de 20px no mobile e 32px no desktop.
- Cards: raio de 22px e borda de 1px. Controles de seleção: raio de 999px. O uso misto é intencional e documentado: superfície agrupada tem raio suave; controles são cápsulas para comunicar escolha.
- Camadas: z-index 0 conteúdo, 10 header sticky, 20 overlays de seção, 40 tema, 100 skip link.

### Motion

- `--motion-fast`: 160ms para foco, pressão e micro feedback.
- `--motion-standard`: 320ms para mudança de estado.
- `--motion-slow`: 640ms para entradas e transições de seção.
- `--motion-orbit`: 1200ms para movimento contínuo do produto.
- `--ease-entry`: `cubic-bezier(.16, 1, .3, 1)`.
- `--ease-settle`: `cubic-bezier(.22, 1, .36, 1)`.
- `--ease-state`: `cubic-bezier(.4, 0, .2, 1)`.

Animações contínuas escrevem apenas `transform`, `opacity`, `clip-path` e `filter`. `prefers-reduced-motion` desliga loops, parallax, tilt, scrubbing visual e count-up, mantendo mudanças de estado e conteúdo acessíveis.

## Arquitetura de pastas

```text
index.html
package.json
tsconfig.json
tsconfig.app.json
vite.config.ts
src/
  main.tsx
  App.tsx
  styles.css
  types.ts
  data/content.ts
  components/
    BrandMark.tsx
    Header.tsx
    ThemeToggle.tsx
    ProductVisual.tsx
    MagneticButton.tsx
    Hero.tsx
    StorySection.tsx
    Configurator.tsx
    FeatureGrid.tsx
    TestimonialRail.tsx
    FAQ.tsx
    FinalCTA.tsx
    Icon.tsx
  hooks/
    useReducedMotion.ts
    useCountUp.ts
    usePointerParallax.ts
    useScrollScrub.ts
    useTheme.ts
```

`App.tsx` mantém apenas composição e estado do produto. Hooks de movimento alteram CSS custom properties ou estilos transformacionais diretamente para evitar re-render por frame. `content.ts` concentra copy, opções e dados mockados; os componentes não inventam conteúdo em linha.

## Estratégia por seção

1. **Hero:** header compacto e split assimétrico. Um `ProductVisual` SVG autoral ocupa a zona direita, com duas órbitas, sombra elíptica e halo de sinal. CSS faz a entrada em stagger; um hook de pointer parallax só ativa em dispositivos com hover. O CTA primário aponta para a história e o secundário para o configurador.
2. **Como funciona:** seção de 300vh com viewport sticky. `useScrollScrub` mede a posição da seção uma vez por frame agendado em `requestAnimationFrame`, calcula progresso de 0 a 1 e grava `--story-progress` no wrapper. Três faixas narrativas usam o mesmo progresso para mover camadas do SVG, alterar opacidade e atualizar o texto ativo. ResizeObserver recalcula dimensões; reduced-motion troca o scrubbing por uma sequência estática.
3. **Configurador:** estado `productSelection` vive em `App` e é passado a `ProductVisual`, `Configurator` e `FinalCTA`. Há quatro cores e três perfis espaciais. O preço é derivado de preço-base mais deltas e mostrado por `useCountUp`; o CTA recebe a label completa com cor e preço.
4. **Features:** grade assimétrica de cinco cards, com ícones SVG autorais de arcos, ondas, sensores e órbitas. A entrada usa IntersectionObserver com stagger em CSS; tilt e spotlight usam variáveis de ponteiro sem React state e desligam em touch/reduced-motion.
5. **Depoimentos:** trilho duplicado em memória, movido por um único RAF e reiniciado por módulo de largura para não saltar. Hover e foco pausam a auto-rotação. Pointer Events com `setPointerCapture` oferecem arraste; botões anterior/próximo permanecem disponíveis como alternativa de teclado e reduced-motion.
6. **FAQ:** cada pergunta é um `button` semântico e cada resposta tem `aria-controls`. A altura é animada por `grid-template-rows: 0fr` e `1fr`, nunca por `height: auto`. Home, End, ArrowUp e ArrowDown movem o foco entre perguntas.
7. **CTA final e rodapé:** reproduz a seleção atual no SVG e no botão final. `MagneticButton` limita o deslocamento a poucos pixels, tem fallback de ripple e não é necessário para concluir a compra. Rodapé simples com links âncora e informação de produto.

## Tema

`useTheme` começa por `localStorage`, depois `prefers-color-scheme`, e só então usa `dark`. A escolha explícita é persistida. A troca adiciona uma camada de reveal circular originada no botão; tokens CSS fazem o cross-fade e a mídia de reduced-motion reduz a troca a uma transição curta.

## Ordem de implementação

1. Criar scaffold Vite, tokens, tipagem de produto e shell semântico.
2. Implementar `ProductVisual`, Hero e hooks de movimento.
3. Implementar scroll-telling com scrubbing e fallback reduced-motion.
4. Implementar estado compartilhado, Configurador, preço e CTA final.
5. Implementar features, depoimentos arrastáveis e FAQ acessível.
6. Fechar tema, responsive, documentação e estados de interação.
7. Rodar TypeScript, build e testes Playwright em 360, 768 e 1280px, revisar em ambos os temas e em reduced-motion.

## Restrições mantidas

- Nenhuma biblioteca de componentes ou de animação.
- Nenhum asset externo baixado em runtime.
- Visual do produto e ícones desenhados como SVG autoral.
- Nenhum texto visível usa travessão longo; a copy usa frases curtas e hífen comum quando necessário.
- `npm run build` deve gerar saída estática sem erro em Node 20+.
