// Renderiza o hub como HTML estático. Sem JavaScript no cliente: a página
// precisa funcionar sempre, e o estado de cada build só é conhecido aqui,
// no momento da construção.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Reordena a ISO na mão em vez de usar Date: `new Date('2026-07-23')` é
// interpretado como UTC e, em fuso negativo, imprime o dia anterior.
function dataBR(iso) {
  const [a, m, d] = String(iso).split('-');
  return `${d}/${m}/${a}`;
}

// Ordena por nota, maior primeiro. Sem nota vai para o fim. Empate mantém a
// ordem do manifesto — `sort` é estável por spec desde ES2019.
// Copia o array antes: ordenar o que veio de fora seria efeito colateral.
function porNota(projects) {
  return [...projects].sort((a, b) => {
    const x = a.score ?? -Infinity;
    const y = b.score ?? -Infinity;
    return y - x;
  });
}

function renderCard(project, result, posicao) {
  const title = escapeHtml(project.title);
  const model = escapeHtml(project.model);
  const accent = escapeHtml(project.accent);
  const slug = escapeHtml(project.slug);
  const score = project.score === null || project.score === undefined
    ? ''
    : `<span class="card-score" title="nota preliminar, leitura estática de código">${escapeHtml(project.score)}</span>`;

  const tech = project.stack || project.date
    ? `
      <p class="card-tech">${project.stack ? `<span class="card-stack">${escapeHtml(project.stack)}</span>` : ''}${
        project.date ? `<time class="card-date" datetime="${escapeHtml(project.date)}">${dataBR(project.date)}</time>` : ''
      }</p>`
    : '';

  const body = `
      <img class="card-shot" src="shots/${slug}.png" alt="Captura da implementação ${title}" loading="lazy" width="720" height="450">
      <div class="card-meta">
        <span class="card-rank">${posicao}</span>
        <h2 class="card-title">${title}</h2>
        <p class="card-model">${model}</p>
        ${score}
      </div>${tech}`;

  if (!result || !result.ok) {
    const reason = escapeHtml(result?.reason ?? 'build não executado');
    return `    <div class="card card-broken" style="--accent: ${accent}">${body}
      <p class="card-status">Indisponível — ${reason}</p>
    </div>`;
  }

  return `    <a class="card" href="/p/${slug}/" style="--accent: ${accent}">${body}
    </a>`;
}

export function renderHub(projects, results, opts = {}) {
  const visible = porNota(projects.filter((p) => p.enabled));
  const cards = visible.map((p, i) => renderCard(p, results.get(p.slug), i + 1)).join('\n');
  const avaliacao = opts.avaliadoEm
    ? ` Avaliação de <time datetime="${escapeHtml(opts.avaliadoEm)}">${dataBR(opts.avaliadoEm)}</time>.`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vitrine ÓRBITA — o mesmo briefing por modelos diferentes</title>
<meta name="description" content="Implementações independentes do briefing ÓRBITA, uma por modelo de linguagem.">
<link rel="stylesheet" href="hub.css">
</head>
<body>
<header class="head">
  <h1 class="head-title">ÓRBITA</h1>
  <p class="head-sub">Um briefing. ${visible.length} implementações. Um modelo diferente em cada uma.</p>
  <p class="head-note">Nota de 0 a 100 pela rubrica do briefing. Animação, interatividade, código, acessibilidade e performance saem de leitura do código, com os pontos mais frágeis confirmados por medição no navegador. Design sai de olhar o resultado renderizado — <a href="/produtos.html">os 13 produtos lado a lado</a> — e é julgamento estético de um avaliador só.${avaliacao}</p>
</header>
<main class="grid">
${cards}
</main>
</body>
</html>
`;
}
