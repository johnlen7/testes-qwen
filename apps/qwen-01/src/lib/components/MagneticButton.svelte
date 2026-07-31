<script lang="ts">
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from '$lib/utils/animation';

	interface Props {
		children: Snippet;
		class?: string;
		href?: string;
		onclick?: () => void;
	}

	let { children, class: className = '', href, onclick }: Props = $props();

	let btnEl = $state<HTMLElement>();
	let x = $state(0);
	let y = $state(0);
	let ripples: Array<{ id: number; x: number; y: number }> = $state([]);
	let rippleId = 0;

	function onMouseMove(e: MouseEvent) {
		if (prefersReducedMotion() || !btnEl) return;
		const rect = btnEl.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		x = (e.clientX - cx) * 0.3;
		y = (e.clientY - cy) * 0.3;
	}

	function onMouseLeave() {
		x = 0;
		y = 0;
	}

	function onClick(e: MouseEvent) {
		if (prefersReducedMotion() || !btnEl) return;
		const rect = btnEl.getBoundingClientRect();
		const rx = e.clientX - rect.left;
		const ry = e.clientY - rect.top;
		const id = ++rippleId;
		ripples = [...ripples, { id, x: rx, y: ry }];
		setTimeout(() => {
			ripples = ripples.filter((r) => r.id !== id);
		}, 600);
		onclick?.();
	}
</script>

{#if href}
	<a
		class="magnetic-btn {className}"
		{href}
		bind:this={btnEl}
		onmousemove={onMouseMove}
		onmouseleave={onMouseLeave}
		onclick={onClick}
		style="transform: translate({x}px, {y}px)"
	>
		{@render children()}
		{#each ripples as ripple}
			<span
				class="magnetic-btn__ripple"
				style="left: {ripple.x}px; top: {ripple.y}px"
				aria-hidden="true"
			></span>
		{/each}
	</a>
{:else}
	<button
		class="magnetic-btn {className}"
		bind:this={btnEl}
		onmousemove={onMouseMove}
		onmouseleave={onMouseLeave}
		onclick={onClick}
		style="transform: translate({x}px, {y}px)"
	>
		{@render children()}
		{#each ripples as ripple}
			<span
				class="magnetic-btn__ripple"
				style="left: {ripple.x}px; top: {ripple.y}px"
				aria-hidden="true"
			></span>
		{/each}
	</button>
{/if}

<style>
	.magnetic-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		transition: transform var(--dur-standard) var(--ease-out-expo),
			box-shadow var(--dur-standard);
		will-change: transform;
	}

	.magnetic-btn__ripple {
		position: absolute;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.4);
		transform: translate(-50%, -50%) scale(0);
		animation: ripple-expand 600ms var(--ease-out-expo) forwards;
		pointer-events: none;
	}

	@keyframes ripple-expand {
		to {
			transform: translate(-50%, -50%) scale(80);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.magnetic-btn {
			transform: none !important;
		}

		.magnetic-btn__ripple {
			display: none;
		}
	}
</style>
