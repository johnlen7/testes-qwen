/* ============================================================
   marquee — carrossel infinito autoral
   Loop WAAPI sem salto + pausa no hover + drag com física.
   ============================================================ */

import { RM, clamp } from './motion';

interface Testimonial {
  q: string;
  n: string;
  r: string;
  i: string;
}

const TESTIMONIALS: Testimonial[] = [
  { q: 'Parei de escutar música. Passei a visitá-la.', n: 'Marina Duarte', r: 'Produtora musical', i: 'MD' },
  { q: 'O ANC mais convincente que já usei. O mundo some sem pesar.', n: 'Rafael Nunes', r: 'Crítico de tecnologia', i: 'RN' },
  { q: 'Parece que a sala virou um estúdio.', n: 'Cléo Andrade', r: 'Sound designer', i: 'CA' },
  { q: 'Trabalho 8h com eles e esqueço que existem.', n: 'Diego Ferraz', r: 'Engenheiro de áudio', i: 'DF' },
  { q: 'A cena espacial é assustadoramente precisa.', n: 'Laura Bianchi', r: 'Podcaster', i: 'LB' },
  { q: 'Design raro: bonito de olhar, melhor de usar.', n: 'Otávio Lima', r: 'Arquiteto', i: 'OL' },
  { q: 'O modo transparência é melhor que o mundo real.', n: 'Inês Marques', r: 'Compositora', i: 'IM' },
  { q: 'Caros. E valem cada centavo.', n: 'Tomás Vieira', r: 'Músico', i: 'TV' }
];

const STAR = `<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9L6.6 19.6l1.1-6L3.2 9.4l6.1-.8z" fill="currentColor"/></svg>`;

function card(t: Testimonial): string {
  return `
  <article class="testimonial" role="listitem">
    <p class="testimonial-q">${t.q}</p>
    <div class="testimonial-stars" aria-hidden="true">${STAR.repeat(5)}</div>
    <div class="testimonial-meta">
      <span class="testimonial-avatar" aria-hidden="true">${t.i}</span>
      <span><span class="testimonial-name">${t.n}</span><br /><span class="testimonial-role">${t.r}</span></span>
    </div>
  </article>`;
}

export function initMarquee() {
  document.querySelectorAll<HTMLElement>('.marquee').forEach((marquee) => {
    const track = marquee.querySelector<HTMLElement>('.marquee-track')!;
    const reversed = marquee.dataset.reverse === 'true';

    // conteúdo duplicado ×2 → loop sem costura
    track.innerHTML = TESTIMONIALS.map(card).join('') + TESTIMONIALS.map(card).join('');

    const measure = () => track.scrollWidth / 2;
    let half = measure();

    // ---------- loop WAAPI ----------
    let anim: Animation | null = null;
    const DURATION = reversed ? 34000 : 28000;

    const startAnim = (from: number) => {
      anim?.cancel();
      if (RM) return;
      // faixa normal: anda para a esquerda (from → from−half)
      // faixa reversa: anda para a direita (from → from+half)
      const to = reversed ? from + half : from - half;
      anim = track.animate(
        [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
        { duration: DURATION, iterations: Infinity, easing: 'linear' }
      );
    };

    // offset atual do loop (em px, range [-half, 0])
    const currentOffset = () => {
      if (anim) return -((anim.effect as KeyframeEffect).getComputedTiming().progress ?? 0) * half;
      return 0;
    };

    startAnim(0);

    // ---------- pause no hover ----------
    marquee.addEventListener('pointerenter', () => {
      if (RM) return;
      anim?.pause();
      marquee.classList.add('is-paused');
    });
    marquee.addEventListener('pointerleave', () => {
      if (RM) return;
      anim?.play();
      marquee.classList.remove('is-paused');
    });

    // ---------- drag ----------
    let dragging = false;
    let startX = 0;
    let base = 0;
    let offset = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;

    const norm = (o: number) => ((o % half) + half) % half;

    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
      if (!RM) anim?.pause();
      base = currentOffset();
      offset = base;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) vel = ((e.clientX - lastX) / dt) * 1000 * 0.9 + vel * 0.1;
      lastX = e.clientX;
      lastT = now;
      offset = base + (e.clientX - startX);
      track.style.transform = `translateX(${offset}px)`;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      // física: devolve a velocidade como deslocamento extra
      const flick = clamp(vel * 0.22, -half * 0.3, half * 0.3);
      const final = norm(offset + flick);
      if (RM) {
        track.style.transform = `translateX(${-final}px)`;
      } else {
        const from = -final;
        track.style.transform = '';
        startAnim(from);
        anim?.play();
        marquee.classList.remove('is-paused');
      }
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // resize: re-meia e re-posiciona
    const onResize = () => {
      const prev = half;
      half = measure();
      if (!RM && anim) {
        const ratio = half / prev;
        const from = currentOffset() * ratio;
        startAnim(from);
      }
    };
    window.addEventListener('resize', onResize);
  });
}
