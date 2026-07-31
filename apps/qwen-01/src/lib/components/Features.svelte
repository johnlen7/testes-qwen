<script lang="ts">
	import { onMount } from 'svelte';
	import { FEATURES } from '$lib/data/features';
	import { createIntersectionObserver } from '$lib/utils/scroll';
	import { prefersReducedMotion } from '$lib/utils/animation';

	let sectionEl: HTMLElement;
	let visible = $state(false);
	let cards: HTMLElement[] = $state([]);

	onMount(() => {
		const observer = createIntersectionObserver(
			() => {
				visible = true;
			},
			{ threshold: 0.15 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});

	function onCardMouseMove(e: MouseEvent, index: number) {
		if (prefersReducedMotion()) return;
		const card = cards[index];
		if (!card) return;

		const rect = card.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;

		card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
	}

	function onCardMouseLeave(index: number) {
		const card = cards[index];
		if (card) card.style.transform = '';
	}
</script>

<section class="features section" id="recursos" bind:this={sectionEl} aria-label="Recursos">
	<div class="container">
		<header class="features__header" class:visible>
			<h2 class="heading-section features__title">Engenharia obsessiva</h2>
			<p class="features__subtitle text-muted">
				Cada componente projetado para um único objetivo: desaparecer entre você e a música.
			</p>
		</header>

		<div class="features__grid">
			{#each FEATURES as feature, i}
				<article
					class="features__card"
					class:visible
					style="transition-delay: {i * 80}ms"
					bind:this={cards[i]}
					onmousemove={(e) => onCardMouseMove(e, i)}
					onmouseleave={() => onCardMouseLeave(i)}
				>
					<div class="features__icon" aria-hidden="true">
						{#if feature.icon === 'anc'}
							<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="20" cy="20" r="8" />
								<path d="M8 12 Q2 20 8 28" stroke-linecap="round" />
								<path d="M32 12 Q38 20 32 28" stroke-linecap="round" />
								<path d="M4 8 Q-4 20 4 32" stroke-linecap="round" opacity="0.5" />
								<path d="M36 8 Q44 20 36 32" stroke-linecap="round" opacity="0.5" />
							</svg>
						{:else if feature.icon === 'battery'}
							<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="6" y="12" width="24" height="16" rx="3" />
								<rect x="32" y="17" width="4" height="6" rx="1" />
								<path d="M12 18 L16 20 L12 22" stroke-linecap="round" stroke-linejoin="round" />
								<line x1="20" y1="16" x2="20" y2="24" stroke-linecap="round" />
								<line x1="24" y1="16" x2="24" y2="24" stroke-linecap="round" opacity="0.5" />
							</svg>
						{:else if feature.icon === 'bluetooth'}
							<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M14 12 L26 20 L14 28 M14 20 L26 12 M14 20 L26 28" stroke-linecap="round" stroke-linejoin="round" />
								<circle cx="20" cy="20" r="16" opacity="0.3" />
							</svg>
						{:else if feature.icon === 'driver'}
							<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="20" cy="20" r="14" />
								<circle cx="20" cy="20" r="8" />
								<circle cx="20" cy="20" r="3" fill="currentColor" />
								<line x1="20" y1="6" x2="20" y2="12" opacity="0.4" />
								<line x1="20" y1="28" x2="20" y2="34" opacity="0.4" />
							</svg>
						{:else if feature.icon === 'mic'}
							<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="16" y="8" width="8" height="16" rx="4" />
								<path d="M12 20 Q12 30 20 30 Q28 30 28 20" stroke-linecap="round" />
								<line x1="20" y1="30" x2="20" y2="34" stroke-linecap="round" />
								<line x1="15" y1="34" x2="25" y2="34" stroke-linecap="round" />
							</svg>
						{:else}
							<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20 6 L20 34" stroke-linecap="round" />
								<path d="M12 10 L20 6 L28 10" stroke-linecap="round" stroke-linejoin="round" />
								<circle cx="20" cy="26" r="8" />
								<path d="M17 26 L20 23 L23 26" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{/if}
					</div>
					<h3 class="features__card-title">{feature.title}</h3>
					<p class="features__card-text">{feature.description}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.features__header {
		text-align: center;
		margin-bottom: var(--sp-16);
		opacity: 0;
		transform: translateY(20px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo),
			transform var(--dur-dramatic) var(--ease-out-expo);
	}

	.features__header.visible {
		opacity: 1;
		transform: none;
	}

	.features__title {
		font-size: clamp(2rem, 4vw, 3rem);
		margin-bottom: var(--sp-3);
	}

	.features__grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--sp-6);
	}

	.features__card {
		padding: var(--sp-8);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		opacity: 0;
		transform: translateY(30px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo),
			transform var(--dur-dramatic) var(--ease-out-expo),
			box-shadow var(--dur-standard);
		will-change: transform;
	}

	.features__card.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.features__card:hover {
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--accent-dim);
	}

	.features__icon {
		width: 40px;
		height: 40px;
		color: var(--accent);
		margin-bottom: var(--sp-6);
	}

	.features__icon svg {
		width: 100%;
		height: 100%;
	}

	.features__card-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.1rem;
		margin-bottom: var(--sp-3);
	}

	.features__card-text {
		font-size: 0.9rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	@media (max-width: 1024px) {
		.features__grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.features__grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.features__header,
		.features__card {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
