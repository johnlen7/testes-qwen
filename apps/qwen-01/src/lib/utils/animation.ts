export function easeOutExpo(t: number): number {
	return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeOutBack(t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function mapRange(
	value: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number
): number {
	return clamp(((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin, outMin, outMax);
}

export function countUp(
	from: number,
	to: number,
	duration: number,
	onUpdate: (value: number) => void,
	onComplete?: () => void
): () => void {
	const start = performance.now();
	let raf: number;

	function tick(now: number) {
		const elapsed = now - start;
		const progress = clamp(elapsed / duration, 0, 1);
		const eased = easeOutExpo(progress);
		const current = Math.round(lerp(from, to, eased));
		onUpdate(current);

		if (progress < 1) {
			raf = requestAnimationFrame(tick);
		} else {
			onComplete?.();
		}
	}

	raf = requestAnimationFrame(tick);
	return () => cancelAnimationFrame(raf);
}

export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
