export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function createRafLoop(fn, { element = null } = {}) {
  let rafId = null;
  let running = false;
  let visible = true;
  let observer = null;

  function tick() {
    if (!running) return;
    if (visible) {
      fn();
    }
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    visible = true;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  if (element && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(element);
  }

  return {
    start,
    stop,
    get running() {
      return running;
    },
    destroy() {
      stop();
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  };
}
