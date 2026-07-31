import { clamp } from './animation';

export function getScrollProgress(element: HTMLElement): number {
	const rect = element.getBoundingClientRect();
	const viewportHeight = window.innerHeight;
	const totalScroll = rect.height - viewportHeight;

	if (totalScroll <= 0) return 0;

	const scrolled = clamp(-rect.top, 0, totalScroll);
	return scrolled / totalScroll;
}

export function onScrollRaf(callback: () => void): () => void {
	let ticking = false;

	function onScroll() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(() => {
				callback();
				ticking = false;
			});
		}
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	return () => window.removeEventListener('scroll', onScroll);
}

export function createIntersectionObserver(
	callback: (entry: IntersectionObserverEntry) => void,
	options?: IntersectionObserverInit
): IntersectionObserver {
	return new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				callback(entry);
			}
		});
	}, options);
}
