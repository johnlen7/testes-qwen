export function observeReveal(root = document) {
  const items = Array.from(root.querySelectorAll('[data-reveal]'));
  if (!items.length) return { destroy: () => {} };

  items.forEach((el) => {
    const index = el.getAttribute('data-reveal');
    el.style.setProperty('--i', index && index !== '' ? index : '0');
  });

  if (typeof IntersectionObserver === 'undefined') {
    items.forEach((el) => el.classList.add('is-in'));
    return { destroy: () => {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
