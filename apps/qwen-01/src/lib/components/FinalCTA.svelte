<script lang="ts">
	import HeadphoneSVG from './HeadphoneSVG.svelte';
	import MagneticButton from './MagneticButton.svelte';
	import { selectedColor, selectedMode, totalPrice } from '$lib/stores/configurator';
	import { createIntersectionObserver } from '$lib/utils/scroll';
	import { onMount } from 'svelte';

	let sectionEl: HTMLElement;
	let visible = $state(false);

	const currentColor = $derived($selectedColor);
	const currentMode = $derived($selectedMode);
	const price = $derived($totalPrice);

	onMount(() => {
		const observer = createIntersectionObserver(
			() => {
				visible = true;
			},
			{ threshold: 0.3 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="final-cta section" bind:this={sectionEl} aria-label="Chamada final">
	<div class="container final-cta__inner">
		<div class="final-cta__visual" class:visible>
			<HeadphoneSVG
				color={currentColor.hex}
				colorLight={currentColor.hexLight}
				mode={currentMode.id}
				class="final-cta__headphone"
			/>
		</div>

		<div class="final-cta__content" class:visible>
			<h2 class="heading-display final-cta__title">
				Sua órbita<br />começa agora
			</h2>
			<p class="final-cta__text text-muted">
				ÓRBITA {currentColor.name} · Modo {currentMode.name} · R$ {price.toLocaleString('pt-BR')}
			</p>
			<MagneticButton class="final-cta__btn">
				Garantir o meu ÓRBITA
			</MagneticButton>
			<p class="final-cta__note text-muted">
				Envio em 48h · 30 dias para devolução · Frete grátis
			</p>
		</div>
	</div>
</section>

<style>
	.final-cta {
		background: var(--bg-elevated);
		border-top: 1px solid var(--border);
	}

	.final-cta__inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		gap: var(--sp-16);
	}

	.final-cta__visual {
		display: flex;
		justify-content: center;
		opacity: 0;
		transform: scale(0.9);
		transition: opacity var(--dur-cinematic) var(--ease-out-expo),
			transform var(--dur-cinematic) var(--ease-out-expo);
	}

	.final-cta__visual.visible {
		opacity: 1;
		transform: none;
	}

	:global(.final-cta__headphone) {
		width: min(100%, 320px);
	}

	.final-cta__content {
		opacity: 0;
		transform: translateY(30px);
		transition: opacity var(--dur-cinematic) var(--ease-out-expo) 200ms,
			transform var(--dur-cinematic) var(--ease-out-expo) 200ms;
	}

	.final-cta__content.visible {
		opacity: 1;
		transform: none;
	}

	.final-cta__title {
		font-size: clamp(2.5rem, 5vw, 4rem);
		margin-bottom: var(--sp-4);
	}

	.final-cta__text {
		font-size: 1.05rem;
		margin-bottom: var(--sp-8);
	}

	:global(.final-cta__btn) {
		padding: var(--sp-4) var(--sp-12);
		background: var(--accent);
		color: #0a0a0f;
		font-weight: 700;
		font-size: 1.05rem;
		border-radius: 100px;
	}

	:global(.final-cta__btn:hover) {
		box-shadow: 0 0 40px rgba(232, 160, 64, 0.3);
	}

	.final-cta__note {
		margin-top: var(--sp-6);
		font-size: 0.8rem;
	}

	@media (max-width: 768px) {
		.final-cta__inner {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.final-cta__visual {
			order: -1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.final-cta__visual,
		.final-cta__content {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
