import './testimonials.css';
import { onFrame } from '../lib/raf-loop';
import { createDraggable, type DragState } from '../lib/drag';
import { reducedMotion } from '../lib/reduced-motion';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Marina Vasconcelos',
    role: 'Produtora musical',
    quote:
      'Uso o ÓRBITA em masterizações de madrugada. O cancelamento adaptativo desliga o mundo sem lavar os graves — é a primeira vez que confio meus ouvidos num fone sem fio.',
  },
  {
    name: 'Théo Bittencourt',
    role: 'Piloto de linha aérea',
    quote:
      'Onze horas de voo, zero fadiga auricular. O ajuste espacial percebe a cabine e recalibra sozinho antes de eu notar o ronco da turbina.',
  },
  {
    name: 'Ingrid Kessler',
    role: 'Arquiteta',
    quote:
      'Comprei pelo desenho, fiquei pelo silêncio. É o único objeto na minha mesa desenhado por alguém que odeia ruído visual tanto quanto eu odeio ruído sonoro.',
  },
  {
    name: 'Rafael Andreoli',
    role: 'Maratonista amador',
    quote:
      'Chove, treino ao ar livre, o encaixe do modo adaptativo nunca falha. Depois de três fones perdidos pro suor, esse ainda parece novo.',
  },
  {
    name: 'Camila Duprat',
    role: 'Diretora de fotografia',
    quote:
      'Reviso trilha sonora com o ÓRBITA há oito meses. A resposta em graves é honesta o bastante pra eu fechar uma mixagem sem voltar ao estúdio.',
  },
  {
    name: 'Hugo Tanaka',
    role: 'Investidor',
    quote:
      'Testei os concorrentes premium todos. Nenhum resolveu o vento numa varanda de trigésimo andar como o ÓRBITA resolveu.',
  },
  {
    name: 'Sofia Meireles',
    role: 'Tradutora simultânea',
    quote:
      'Seis horas de cabine, sem fio, sem fadiga. O sinal ciano no case virou o jeito mais rápido de saber a carga antes de entrar numa sessão.',
  },
  {
    name: 'Bruno Salgado',
    role: 'Baterista',
    quote:
      'Não é fone pra ouvir bateria — é fone pra sentir. A latência é baixa o bastante pra eu tocar junto sem atraso perceptível.',
  },
];

const AUTO_SPEED_PX_MS = 0.032;
const FRICTION = 0.95;
const VELOCITY_EPSILON = 0.02;

function renderCard(testimonial: Testimonial, hidden: boolean): string {
  return `
    <li class="testimonial-card"${hidden ? ' aria-hidden="true"' : ''}>
      <blockquote class="testimonial-card__quote">
        <p>${testimonial.quote}</p>
      </blockquote>
      <p class="testimonial-card__author">
        <span class="testimonial-card__name">${testimonial.name}</span>
        <span class="testimonial-card__role">${testimonial.role}</span>
      </p>
    </li>
  `;
}

export function mount(container: HTMLElement): void {
  const section = document.createElement('section');
  section.id = 'depoimentos';
  section.className = 'testimonials';

  section.innerHTML = `
    <div class="container testimonials__intro">
      <span class="eyebrow">Depoimentos</span>
      <h2 class="testimonials__title">Confiança testada em uso real</h2>
      <p class="testimonials__lead">
        Pessoas que dependem de silêncio preciso — em estúdio, em cabine, em plena rua — usam o
        ÓRBITA todos os dias.
      </p>
    </div>
    <div
      class="testimonials__viewport"
      aria-label="depoimentos, arraste para navegar"
      tabindex="0"
    >
      <ul class="testimonials__track"></ul>
    </div>
  `;

  const viewport = section.querySelector<HTMLDivElement>('.testimonials__viewport');
  const track = section.querySelector<HTMLUListElement>('.testimonials__track');
  if (!viewport || !track) return;

  track.innerHTML =
    TESTIMONIALS.map((t) => renderCard(t, false)).join('') +
    TESTIMONIALS.map((t) => renderCard(t, true)).join('');

  const realFirst = track.children[0] as HTMLLIElement | undefined;
  const duplicateFirst = track.children[TESTIMONIALS.length] as HTMLLIElement | undefined;

  // offset: deslocamento acumulado em px (a trilha aplica translateX(-offset)).
  let offset = 0;
  // largura de "uma cópia" da trilha — o ponto onde o wrap acontece sem salto visível.
  let loopWidth = 0;
  let isPaused = false;
  let isDragging = false;
  let dragBaseOffset = 0;
  let flingVelocity = 0;

  function wrap(value: number): number {
    if (loopWidth <= 0) return value;
    return ((value % loopWidth) + loopWidth) % loopWidth;
  }

  function setOffset(next: number): void {
    offset = wrap(next);
    track!.style.transform = `translateX(${-offset}px)`;
  }

  function recomputeLoopWidth(): void {
    if (!realFirst || !duplicateFirst) return;
    loopWidth = duplicateFirst.offsetLeft - realFirst.offsetLeft;
    setOffset(offset);
  }

  const resizeObserver = new ResizeObserver(() => recomputeLoopWidth());
  resizeObserver.observe(track);

  function handlePause(): void {
    isPaused = true;
  }
  function handleResume(): void {
    isPaused = false;
  }

  viewport.addEventListener('pointerenter', handlePause);
  viewport.addEventListener('pointerleave', handleResume);
  viewport.addEventListener('focusin', handlePause);
  viewport.addEventListener('focusout', handleResume);

  function onDragStart(): void {
    isDragging = true;
    flingVelocity = 0;
    dragBaseOffset = offset;
  }

  function onDragMove(state: DragState): void {
    setOffset(dragBaseOffset - state.deltaX);
  }

  function onDragEnd(state: DragState): void {
    isDragging = false;
    flingVelocity = -state.velocityX;
  }

  let destroyDrag: (() => void) | null = null;

  function enableInteractive(): void {
    if (destroyDrag) return;
    destroyDrag = createDraggable({
      element: viewport!,
      onDragStart,
      onDragMove,
      onDragEnd,
    });
  }

  function disableInteractive(): void {
    destroyDrag?.();
    destroyDrag = null;
    isDragging = false;
    flingVelocity = 0;
  }

  const unsubscribeReducedMotion = reducedMotion.subscribe((isReduced) => {
    section.classList.toggle('is-static', isReduced);
    if (isReduced) {
      disableInteractive();
      setOffset(0);
    } else {
      enableInteractive();
    }
  });

  const stopFrame = onFrame((_time, delta) => {
    if (reducedMotion.get() || isDragging || isPaused) return;

    if (Math.abs(flingVelocity) > VELOCITY_EPSILON) {
      // inércia do arraste: decai gradualmente até virar avanço automático constante.
      setOffset(offset + flingVelocity);
      flingVelocity *= FRICTION;
    } else {
      flingVelocity = 0;
      setOffset(offset + AUTO_SPEED_PX_MS * delta);
    }
  });

  // Guarda os unsubscribers no elemento para eventual limpeza futura (a página não desmonta seções hoje).
  (section as unknown as { __cleanup?: () => void }).__cleanup = () => {
    resizeObserver.disconnect();
    unsubscribeReducedMotion();
    stopFrame();
    disableInteractive();
  };

  container.appendChild(section);
}
