<script lang="ts">
	import { onMount } from 'svelte';
	import HeadphoneSVG from './HeadphoneSVG.svelte';
	import { getScrollProgress, onScrollRaf } from '$lib/utils/scroll';
	import { prefersReducedMotion } from '$lib/utils/animation';

	let containerEl: HTMLElement;
	let progress = $state(0);

	const stage = $derived(progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2);
	const explode = $derived(
		progress < 0.33 ? 0 : progress < 0.66 ? (progress - 0.33) / 0.33 : 1 - (progress - 0.66) / 0.34
	);
	const rotation = $derived(progress * 15 - 7.5);

	const stages = [
		{
			title: 'Cancelamento Adaptativo',
			text: '8 microfones mapeiam o ambiente 500 vezes por segundo, criando zonas de silêncio em 3D ao redor da sua cabeça.'
		},
		{
			title: 'Engenharia Exposta',
			text: 'Driver planar magnético de 50mm com diafragma de 0.2μm. Cada componente posicionado para eliminar ressonância interna.'
		},
		{
			title: 'Som Espacial 360°',
			text: 'O processador ÓRBITA S1 reconstrói o campo sonoro em tempo real. A música não vem do fone — vem do espaço.'
		}
	];

	onMount(() => {
		if (prefersReducedMotion()) {
			progress = 0.5;
			return;
		}

		const cleanup = onScrollRaf(() => {
			if (containerEl) {
				progress = getScrollProgress(containerEl);
			}
		});

		return cleanup;
	});
</script>

<section class="scroll-telling" id="como-funciona" bind:this={containerEl} aria-label="Como funciona">
	<div class="scroll-telling__sticky">
		<div class="scroll-telling__inner container">
			<div class="scroll-telling__visual">
				<HeadphoneSVG explode={explode} class="scroll-telling__headphone" />
			</div>

			<div class="scroll-telling__text">
				{#each stages as s, i}
					<div
						class="scroll-telling__stage"
						class:active={stage === i}
						aria-hidden={stage !== i}
					>
						<span class="scroll-telling__step">0{i + 1}</span>
						<h2 class="scroll-telling__stage-title heading-section">{s.title}</h2>
						<p class="scroll-telling__stage-text">{s.text}</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Progress indicator -->
		<div class="scroll-telling__progress" aria-hidden="true">
			<div class="scroll-telling__progress-track">
				<div class="scroll-telling__progress-fill" style="transform: scaleY({progress})"></div>
			</div>
			<div class="scroll-telling__progress-dots">
				{#each stages as _, i}
					<span class="scroll-telling__dot" class:active={stage >= i}></span>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.scroll-telling {
		height: 400vh;
		position: relative;
	}

	.scroll-telling__sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.scroll-telling__inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		gap: var(--sp-16);
	}

	.scroll-telling__visual {
		display: flex;
		justify-content: center;
	}

	:global(.scroll-telling__headphone) {
		width: min(100%, 380px);
		transform: rotate(var(--rotation, 0deg));
		transition: transform 100ms linear;
	}

	.scroll-telling__text {
		position: relative;
		min-height: 200px;
	}

	.scroll-telling__stage {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		opacity: 0;
		transform: translateY(30px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo),
			transform var(--dur-dramatic) var(--ease-out-expo);
		pointer-events: none;
	}

	.scroll-telling__stage.active {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.scroll-telling__step {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--accent);
		letter-spacing: 0.2em;
		margin-bottom: var(--sp-3);
	}

	.scroll-telling__stage-title {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		margin-bottom: var(--sp-4);
	}

	.scroll-telling__stage-text {
		color: var(--text-muted);
		font-size: 1.05rem;
		line-height: 1.7;
		max-width: 40ch;
	}

	.scroll-telling__progress {
		position: absolute;
		right: var(--sp-8);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sp-4);
	}

	.scroll-telling__progress-track {
		width: 2px;
		height: 120px;
		background: var(--ring);
		border-radius: 1px;
		overflow: hidden;
	}

	.scroll-telling__progress-fill {
		width: 100%;
		height: 100%;
		background: var(--accent);
		transform-origin: top;
		border-radius: 1px;
	}

	.scroll-telling__progress-dots {
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}

	.scroll-telling__dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--ring);
		transition: background var(--dur-standard), transform var(--dur-standard) var(--ease-out-back);
	}

	.scroll-telling__dot.active {
		background: var(--accent);
		transform: scale(1.4);
	}

	@media (max-width: 768px) {
		.scroll-telling__inner {
			grid-template-columns: 1fr;
			text-align: center;
		}

		:global(.scroll-telling__headphone) {
			width: min(100%, 260px);
		}

		.scroll-telling__stage-text {
			margin-inline: auto;
		}

		.scroll-telling__progress {
			right: var(--sp-4);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-telling {
			height: auto;
		}

		.scroll-telling__sticky {
			position: relative;
			height: auto;
			padding-block: var(--sp-16);
		}

		.scroll-telling__stage {
			position: relative;
			opacity: 1;
			transform: none;
			margin-bottom: var(--sp-8);
		}

		.scroll-telling__progress {
			display: none;
		}
	}
</style>
