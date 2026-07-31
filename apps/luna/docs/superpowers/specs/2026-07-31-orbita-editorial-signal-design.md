# ÓRBITA Editorial Signal

## Design read

Landing de lançamento premium para ouvintes atentos a design, com linguagem editorial espacial, precisão industrial e motion cinematográfico controlado. A página é greenfield e sua função principal é levar a pessoa da observação do produto à configuração e compra simulada.

Dials: DESIGN_VARIANCE 8, MOTION_INTENSITY 7, VISUAL_DENSITY 3.

## Opções consideradas

1. **Kinetic brutalism:** preto, acid yellow, bordas duras e tipografia agressiva. É memorável, mas torna o produto mais cultural do que premium e exige mais contenção para não sacrificar leitura.
2. **Cinema glass:** superfícies escuras, blur e brilho frio. É fácil de executar, mas se aproxima demais do padrão de produto tecnológico premium e não diferencia o ÓRBITA.
3. **Orbital Signal, recomendada:** objeto de precisão em um campo orbital, vazio editorial, base mineral e ciano controlado. Mantém a energia espacial sem estrelas ou gradientes decorativos, e cria uma assinatura que pode aparecer no hero, no scroll-telling e no configurador.

## Direção visual aprovada para implementação

O fundo escuro principal é carvão azulado `#090B0E`, com superfícies `#11161B` e `#1B232A`. A versão clara usa cinza mineral `#EFF2F0`, nunca branco puro ou papel bege. O acento é ciano orbital: `#8BE7D4` no escuro e `#2D9D91` em controles claros. `#FF8A62` aparece apenas como cor de produto Ember ou semântica de erro.

O display usa Space Grotesk com fallback de sistema; o corpo usa DM Sans; números e metadados usam uma pilha mono. A composição prefere um split assimétrico no hero, uma desmontagem sticky no scroll-telling, um configurador de duas colunas, uma grade irregular, um trilho horizontal e um accordion vertical. Assim, cada seção tem uma família de layout própria.

A assinatura é um `ProductVisual` SVG autoral com arco, conchas, anéis internos, halo, sombra e trajetórias orbitais. O elemento é reutilizado com propriedades de cor, perfil, tamanho e progresso de desmontagem. O produto não fica dentro de um card falso.

## Arquitetura e fluxo

React/Vite/TypeScript compõe uma única rota. `App` é dono da seleção de produto e tema. Dados estáticos ficam em `src/data/content.ts`; o produto recebe uma seleção normalizada e o preço é sempre derivado de preço base mais deltas.

Interações contínuas não chamam `setState` a cada frame. Hooks de pointer, scroll e marquee usam `requestAnimationFrame`, cancelam o frame no cleanup e escrevem custom properties em elementos DOM. Estado React só muda em eventos discretos, como seleção de cor, etapa narrativa, abertura do FAQ ou atualização do tema.

## Contratos de acessibilidade

- Skip link para `#main-content`, landmarks `header`, `main`, `nav`, `section` e `footer`.
- Todos os controles interativos são `button`, `a` ou controles de formulário nativos.
- O visual do produto tem `role="img"` e descrição textual útil.
- Foco visível com cor orbital e contraste suficiente nos dois temas.
- `prefers-reduced-motion` remove órbitas, parallax, tilt, marquee automático, scrubbing visual e count-up.
- FAQ usa `aria-expanded`, `aria-controls`, setas e foco preservado.
- Carrossel tem pausa por hover/foco e alternativa por botões.
- Swatches anunciam nome, preço adicional e seleção sem depender somente de cor.

## Verificação

O resultado será validado com `npm run build`, verificação de tipos, inspeção de dependências proibidas, um script Playwright para os fluxos principais e screenshots em 360, 768 e 1280px. A revisão também cobre tema claro/escuro, reduced-motion, foco de teclado, largura horizontal e o checklist completo do PRD.
