export type FrameCallback = (time: number, delta: number) => void;

const callbacks = new Set<FrameCallback>();
let running = false;
let lastTime = 0;

function tick(time: number) {
  const delta = lastTime ? time - lastTime : 0;
  lastTime = time;
  callbacks.forEach((cb) => cb(time, delta));
  if (callbacks.size > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
    lastTime = 0;
  }
}

/**
 * Loop de rAF centralizado e único para toda a página — nada de N loops
 * concorrentes por componente. Subscribers entram/saem do Set; o loop para
 * sozinho quando não há mais ninguém ouvindo.
 */
export function onFrame(cb: FrameCallback): () => void {
  callbacks.add(cb);
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return () => callbacks.delete(cb);
}
