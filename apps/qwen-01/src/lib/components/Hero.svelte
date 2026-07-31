<script lang="ts">
	import { onMount } from 'svelte';
	import HeadphoneSVG from './HeadphoneSVG.svelte';
	import { prefersReducedMotion } from '$lib/utils/animation';

	let canvasEl: HTMLCanvasElement;
	let heroEl: HTMLElement;
	let mouseX = $state(0);
	let mouseY = $state(0);
	let entered = $state(false);
	let rafId: number;

	const parallaxX = $derived(mouseX * 12);
	const parallaxY = $derived(mouseY * 8);

	onMount(() => {
		entered = true;

		if (prefersReducedMotion()) return;

		const canvas = canvasEl;
		const ctx = canvas.getContext('2d')!;
		let particles: Array<{
			angle: number;
			radius: number;
			speed: number;
			size: number;
			opacity: number;
			radiusY: number;
		}> = [];

		function resize() {
			const rect = canvas.parentElement!.getBoundingClientRect();
			canvas.width = rect.width * devicePixelRatio;
			canvas.height = rect.height * devicePixelRatio;
			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;
			ctx.scale(devicePixelRatio, devicePixelRatio);
		}

		function initParticles() {
			particles = Array.from({ length: 40 }, () => ({
				angle: Math.random() * Math.PI * 2,
				radius: 100 + Math.random() * 120,
				radiusY: 60 + Math.random() * 80,
				speed: (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1),
				size: 1 + Math.random() * 2,
				opacity: 0.2 + Math.random() * 0.5
			}));
		}

		function draw() {
			const w = canvas.width / devicePixelRatio;
			const h = canvas.height / devicePixelRatio;
			ctx.clearRect(0, 0, w, h);

			const cx = w / 2;
			const cy = h / 2;

			for (const p of particles) {
				p.angle += p.speed * 0.008;
				const x = cx + Math.cos(p.angle) * p.radius;
				const y = cy + Math.sin(p.angle) * p.radiusY;

				ctx.beginPath();
				ctx.arc(x, y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(232, 160, 64, ${p.opacity})`;
				ctx.fill();
			}

			rafId = requestAnimationFrame(draw);
		}

		resize();
		initParticles();
		draw();

		window.addEventListener('resize', resize);
		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
		};
	});

	function onMouseMove(e: MouseEvent) {
		if (prefersReducedMotion()) return;
		const rect = heroEl.getBoundingClientRect();
		mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
		mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
	}
</script>

<section class="hero" aria-label="ÓRBITA — fone de ouvido premium" bind:this={heroEl} onmousemove={onMouseMove}>
	<canvas class="hero__particles" bind:this={canvasEl} aria-hidden="true"></canvas>

	<div class="hero__content container">
		<div class="hero__text">
			<p class="hero__eyebrow" class:entered>
				Cancelamento de ruído adaptativo espacial
			</p>
			<h1 class="hero__title heading-display" class:entered>
				ÓRBITA
			</h1>
			<p class="hero__subtitle" class:entered>
				Silêncio absoluto. Som infinito. O primeiro fone que mapeia o espaço ao seu redor e cria uma órbita de silêncio só sua.
			</p>
			<div class="hero__actions" class:entered>
				<a href="#configurador" class="hero__cta">
					Configurar o seu
				</a>
				<a href="#como-funciona" class="hero__cta-secondary">
					Como funciona ↓
				</a>
			</div>
		</div>

		<div
			class="hero__visual"
			class:entered
			style="transform: translate3d({parallaxX}px, {parallaxY}px, 0)"
		>
			<HeadphoneSVG class="hero__headphone" />
		</div>
	</div>

	<div class="hero__scroll-hint" aria-hidden="true">
		<span class="hero__scroll-line"></span>
	</div>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.hero__particles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.hero__content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		gap: var(--sp-12);
		position: relative;
		z-index: 1;
	}

	.hero__eyebrow {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--accent);
		margin-bottom: var(--sp-4);
		opacity: 0;
		transform: translateY(20px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo),
			transform var(--dur-dramatic) var(--ease-out-expo);
	}

	.hero__title {
		font-size: clamp(4rem, 12vw, 8rem);
		color: var(--text);
		margin-bottom: var(--sp-4);
		opacity: 0;
		transform: translateY(30px);
		transition: opacity var(--dur-cinematic) var(--ease-out-expo) 100ms,
			transform var(--dur-cinematic) var(--ease-out-expo) 100ms;
	}

	.hero__subtitle {
		font-size: clamp(1rem, 2vw, 1.25rem);
		color: var(--text-muted);
		max-width: 32ch;
		line-height: 1.7;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo) 300ms,
			transform var(--dur-dramatic) var(--ease-out-expo) 300ms;
	}

	.hero__actions {
		display: flex;
		gap: var(--sp-4);
		margin-top: var(--sp-8);
		flex-wrap: wrap;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo) 500ms,
			transform var(--dur-dramatic) var(--ease-out-expo) 500ms;
	}

	.hero__cta {
		display: inline-flex;
		align-items: center;
		padding: var(--sp-4) var(--sp-8);
		background: var(--accent);
		color: #0a0a0f;
		font-weight: 600;
		font-size: 0.95rem;
		border-radius: 100px;
		transition: transform var(--dur-micro) var(--ease-out-back),
			box-shadow var(--dur-standard) var(--ease-out-expo);
	}

	.hero__cta:hover {
		transform: scale(1.05);
		box-shadow: 0 0 30px rgba(232, 160, 64, 0.3);
	}

	.hero__cta-secondary {
		display: inline-flex;
		align-items: center;
		padding: var(--sp-4) var(--sp-8);
		color: var(--text-muted);
		font-weight: 500;
		font-size: 0.95rem;
		border-radius: 100px;
		border: 1px solid var(--border);
		transition: color var(--dur-micro), border-color var(--dur-micro);
	}

	.hero__cta-secondary:hover {
		color: var(--text);
		border-color: var(--text-muted);
	}

	.hero__visual {
		display: flex;
		justify-content: center;
		opacity: 0;
		transform: translateY(40px) scale(0.9);
		transition: opacity var(--dur-cinematic) var(--ease-out-expo) 400ms,
			transform var(--dur-cinematic) var(--ease-out-expo) 400ms;
		will-change: transform;
	}

	:global(.hero__headphone) {
		width: min(100%, 420px);
	}

	.entered {
		opacity: 1 !important;
		transform: translateY(0) scale(1) !important;
	}

	.hero__scroll-hint {
		position: absolute;
		bottom: var(--sp-8);
		left: 50%;
		transform: translateX(-50%);
	}

	.hero__scroll-line {
		display: block;
		width: 1px;
		height: 48px;
		background: linear-gradient(to bottom, var(--accent), transparent);
		animation: scroll-hint 2s var(--ease-in-out) infinite;
	}

	@keyframes scroll-hint {
		0% {
			opacity: 0;
			transform: scaleY(0);
			transform-origin: top;
		}
		50% {
			opacity: 1;
			transform: scaleY(1);
			transform-origin: top;
		}
		100% {
			opacity: 0;
			transform: scaleY(1);
			transform-origin: bottom;
		}
	}

	@media (max-width: 768px) {
		.hero__content {
			grid-template-columns: 1fr;
			text-align: center;
			padding-top: var(--sp-24);
		}

		.hero__subtitle {
			margin-inline: auto;
		}

		.hero__actions {
			justify-content: center;
		}

		.hero__visual {
			order: -1;
		}

		:global(.hero__headphone) {
			width: min(100%, 280px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero__eyebrow,
		.hero__title,
		.hero__subtitle,
		.hero__actions,
		.hero__visual {
			opacity: 1;
			transform: none;
			transition: none;
		}

		.hero__scroll-line {
			animation: none;
			opacity: 0.5;
		}
	}
</style>
