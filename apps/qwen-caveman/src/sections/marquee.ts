/**
 * Depoimentos · marquee autoral.
 * Loop infinito dirigido por rAF (conteúdo clonado => -50% é invisível).
 * Pausa em hover/focus e suporta arrastar com Pointer Events + inércia.
 */

import { prefersReducedMotion, rafLoop } from "../lib/motion";

interface Voice {
  quote: string;
  name: string;
  role: string;
}

const VOICES: Voice[] = [
  {
    quote:
      "Coloquei no avião e esqueci que existia turbina. É literalmente outro nível de silêncio.",
    name: "Marina Alves",
    role: "Pilota comercial",
  },
  {
    quote:
      "Mixei um EP inteiro no modo Estúdio. A resposta é honesta do grave ao agudo.",
    name: "Rafael Nunes",
    role: "Produtor musical",
  },
  {
    quote:
      "Uso 10 horas por dia e esqueço que está na cabeça. A suspensão magnética é real.",
    name: "Camila Rocha",
    role: "Dev remota",
  },
  {
    quote:
      "O rastreio espacial em filmes é absurdo. O som fica parado no espaço mesmo quando eu viro.",
    name: "João Pereira",
    role: "Crítico de cinema",
  },
  {
    quote:
      "A bateria dura a semana inteira de home office. Carrego uma vez, esqueço o cabo.",
    name: "Beatriz Lima",
    role: "Designer",
  },
  {
    quote:
      "Comprei pelo design e fiquei pelo ANC. O acabamento Solar é ainda mais bonito ao vivo.",
    name: "André Souza",
    role: "Fotógrafo",
  },
];

const initials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

function cardHTML(v: Voice): string {
  return `
  <article class="voice-card">
    <span class="voice-stars" aria-label="5 de 5 estrelas">★★★★★</span>
    <p class="voice-quote">“${v.quote}”</p>
    <footer class="voice-author">
      <span class="voice-avatar" aria-hidden="true">${initials(v.name)}</span>
      <span>
        <span class="voice-name">${v.name}</span><br />
        <span class="voice-role">${v.role}</span>
      </span>
    </footer>
  </article>`;
}

export function initMarquee(): void {
  const wrap = document.querySelector<HTMLElement>("[data-marquee]");
  const track = document.querySelector<HTMLElement>("[data-marquee-track]");
  if (!wrap || !track) return;

  const oneSet = VOICES.map(cardHTML).join("");
  track.innerHTML = oneSet + oneSet; // clona para loop sem salto

  let halfWidth = 0;
  const measure = () => {
    // período real = distância entre o 1º card do set 1 e o 1º do set 2
    // (inclui o gap da emenda; scrollWidth/2 erraria por meio gap)
    const first = track.children[0] as HTMLElement | undefined;
    const mid = track.children[VOICES.length] as HTMLElement | undefined;
    halfWidth =
      first && mid ? mid.offsetLeft - first.offsetLeft : track.scrollWidth / 2;
  };
  measure();
  window.addEventListener("resize", measure);

  let offset = 0;
  let velocity = 0;
  let hovering = false;
  let dragging = false;
  let lastX = 0;
  let dragDelta = 0;

  const speed = prefersReducedMotion() ? 0 : 0.55; // px por frame

  wrap.addEventListener("pointerenter", () => (hovering = true));
  wrap.addEventListener("pointerleave", () => (hovering = false));
  wrap.addEventListener("focusin", () => (hovering = true));
  wrap.addEventListener("focusout", () => (hovering = false));

  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    dragDelta = 0;
    velocity = 0;
    wrap.classList.add("is-dragging");
    wrap.setPointerCapture(e.pointerId);
  });

  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dragDelta = e.clientX - lastX;
    lastX = e.clientX;
    velocity = dragDelta; // guarda para inércia
    offset += dragDelta;
  });

  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove("is-dragging");
    try {
      wrap.releasePointerCapture(e.pointerId);
    } catch {
      /* ponteiro já liberado */
    }
  };
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);

  rafLoop((dt) => {
    if (halfWidth <= 0) measure();

    if (!dragging) {
      // inércia decai
      if (Math.abs(velocity) > 0.05) {
        offset += velocity * dt;
        velocity *= Math.pow(0.94, dt);
      } else if (!hovering) {
        offset -= speed * dt;
      }
    }

    // wrap contínuo (while cobre arrastos/voos maiores que um período)
    if (halfWidth > 0) {
      while (offset <= -halfWidth) offset += halfWidth;
      while (offset > 0) offset -= halfWidth;
    }

    track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
  });
}
