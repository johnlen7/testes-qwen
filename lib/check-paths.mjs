// Detecta referências que escapariam do prefixo /p/<slug>/ do projeto.
// O modo de falha que isto existe para pegar: um build sem prefixo emite
// src="/assets/index-abc.js", que o browser resolve na raiz do domínio,
// colidindo com todos os outros projetos.

const ATTR_RE = /\b(?:src|href)\s*=\s*"([^"]*)"/gi;

export function checkPaths(html, slug) {
  const allowed = `/p/${slug}/`;
  const violations = [];

  for (const match of html.matchAll(ATTR_RE)) {
    const value = match[1].trim();

    // Vazio, fragmento, data URI, URL absoluta ou protocol-relative: fora do escopo.
    if (value === '' || value.startsWith('#') || value.startsWith('data:')) continue;
    if (value.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(value)) continue;

    // Relativo: sempre resolve dentro da pasta do projeto.
    if (!value.startsWith('/')) continue;

    // A barra final em `allowed` é o que impede /p/qwen-01/ de passar como /p/qwen.
    if (!value.startsWith(allowed)) {
      violations.push(`caminho absoluto fora de ${allowed}: ${value}`);
    }
  }

  return violations;
}
