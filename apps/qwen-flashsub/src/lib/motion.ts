const query = window.matchMedia("(prefers-reduced-motion: reduce)");

export function prefersReducedMotion(): boolean {
  return query.matches;
}

export function onMotionChange(cb: (reduced: boolean) => void): () => void {
  const handler = (e: MediaQueryListEvent): void => cb(e.matches);
  query.addEventListener("change", handler);
  return () => {
    query.removeEventListener("change", handler);
  };
}
