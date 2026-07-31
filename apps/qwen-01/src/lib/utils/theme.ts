const STORAGE_KEY = 'orbita-theme';

export type Theme = 'dark' | 'light';

export function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';

	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'dark' || stored === 'light') return stored;

	return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(current: Theme): Theme {
	return current === 'dark' ? 'light' : 'dark';
}
