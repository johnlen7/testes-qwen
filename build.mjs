#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './lib/build-app.mjs';
import { renderHub } from './lib/render-hub.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(root, 'site');

// Data em que a rodada de avaliação foi feita. Fixa de propósito: não é a data
// do build. Rebuildar o site não reavalia nada.
const AVALIADO_EM = '2026-07-31';

// --hub-only re-renderiza só o hub a partir do site/ que já existe, sem
// reconstruir os apps. Usado ao mexer em texto, nota ou metadado de card.
const hubOnly = process.argv.includes('--hub-only');

function run(cmd, args, cwd) {
  return new Promise((resolve) => {
    // shell: true no Windows para resolver npm.cmd / npx.cmd.
    const child = spawn(cmd, args, {
      cwd: path.join(root, cwd),
      shell: process.platform === 'win32',
      stdio: ['ignore', 'inherit', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on('close', (code) => resolve({ code: code ?? 1, stderr: stderr.slice(-2000) }));
  });
}

const deps = { run, exists: (p) => existsSync(path.join(root, p)) };

const projects = JSON.parse(await fs.readFile(path.join(root, 'projects.json'), 'utf8'));
const enabled = projects.filter((p) => p.enabled);

if (!hubOnly) {
  await fs.rm(siteDir, { recursive: true, force: true });
}
await fs.mkdir(path.join(siteDir, 'p'), { recursive: true });

const results = new Map();

for (const project of enabled) {
  if (hubOnly) {
    const pronto = existsSync(path.join(siteDir, 'p', project.slug, 'index.html'));
    results.set(project.slug, pronto
      ? { ok: true }
      : { ok: false, reason: 'não construído nesta execução (--hub-only)' });
    continue;
  }

  console.log(`\n=== ${project.slug} ===`);
  const result = await buildApp(project, deps);

  if (result.ok) {
    const from = path.join(root, project.dir, result.outDir);
    if (existsSync(from)) {
      await fs.cp(from, path.join(siteDir, 'p', project.slug), { recursive: true });
    } else {
      result.ok = false;
      result.reason = `build terminou sem produzir ${result.outDir}/`;
    }
  }

  results.set(project.slug, result);
  console.log(result.ok ? `OK    ${project.slug}` : `FALHA ${project.slug}: ${result.reason}`);
}

// Hub e assets estáticos.
await fs.writeFile(
  path.join(siteDir, 'index.html'),
  renderHub(projects, results, { avaliadoEm: AVALIADO_EM }),
);
await fs.cp(path.join(root, 'hub', 'hub.css'), path.join(siteDir, 'hub.css'));

const shotsDir = path.join(root, 'hub', 'shots');
if (existsSync(shotsDir)) {
  await fs.cp(shotsDir, path.join(siteDir, 'shots'), { recursive: true });
} else {
  // Cards degradam para o gradiente da cor de destaque; não é motivo de falha.
  console.log('aviso: hub/shots/ ausente, cards sem screenshot');
}

const falhas = [...results.values()].filter((r) => !r.ok).length;
console.log(`\n${enabled.length - falhas}/${enabled.length} projetos construídos`);

if (falhas === enabled.length) {
  console.error('todos os projetos habilitados falharam');
  process.exit(1);
}
