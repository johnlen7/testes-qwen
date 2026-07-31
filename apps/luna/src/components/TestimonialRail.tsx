import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Testimonial } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Icon } from './Icon';

interface TestimonialRailProps {
  testimonials: Testimonial[];
}

export function TestimonialRail({ testimonials }: TestimonialRailProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const halfWidth = useRef(1);
  const pointer = useRef({ id: -1, x: 0, startOffset: 0, dragging: false });
  const pointerInside = useRef(false);
  const focusWithin = useRef(false);
  const hover = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => { halfWidth.current = Math.max(1, track.scrollWidth / 2); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    let frame = 0;
    let previous = performance.now();
    const draw = (now: number) => {
      const delta = Math.min(34, now - previous);
      previous = now;
      if (!reducedMotion && !isPaused && !hover.current && !pointer.current.dragging) {
        offset.current -= delta * 0.028;
        if (offset.current <= -halfWidth.current) offset.current += halfWidth.current;
        track.style.transform = `translate3d(${offset.current}px, 0, 0)`;
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [isPaused, reducedMotion]);

  const renderOffset = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    offset.current = next;
    while (offset.current > 0) offset.current -= halfWidth.current;
    while (offset.current <= -halfWidth.current) offset.current += halfWidth.current;
    track.style.transform = `translate3d(${offset.current}px, 0, 0)`;
  };

  const moveByCard = (direction: 1 | -1) => {
    const card = trackRef.current?.querySelector<HTMLElement>('.testimonial-card');
    const distance = (card?.offsetWidth ?? 320) + 12;
    renderOffset(offset.current + direction * distance);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const element = windowRef.current;
    if (!element) return;
    element.setPointerCapture(event.pointerId);
    pointerInside.current = true;
    pointer.current = { id: event.pointerId, x: event.clientX, startOffset: offset.current, dragging: true };
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointer.current.dragging || pointer.current.id !== event.pointerId) return;
    renderOffset(pointer.current.startOffset + event.clientX - pointer.current.x);
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointer.current.id !== event.pointerId) return;
    pointer.current.dragging = false;
    const element = windowRef.current;
    if (element?.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    const bounds = element?.getBoundingClientRect();
    pointerInside.current = Boolean(bounds && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom);
    hover.current = pointerInside.current || focusWithin.current;
    setIsDragging(false);
  };

  const syncPauseState = () => {
    hover.current = pointerInside.current || focusWithin.current;
  };

  return (
    <section className="section testimonials-section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="testimonials-heading">
          <div className="section-heading">
            <div className="mono-label">Escuta em primeira pessoa</div>
            <h2 id="testimonials-title">Quando a sala muda, você nota.</h2>
          </div>
          <div className="rail-controls" aria-label="Controles de depoimentos">
            <button className="icon-button" type="button" aria-label="Depoimento anterior" onClick={() => moveByCard(1)}><Icon name="return" size={18} /></button>
            <button className="icon-button" type="button" aria-label={isPaused ? 'Retomar depoimentos' : 'Pausar depoimentos'} aria-pressed={isPaused} onClick={() => setIsPaused((current) => !current)}><Icon name={isPaused ? 'play' : 'pause'} size={18} /></button>
            <button className="icon-button" type="button" aria-label="Próximo depoimento" onClick={() => moveByCard(-1)}><Icon name="arrow" size={18} /></button>
          </div>
        </div>
      </div>
      <div
        ref={windowRef}
        className={`rail-window ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerEnter={() => { pointerInside.current = true; syncPauseState(); }}
        onPointerLeave={() => { pointerInside.current = false; syncPauseState(); }}
        onFocusCapture={() => { focusWithin.current = true; syncPauseState(); }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            focusWithin.current = false;
            syncPauseState();
          }
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Depoimentos de pessoas que ouviram ÓRBITA"
      >
        <div ref={trackRef} className="rail-track">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <article className="testimonial-card" aria-hidden={index >= testimonials.length ? 'true' : undefined} key={`${testimonial.id}-${index}`}>
              <p className="testimonial-card__quote">“{testimonial.quote}”</p>
              <div className="testimonial-card__meta">
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
                <span className="testimonial-card__location">{testimonial.location}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Arraste os depoimentos ou use os botões de navegação.</p>
    </section>
  );
}
