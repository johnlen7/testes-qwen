<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		color?: string;
		colorLight?: string;
		class?: string;
		mode?: string;
		explode?: number;
		children?: Snippet;
	}

	let {
		color = '#2a2a2e',
		colorLight = '#3a3a40',
		class: className = '',
		mode = 'immersive',
		explode = 0,
		children
	}: Props = $props();

	const leftOffset = $derived(explode * -40);
	const rightOffset = $derived(explode * 40);
	const bandOffset = $derived(explode * -20);
	const innerOpacity = $derived(Math.min(explode * 2, 1));
</script>

<svg
	viewBox="0 0 400 400"
	class="headphone {className}"
	role="img"
	aria-label="Fone de ouvido ÓRBITA"
	xmlns="http://www.w3.org/2000/svg"
>
	<defs>
		<linearGradient id="band-grad" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color={colorLight} />
			<stop offset="100%" stop-color={color} />
		</linearGradient>
		<linearGradient id="cup-grad" x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset="0%" stop-color={colorLight} />
			<stop offset="50%" stop-color={color} />
			<stop offset="100%" stop-color={color} />
		</linearGradient>
		<radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
			<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.3" />
			<stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
		</radialGradient>
		<filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
			<feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3" />
		</filter>
	</defs>

	<!-- Ambient glow -->
	<circle cx="200" cy="200" r="160" fill="url(#glow-grad)" opacity={0.4 + explode * 0.3} />

	<!-- Headband -->
	<g
		style="transform: translateY({bandOffset}px)"
		class="headphone__band"
	>
		<path
			d="M 120 200 Q 120 80 200 70 Q 280 80 280 200"
			fill="none"
			stroke="url(#band-grad)"
			stroke-width="14"
			stroke-linecap="round"
		/>
		<!-- Headband padding -->
		<path
			d="M 160 105 Q 200 92 240 105"
			fill="none"
			stroke={colorLight}
			stroke-width="20"
			stroke-linecap="round"
			opacity="0.6"
		/>
	</g>

	<!-- Left ear cup -->
	<g
		style="transform: translateX({leftOffset}px)"
		class="headphone__cup"
		filter="url(#soft-shadow)"
	>
		<ellipse cx="120" cy="240" rx="52" ry="62" fill="url(#cup-grad)" />
		<ellipse cx="120" cy="240" rx="38" ry="48" fill={color} opacity="0.8" />
		<ellipse cx="120" cy="240" rx="26" ry="34" fill="var(--bg)" opacity="0.6" />
		<!-- Cushion ring -->
		<ellipse
			cx="120"
			cy="240"
			rx="44"
			ry="54"
			fill="none"
			stroke={colorLight}
			stroke-width="3"
			opacity="0.4"
		/>
		<!-- Internal driver (visible when exploded) -->
		<g opacity={innerOpacity}>
			<circle cx="120" cy="240" r="20" fill="none" stroke="var(--accent)" stroke-width="1.5" />
			<circle cx="120" cy="240" r="12" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.6" />
			<circle cx="120" cy="240" r="4" fill="var(--accent)" opacity="0.8" />
		</g>
	</g>

	<!-- Right ear cup -->
	<g
		style="transform: translateX({rightOffset}px)"
		class="headphone__cup"
		filter="url(#soft-shadow)"
	>
		<ellipse cx="280" cy="240" rx="52" ry="62" fill="url(#cup-grad)" />
		<ellipse cx="280" cy="240" rx="38" ry="48" fill={color} opacity="0.8" />
		<ellipse cx="280" cy="240" rx="26" ry="34" fill="var(--bg)" opacity="0.6" />
		<!-- Cushion ring -->
		<ellipse
			cx="280"
			cy="240"
			rx="44"
			ry="54"
			fill="none"
			stroke={colorLight}
			stroke-width="3"
			opacity="0.4"
		/>
		<!-- Internal driver (visible when exploded) -->
		<g opacity={innerOpacity}>
			<circle cx="280" cy="240" r="20" fill="none" stroke="var(--accent)" stroke-width="1.5" />
			<circle cx="280" cy="240" r="12" fill="none" stroke="var(--accent)" stroke-width="1" opacity="0.6" />
			<circle cx="280" cy="240" r="4" fill="var(--accent)" opacity="0.8" />
		</g>
	</g>

	<!-- Sound waves (mode-dependent) -->
	{#if mode === 'immersive'}
		<g class="headphone__waves" opacity="0.5">
			<path d="M 60 220 Q 40 240 60 260" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.6" />
			<path d="M 48 210 Q 20 240 48 270" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.4" />
			<path d="M 340 220 Q 360 240 340 260" fill="none" stroke="var(--accent)" stroke-width="2" opacity="0.6" />
			<path d="M 352 210 Q 380 240 352 270" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.4" />
		</g>
	{:else if mode === 'studio'}
		<g class="headphone__waves" opacity="0.5">
			<line x1="50" y1="240" x2="70" y2="240" stroke="var(--accent)" stroke-width="2" />
			<line x1="330" y1="240" x2="350" y2="240" stroke="var(--accent)" stroke-width="2" />
			<line x1="55" y1="230" x2="65" y2="230" stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />
			<line x1="335" y1="230" x2="345" y2="230" stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />
			<line x1="55" y1="250" x2="65" y2="250" stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />
			<line x1="335" y1="250" x2="345" y2="250" stroke="var(--accent)" stroke-width="1.5" opacity="0.5" />
		</g>
	{:else}
		<g class="headphone__waves" opacity="0.5">
			<path d="M 55 225 L 65 240 L 55 255" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
			<path d="M 345 225 L 335 240 L 345 255" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" />
		</g>
	{/if}

	{@render children?.()}
</svg>

<style>
	.headphone {
		width: 100%;
		height: auto;
	}

	.headphone__band,
	.headphone__cup {
		transition: transform var(--dur-dramatic) var(--ease-out-expo);
	}

	.headphone__waves {
		animation: wave-pulse 2s var(--ease-in-out) infinite;
	}

	@keyframes wave-pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.7;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.headphone__waves {
			animation: none;
		}
	}
</style>
