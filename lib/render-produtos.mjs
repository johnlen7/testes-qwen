// Página de comparação dos visuais de produto.
//
// Existe porque a categoria "design / direção de arte" vale 20 dos 100 pontos
// e é a única que leitura de código não consegue avaliar em princípio. Os
// recortes aqui são a evidência da nota de design — quem discordar consegue
// discordar olhando.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderProdutos(projects) {
  const visible = [...projects.filter((p) => p.enabled)]
    .sort((a, b) => (b.design ?? -Infinity) - (a.design ?? -Infinity));

  const itens = visible.map((p) => {
    const slug = escapeHtml(p.slug);
    const nota = p.design === undefined || p.design === null
      ? ''
      : `<span class="prod-nota">${escapeHtml(p.design)}<span class="prod-max">/20</span></span>`;
    return `    <figure class="prod" style="--accent: ${escapeHtml(p.accent)}">
      <img class="prod-img" src="produto/${slug}.png" alt="Visual do produto da implementação ${escapeHtml(p.title)}" loading="lazy">
      <figcaption class="prod-cap">
        <a class="prod-link" href="/p/${slug}/">${escapeHtml(p.model)}</a>
        ${nota}
      </figcaption>
    </figure>`;
  }).join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ÓRBITA — os ${visible.length} produtos lado a lado</title>
<meta name="description" content="O visual de produto de cada implementação do briefing ÓRBITA, isolado para comparação.">
<link rel="stylesheet" href="hub.css">
</head>
<body>
<header class="head">
  <p class="head-volta"><a href="/">&larr; voltar para a vitrine</a></p>
  <h1 class="head-title">Os ${visible.length} produtos</h1>
  <p class="head-sub">O mesmo briefing pedia o mesmo fone. Cada implementação desenhou o seu, em SVG, à mão.</p>
  <p class="head-note">Ordenado pela nota de design. Esta é a única categoria da rubrica avaliada olhando, e não lendo código — leitura estática não enxerga se o produto ficou bom. É julgamento estético de um avaliador só, e o mais contestável do conjunto.</p>
</header>
<main class="prod-grid">
${itens}
</main>
</body>
</html>
`;
}
