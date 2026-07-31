import { lerp, tick } from "../lib/raf";
import { prefersReducedMotion } from "../lib/motion";
import { createOrbitField } from "../components/orbit-canvas";
import { renderHeadphone, type HeadphoneHandle } from "../components/headphone";

const MOBILE_BREAKPOINT = 768;

export function initHero(): void {
  const headphoneMount = document.getElementById("hero-headphone");
  if (!headphoneMount) return;
  const hp: HeadphoneHandle = renderHeadphone(headphoneMount);

  const canvas = document.getElementById("hero-canvas");
  if (canvas instanceof HTMLCanvasElement) {
    const center: [number, number] =
      window.innerWidth < MOBILE_BREAKPOINT ? [0.5, 0.35] : [0.72, 0.45];
    createOrbitField(canvas, { center, interactive: true });
  }

  const hero = document.querySelector<HTMLElement>(".hero");
  if (!hero || prefersReducedMotion()) return;

  // desktop: ponteiro fino, sem touch
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!finePointer.matches) return;

  const stage = hero.querySelector<HTMLElement>(".hero__stage");
  const rings = hero.querySelector<HTMLElement>(".hero__rings");
  const chips = hero.querySelector<HTMLElement>(".hero__chips");
  if (!stage || !rings || !chips) return;

  for (const el of [stage, rings, chips]) el.style.willChange = "transform";

  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;

  hero.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  tick(() => {
    curX = lerp(curX, targetX, 0.06);
    curY = lerp(curY, targetY, 0.06);

    stage.style.transform = `translate(${curX * 12}px, ${curY * 8}px)`;
    rings.style.transform = `translate(${curX * -8}px, ${curY * -6}px)`;
    chips.style.transform = `translate(${curX * 20}px, ${curY * 14}px)`;
    hp.setTilt(curY * -4, curX * 6);
  });
}
