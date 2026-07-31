/* ============================================================
   story — scroll-telling com scrubbing real
   4 etapas mapeadas ao progresso do scroll (p ∈ [0,1]):
   percepção → chip → matéria (explosão) → sintonia (remontagem).
   ============================================================ */

import { addFrame, RM, clamp, seq, windowFade, smoothstep, easeOutQuart } from './motion';
import { getState } from './store';
import type { HPInstance } from './headphone';

const STAGE_START = [0, 0.22, 0.5, 0.78, 1];
const CUP_ORIGIN_L = '246px 486px';
const CUP_ORIGIN_R = '554px 486px';

export function initStory(hp: HPInstance) {
  const scroll = document.getElementById('story-scroll')!;
  const pin = document.getElementById('story-pin')!;
  const texts = [...document.querySelectorAll<HTMLElement>('.story-text')];
  const callouts = [...document.querySelectorAll<HTMLElement>('.callout')];
  const railFill = document.getElementById('story-rail-fill')!;
  const dots = [...document.querySelectorAll<HTMLElement>('.story-dot')];
  const counter = document.getElementById('story-counter-num')!;
  const rings = pin.querySelector<HTMLElement>('.story-rings');

  // ---------- Reduced motion: palco estático + textos empilhados ----------
  if (RM) {
    scroll.classList.add('rm');
    hp.setColorway(getState().colorway, false);
    return;
  }

  // estados persistentes (evita re-aplicar a cada frame)
  let lastStage = -1;
  let revealed = false;
  let tuned = false;

  // callout: ordem de entrada na etapa 3
  const calloutAlpha = (i: number, p: number) =>
    Math.min(
      windowFade(p, 0.5 + i * 0.022, 0.72, 0.05),
      1 - windowFade(p, 0.7, 0.78, 0.04)
    );

  const scrub = (p: number) => {
    // ---------- rig: rotação + escala de entrada ----------
    const rot = seq(p, [[0, -14], [0.22, 0]]);
    const scl = seq(p, [[0, 0.9], [0.22, 1]]);
    hp.rig.style.transform = `rotate(${rot}deg) scale(${scl})`;

    // ---------- band: levanta e volta ----------
    const by = seq(p, [
      [0, 0],
      [0.22, 0],
      [0.5, -34],
      [0.78, -110, easeOutQuart],
      [1, 0, easeOutQuart]
    ]);
    hp.band.style.transform = `translateY(${by.toFixed(1)}px)`;

    // ---------- cups: giram, explodem, remontam ----------
    const lx = seq(p, [
      [0, 0],
      [0.22, 0],
      [0.5, -20],
      [0.78, -150, easeOutQuart],
      [1, 0, easeOutQuart]
    ]);
    const ly = seq(p, [
      [0, 0],
      [0.22, 0],
      [0.5, 8],
      [0.78, 28, easeOutQuart],
      [1, 0, easeOutQuart]
    ]);
    const la = seq(p, [
      [0, 0],
      [0.22, -3],
      [0.5, -8],
      [0.78, -14, easeOutQuart],
      [1, 0, easeOutQuart]
    ]);
    const rx = -lx;
    const ra = -la;

    hp.cupL.style.transformOrigin = CUP_ORIGIN_L;
    hp.cupR.style.transformOrigin = CUP_ORIGIN_R;
    hp.cupL.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) rotate(${la.toFixed(2)}deg)`;
    hp.cupR.style.transform = `translate(${rx.toFixed(1)}px, ${ly.toFixed(1)}px) rotate(${ra.toFixed(2)}deg)`;

    // ---------- anéis de fundo: respiram com o progresso ----------
    if (rings) {
      const rs = seq(p, [[0, 1], [0.5, 1.06], [0.78, 1.03], [1, 1]]);
      rings.style.transform = `scale(${rs.toFixed(3)})`;
    }

    // ---------- textos sincronizados ----------
    const textWindows: Array<[number, number]> = [
      [-0.02, 0.22],
      [0.22, 0.5],
      [0.5, 0.78],
      [0.78, 1.02]
    ];
    texts.forEach((t, i) => {
      const [a, b] = textWindows[i];
      const alpha = Math.min(
        clamp((p - a) / 0.07, 0, 1),
        clamp((b - p) / 0.06, 0, 1)
      );
      t.style.opacity = String(alpha);
      t.style.transform = `translateY(${(1 - alpha) * 14}px)`;
      t.style.visibility = alpha > 0.01 ? 'visible' : 'hidden';
    });

    // ---------- callouts da explosão ----------
    callouts.forEach((c, i) => {
      const a = calloutAlpha(i, p);
      c.classList.toggle('is-on', a > 0.5);
    });

    // ---------- rail + contador ----------
    railFill.style.transform = `scaleY(${smoothstep(p).toFixed(4)})`;
    dots.forEach((d, i) => {
      const on = p >= STAGE_START[i] - 0.02;
      d.classList.toggle('is-on', on);
    });
    const stage = p < 0.22 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3;
    if (stage !== lastStage) {
      lastStage = stage;
      counter.textContent = `0${stage + 1}`;
    }

    // ---------- etapa 4: revela a cor do configurador + glow ----------
    if (p >= 0.76 && !revealed) {
      revealed = true;
      hp.setColorway(getState().colorway, true);
    }
    const wantTuned = p >= 0.76;
    if (wantTuned !== tuned) {
      tuned = wantTuned;
      hp.setTuned(tuned);
    }
  };

  // ---------- driver de scroll ----------
  let dirty = false;
  const onScroll = () => {
    dirty = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const compute = () => {
    const rect = scroll.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height - vh;
    const p = clamp(-rect.top / Math.max(total, 1), 0, 1);
    scrub(p);
  };

  addFrame(() => {
    if (dirty) {
      dirty = false;
      compute();
    }
  });

  // estado inicial
  compute();
  window.addEventListener('resize', onScroll);
}
