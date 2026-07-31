import { useEffect, useRef, useState } from 'react';
import { TESTIMONIALS, type Testimonial } from '../../data/site';
import { useInView } from '../../lib/useInView';
import { useReducedMotion } from '../../lib/useReducedMotion';
import './Testimonials.css';

/** velocidade do marquee em px/ms */
const SPEED = 0.33;

function TsCard({ t }: { t: Testimonial }) {
  return (
    <figure className="ts-card">
      <blockquote className="ts-quote">“{t.quote}”</blockquote>
      <figcaption className="ts-author">
        <span className="ts-avatar" aria-hidden="true">
          {t.initials}
        </span>
        <span className="ts-meta">
          <strong className="ts-name">{t.name}</strong>
          <span className="ts-role">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const reduced = useReducedMotion();
  const { ref: vpRef, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0 });

  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(true);
  const hoverRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  /* Anda quando visível e sem interação; pausa fora da tela */
  useEffect(() => {
    if (reduced) return;
    if (inView && !hoverRef.current && !draggingRef.current) {
      pausedRef.current = false;
    } else if (!inView) {
      pausedRef.current = true;
    }
  }, [inView, reduced]);

  /* Loop rAF — escreve o transform direto no track, sem re-render */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (reduced) return;

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(now - last, 50); // ignora saltos de abas em background
      last = now;
      if (!pausedRef.current && inView) {
        offsetRef.current += SPEED * dt;
        const half = track.scrollWidth / 2;
        if (half > 0) {
          if (offsetRef.current > half) offsetRef.current -= half;
          else if (offsetRef.current < 0) offsetRef.current += half;
        }
      }
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, inView]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    pausedRef.current = true;
    draggingRef.current = true;
    setDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = offsetRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    offsetRef.current = dragStartOffsetRef.current - (e.clientX - dragStartXRef.current);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!hoverRef.current) pausedRef.current = false;
  };

  const onMouseEnter = () => {
    if (reduced) return;
    hoverRef.current = true;
    pausedRef.current = true;
  };

  const onMouseLeave = () => {
    if (reduced) return;
    hoverRef.current = false;
    if (!draggingRef.current) pausedRef.current = false;
  };

  const cards = TESTIMONIALS.map((t) => <TsCard key={t.name} t={t} />);

  return (
    <section id="depoimentos" className="section ts-section">
      <div className="container ts-head">
        <p className="eyebrow">Depoimentos · 05</p>
        <h2 className="display">
          Quem ouviu, <em>não volta atrás</em>.
        </h2>
      </div>

      <div
        className={`ts-viewport${dragging ? ' is-dragging' : ''}`}
        ref={vpRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="ts-track" ref={trackRef}>
          {/* fonte semântica — a segunda cópia é puramente visual */}
          <div className="ts-group">{cards}</div>
          <div className="ts-group ts-clone" aria-hidden="true">
            {cards}
          </div>
        </div>
      </div>
    </section>
  );
}
