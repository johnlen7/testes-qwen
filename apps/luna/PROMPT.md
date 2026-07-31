# Prompt de execução

> Cole o conteúdo abaixo como primeira mensagem para o modelo, com o diretório de trabalho apontando para esta pasta.

---

```markdown
## Contexto
Você está em uma pasta vazia (exceto por `PRD.md` e este prompt) e vai construir um projeto frontend completo do zero. O arquivo `PRD.md` nesta pasta contém a especificação integral do produto: um site de lançamento imersivo para o fone de ouvido fictício ÓRBITA. Não existe backend — é 100% frontend estático. Este trabalho será avaliado comparativamente contra outros modelos usando a rubrica do PRD, seção 8.

## Tarefa
Leia `PRD.md` por completo antes de escrever qualquer código. Depois:

1. **Planeje primeiro.** Escreva `PLANO.md` com: escolha de framework e justificativa em 3 linhas; arquitetura de pastas; sistema de design (paleta, tipografia, escala de espaçamento, tokens de duração/easing das animações); estratégia técnica para cada seção do PRD (especialmente o scroll-telling da seção 4.2 e a troca de tema da 5.2); ordem de implementação.
2. **Implemente tudo.** As 7 seções da página (PRD seção 4), os requisitos transversais (seção 5) e os entregáveis (seção 7). Sem esqueleto pela metade: cada seção precisa estar em estado final apresentável.
3. **Verifique.** Rode `npm run build` e corrija até passar sem erro. Revise contra o checklist abaixo.

## Restrições (inegociáveis — ver PRD seção 3)
- PROIBIDO: bibliotecas de componentes (shadcn, MUI, Radix, Chakra…) e de animação (GSAP, Framer Motion, Lottie, Anime.js, Three.js…). Uso de qualquer uma = penalidade de −20 pts.
- Animações apenas com CSS, Web Animations API e requestAnimationFrame, escritas por você.
- Visuais do produto em SVG/Canvas autorais — nenhum asset externo baixado em runtime.
- `npm install && npm run dev` deve funcionar em Node 20+; `npm run build` deve gerar saída estática sem erro.

## Padrão de qualidade
Este desafio mede o seu teto, não o seu mínimo. O resultado deve parecer obra de um estúdio de design de ponta. Capriche na coreografia das animações, na física de movimento e nos detalhes que ninguém pediu (rubrica reserva 5 pts para isso). Genérico e seguro perde para ousado e intencional.

## Checklist final (autoavaliação obrigatória antes de encerrar)
- [ ] Hero com entrada orquestrada + elemento de movimento contínuo + paralaxe/mouse
- [ ] Scroll-telling com scrubbing real (animação mapeada ao progresso do scroll, mínimo 3 etapas)
- [ ] Configurador: 4+ cores com transição animada, segundo atributo, preço com count-up, estado refletido no CTA e reutilizado no CTA final
- [ ] Grade de features com micro-interações e ícones SVG autorais
- [ ] Carrossel/marquee infinito autoral com pausa em hover e drag
- [ ] Accordion FAQ com animação de altura correta e navegação por teclado
- [ ] Tema claro/escuro com transição animada, `prefers-color-scheme` e `localStorage`
- [ ] `prefers-reduced-motion` desliga todas as animações decorativas
- [ ] Responsivo intencional em 360/768/1280px
- [ ] Apenas `transform`/`opacity`/`clip-path`/`filter` em animações contínuas
- [ ] `npm run build` passa sem erro
- [ ] `PLANO.md` e `README.md` escritos

## Output esperado
Projeto completo nesta pasta: código-fonte, `PLANO.md`, `README.md` (como rodar, porta, decisões, o que faria com mais tempo). Nada fora desta pasta.
```
