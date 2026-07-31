# Vitrine ÓRBITA

Doze implementações do mesmo briefing, uma por modelo. Hub em `/`, cada
implementação em `/p/<slug>/`.

## Comandos

    npm test        # testes das funções puras
    npm run build   # constrói os apps habilitados em site/ e verifica
    npm run capture # regera os screenshots dos cards (precisa de Chrome local)

## Adicionar um projeto

1. Copiar o fonte para `apps/<slug>/` (sem `node_modules`, `dist`, `build`).
2. Adicionar a entrada em `projects.json` com `enabled: true`.
3. `npm run build` e depois `npm run capture`.
4. Commit e push. O EasyPanel reconstrói sozinho.

## Notas

As notas exibidas vêm de avaliação por leitura estática de código, sem
confirmação visual. São preliminares. `claude-01` aparece sem nota de
propósito: a avaliação que existe dele foi feita no meio da construção e
está obsoleta.

## Publicado em

https://example-qwen-kimi.rf3asg.easypanel.host/

## Deploy

EasyPanel, App com Source = GitHub, Build = Dockerfile, porta 80.
Push na `main` dispara rebuild. O build leva de 5 a 12 minutos — são
doze `npm ci` em sequência dentro do estágio Node.
