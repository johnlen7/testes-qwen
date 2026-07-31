// Mede se o scroll-telling faz scrubbing real ou é trigger disfarçado.
//
// Discriminador: scrubbing real interpola frame a frame, então um mesmo
// elemento assume MUITOS valores distintos de transform ao longo do track.
// Trigger (IntersectionObserver + classe) assume 2: antes e depois.
//
// Amostra transform/opacity de todos os elementos em 9 posições de scroll e
// conta, por elemento, quantos valores distintos apareceram.
import { chromium } from 'playwright-core';

const HOST = process.env.PROBE_HOST || 'https://example-qwen-kimi.rf3asg.easypanel.host';
const slugs = process.argv.slice(2);

const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const slug of slugs) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e).slice(0, 120)));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text().slice(0, 120)));

  try {
    await page.goto(`${HOST}/p/${slug}/`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1500);

    // Marca cada elemento com um id estável para casar amostras entre scrolls.
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el, i) => { el.dataset.probeId = String(i); });
    });

    const amostras = [];
    for (const frac of [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85]) {
      await page.evaluate((f) => {
        window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f);
      }, frac);
      await page.waitForTimeout(420);

      amostras.push(await page.evaluate(() => {
        const out = {};
        for (const el of document.querySelectorAll('[data-probe-id]')) {
          const cs = getComputedStyle(el);
          if (cs.transform === 'none' && cs.opacity === '1') continue;
          out[el.dataset.probeId] = `${cs.transform}|${cs.opacity}`;
        }
        return out;
      }));
    }

    // Por elemento, quantos valores distintos ao longo do track.
    const distintos = new Map();
    for (const a of amostras) {
      for (const [id, v] of Object.entries(a)) {
        if (!distintos.has(id)) distintos.set(id, new Set());
        distintos.get(id).add(v);
      }
    }

    const contagens = [...distintos.values()].map((s) => s.size);
    const continuos = contagens.filter((n) => n >= 6).length;  // muda quase todo frame
    const graduais = contagens.filter((n) => n >= 3 && n < 6).length;
    const binarios = contagens.filter((n) => n === 2).length;

    const alturaVh = await page.evaluate(() =>
      Math.round((document.documentElement.scrollHeight / innerHeight) * 100) / 100);

    const veredito = continuos >= 3 ? 'SCRUBBING REAL'
      : continuos >= 1 || graduais >= 6 ? 'PARCIAL'
      : 'TRIGGER/FADE';

    console.log(`${slug.padEnd(14)} ${veredito.padEnd(15)} continuos=${String(continuos).padStart(3)} graduais=${String(graduais).padStart(3)} binarios=${String(binarios).padStart(3)} altura=${alturaVh}vh erros=${erros.length}${erros.length ? ' :: ' + erros[0] : ''}`);
  } catch (e) {
    console.log(`${slug.padEnd(14)} ERRO :: ${String(e).slice(0, 120)}`);
  }

  await ctx.close();
}

await browser.close();
