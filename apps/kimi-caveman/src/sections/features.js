import './features.css';
import { reducedMotion, lerp, clamp, createRafLoop } from '../lib/motion.js';
import { observeReveal } from '../lib/reveal.js';

const features = [
  {
    title: 'ANC Espacial adaptativo',
    description: 'Microfones em malha tridimensional mapeiam o ambiente e ajustam o cancelamento em tempo real.',
    spec: '−42 dB · 8 perfis',
    icon: ancIcon,
  },
  {
    title: '60 h de bateria',
    description: 'Uma carga completa alimenta dias inteiros de audição. Recarga rápida: 10 minutos para 5 horas.',
    spec: 'USB-C · quick-charge',
    icon: batteryIcon,
  },
  {
    title: 'Driver de grafeno 42 mm',
    description: 'Diafragma revestido em grafeno responde em microssegundos, com extensão plana até 40 kHz.',
    spec: '20 Hz – 40 kHz',
    icon: driverIcon,
  },
  {
    title: 'Bluetooth 5.4 multiponto',
    description: 'Conecte o notebook e o celular ao mesmo tempo. A troca entre dispositivos é instantânea.',
    spec: '2 dispositivos',
    icon: bluetoothIcon,
  },
  {
    title: 'IPX5 à prova de treino',
    description: 'Resiste a jatos de água e suor intenso. Projetado para acompanhar o ritmo da rua e da academia.',
    spec: 'IPX5 · nano-revestimento',
    icon: ipx5Icon,
  },
  {
    title: 'App com EQ paramétrico',
    description: 'Ajuste cinco bandas paramétricas e salve presets por gênero ou ambiente de escuta.',
    spec: '5 bandas · 8 presets',
    icon: eqIcon,
  },
];

function ancIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" class="feature-icon">
    <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="1" opacity="0.9"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/>
    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.5"/>
    <line x1="6" y1="32" x2="10" y2="32" stroke="currentColor" stroke-width="1"/>
    <line x1="54" y1="32" x2="58" y2="32" stroke="currentColor" stroke-width="1"/>
    <line x1="32" y1="6" x2="32" y2="10" stroke="currentColor" stroke-width="1"/>
    <line x1="32" y1="54" x2="32" y2="58" stroke="currentColor" stroke-width="1"/>
  </svg>`;
}

function batteryIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" class="feature-icon">
    <rect x="12" y="20" width="36" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="48" y="26" width="4" height="12" rx="1.5" fill="currentColor" opacity="0.85"/>
    <rect x="16" y="24" width="28" height="16" rx="1" fill="currentColor" opacity="0.35"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.4" stroke-dasharray="90 45"/>
  </svg>`;
}

function driverIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" class="feature-icon">
    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="1"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="1.25"/>
    <circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M32 12 L32 20 M32 44 L32 52 M12 32 L20 32 M44 32 L52 32" stroke="currentColor" stroke-width="0.75" opacity="0.6"/>
    <path d="M18 18 L24 24 M46 18 L40 24 M18 46 L24 40 M46 46 L40 40" stroke="currentColor" stroke-width="0.75" opacity="0.6"/>
  </svg>`;
}

function bluetoothIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" class="feature-icon">
    <circle cx="20" cy="32" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="44" cy="32" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M25 32 L39 32" stroke="currentColor" stroke-width="1"/>
    <path d="M32 14 L32 20 M32 44 L32 50" stroke="currentColor" stroke-width="1" opacity="0.6"/>
    <path d="M26 16 L22 28 M38 16 L42 28" stroke="currentColor" stroke-width="0.75" opacity="0.5"/>
    <path d="M26 48 L22 36 M38 48 L42 36" stroke="currentColor" stroke-width="0.75" opacity="0.5"/>
  </svg>`;
}

function ipx5Icon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" class="feature-icon">
    <path d="M32 8 C32 8, 16 22, 16 38 C16 49, 23 56, 32 56 C41 56, 48 49, 48 38 C48 22, 32 8, 32 8 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M26 30 L26 38 M32 26 L32 40 M38 30 L38 38" stroke="currentColor" stroke-width="1" opacity="0.7"/>
    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="0.75" opacity="0.35"/>
  </svg>`;
}

function eqIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" class="feature-icon">
    <line x1="4" y1="32" x2="60" y2="32" stroke="currentColor" stroke-width="0.75" opacity="0.3"/>
    <line x1="4" y1="16" x2="60" y2="16" stroke="currentColor" stroke-width="0.75" opacity="0.2"/>
    <line x1="4" y1="48" x2="60" y2="48" stroke="currentColor" stroke-width="0.75" opacity="0.2"/>
    <path d="M6 44 Q16 44, 20 28 T34 20 T58 24" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="20" cy="28" r="2" fill="currentColor"/>
    <circle cx="34" cy="20" r="2" fill="currentColor"/>
    <circle cx="48" cy="22" r="2" fill="currentColor"/>
  </svg>`;
}

function renderFeature(f, index) {
  return `
    <article class="feature-card" data-reveal="${index + 1}">
      <div class="feature-icon-wrap">${f.icon()}</div>
      <h3 class="feature-title">${f.title}</h3>
      <p class="feature-desc">${f.description}</p>
      <span class="feature-spec mono">${f.spec}</span>
    </article>
  `;
}

export function initFeatures(el) {
  if (!el) return;

  el.innerHTML = `
    <div class="features container">
      <header class="features__header" data-reveal="0">
        <span class="features__eyebrow mono">SYS.03 — ENGENHARIA</span>
        <h2 class="features__title">Especificações de precisão</h2>
        <p class="features__sub">Cada componente do ÓRBITA foi calibrado para silêncio, duração e fidelidade.</p>
      </header>
      <div class="features__grid">
        ${features.map((f, i) => renderFeature(f, i)).join('')}
      </div>
    </div>
  `;

  const cards = Array.from(el.querySelectorAll('.feature-card'));
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const enableTilt = finePointer && !reducedMotion();
  const enableGlow = finePointer && !reducedMotion();

  // Cursor-following glow.
  if (enableGlow) {
    cards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${clamp(x, 0, 100)}%`);
        card.style.setProperty('--my', `${clamp(y, 0, 100)}%`);
      });
    });
  }

  // Subtle 3D tilt, lerped.
  if (enableTilt) {
    cards.forEach((card) => {
      card._tilt = { rx: 0, ry: 0, trx: 0, try: 0 };

      const updateTarget = (e) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        card._tilt.trx = clamp(ny * -8, -4, 4);
        card._tilt.try = clamp(nx * 8, -4, 4);
      };

      const resetTarget = () => {
        card._tilt.trx = 0;
        card._tilt.try = 0;
      };

      card.addEventListener('pointermove', updateTarget);
      card.addEventListener('pointerleave', resetTarget);
      card.addEventListener('focusin', () => {
        card._tilt.trx = 0;
        card._tilt.try = 0;
      });
    });

    const loop = createRafLoop(() => {
      let dirty = false;
      cards.forEach((card) => {
        const t = card._tilt;
        const nextRx = lerp(t.rx, t.trx, 0.12);
        const nextRy = lerp(t.ry, t.try, 0.12);
        if (Math.abs(nextRx - t.rx) > 0.001 || Math.abs(nextRy - t.ry) > 0.001) {
          dirty = true;
        }
        t.rx = nextRx;
        t.ry = nextRy;
        card.style.transform = `perspective(800px) rotateX(${nextRx}deg) rotateY(${nextRy}deg)`;
      });
      if (!dirty) return;
    }, { element: el });

    loop.start();
  }

  observeReveal(el);
}
