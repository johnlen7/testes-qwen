import './features.css';
import { createIcon, type IconName } from '../svg/icons';
import { onEnterView } from '../lib/scroll-progress';
import { onFrame } from '../lib/raf-loop';
import { smoothDamp, clamp } from '../lib/lerp';
import { easingCSS } from '../lib/easing';
import { reducedMotion } from '../lib/reduced-motion';

interface FeatureCard {
  icon: IconName;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: 'orbit',
    title: 'Cancelamento adaptativo espacial',
    description: 'ANC que mapeia o ambiente em tempo real e reage a cada mudança de ruído ao seu redor.',
  },
  {
    icon: 'wave',
    title: 'Áudio de campo amplo',
    description: 'Soundstage espacial que posiciona cada instrumento no espaço — muito além do estéreo comum.',
  },
  {
    icon: 'feather',
    title: '42g por concha',
    description: 'Leveza projetada para sessões longas, sem fadiga na orelha ou na nuca.',
  },
  {
    icon: 'battery',
    title: '38h de bateria',
    description: 'Autonomia total com o case incluso — uma semana inteira sem procurar tomada.',
  },
  {
    icon: 'drop',
    title: 'Resistência IPX4',
    description: 'Preparado para suor de treino e chuva leve, sem comprometer a qualidade do som.',
  },
  {
    icon: 'touch',
    title: 'Controle por toque',
    description: 'Gestos precisos na concha para pausar, pular faixas e ajustar volume sem tirar o fone.',
  },
];

const TILT_MAX_DEG = 10;
const TILT_FACTOR = 14;
const ENTRANCE_DURATION = 640;
const ENTRANCE_STAGGER_MS = 70;

export function mount(container: HTMLElement): void {
  const section = document.createElement('section');
  section.id = 'features';

  const inner = document.createElement('div');
  inner.className = 'container features__container';

  const header = document.createElement('div');
  header.className = 'features__header';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'Engenharia';

  const heading = document.createElement('h2');
  heading.className = 'features__title';
  heading.textContent = 'Feito para desaparecer no seu dia';

  const lede = document.createElement('p');
  lede.className = 'features__lede';
  lede.textContent =
    'Seis decisões de engenharia que colocam o ÓRBITA à frente — sentidas antes de serem notadas.';

  header.append(eyebrow, heading, lede);

  const list = document.createElement('ul');
  list.className = 'features__grid';
  list.setAttribute('aria-label', 'Recursos do ÓRBITA');

  FEATURES.forEach((feature) => {
    list.appendChild(buildCard(feature));
  });

  inner.append(header, list);
  section.appendChild(inner);
  container.appendChild(section);

  setupStagger(list);
}

function buildCard(feature: FeatureCard): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'features__item';

  const card = document.createElement('article');
  card.className = 'feature-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-label', feature.title);

  const iconWrap = document.createElement('div');
  iconWrap.className = 'feature-card__icon';
  iconWrap.appendChild(createIcon(feature.icon));

  const title = document.createElement('h3');
  title.className = 'feature-card__title';
  title.textContent = feature.title;

  const desc = document.createElement('p');
  desc.className = 'feature-card__desc';
  desc.textContent = feature.description;

  card.append(iconWrap, title, desc);
  item.appendChild(card);

  setupTilt(card);

  return item;
}

/** Tilt 3D leve seguindo o ponteiro — só transform/opacity/filter, e só fora de reduced motion. */
function setupTilt(card: HTMLElement): void {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let hovering = false;
  let stopFrame: (() => void) | null = null;

  function applyTilt(x: number, y: number) {
    card.style.setProperty('--tilt-x', `${x.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${y.toFixed(2)}deg`);
  }

  function ensureLoop() {
    if (stopFrame) return;
    stopFrame = onFrame((_time, delta) => {
      const dt = delta || 16;
      currentX = smoothDamp(currentX, targetX, TILT_FACTOR, dt);
      currentY = smoothDamp(currentY, targetY, TILT_FACTOR, dt);
      applyTilt(currentX, currentY);

      const settled = !hovering && Math.abs(currentX) < 0.03 && Math.abs(currentY) < 0.03;
      if (settled) {
        currentX = 0;
        currentY = 0;
        applyTilt(0, 0);
        stopFrame?.();
        stopFrame = null;
      }
    });
  }

  function onPointerMove(event: PointerEvent) {
    if (reducedMotion.get()) return;
    hovering = true;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    targetX = clamp((0.5 - py) * TILT_MAX_DEG * 2, -TILT_MAX_DEG, TILT_MAX_DEG);
    targetY = clamp((px - 0.5) * TILT_MAX_DEG * 2, -TILT_MAX_DEG, TILT_MAX_DEG);
    ensureLoop();
  }

  function release() {
    if (!hovering) return;
    hovering = false;
    targetX = 0;
    targetY = 0;
    ensureLoop();
  }

  card.addEventListener('pointermove', onPointerMove);
  card.addEventListener('pointerleave', release);
  card.addEventListener('pointercancel', release);
}

/** Stagger de entrada via WAAPI, disparado uma única vez ao entrar na viewport. */
function setupStagger(list: HTMLElement): void {
  const items = Array.from(list.querySelectorAll<HTMLElement>('.features__item'));

  if (reducedMotion.get()) {
    return;
  }

  items.forEach((item) => {
    item.style.opacity = '0';
  });

  const stop = onEnterView(
    list,
    () => {
      items.forEach((item, index) => {
        item.animate(
          [
            { opacity: 0, transform: 'translateY(28px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: ENTRANCE_DURATION,
            delay: index * ENTRANCE_STAGGER_MS,
            easing: easingCSS.outExpo,
            fill: 'forwards',
          }
        );
      });
      stop();
    },
    { threshold: 0.15 }
  );
}
