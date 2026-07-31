<script lang="ts">
	import { onMount } from 'svelte';
	import { getInitialTheme, applyTheme, toggleTheme, type Theme } from '$lib/utils/theme';
	import { prefersReducedMotion } from '$lib/utils/animation';

	let theme = $state<Theme>('dark');
	let overlayEl: HTMLElement;

	onMount(() => {
		theme = getInitialTheme();
		applyTheme(theme);
	});

	function handleToggle(e: MouseEvent) {
		const next = toggleTheme(theme);

		if (prefersReducedMotion() || !overlayEl) {
			theme = next;
			applyTheme(next);
			return;
		}

		const x = e.clientX;
		const y = e.clientY;
		const endRadius = Math.hypot(
			Math.max(x, window.innerWidth - x),
			Math.max(y, window.innerHeight - y)
		);

		overlayEl.style.background = next === 'dark' ? '#0a0a0f' : '#faf9f7';
		overlayEl.style.clipPath = `circle(0px at ${x}px ${y}px)`;
		overlayEl.style.display = 'block';

		const anim = overlayEl.animate(
			[
				{ clipPath: `circle(0px at ${x}px ${y}px)` },
				{ clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
			],
			{ duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
		);

		anim.onfinish = () => {
			theme = next;
			applyTheme(next);
			overlayEl.style.display = 'none';
		};
	}
</script>

<div class="theme-overlay" bind:this={overlayEl} aria-hidden="true"></div>

<button
	class="theme-toggle"
	onclick={handleToggle}
	aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
	title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
>
	<span class="theme-toggle__icon" class:light={theme === 'light'}>
		{#if theme === 'dark'}
			<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
			</svg>
		{:else}
			<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
					clip-rule="evenodd"
				/>
			</svg>
		{/if}
	</span>
</button>

<style>
	.theme-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
		display: none;
	}

	.theme-toggle {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--surface);
		border: 1px solid var(--border);
		transition: background-color var(--dur-standard), border-color var(--dur-standard),
			transform var(--dur-micro) var(--ease-out-back);
	}

	.theme-toggle:hover {
		transform: scale(1.1);
		border-color: var(--accent);
	}

	.theme-toggle__icon {
		width: 20px;
		height: 20px;
		color: var(--text);
		transition: transform var(--dur-dramatic) var(--ease-out-back);
	}

	.theme-toggle__icon.light {
		transform: rotate(180deg);
	}

	.theme-toggle__icon svg {
		width: 100%;
		height: 100%;
	}
</style>
