/**
 * Scroll-telling · scrubbing real.
 * O progresso do scroll (0..1) dirige a transformação do produto em 3 etapas:
 *   0.00–0.33  casco intacto
 *   0.33–0.66  explode em camadas (conchas afastam, arco sobe)
 *   0.66–1.00  revela os drivers (coração espacial)
 * A altura do .scrolltell-driver (320vh, no CSS) é o curso da animação.
 */

import { clamp, lerp, mapRange, rafLoop, prefersReducedMotion } from "../lib/motion";

export function initScrolltell(): void {
  const driver = document.querySelector<HTMLElement>(".scrolltell-driver");
  const product = document.querySelector<HTMLElement>(".scrolltell-product");
  if (!driver || !product) return;

  const band = product.querySelector<SVGGElement>(".hp-band");
  const asmL = product.querySelector<SVGGElement>(".hp-asm-l");
  const asmR = product.querySelector<SVGGElement>(".hp-asm-r");
  const drivers = product.querySelectorAll<SVGGElement>(".hp-driver");
  const cushions = product.querySelectorAll<SVGGElement>(".hp-cushion");
  const orbits = product.querySelector<SVGGElement>(".hp-orbits");
  const steps = Array.from(
    document.querySelectorAll<HTMLElement>(".scrolltell-step")
  );
  const fill = document.querySelector<HTMLElement>(".scrolltell-progress-fill");

  // Sem JS de animação (reduced motion): mostra tudo estático no estado final.
  if (prefersReducedMotion()) {
    steps.forEach((s) => {
      s.style.opacity = "1";
      s.style.transform = "none";
      s.style.position = "relative";
    });
    return;
  }

  let target = 0;
  let p = 0;

  const readProgress = (): number => {
    const rect = driver.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0; // proteção: sem curso, sem scrub
    return clamp(-rect.top / total);
  };

  const applyStep = (el: HTMLElement, opacity: number) => {
    el.style.opacity = opacity.toFixed(3);
    el.style.transform = `translateY(${((1 - opacity) * 24).toFixed(1)}px)`;
  };

  rafLoop((dt) => {
    const rect = driver.getBoundingClientRect();
    // só trabalha enquanto a seção está perto da viewport
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

    target = readProgress();
    p = lerp(p, target, 1 - Math.pow(0.8, dt));

    // ---- produto ----
    const explode = mapRange(p, 0.22, 0.6, 0, 1);
    if (band) band.style.transform = `translateY(${(-78 * explode).toFixed(1)}px)`;
    if (asmL)
      asmL.style.transform = `translate(${(-64 * explode).toFixed(1)}px, ${(18 * explode).toFixed(1)}px)`;
    if (asmR)
      asmR.style.transform = `translate(${(64 * explode).toFixed(1)}px, ${(18 * explode).toFixed(1)}px)`;

    const reveal = mapRange(p, 0.6, 0.86, 0, 1);
    const cushionOpacity = 1 - mapRange(p, 0.55, 0.82, 0, 0.85);
    drivers.forEach((d) => {
      d.style.opacity = reveal.toFixed(3);
      d.style.transform = `scale(${(0.6 + 0.4 * reveal).toFixed(3)})`;
    });
    cushions.forEach((c) => {
      c.style.opacity = cushionOpacity.toFixed(3);
    });
    if (orbits) orbits.style.opacity = (1 - explode * 0.7).toFixed(3);

    // ---- textos (crossfade por trecho) ----
    if (steps[0]) applyStep(steps[0], 1 - mapRange(p, 0.2, 0.34, 0, 1));
    if (steps[1])
      applyStep(
        steps[1],
        mapRange(p, 0.28, 0.42, 0, 1) * (1 - mapRange(p, 0.56, 0.7, 0, 1))
      );
    if (steps[2]) applyStep(steps[2], mapRange(p, 0.62, 0.76, 0, 1));

    if (fill) fill.style.transform = `scaleY(${p.toFixed(3)})`;
  });
}
