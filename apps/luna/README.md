# ÓRBITA

Landing de lançamento imersiva para um fone de ouvido fictício com cancelamento de ruído adaptativo espacial.

## Rodar localmente

Requer Node 20 ou superior.

```bash
npm install
npm run dev
```

O Vite abre o endereço `http://localhost:5173`. Para validar a saída de produção:

```bash
npm run typecheck
npm run build
npm run preview
```

O teste de navegador usa Playwright Python e sobe o servidor automaticamente:

```bash
python "C:\Users\johnl\.agents\skills\webapp-testing\scripts\with_server.py" --server "npm run dev -- --host 127.0.0.1 --port 4173" --port 4173 -- python scripts\verify_orbita.py
```

## Decisões principais

- React + Vite + TypeScript foram escolhidos para manter a SPA estática pequena, explícita e sem runtime de servidor.
- O sistema visual Orbital Signal trata o produto como um objeto de precisão em observação: carvão mineral, ciano orbital, espaço negativo e SVG autoral.
- Não há biblioteca de componente ou animação. Scrubbing, parallax, count-up e marquee usam CSS, `requestAnimationFrame`, Pointer Events e ResizeObserver.
- O estado de seleção fica no `App` e alimenta o configurador, o CTA de compra e o produto do fechamento. O preço é derivado do catálogo, nunca duplicado em cada seção.
- A troca de tema usa `prefers-color-scheme` como padrão, `localStorage` para escolhas explícitas e um reveal circular com fallback de reduced-motion.
- Acessibilidade inclui skip link, landmarks, foco visível, SVG com descrição, controles semânticos, FAQ navegável por setas e alternativa por botões para o trilho arrastável.

## O que faria com mais tempo

- Rodaria Lighthouse em um dispositivo móvel real e ajustaria carregamento de fontes, composição do SVG e custo de filtros para buscar 90+ em Performance e 95+ em Accessibility.
- Adicionaria uma página de especificações com dados reais de engenharia e uma fila de compra simulada, mantendo a experiência principal sem backend.
- Testaria o scroll-telling em Safari e Firefox para adicionar um fallback de Web Animations API caso o suporte a propriedades de customização SVG varie.
