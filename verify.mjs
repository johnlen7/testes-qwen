#!/usr/bin/env node
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPaths } from './lib/check-paths.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(root, 'site');
const projects = JSON.parse(await fs.readFile(path.join(root, 'projects.json'), 'utf8'));

const problemas = [];

for (const arquivo of ['index.html', 'hub.css', 'produtos.html']) {
  if (!existsSync(path.join(siteDir, arquivo))) problemas.push(`site/${arquivo} não existe`);
}

// A página de comparação é a evidência da nota de design. Um recorte faltando
// vira um card sem imagem, e a nota fica sem o que a sustente.
if (existsSync(path.join(siteDir, 'produtos.html'))) {
  const produtos = await fs.readFile(path.join(siteDir, 'produtos.html'), 'utf8');
  for (const m of produtos.matchAll(/src="(produto\/[^"]+)"/g)) {
    if (!existsSync(path.join(siteDir, m[1]))) problemas.push(`produtos.html: recorte ausente ${m[1]}`);
  }
  for (const p of projects.filter((x) => x.enabled)) {
    if (!produtos.includes(`produto/${p.slug}.png`)) {
      problemas.push(`${p.slug}: habilitado mas ausente da página de produtos`);
    }
  }
}

const hub = existsSync(path.join(siteDir, 'index.html'))
  ? await fs.readFile(path.join(siteDir, 'index.html'), 'utf8')
  : '';

for (const project of projects.filter((p) => p.enabled)) {
  const appDir = path.join(siteDir, 'p', project.slug);
  const indexPath = path.join(appDir, 'index.html');
  const linkado = hub.includes(`href="/p/${project.slug}/"`);

  if (!existsSync(indexPath)) {
    // Build falhado é estado válido; o hub precisa refletir isso e não linkar.
    if (linkado) problemas.push(`${project.slug}: hub linka um projeto que não foi construído`);
    continue;
  }

  if (!linkado) problemas.push(`${project.slug}: construído mas ausente do hub`);

  const html = await fs.readFile(indexPath, 'utf8');

  for (const violacao of checkPaths(html, project.slug)) {
    problemas.push(`${project.slug}: ${violacao}`);
  }

  // Todo arquivo local referenciado precisa existir no disco.
  const prefixo = `/p/${project.slug}/`;
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*"([^"]*)"/gi)) {
    const value = match[1].trim();
    if (!value || value.startsWith('#') || value.startsWith('data:')) continue;
    if (value.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(value)) continue;

    const rel = value.startsWith(prefixo) ? value.slice(prefixo.length) : value;
    const alvo = path.join(appDir, rel.split('?')[0].split('#')[0]);

    if (!existsSync(alvo)) problemas.push(`${project.slug}: referência quebrada ${value}`);
  }
}

if (problemas.length > 0) {
  console.error('verificação falhou:');
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

console.log('verificação ok');
