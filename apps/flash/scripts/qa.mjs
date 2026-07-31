/* ============================================================
   QA automatizado (dev tool) — roda com: node scripts/qa.mjs
   Verifica hero, scrub do story, configurador, tema, FAQ,
   marquee, reduced-motion e overflow em 1280/768/360.
   ============================================================ */

import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:5173/';

const results = [];
let failed = 0;

function check(name, ok, detail = '') {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function run(viewport, fn) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400);
  await fn(page, ctx, errors);
  await ctx.close();
}

/* ---------------- 1280 ---------------- */
await run({ width: 1280, height: 800 }, async (page, ctx, errors) => {
  const v = '1280';

  const base = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const svg = document.querySelector('#hero-hp svg');
    const storyScroll = document.getElementById('story-scroll');
    const track = document.querySelector('#marquee-a .marquee-track');
    return {
      heroEnter: hero.classList.contains('is-enter'),
      svgW: Math.round(svg.getBoundingClientRect().width),
      storyScrollH: Math.round(storyScroll.getBoundingClientRect().height),
      storyPinH: Math.round(document.getElementById('story-pin').getBoundingClientRect().height),
      marqueeAnims: track.getAnimations().length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      fonts: document.fonts.status
    };
  });
  check(`[${v}] hero entra (is-enter)`, base.heroEnter);
  check(`[${v}] svg do fone com largura`, base.svgW > 300, `w=${base.svgW}px`);
  check(`[${v}] story-scroll = 420vh (teto p/ scrub)`, base.storyScrollH >= 3000, `${base.storyScrollH}px`);
  check(`[${v}] pin sticky 100vh`, base.storyPinH === 800, `${base.storyPinH}px`);
  check(`[${v}] marquee animando`, base.marqueeAnims >= 1);
  check(`[${v}] sem overflow horizontal`, base.overflow <= 0, `delta=${base.overflow}`);

  // --- scrub: 3 amostras de progresso ---
  const samples = [];
  for (const p of [0.12, 0.55, 0.95]) {
    await page.evaluate((target) => {
      const scroll = document.getElementById('story-scroll');
      const rect = scroll.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const y = window.scrollY + rect.top + total * target;
      window.scrollTo({ top: y, behavior: 'instant' });
    }, p);
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => {
      const rig = document.querySelector('#story-hp .hp-rig');
      const cupL = document.querySelector('#story-hp .hp-cup-g');
      const texts = [...document.querySelectorAll('.story-text')];
      return {
        rig: rig.style.transform,
        cupL: cupL.style.transform,
        textsVis: texts.map((t) => t.style.visibility),
        rail: document.getElementById('story-rail-fill').style.transform,
        counter: document.getElementById('story-counter-num').textContent
      };
    });
    samples.push({ p, ...s });
  }
  const dist = (t) => {
    const m = t.match(/translate\((-?[\d.]+)px/);
    return m ? Math.abs(parseFloat(m[1])) : 0;
  };
  check(`[${v}] scrub p=0.12: rig rotaciona de entrada`, /rotate\(-\d/.test(samples[0].rig), samples[0].rig);
  check(`[${v}] scrub p=0.55: explosão (cups afastados)`, dist(samples[1].cupL) > 80, `${dist(samples[1].cupL)}px`);
  check(`[${v}] scrub p=0.95: remontado (cups voltam)`, dist(samples[2].cupL) < 12, `${dist(samples[2].cupL)}px`);
  check(`[${v}] textos sincronizados (etapa 3 no p=0.55)`, samples[1].textsVis[2] === 'visible' && samples[1].textsVis[0] === 'hidden', samples[1].textsVis.join('/'));
  check(`[${v}] rail progride`, samples[2].rail !== 'scaleY(0.0000)' && samples[2].rail !== 'scaleY(1.0000)', samples[2].rail);
  check(`[${v}] contador vira 04`, samples[2].counter === '04', samples[2].counter);

  // volta ao topo e testa configurador (scroll instantâneo, sem smooth race)
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(400);

  // swatch → cor muda + acento + preço
  const before = await page.evaluate(() => ({
    colorway: document.querySelector('#config-hp').dataset.colorway,
    accent: document.documentElement.dataset.accent,
    price: document.getElementById('price-num').textContent
  }));
  await page.click('[data-color="solar"]');
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({
    colorway: document.querySelector('#config-hp').dataset.colorway,
    accent: document.documentElement.dataset.accent,
    price: document.getElementById('price-num').textContent,
    cta: document.getElementById('config-cta-label').textContent
  }));
  check(`[${v}] swatch muda colorway`, after.colorway === 'solar' && before.colorway === 'ion', `${before.colorway}→${after.colorway}`);
  check(`[${v}] acento do site segue a cor`, after.accent === 'solar', after.accent);
  const norm = (s) => s.replace(/\s/g, ' ');
  check(`[${v}] preço count-up para R$ 2.699`, norm(after.price) === 'R$ 2.699', after.price);
  check(`[${v}] CTA reflete estado`, after.cta.includes('Solar'), after.cta);

  // modo
  await page.click('[data-mode="silencioso"]');
  await page.waitForTimeout(600);
  const modeAfter = await page.evaluate(() => ({
    mode: document.querySelector('#config-hp').dataset.mode,
    price: document.getElementById('price-num').textContent
  }));
  check(`[${v}] modo muda para silencioso`, modeAfter.mode === 'silencioso', modeAfter.mode);
  check(`[${v}] preço com modo (2.999)`, norm(modeAfter.price) === 'R$ 2.999', modeAfter.price);

  // CTA final compartilha estado
  await page.evaluate(() => document.getElementById('finale').scrollIntoView());
  await page.waitForTimeout(400);
  const finale = await page.evaluate(() => ({
    label: document.getElementById('finale-cta-label').textContent,
    cw: document.querySelector('#finale-hp').dataset.colorway,
    mode: document.querySelector('#finale-hp').dataset.mode
  }));
  check(`[${v}] CTA final usa estado compartilhado`, finale.label.includes('Solar · Silêncio Total') && finale.cw === 'solar' && finale.mode === 'silencioso', finale.label);

  // tema
  const t0 = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('#theme-toggle');
  await page.waitForTimeout(900);
  const t1 = await page.evaluate(() => document.documentElement.dataset.theme);
  check(`[${v}] toggle de tema alterna`, t0 !== t1, `${t0}→${t1}`);
  await page.click('#theme-toggle');
  await page.waitForTimeout(900);
  const t2 = await page.evaluate(() => document.documentElement.dataset.theme);
  check(`[${v}] toggle volta`, t2 === t0, `${t1}→${t2}`);

  // FAQ keyboard + height animada
  await page.evaluate(() => {
    const b = document.getElementById('faq-b3');
    b.focus();
  });
  await page.keyboard.press('ArrowDown'); // b4
  const focus = await page.evaluate(() => document.activeElement?.id);
  check(`[${v}] FAQ setas movem foco`, focus === 'faq-b4', focus);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const faqH = await page.evaluate(() => {
    const panel = document.getElementById('faq-p4');
    return { h: panel.style.height, expanded: document.getElementById('faq-b4').getAttribute('aria-expanded'), scrollH: panel.scrollHeight };
  });
  check(`[${v}] FAQ abre com altura animada`, faqH.expanded === 'true' && (faqH.h === 'auto' || parseInt(faqH.h) > 50), `${faqH.expanded} h=${faqH.h} scrollH=${faqH.scrollH}`);

  // marquee drag (pointer)
  const dragOk = await page.evaluate(() => {
    const track = document.querySelector('#marquee-a .marquee-track');
    const before = track.getAnimations()[0].playState;
    return before;
  });
  check(`[${v}] marquee rodando`, dragOk === 'running', dragOk);

  check(`[${v}] sem erros de console`, errors.length === 0, errors.join(' | '));
});

/* ---------------- 768 ---------------- */
await run({ width: 768, height: 1024 }, async (page, ctx, errors) => {
  const v = '768';
  // rola até o palco do story para medir a posição dos textos
  await page.evaluate(() => {
    document.getElementById('story-pin').scrollIntoView();
  });
  await page.waitForTimeout(400);
  const base = await page.evaluate(() => {
    const texts = document.querySelector('.story-texts');
    const visual = document.querySelector('.story-visual');
    const tr = texts.getBoundingClientRect();
    const vr = visual.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      heroHpW: Math.round(document.querySelector('#hero-hp svg').getBoundingClientRect().width),
      textsTop: Math.round(tr.top),
      visualTop: Math.round(vr.top),
      textsAboveVisual: tr.bottom < vr.top + vr.height * 0.25
    };
  });
  check(`[${v}] sem overflow`, base.overflow <= 0, `delta=${base.overflow}`);
  check(`[${v}] hero ok`, base.heroHpW > 250, `w=${base.heroHpW}`);
  check(`[${v}] texto do story acima do fone`, base.textsAboveVisual, `texts.top=${base.textsTop} visual.top=${base.visualTop}`);
  check(`[${v}] sem erros`, errors.length === 0, errors.join(' | '));
});

/* ---------------- 360 ---------------- */
await run({ width: 360, height: 800 }, async (page, ctx, errors) => {
  const v = '360';
  const base = await page.evaluate(() => {
    const cfg = document.querySelector('.config-grid');
    const cfgCS = getComputedStyle(cfg);
    const feat = document.querySelector('.features-grid');
    const iw = window.innerWidth;
    // caça o elemento que estoura o viewport
    const culprits = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > iw + 1 || r.left < -1;
      })
      .slice(0, 6)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        cls: el.className && el.className.toString().slice(0, 60),
        right: Math.round(el.getBoundingClientRect().right),
        left: Math.round(el.getBoundingClientRect().left)
      }));
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      culprits,
      cfgCols: cfgCS.gridTemplateColumns,
      featCols: getComputedStyle(feat).gridTemplateColumns,
      heroHpW: Math.round(document.querySelector('#hero-hp svg').getBoundingClientRect().width),
      swatchesFit: document.querySelector('.swatches').scrollWidth <= document.querySelector('.swatches').clientWidth + 2,
      finaleHpW: Math.round(document.querySelector('#finale-hp svg').getBoundingClientRect().width)
    };
  });
  check(`[${v}] sem overflow`, base.overflow <= 0, `delta=${base.overflow} culprits=${JSON.stringify(base.culprits)}`);
  check(`[${v}] configurador em 1 coluna`, !base.cfgCols.includes(' '), base.cfgCols);
  check(`[${v}] features em 1 coluna`, !base.featCols.includes(' '), base.featCols);
  check(`[${v}] fone do hero cabe`, base.heroHpW > 250 && base.heroHpW <= 360, `w=${base.heroHpW}`);
  check(`[${v}] swatches não estouram`, base.swatchesFit);
  check(`[${v}] sem erros`, errors.length === 0, errors.join(' | '));
});

/* ---------------- reduced motion ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const rm = await page.evaluate(() => {
    const scroll = document.getElementById('story-scroll');
    const track = document.querySelector('#marquee-a .marquee-track');
    const reveal = document.querySelector('.reveal-up');
    const line = document.querySelector('.hero-line-inner');
    return {
      storyRm: scroll.classList.contains('rm'),
      storyStatic: getComputedStyle(scroll).height !== '420vh',
      marqueeAnims: track.getAnimations().length,
      revealVisible: getComputedStyle(reveal).opacity === '1',
      lineInPlace: getComputedStyle(line).transform === 'matrix(1, 0, 0, 1, 0, 0)' || getComputedStyle(line).transform === 'none',
      textsVisible: [...document.querySelectorAll('.story-text')].every((t) => getComputedStyle(t).opacity === '1')
    };
  });
  check('RM: story colapsado estático', rm.storyRm && rm.storyStatic);
  check('RM: marquee sem loop', rm.marqueeAnims === 0, `${rm.marqueeAnims}`);
  check('RM: reveals visíveis', rm.revealVisible);
  check('RM: linhas do hero no lugar', rm.lineInPlace);
  check('RM: textos do story empilhados visíveis', rm.textsVisible);
  check('RM: sem erros', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
console.log('\n===== RESULTADO =====');
results.forEach((r) => console.log(r));
console.log(`\n${failed === 0 ? '✅ TODOS PASSAM' : `❌ ${failed} falha(s)`}`);
process.exit(failed === 0 ? 0 : 1);
