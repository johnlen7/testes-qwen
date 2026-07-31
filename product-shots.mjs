// Captura só o visual do produto (o fone) de cada candidato, isolado.
//
// A categoria "design / direção de arte" vale 20 dos 100 pontos e é a única
// que leitura de código não consegue julgar. Estes recortes existem para que
// a nota de design seja dada olhando, não inferindo.
//
// Heurística: o maior <svg> dentro do primeiro viewport. Nas 13 implementações
// o fone é desenhado em SVG inline e é, por larga margem, o maior da dobra.
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(root, 'hub', 'produto');
const HOST = process.env.PROBE_HOST || 'https://example-qwen-kimi.rf3asg.easypanel.host';

await fs.mkdir(outDir, { recursive: true });
const projects = JSON.parse(await fs.readFile(path.join(root, 'projects.json'), 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const project of projects.filter((p) => p.enabled)) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();

  try {
    await page.goto(`${HOST}/p/${project.slug}/`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);

    const alvo = await page.evaluate(() => {
      let melhor = null;
      let maiorArea = 0;
      for (const svg of document.querySelectorAll('svg')) {
        const r = svg.getBoundingClientRect();
        // Precisa estar na dobra e ter tamanho de peça central, não de ícone.
        if (r.top > 900 || r.width < 180 || r.height < 180) continue;
        const area = r.width * r.height;
        if (area > maiorArea) { maiorArea = area; melhor = svg; }
      }
      if (!melhor) return null;
      melhor.setAttribute('data-produto-alvo', '1');
      const r = melhor.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });

    if (!alvo) {
      console.log(`${project.slug.padEnd(16)} sem SVG grande na dobra — capturando a dobra inteira`);
      await page.screenshot({ path: path.join(outDir, `${project.slug}.png`) });
    } else {
      // Margem em volta para o fone não ficar colado na borda do recorte.
      const el = page.locator('[data-produto-alvo]').first();
      const box = await el.boundingBox();
      const m = 24;
      await page.screenshot({
        path: path.join(outDir, `${project.slug}.png`),
        clip: {
          x: Math.max(0, box.x - m),
          y: Math.max(0, box.y - m),
          width: Math.min(1440 - Math.max(0, box.x - m), box.width + m * 2),
          height: Math.min(900 - Math.max(0, box.y - m), box.height + m * 2),
        },
      });
      console.log(`${project.slug.padEnd(16)} ${alvo.w}x${alvo.h}`);
    }
  } catch (e) {
    console.log(`${project.slug.padEnd(16)} ERRO :: ${String(e).slice(0, 100)}`);
  }

  await ctx.close();
}

await browser.close();
console.log(`\n${(await fs.readdir(outDir)).length} recortes em hub/produto/`);
