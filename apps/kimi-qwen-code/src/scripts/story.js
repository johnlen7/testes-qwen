// story.js — scroll-telling com scrubbing real:
// o progresso do scroll (0..1) é mapeado frame a frame para os transforms
// das partes do produto, das ondas de ANC e dos textos das etapas.
import { clamp, seg, easeInOut, reducedMotion, rafLoop } from './motion.js';

const section = document.querySelector('.story');

if (section && !reducedMotion()) {
  const parts = {};
  section.querySelectorAll('.o-part').forEach((el) => {
    parts[el.dataset.part] = el;
  });
  const group = section.querySelector('.o-cup-group');
  const shadow = section.querySelector('.o-shadow');
  const wavesWrap = section.querySelector('.story__waves');
  const waves = section.querySelectorAll('.story__wave');
  const steps = section.querySelectorAll('.story__step');
  const railFill = section.querySelector('.story__rail-fill');

  // janelas de texto de cada etapa dentro do progresso 0..1
  const windows = [
    [0.0, 0.22],
    [0.28, 0.48],
    [0.54, 0.74],
    [0.8, 1.01],
  ];

  let active = false;
  const io = new IntersectionObserver(
    ([entry]) => { active = entry.isIntersecting; },
    { rootMargin: '10% 0px' }
  );
  io.observe(section);

  rafLoop(() => {
    if (!active) return;
    const r = section.getBoundingClientRect();
    const scrollable = r.height - innerHeight;
    const p = clamp(-r.top / scrollable, 0, 1);

    // explode: entra na etapa 2, desfaz na etapa 4
    const ex = easeInOut(seg(p, 0.2, 0.42)) - easeInOut(seg(p, 0.78, 0.96));
    // rotação de remontagem na etapa 4
    const spin = easeInOut(seg(p, 0.78, 1));
    // flutuação sutil contínua
    const float = Math.sin(performance.now() / 900) * 6 * (1 - ex);

    const t = (el, x, y, rot = 0) => {
      if (el) el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    };

    t(parts.band, 0, -118 * ex + float, -8 * ex);
    t(parts.pad, -14 * ex, -176 * ex + float, -10 * ex);
    t(parts.yoke, -52 * ex, -52 * ex + float);
    t(parts.shell, -84 * ex, float);
    t(parts.ring, -150 * ex, float, -24 * ex);
    t(parts.cushion, 84 * ex, float);
    t(parts.driver, 158 * ex, float);

    if (group) {
      group.style.transformOrigin = '248px 322px';
      group.style.transform = `rotate(${(spin * 360).toFixed(2)}deg)`;
    }
    if (shadow) {
      shadow.style.transformOrigin = '252px 448px';
      shadow.style.transform = `scaleX(${1 + ex * 1.6})`;
      shadow.style.opacity = String(0.28 * (1 - ex * 0.5));
    }

    // ondas de ANC na etapa 3
    const wVis = seg(p, 0.5, 0.56) - seg(p, 0.72, 0.78);
    const wProg = seg(p, 0.5, 0.78);
    if (wavesWrap) wavesWrap.style.opacity = String(wVis);
    waves.forEach((w, i) => {
      const ph = (wProg * 2 + i / waves.length) % 1;
      w.style.transform = `scale(${(1 + ph * 2.4).toFixed(3)})`;
      w.style.opacity = (wVis * (1 - ph) * 0.9).toFixed(3);
    });

    // textos sincronizados
    steps.forEach((el, i) => {
      const [a, b] = windows[i];
      const fadeIn = i === 0 ? 1 : seg(p, a - 0.045, a + 0.02);
      const fadeOut = i === steps.length - 1 ? 0 : seg(p, b - 0.02, b + 0.045);
      const op = fadeIn * (1 - fadeOut);
      el.style.opacity = op.toFixed(3);
      el.style.transform = `translateY(${((1 - fadeIn) * 26 + fadeOut * -26).toFixed(1)}px)`;
      el.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
    });

    if (railFill) railFill.style.transform = `scaleY(${p.toFixed(4)})`;
  });
}
