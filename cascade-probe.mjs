// Acha efeitos mortos por conflito de cascata, sem precisar saber o seletor.
//
// Padrão do defeito: o JS escreve `element.style.transform` a cada frame, mas
// uma `animation` CSS ou uma regra `!important` vence a cascata, então o
// transform computado nunca muda. O efeito existe no código e não existe na
// tela.
//
// Método: mover o mouse por 5 posições e, para todo elemento que tenha
// transform inline, comparar quantos valores distintos o INLINE assume contra
// quantos o COMPUTADO assume. Inline variando + computado parado = morto.
//
// Uso: node cascade-probe.mjs <slug>...
import { chromium } from 'playwright-core';

const HOST = process.env.PROBE_HOST || 'https://example-qwen-kimi.rf3asg.easypanel.host';
const slugs = process.argv.slice(2);
const POSICOES = [[200, 300], [1200, 300], [200, 700], [1240, 760], [700, 450]];

const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const slug of slugs) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();

  try {
    await page.goto(`${HOST}/p/${slug}/`, { waitUntil: 'networkidle', timeout: 45000 });
    // Espera a animação de entrada terminar: é depois dela que um `forwards`
    // congela o elemento.
    await page.waitForTimeout(3000);

    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((el, i) => { el.dataset.ccId = String(i); });
    });

    const amostras = [];
    for (const [x, y] of POSICOES) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(300);
      amostras.push(await page.evaluate(() => {
        const out = {};
        for (const el of document.querySelectorAll('[data-cc-id]')) {
          if (!el.style.transform) continue;
          const cs = getComputedStyle(el);
          out[el.dataset.ccId] = {
            inline: el.style.transform,
            computed: cs.transform,
            anim: cs.animationName,
            tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
              : ''),
          };
        }
        return out;
      }));
    }

    const ids = new Set(amostras.flatMap((a) => Object.keys(a)));
    const mortos = [];
    let vivos = 0;

    for (const id of ids) {
      const vals = amostras.map((a) => a[id]).filter(Boolean);
      if (vals.length < POSICOES.length) continue;
      const inlines = new Set(vals.map((v) => v.inline));
      const computados = new Set(vals.map((v) => v.computed));
      if (inlines.size > 1 && computados.size === 1) {
        mortos.push({ tag: vals[0].tag, anim: vals[0].anim, computed: vals[0].computed });
      } else if (computados.size > 1) {
        vivos += 1;
      }
    }

    console.log(`\n${slug}: ${vivos} elemento(s) com transform vivo, ${mortos.length} morto(s)`);
    for (const m of mortos) {
      const causa = m.anim !== 'none' ? `animation "${m.anim}"` : 'regra !important';
      console.log(`   MORTO  ${m.tag}  — vence: ${causa}  — travado em ${m.computed}`);
    }
  } catch (e) {
    console.log(`\n${slug}: ERRO :: ${String(e).slice(0, 120)}`);
  }

  await ctx.close();
}

await browser.close();
