<script lang="ts">
	import { FAQ_ITEMS } from '$lib/data/faq';

	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}

	function onKeydown(e: KeyboardEvent, index: number) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusItem(index + 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusItem(index - 1);
				break;
			case 'Home':
				e.preventDefault();
				focusItem(0);
				break;
			case 'End':
				e.preventDefault();
				focusItem(FAQ_ITEMS.length - 1);
				break;
		}
	}

	function focusItem(index: number) {
		const wrapped = ((index % FAQ_ITEMS.length) + FAQ_ITEMS.length) % FAQ_ITEMS.length;
		const buttons = document.querySelectorAll('.faq__trigger');
		(buttons[wrapped] as HTMLElement)?.focus();
	}
</script>

<section class="faq section" id="faq" aria-label="Perguntas frequentes">
	<div class="container faq__container">
		<header class="faq__header">
			<h2 class="heading-section faq__title">Perguntas frequentes</h2>
		</header>

		<div class="faq__list" role="list">
			{#each FAQ_ITEMS as item, i}
				<div class="faq__item" role="listitem">
					<h3>
						<button
							class="faq__trigger"
							aria-expanded={openIndex === i}
							aria-controls="faq-panel-{i}"
							id="faq-trigger-{i}"
							onclick={() => toggle(i)}
							onkeydown={(e) => onKeydown(e, i)}
						>
							<span class="faq__question">{item.question}</span>
							<span class="faq__icon" class:open={openIndex === i} aria-hidden="true">
								<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="8" y1="3" x2="8" y2="13" />
									<line x1="3" y1="8" x2="13" y2="8" />
								</svg>
							</span>
						</button>
					</h3>
					<div
						class="faq__panel"
						class:open={openIndex === i}
						id="faq-panel-{i}"
						role="region"
						aria-labelledby="faq-trigger-{i}"
						inert={openIndex !== i}
					>
						<div class="faq__panel-inner">
							<p class="faq__answer">{item.answer}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.faq__container {
		max-width: 48rem;
	}

	.faq__header {
		text-align: center;
		margin-bottom: var(--sp-12);
	}

	.faq__title {
		font-size: clamp(2rem, 4vw, 3rem);
	}

	.faq__list {
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}

	.faq__item {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		transition: border-color var(--dur-standard);
	}

	.faq__item:has(.faq__trigger[aria-expanded='true']) {
		border-color: var(--accent-dim);
	}

	.faq__trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
		padding: var(--sp-6);
		text-align: left;
		font-weight: 500;
		font-size: 1rem;
		transition: background-color var(--dur-micro);
	}

	.faq__trigger:hover {
		background: var(--surface);
	}

	.faq__icon {
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		color: var(--accent);
		transition: transform var(--dur-standard) var(--ease-out-back);
	}

	.faq__icon.open {
		transform: rotate(45deg);
	}

	.faq__icon svg {
		width: 100%;
		height: 100%;
	}

	.faq__panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--dur-dramatic) var(--ease-out-expo);
	}

	.faq__panel.open {
		grid-template-rows: 1fr;
	}

	.faq__panel-inner {
		overflow: hidden;
	}

	.faq__answer {
		padding: 0 var(--sp-6) var(--sp-6);
		color: var(--text-muted);
		font-size: 0.95rem;
		line-height: 1.7;
	}

	@media (prefers-reduced-motion: reduce) {
		.faq__panel {
			transition: none;
		}

		.faq__icon {
			transition: none;
		}
	}
</style>
