export interface DragState {
  isDragging: boolean;
  deltaX: number;
  velocityX: number;
}

export interface DragOptions {
  element: HTMLElement;
  onDragStart?: () => void;
  onDragMove?: (state: DragState) => void;
  onDragEnd?: (state: DragState) => void;
}

/** Drag por pointer events com velocidade (px/frame ~16.67ms) para inércia no marquee. */
export function createDraggable({ element, onDragStart, onDragMove, onDragEnd }: DragOptions): () => void {
  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocityX = 0;

  function onPointerDown(event: PointerEvent) {
    isDragging = true;
    startX = event.clientX;
    lastX = event.clientX;
    lastTime = performance.now();
    velocityX = 0;
    element.setPointerCapture(event.pointerId);
    element.classList.add('is-dragging');
    onDragStart?.();
  }

  function onPointerMove(event: PointerEvent) {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    velocityX = ((event.clientX - lastX) / dt) * 16.67;
    lastX = event.clientX;
    lastTime = now;
    onDragMove?.({ isDragging: true, deltaX: event.clientX - startX, velocityX });
  }

  function endDrag(event: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    element.classList.remove('is-dragging');
    onDragEnd?.({ isDragging: false, deltaX: event.clientX - startX, velocityX });
  }

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', endDrag);
  element.addEventListener('pointercancel', endDrag);

  return () => {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', endDrag);
    element.removeEventListener('pointercancel', endDrag);
  };
}
