# Vitrine ÓRBITA

Doze implementações do mesmo briefing, uma por modelo. Hub em `/`, cada
implementação em `/p/<slug>/`.

## Comandos

    npm test                    # testes das funções puras
    npm run build               # constrói os apps em site/ e verifica
    node build.mjs --hub-only   # re-renderiza só o hub, sem rebuildar os apps
    npm run capture             # regera os screenshots (precisa de Chrome local)
    node scrub-probe.mjs <slug>...   # mede se o scroll-telling scruba de verdade

## Adicionar um projeto

1. Copiar o fonte para `apps/<slug>/` (sem `node_modules`, `dist`, `build`).
2. Adicionar a entrada em `projects.json` com `enabled: true`.
3. `npm run build` e depois `npm run capture`.
4. Commit e push. O EasyPanel reconstrói sozinho.

## Notas

As notas exibidas vêm de avaliação por leitura estática de código contra a
rubrica do PRD (animação 25, design 20, interatividade 15, código 15,
acessibilidade 10, performance 10, extra 5). São preliminares.

A afirmação mais frágil dessa leitura é "o scroll-telling faz scrubbing
real". `scrub-probe.mjs` existe para medir isso em vez de supor: ele amostra
`transform`/`opacity` de todos os elementos em 8 posições de scroll e conta
quantos valores distintos cada um assume. Scrubbing real produz elementos com
muitos valores distintos; trigger com IntersectionObserver produz dois.

## Publicado em

https://example-qwen-kimi.rf3asg.easypanel.host/

## Deploy

EasyPanel, App com Source = GitHub, Build = Dockerfile, porta 80.
Push na `main` dispara rebuild. O build leva de 5 a 12 minutos — são
doze `npm ci` em sequência dentro do estágio Node.
