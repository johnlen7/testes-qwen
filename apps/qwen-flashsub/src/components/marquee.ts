import { tick, lerp } from "../lib/raf";
import { prefersReducedMotion } from "../lib/motion";

export interface Marquee {
  destroy(): void;
}

const BASE_SPEED = 60; // px/s
const HOVER_FACTOR = 0.08; // lerp da velocidade no hover (e na saída)

export function createMarquee(viewport: HTMLElement): Marquee {
  const track = viewport.querySelector<HTMLElement>(".voices__track");
  if (!track || track.children.length === 0) return { destroy() {} };

  // reduced motion: sem clone, sem animação — scroll nativo
  if (prefersReducedMotion()) {
    viewport.style.overflowX = "auto";
    return {
      destroy() {
        viewport.style.overflowX = "";
      },
    };
  }

  // gestos horizontais são do marquee; o scroll vertical fica com a página
  viewport.style.touchAction = "pan-y";

  const originals = Array.from(track.children) as HTMLElement[];
  const clones = originals.map((el) => {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });
  for (const clone of clones) track.appendChild(clone);

  let x = 0; // deslocamento do track (px); positivo = conteúdo anda para a esquerda
  let velocity = BASE_SPEED;
  let half = 0; // período do loop: largura do conjunto original
  let hovered = false;
  let dragging = false;
  let visible = true;

  let dragStartX = 0; // x no pointerdown
  let dragStartClientX = 0;
  let dragStartTime = 0;

  function measure() {
    if (!track) return;
    const a = originals[0].getBoundingClientRect();
    const b = clones[0].getBoundingClientRect();
    const period = b.left - a.left;
    half = period > 0 ? period : track.scrollWidth / 2;
  }
  measure();
  // re-mede depois que as fontes carregarem (evita emenda visível)
  if (document.fonts?.ready) document.fonts.ready.then(measure);
  window.addEventListener("resize", measure, { passive: true });

  const cancelTick = tick((dt) => {
    if (!visible || document.hidden || half <= 0) return;
    if (!dragging) {
      const target = hovered ? 0 : BASE_SPEED;
      velocity = lerp(velocity, target, HOVER_FACTOR);
      x += velocity * dt;
    }
    if (x >= half) x -= half;
    else if (x < 0) x += half;
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
  });

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(e.pointerId);
    dragStartX = x;
    dragStartClientX = e.clientX;
    dragStartTime = performance.now();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    // segue o ponteiro direto, sem velocidade
    x = dragStartX - (e.clientX - dragStartClientX);
  };

  function endDrag(e: PointerEvent, keepInertia: boolean) {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    if (keepInertia) {
      const dt = (performance.now() - dragStartTime) / 1000;
      if (dt > 0) velocity = -(e.clientX - dragStartClientX) / dt;
    }
  }

  const onPointerUp = (e: PointerEvent) => endDrag(e, true);
  const onPointerCancel = (e: PointerEvent) => endDrag(e, false);

  const onEnter = () => {
    hovered = true;
  };
  const onLeave = () => {
    hovered = false;
  };

  viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
  viewport.addEventListener("pointermove", onPointerMove, { passive: true });
  viewport.addEventListener("pointerup", onPointerUp, { passive: true });
  viewport.addEventListener("pointercancel", onPointerCancel, { passive: true });
  viewport.addEventListener("mouseenter", onEnter, { passive: true });
  viewport.addEventListener("mouseleave", onLeave, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    },
    { threshold: 0 }
  );
  io.observe(viewport);

  return {
    destroy() {
      cancelTick();
      io.disconnect();
      window.removeEventListener("resize", measure);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerCancel);
      viewport.removeEventListener("mouseenter", onEnter);
      viewport.removeEventListener("mouseleave", onLeave);
      viewport.style.touchAction = "";
      for (const clone of clones) clone.remove();
      track.style.transform = "";
    },
  };
}
