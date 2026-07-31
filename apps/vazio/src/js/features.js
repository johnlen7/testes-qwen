/* ============================================================
   ÓRBITA · features (#recursos)
   Entrada em stagger via IntersectionObserver + WAAPI
   (fade + translateY, ease-out-expo). Micro-interação de
   hover/focus: tilt 3D leve + glow radial hélio seguindo o
   cursor (CSS vars --mx/--my/--rx/--ry, só transform/opacity).
   Tilt só em pointer:fine; touch mantém glow no :active.
   ============================================================ */

import { prefersReducedMotion, hasFinePointer } from './motion.js';

export function initFeatures() {
  const grid = document.getElementById('features-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.feature-card'));
  const reduced = prefersReducedMotion();

  // Esconde os cards só quando o JS está pronto para animá-los
  grid.classList.add('features-armed');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const i = cards.indexOf(el);

        const anim = reduced
          ? el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 300,
              easing: 'ease',
              fill: 'backwards'
            })
          : el.animate(
              [
                { opacity: 0, transform: 'translateY(26px)' },
                { opacity: 1, transform: 'translateY(0px)' }
              ],
              {
                duration: 600,
                delay: i * 90,
                easing: 'cubic-bezier(.16,1,.3,1)',
                fill: 'backwards'
              }
            );

        // Ao terminar, o estado final volta ao CSS (libera o tilt)
        anim.onfinish = () => {
          el.classList.add('is-in');
          anim.cancel();
        };
      });
    },
    { threshold: 0.2 }
  );

  cards.forEach((card) => io.observe(card));

  // Tilt + glow: só pointer fino e sem reduced-motion
  if (reduced || !hasFinePointer()) return;

  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      card.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}
