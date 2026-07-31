<script lang="ts">
	import { onMount } from 'svelte';
	import HeadphoneSVG from './HeadphoneSVG.svelte';
	import { selectedColor, selectedMode, totalPrice, COLORS, MODES } from '$lib/stores/configurator';
	import { countUp, prefersReducedMotion } from '$lib/utils/animation';
	import { createIntersectionObserver } from '$lib/utils/scroll';

	let sectionEl: HTMLElement;
	let visible = $state(false);
	let displayedPrice = $state(COLORS[0].price);
	let prevPrice = $state(COLORS[0].price);
	let cancelCountUp: (() => void) | undefined;

	const currentColor = $derived($selectedColor);
	const currentMode = $derived($selectedMode);
	const targetPrice = $derived($totalPrice);

	$effect(() => {
		const target = targetPrice;
		if (target === prevPrice) return;

		if (prefersReducedMotion()) {
			displayedPrice = target;
			prevPrice = target;
			return;
		}

		cancelCountUp?.();
		const from = displayedPrice;
		cancelCountUp = countUp(from, target, 600, (v) => {
			displayedPrice = v;
		});
		prevPrice = target;

		return () => cancelCountUp?.();
	});

	onMount(() => {
		const observer = createIntersectionObserver(
			() => {
				visible = true;
			},
			{ threshold: 0.2 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});

	function formatPrice(value: number): string {
		return value.toLocaleString('pt-BR');
	}
</script>

<section class="configurator section" id="configurador" bind:this={sectionEl} aria-label="Configurador de produto">
	<div class="container">
		<header class="configurator__header" class:visible>
			<h2 class="heading-section configurator__title">Monte o seu ÓRBITA</h2>
			<p class="configurator__subtitle text-muted">
				Cada detalhe, do seu jeito.
			</p>
		</header>

		<div class="configurator__grid">
			<div class="configurator__preview" class:visible>
				<HeadphoneSVG
					color={currentColor.hex}
					colorLight={currentColor.hexLight}
					mode={currentMode.id}
					class="configurator__headphone"
				/>
			</div>

			<div class="configurator__controls" class:visible>
				<!-- Color selection -->
				<fieldset class="configurator__field">
					<legend class="configurator__label">Cor — {currentColor.name}</legend>
					<div class="configurator__colors" role="radiogroup" aria-label="Cor do fone">
						{#each COLORS as color}
							<button
								class="configurator__color-swatch"
								class:selected={currentColor.id === color.id}
								style="--swatch: {color.hex}"
								role="radio"
								aria-checked={currentColor.id === color.id}
								aria-label={color.name}
								title={color.name}
								onclick={() => selectedColor.set(color)}
							>
								<span class="configurator__swatch-inner"></span>
							</button>
						{/each}
					</div>
				</fieldset>

				<!-- Mode selection -->
				<fieldset class="configurator__field">
					<legend class="configurator__label">Modo de som</legend>
					<div class="configurator__modes">
						{#each MODES as mode}
							<button
								class="configurator__mode-btn"
								class:selected={currentMode.id === mode.id}
								role="radio"
								aria-checked={currentMode.id === mode.id}
								onclick={() => selectedMode.set(mode)}
							>
								<span class="configurator__mode-name">{mode.name}</span>
								<span class="configurator__mode-desc">{mode.description}</span>
							</button>
						{/each}
					</div>
				</fieldset>

				<!-- Price + CTA -->
				<div class="configurator__purchase">
					<div class="configurator__price" aria-live="polite">
						<span class="configurator__price-label">Total</span>
						<span class="configurator__price-value">R$ {formatPrice(displayedPrice)}</span>
					</div>
					<button class="configurator__buy-btn">
						Comprar ÓRBITA — {currentColor.name}, R$ {formatPrice(targetPrice)}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.configurator__header {
		text-align: center;
		margin-bottom: var(--sp-16);
		opacity: 0;
		transform: translateY(20px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo),
			transform var(--dur-dramatic) var(--ease-out-expo);
	}

	.configurator__header.visible {
		opacity: 1;
		transform: none;
	}

	.configurator__title {
		font-size: clamp(2rem, 4vw, 3rem);
		margin-bottom: var(--sp-3);
	}

	.configurator__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--sp-16);
		align-items: center;
	}

	.configurator__preview {
		display: flex;
		justify-content: center;
		opacity: 0;
		transform: translateX(-30px);
		transition: opacity var(--dur-cinematic) var(--ease-out-expo) 200ms,
			transform var(--dur-cinematic) var(--ease-out-expo) 200ms;
	}

	.configurator__preview.visible {
		opacity: 1;
		transform: none;
	}

	:global(.configurator__headphone) {
		width: min(100%, 360px);
	}

	.configurator__controls {
		display: flex;
		flex-direction: column;
		gap: var(--sp-8);
		opacity: 0;
		transform: translateX(30px);
		transition: opacity var(--dur-cinematic) var(--ease-out-expo) 300ms,
			transform var(--dur-cinematic) var(--ease-out-expo) 300ms;
	}

	.configurator__controls.visible {
		opacity: 1;
		transform: none;
	}

	.configurator__field {
		border: none;
	}

	.configurator__label {
		font-weight: 500;
		font-size: 0.9rem;
		margin-bottom: var(--sp-4);
		display: block;
	}

	.configurator__colors {
		display: flex;
		gap: var(--sp-4);
	}

	.configurator__color-swatch {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		padding: 3px;
		border: 2px solid transparent;
		transition: border-color var(--dur-micro), transform var(--dur-micro) var(--ease-out-back);
	}

	.configurator__color-swatch:hover {
		transform: scale(1.1);
	}

	.configurator__color-swatch.selected {
		border-color: var(--accent);
	}

	.configurator__swatch-inner {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: var(--swatch);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.configurator__modes {
		display: flex;
		flex-direction: column;
		gap: var(--sp-3);
	}

	.configurator__mode-btn {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--sp-4) var(--sp-6);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-align: left;
		transition: border-color var(--dur-micro), background-color var(--dur-micro),
			transform var(--dur-micro) var(--ease-out-back);
	}

	.configurator__mode-btn:hover {
		border-color: var(--text-muted);
		transform: translateX(4px);
	}

	.configurator__mode-btn.selected {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, transparent);
	}

	.configurator__mode-name {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.configurator__mode-desc {
		font-size: 0.8rem;
		color: var(--text-muted);
		margin-top: var(--sp-1);
	}

	.configurator__purchase {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		padding-top: var(--sp-6);
		border-top: 1px solid var(--border);
	}

	.configurator__price {
		display: flex;
		align-items: baseline;
		gap: var(--sp-3);
	}

	.configurator__price-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.configurator__price-value {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent);
		font-variant-numeric: tabular-nums;
	}

	.configurator__buy-btn {
		padding: var(--sp-4) var(--sp-8);
		background: var(--accent);
		color: #0a0a0f;
		font-weight: 600;
		font-size: 0.95rem;
		border-radius: 100px;
		transition: transform var(--dur-micro) var(--ease-out-back),
			box-shadow var(--dur-standard);
	}

	.configurator__buy-btn:hover {
		transform: scale(1.03);
		box-shadow: 0 4px 24px rgba(232, 160, 64, 0.25);
	}

	.configurator__buy-btn:active {
		transform: scale(0.98);
	}

	@media (max-width: 768px) {
		.configurator__grid {
			grid-template-columns: 1fr;
		}

		.configurator__preview {
			transform: translateY(20px);
		}

		.configurator__controls {
			transform: translateY(20px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.configurator__header,
		.configurator__preview,
		.configurator__controls {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
