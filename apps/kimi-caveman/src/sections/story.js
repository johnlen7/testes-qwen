import './story.css';

import { renderProduct } from '../lib/product.js';
import { reducedMotion, lerp, clamp, createRafLoop } from '../lib/motion.js';

export function initStory(el) {
  if (!el) return;
  el.classList.add('story');

  const wantsReduced = reducedMotion();

  el.innerHTML = `
    <div class="story__stage">
      <div class="story__rail" aria-hidden="true">
        <div class="story__rail-track"></div>
        <div class="story__rail-fill"></div>
        <div class="story__rail-ticks">
          <span class="story__tick" data-tick="0"></span>
          <span class="story__tick" data-tick="1"></span>
          <span class="story__tick" data-tick="2"></span>
        </div>
      </div>

      <div class="story__visual" aria-hidden="true">
        <div class="story__rings">
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="story__rings-svg">
            <g class="story__ring story__ring--1">${storyRing(200, 200, 140, 36)}</g>
            <g class="story__ring story__ring--2">${storyRing(200, 200, 170, 48)}</g>
            <g class="story__ring story__ring--3">${storyRing(200, 200, 200, 60)}</g>
          </svg>
        </div>

        <div class="story__product-whole">
          ${renderProduct({ color: 'grafite', size: 'm', id: 'story-whole' })}
          <svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" class="story__waves">
            ${soundWaves()}
          </svg>
        </div>

        <div class="story__product-exploded">
          ${renderProduct({ color: 'grafite', size: 'm', exploded: 1, id: 'story-exploded' })}
        </div>

        <div class="story__measurements">
          <div class="story__measure story__measure--db">
            <span class="story__measure-line" aria-hidden="true"></span>
            <span class="story__value mono">-42</span><span class="story__unit mono">dB</span>
          </div>
          <div class="story__measure story__measure--hz">
            <span class="story__measure-line" aria-hidden="true"></span>
            <span class="story__value mono">20 Hz – 20 kHz</span>
          </div>
          <div class="story__measure story__measure--rate">
            <span class="story__measure-line" aria-hidden="true"></span>
            <span class="story__value mono">500</span><span class="story__unit mono">×/s</span>
          </div>
        </div>

        <div class="story__explode-labels">
          <div class="story__explode-label story__explode-label--driver">
            <span class="story__explode-line" aria-hidden="true"></span>
            <span class="mono">Driver de grafeno</span>
          </div>
          <div class="story__explode-label story__explode-label--mesh">
            <span class="story__explode-line" aria-hidden="true"></span>
            <span class="mono">Malha acústica</span>
          </div>
          <div class="story__explode-label story__explode-label--cushion">
            <span class="story__explode-line" aria-hidden="true"></span>
            <span class="mono">Espuma de memória</span>
          </div>
          <div class="story__explode-label story__explode-label--band">
            <span class="story__explode-line" aria-hidden="true"></span>
            <span class="mono">Arco de titânio</span>
          </div>
        </div>
      </div>

      <div class="story__text">
        <article class="story__panel" data-stage="0">
          <span class="story__label mono">CAPTAR</span>
          <h2 class="story__heading">O som ao redor</h2>
          <p class="story__body">Seis microfones de alta sensibilidade mapeiam o ambiente em tempo real, capturando frequências de 20 Hz a 20 kHz antes que elas cheguem ao ouvido.</p>
        </article>
        <article class="story__panel" data-stage="1">
          <span class="story__label mono">MEDIR</span>
          <h2 class="story__heading">Processamento espacial</h2>
          <p class="story__body">O chipset proprietário analisa 500 amostras por segundo e calcula a assinatura acústica exata de cada ruído, ajustando a resposta em até -42 dB.</p>
        </article>
        <article class="story__panel" data-stage="2">
          <span class="story__label mono">CANCELAR</span>
          <h2 class="story__heading">Ondas anti-ruído</h2>
          <p class="story__body">Drivers de grafeno emitem a onda invertida com precisão milimétrica, neutralizando o som antes que ele se torne percepção.</p>
        </article>
      </div>
    </div>
  `;

  const stage = el.querySelector('.story__stage');

  if (wantsReduced) {
    el.classList.add('story--reduced');
    stage.style.setProperty('--progress', '1');
    return;
  }

  let targetProgress = 0;
  let smoothProgress = 0;

  function computeProgress() {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (rect.height <= windowHeight) return 1;
    return clamp(-rect.top / (rect.height - windowHeight), 0, 1);
  }

  const scrubLoop = createRafLoop(() => {
    targetProgress = computeProgress();
    smoothProgress = lerp(smoothProgress, targetProgress, 0.12);
    if (Math.abs(smoothProgress - targetProgress) < 0.0005) {
      smoothProgress = targetProgress;
    }
    stage.style.setProperty('--progress', smoothProgress.toFixed(5));
  }, { element: el });

  scrubLoop.start();

  // Initial set to avoid blank first frame.
  stage.style.setProperty('--progress', computeProgress().toFixed(5));

  el.addEventListener('story:destroy', () => {
    scrubLoop.destroy();
  });
}

function soundWaves() {
  const arcs = [];
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1;
    const idx = i % 4;
    const cx = side === -1 ? 110 : 290;
    const cy = 236;
    const startR = 56 + idx * 18;
    const endR = startR + 14;
    const sweep = 55;
    const startAngle = -sweep / 2;
    const endAngle = sweep / 2;

    const x1 = cx + side * Math.cos((startAngle * Math.PI) / 180) * startR;
    const y1 = cy + Math.sin((startAngle * Math.PI) / 180) * startR;
    const x2 = cx + side * Math.cos((endAngle * Math.PI) / 180) * startR;
    const y2 = cy + Math.sin((endAngle * Math.PI) / 180) * startR;

    const x3 = cx + side * Math.cos((endAngle * Math.PI) / 180) * endR;
    const y3 = cy + Math.sin((endAngle * Math.PI) / 180) * endR;
    const x4 = cx + side * Math.cos((startAngle * Math.PI) / 180) * endR;
    const y4 = cy + Math.sin((startAngle * Math.PI) / 180) * endR;

    const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${startR} ${startR} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${endR} ${endR} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;

    arcs.push(`<path class="story__wave" d="${d}" style="--i:${idx}" />`);
  }
  return arcs.join('\n');
}

function storyRing(cx, cy, r, count) {
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="1" />`;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const isMajor = i % (count / 6) === 0;
    const r1 = r;
    const r2 = r - (isMajor ? 6 : 3);
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="var(--line)" stroke-width="${isMajor ? 1 : 0.5}" />`;
  }
  return svg;
}
