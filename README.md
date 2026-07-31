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

Duas afirmações dessa leitura são frágeis demais para aceitar sem medir, e
cada uma tem um probe:

`scrub-probe.mjs` — "o scroll-telling faz scrubbing real". Amostra
`transform`/`opacity` de todos os elementos em 8 posições de scroll e conta
quantos valores distintos cada um assume. Scrubbing real produz elementos com
muitos valores distintos; trigger com IntersectionObserver produz dois.

`cascade-probe.mjs` — "o efeito escrito pelo JS chega à tela". Move o mouse
por 5 posições e compara, por elemento, quantos valores distintos o
`style.transform` inline assume contra quantos o transform COMPUTADO assume.
Inline variando com computado parado significa que uma `animation` CSS (em
geral com `forwards`) ou um `!important` venceu a cascata: o efeito existe no
código e não existe na tela, sem erro no console. Três candidatos caíram
nisso.

Os dois probes têm limites conhecidos. O de cascata só enxerga elementos que
recebem transform inline nas posições de mouse testadas — um tilt que só
dispara com o ponteiro sobre o card não aparece. E um elemento com animação
infinita tem o computado variando sozinho, o que mascara um efeito morto.
Ausência de achado neles não é prova de ausência de defeito.

## Publicado em

https://example-qwen-kimi.rf3asg.easypanel.host/

## Deploy

EasyPanel, App com Source = GitHub, Build = Dockerfile, porta 80.
Push na `main` dispara rebuild. O build leva de 5 a 12 minutos — são
doze `npm ci` em sequência dentro do estágio Node.
