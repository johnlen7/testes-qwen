<script lang="ts">
	import { onMount } from 'svelte';
	import { TESTIMONIALS } from '$lib/data/testimonials';
	import { prefersReducedMotion } from '$lib/utils/animation';

	let trackEl: HTMLElement;
	let offset = $state(0);
	let isDragging = $state(false);
	let isPaused = $state(false);
	let startX = 0;
	let startOffset = 0;
	let velocity = 0;
	let lastX = 0;
	let lastTime = 0;
	let rafId: number;
	let trackWidth = 0;

	const SPEED = 0.5;

	onMount(() => {
		if (prefersReducedMotion()) return;

		function measure() {
			if (trackEl) {
				trackWidth = trackEl.scrollWidth / 2;
			}
		}

		measure();
		window.addEventListener('resize', measure);

		function animate() {
			if (!isDragging && !isPaused) {
				offset -= SPEED;
			}

			if (!isDragging && Math.abs(velocity) > 0.1) {
				offset += velocity;
				velocity *= 0.95;
			}

			if (trackWidth > 0) {
				if (offset <= -trackWidth) offset += trackWidth;
				if (offset > 0) offset -= trackWidth;
			}

			if (trackEl) {
				trackEl.style.transform = `translateX(${offset}px)`;
			}

			rafId = requestAnimationFrame(animate);
		}

		rafId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', measure);
		};
	});

	function onPointerDown(e: PointerEvent) {
		isDragging = true;
		startX = e.clientX;
		startOffset = offset;
		lastX = e.clientX;
		lastTime = performance.now();
		velocity = 0;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const now = performance.now();
		const dt = now - lastTime;
		const dx = e.clientX - lastX;

		if (dt > 0) {
			velocity = dx / dt * 16;
		}

		offset = startOffset + (e.clientX - startX);
		lastX = e.clientX;
		lastTime = now;
	}

	function onPointerUp() {
		isDragging = false;
	}
</script>

<section class="testimonials section" id="depoimentos" aria-label="Depoimentos">
	<div class="container">
		<header class="testimonials__header">
			<h2 class="heading-section testimonials__title">Quem já orbita</h2>
			<p class="testimonials__subtitle text-muted">
				Arraste para explorar. Pare para ler.
			</p>
		</header>
	</div>

	<div
		class="testimonials__viewport"
		onmouseenter={() => (isPaused = true)}
		onmouseleave={() => {
			isPaused = false;
			isDragging = false;
		}}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		role="region"
		aria-label="Carrossel de depoimentos"
	>
		<div class="testimonials__track" bind:this={trackEl}>
			{#each [...TESTIMONIALS, ...TESTIMONIALS] as t, i}
				<blockquote class="testimonials__card" aria-hidden={i >= TESTIMONIALS.length}>
					<p class="testimonials__quote">"{t.quote}"</p>
					<footer class="testimonials__author">
						<span
							class="testimonials__avatar"
							style="--hue: {t.avatarHue}"
							aria-hidden="true"
						></span>
						<div>
							<cite class="testimonials__name">{t.name}</cite>
							<span class="testimonials__role">{t.role}</span>
						</div>
					</footer>
				</blockquote>
			{/each}
		</div>
	</div>
</section>

<style>
	.testimonials__header {
		text-align: center;
		margin-bottom: var(--sp-12);
	}

	.testimonials__title {
		font-size: clamp(2rem, 4vw, 3rem);
		margin-bottom: var(--sp-3);
	}

	.testimonials__viewport {
		overflow: hidden;
		cursor: grab;
		padding-block: var(--sp-4);
		touch-action: pan-y;
	}

	.testimonials__viewport:active {
		cursor: grabbing;
	}

	.testimonials__track {
		display: flex;
		gap: var(--sp-6);
		width: max-content;
		will-change: transform;
	}

	.testimonials__card {
		flex-shrink: 0;
		width: 360px;
		padding: var(--sp-8);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		transition: border-color var(--dur-standard);
		user-select: none;
	}

	.testimonials__card:hover {
		border-color: var(--accent-dim);
	}

	.testimonials__quote {
		font-size: 0.95rem;
		line-height: 1.7;
		margin-bottom: var(--sp-6);
		color: var(--text);
	}

	.testimonials__author {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
	}

	.testimonials__avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			hsl(var(--hue) 60% 50%),
			hsl(calc(var(--hue) + 40) 60% 40%)
		);
	}

	.testimonials__name {
		display: block;
		font-style: normal;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.testimonials__role {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.testimonials__card {
			width: 300px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.testimonials__track {
			transform: none !important;
		}

		.testimonials__viewport {
			overflow-x: auto;
		}
	}
</style>
