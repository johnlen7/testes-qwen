import { clamp, lerp, smoothstep, tick } from "../lib/raf";
import { prefersReducedMotion } from "../lib/motion";
import { renderHeadphone, type HeadphoneHandle } from "../components/headphone";

interface PanelRange {
  el: HTMLElement;
  start: number;
  end: number;
}

function bellCurve(p: number): number {
  const up = smoothstep(0.15, 0.45, p);
  const down = 1 - smoothstep(0.55, 0.85, p);
  return Math.min(up, down);
}

export function initStory(): void {
  const headphoneMount = document.getElementById("story-headphone");
  if (!headphoneMount) return;
  const hp: HeadphoneHandle = renderHeadphone(headphoneMount);
  hp.scrubMode(true);

  const track = document.querySelector<HTMLElement>(".story__track");
  if (!track) return;

  const railFill = document.getElementById("story-rail-fill");
  const dots = Array.from(document.querySelectorAll<HTMLElement>(".story__rail-dot"));

  const panels: PanelRange[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(".story__panel[data-range]")) {
    const range = el.dataset.range;
    if (!range) continue;
    const [start, end] = range.split(",").map(Number);
    if (Number.isFinite(start) && Number.isFinite(end)) panels.push({ el, start, end });
  }

  const reduced = prefersReducedMotion();

  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(track);

  let trackTop = 0;
  let trackHeight = 0;

  const measure = (): void => {
    const rect = track.getBoundingClientRect();
    trackTop = rect.top + window.scrollY;
    trackHeight = rect.height;
  };

  measure();
  window.addEventListener("resize", measure, { passive: true });

  let scrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
    },
    { passive: true }
  );

  const publish = (p: number): void => {
    if (!reduced) {
      hp.setExplode(bellCurve(p));
      hp.setField(smoothstep(0.5, 0.7, p) * (1 - smoothstep(0.8, 0.95, p)));
    }

    for (const panel of panels) {
      panel.el.classList.toggle("is-active", p >= panel.start && p <= panel.end);
    }

    if (railFill) railFill.style.setProperty("--rail-p", p.toFixed(4));

    const stage = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
    for (const dot of dots) {
      dot.classList.toggle("is-active", Number(dot.dataset.stage) === stage);
    }
  };

  let smoothed = 0;

  tick(() => {
    if (!visible) return;

    const max = Math.max(1, trackHeight - window.innerHeight);
    const raw = clamp((scrollY - trackTop) / max, 0, 1);
    const p = reduced ? raw : (smoothed = lerp(smoothed, raw, 0.12));

    publish(p);
  });
}
