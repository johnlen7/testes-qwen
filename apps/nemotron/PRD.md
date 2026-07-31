# PRD — ÓRBITA · Experiência Frontend Imersiva

**Desafio:** frontend puro, sem backend. Objetivo: medir o teto de capacidade do modelo em design, animação e engenharia de interface. Nada de biblioteca pronta segurando a mão — tudo à mão.

---

## 1. Visão

Construir o site de lançamento do **ÓRBITA** — um fone de ouvido premium fictício com cancelamento de ruído "adaptativo espacial". O site é uma experiência narrativa única (SPA, uma rota principal + seções), com animações cinematográficas dirigidas por scroll, micro-interações em todos os elementos interativos e um configurador de produto interativo.

O site precisa parecer produto de estúdio de design de ponta (nível Apple/Linear/Stripe), não template.

## 2. Escopo

### Incluído
- Site estático servível (sem servidor de API, sem banco, sem auth).
- Todo conteúdo hardcoded/mockado no próprio projeto.
- Uma página principal com as 7 seções descritas abaixo.

### Excluído
- Backend, API, banco de dados, autenticação, CMS.
- Checkout real (o CTA final é simulado).

## 3. Stack e restrições técnicas

| Item | Regra |
|---|---|
| Framework | Livre escolha: React/Next.js, Svelte/SvelteKit, Vue/Nuxt, Astro ou vanilla. Justificar a escolha no plano. |
| CSS | Livre (CSS puro, CSS Modules, Tailwind). |
| **Bibliotecas de componentes** | **PROIBIDO** — nada de shadcn, MUI, Radix, Chakra, DaisyUI etc. Todo componente é autoral. |
| **Bibliotecas de animação** | **PROIBIDO** — nada de GSAP, Framer Motion, Lottie, Anime.js, Motion One, AOS. Animações via CSS (transitions, keyframes, scroll-driven animations), Web Animations API e `requestAnimationFrame`. |
| Canvas/WebGL | Permitido **apenas escrito à mão** (Canvas 2D ou WebGL puro). Three.js e similares proibidos. |
| Fontes | Google Fonts permitido, ou system stack bem construída. |
| Imagens | Gerar via SVG/CSS/Canvas próprios, ou placeholders geométricos autorais. Sem baixar assets externos em runtime. |
| Build | `npm install && npm run dev` deve funcionar. `npm run build` deve gerar saída estática sem erro. |
| Node | Compatível com Node 20+. |

> A proibição de bibliotecas é intencional: o desafio mede a capacidade **crua** do modelo de escrever animação e componente do zero.

## 4. Seções obrigatórias (a página)

### 4.1 Hero — assinatura visual
- Animação de entrada orquestrada (staggered): título, subtítulo, CTA e visual do produto entram em sequência coreografada.
- Visual do produto: representação do fone construída em SVG ou Canvas autoral (não precisa ser foto-realista — precisa ser *bonita e intencional*).
- Algum elemento com movimento contínuo sutil (partículas, gradiente animado, órbitas — coerente com o nome ÓRBITA).
- Efeito de paralaxe ou reação ao mouse (desktop) que não atrapalhe em touch.

### 4.2 Scroll-telling — "como funciona"
- Mínimo 3 etapas narrativas dirigidas por scroll: o visual do produto se transforma/rotaciona/explode em partes conforme o usuário rola.
- Progresso do scroll visivelmente mapeado à animação (scrubbing), não apenas triggers de entrada.
- Texto sincronizado com cada etapa.

### 4.3 Configurador interativo
- Escolha de cor do fone (mínimo 4 cores) com transição animada do visual do produto.
- Escolha de um segundo atributo (ex.: tamanho de concha, modo de som) que altera algo visível.
- Preço atualiza com animação de contagem (count-up/rolagem de dígitos).
- Estado refletido no CTA ("Comprar ÓRBITA — Grafite, R$ 2.499").

### 4.4 Grade de features
- 4–6 cards de features com micro-interações no hover/focus (tilt, glow, revelação — escolha autoral).
- Ícones autorais em SVG.
- Entrada dos cards animada por scroll (stagger).

### 4.5 Depoimentos / prova social
- Carrossel ou marquee **autoral** com pausa em hover e suporte a arrastar (pointer events).
- Loop infinito sem salto visível.

### 4.6 FAQ
- Accordion autoral com animação de altura suave (sem `height: auto` quebrado — resolver o problema clássico de animar altura).
- Acessível por teclado (setas, Enter/Espaço, `aria-expanded`).

### 4.7 CTA final + rodapé
- Seção de fechamento com o produto na cor escolhida no configurador (estado compartilhado).
- Botão com micro-interação premium (magnético, ripple ou equivalente autoral).
- Rodapé simples coerente com o design.

## 5. Requisitos transversais

### 5.1 Motion design
- Física de movimento consistente: curvas de easing customizadas (não usar só `ease`), durações coerentes num sistema (ex.: 150/300/600ms).
- Nenhuma animação que dispare layout thrashing — apenas `transform`, `opacity`, `clip-path`, `filter` em animações contínuas.
- 60fps no scroll-telling em hardware médio.

### 5.2 Tema claro/escuro
- Toggle animado (a própria transição de tema é uma animação — ex.: reveal circular, cross-fade coreografado).
- Respeitar `prefers-color-scheme` como padrão inicial; persistir escolha em `localStorage`.
- Ambos os temas com contraste AA.

### 5.3 Acessibilidade
- `prefers-reduced-motion`: TODAS as animações decorativas desligam ou viram fades simples. Obrigatório e testável.
- Navegação completa por teclado com focus visible autoral (não o outline default, mas visível).
- Landmarks semânticos, headings hierárquicos, `alt`/`aria-label` corretos.

### 5.4 Responsivo
- Mobile (360px), tablet (768px), desktop (1280px+) — todos intencionais, não apenas "não quebrou".
- Interações touch equivalentes às de mouse onde aplicável.

### 5.5 Performance
- Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95.
- Sem CLS perceptível; fontes com `font-display: swap` ou preload.
- JS total enviado ao cliente ≤ 200KB gzip (excluindo framework runtime mínimo).

## 6. Direção de arte (guia, não algema)

- Nome evoca espaço/órbita: paleta escura profunda com um acento vibrante funciona bem, mas a direção final é decisão do modelo — ousadia intencional > segurança genérica.
- Tipografia com hierarquia forte: display expressiva + texto legível.
- Proibido visual "template SaaS genérico" (gradiente roxo/azul padrão, glassmorphism sem propósito, emoji como ícone).

## 7. Entregáveis

1. Código completo na própria pasta (`src/` etc.).
2. `PLANO.md` — plano de implementação escrito ANTES do código (ver PROMPT.md).
3. `README.md` — como rodar (`npm install`, `npm run dev`, porta), decisões principais, o que faria com mais tempo.
4. Build passando: `npm run build` sem erro.

## 8. Rubrica de avaliação (100 pts)

| Critério | Pts | O que pesa |
|---|---|---|
| Qualidade de animação | 25 | Coreografia, física de movimento, scrubbing do scroll-telling, 60fps |
| Design / direção de arte | 20 | Gosto, originalidade, tipografia, coerência visual, não parecer template |
| Interatividade | 15 | Configurador, micro-interações, carrossel, estado compartilhado |
| Qualidade de código | 15 | Arquitetura, legibilidade, componentização, sem gambiarras |
| Acessibilidade | 10 | reduced-motion, teclado, contraste, semântica |
| Performance | 10 | Lighthouse, peso de JS, sem jank |
| Criatividade extra | 5 | Surpresas deliciosas não pedidas que elevam a experiência |

**Desclassificação parcial** (−20 pts): uso de biblioteca proibida. **Build quebrado**: nota máxima 50.
