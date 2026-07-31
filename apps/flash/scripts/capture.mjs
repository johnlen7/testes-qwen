// captura screenshots do configurador (todas as cores/modos) para conferência
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EDGE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);

// hero
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/01-hero.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// configurador (rola até ele)
await page.evaluate(() => document.getElementById('configurador').scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/02-config-ion-espacial.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// aurora + silencioso
await page.click('.mode[data-mode="silencioso"]');
await page.waitForTimeout(700);
await page.click('.swatch[data-color="aurora"]');
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/03-config-aurora-silencioso.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// solar + transparencia (mostra o driver)
await page.click('.swatch[data-color="solar"]');
await page.waitForTimeout(700);
await page.click('.mode[data-mode="transparencia"]');
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/04-config-solar-transparencia.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// nebulosa + espacial
await page.click('.swatch[data-color="nebulosa"]');
await page.waitForTimeout(700);
await page.click('.mode[data-mode="espacial"]');
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/05-config-nebulosa-espacial.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// scroll-telling (explosão)
await page.evaluate(() => {
  const scroll = document.getElementById('story-scroll');
  const rect = scroll.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + rect.top + (rect.height - window.innerHeight) * 0.58, behavior: 'instant' });
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/06-story-explosao.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// finale
await page.evaluate(() => document.getElementById('finale').scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/07-finale.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// tema light no configurador
await page.click('#theme-toggle');
await page.waitForTimeout(1100);
await page.evaluate(() => document.getElementById('configurador').scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/08-config-light.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

await browser.close();
console.log('screenshots salvos em shots/');
