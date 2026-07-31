#!/usr/bin/env node
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(root, 'site');
const shotsDir = path.join(root, 'hub', 'shots');
const PORT = 4319;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.json': 'application/json',
};

const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(siteDir, url);
  if (url.endsWith('/')) file = path.join(file, 'index.html');

  if (!file.startsWith(siteDir) || !existsSync(file)) {
    res.writeHead(404).end('404');
    return;
  }

  res.writeHead(200, { 'content-type': TIPOS[path.extname(file)] ?? 'application/octet-stream' });
  res.end(await fs.readFile(file));
});

await new Promise((r) => server.listen(PORT, r));
await fs.mkdir(shotsDir, { recursive: true });

const projects = JSON.parse(await fs.readFile(path.join(root, 'projects.json'), 'utf8'));

// Chrome do sistema evita depender do download de browser do Playwright.
const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const project of projects.filter((p) => p.enabled)) {
  if (!existsSync(path.join(siteDir, 'p', project.slug, 'index.html'))) {
    console.log(`pulando ${project.slug}: não construído`);
    continue;
  }

  // deviceScaleFactor 0.5 entrega 720x450 a partir de um viewport de desktop real.
  // reducedMotion: 'reduce' faz sites bem construídos irem direto ao estado final,
  // em vez de serem capturados no meio de uma animação de entrada.
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 0.5,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();

  await page.goto(`http://localhost:${PORT}/p/${project.slug}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(shotsDir, `${project.slug}.png`) });
  await ctx.close();

  console.log(`capturado ${project.slug}`);
}

await browser.close();
server.close();
