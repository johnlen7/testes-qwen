<script lang="ts">
	import { onMount, tick } from 'svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const LINKS = [
		{ href: '#como-funciona', label: 'Como funciona' },
		{ href: '#recursos', label: 'Recursos' },
		{ href: '#configurador', label: 'Configurador' },
		{ href: '#faq', label: 'FAQ' }
	];

	let scrolled = $state(false);
	let menuOpen = $state(false);
	let activeId = $state('');
	let burgerEl: HTMLButtonElement;
	let mobileNavEl: HTMLElement;

	onMount(() => {
		let raf = 0;
		function onScroll() {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				scrolled = window.scrollY > 16;
			});
		}
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		const spy = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '-30% 0px -60% 0px' }
		);
		for (const link of LINKS) {
			const el = document.getElementById(link.href.slice(1));
			if (el) spy.observe(el);
		}

		return () => {
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(raf);
			spy.disconnect();
		};
	});

	$effect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	async function toggleMenu() {
		menuOpen = !menuOpen;
		if (menuOpen) {
			await tick();
			mobileNavEl?.querySelector('a')?.focus();
		}
	}

	function closeMenu() {
		menuOpen = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) {
			menuOpen = false;
			burgerEl?.focus();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<header class="header" class:scrolled class:menu-open={menuOpen}>
	<div class="header__inner container">
		<a href="#top" class="header__logo" aria-label="ÓRBITA, voltar ao topo">
			<svg class="header__logo-mark" viewBox="0 0 24 24" aria-hidden="true">
				<ellipse
					cx="12"
					cy="12"
					rx="10"
					ry="4.5"
					fill="none"
					stroke="var(--accent)"
					stroke-width="1.5"
					transform="rotate(-24 12 12)"
				/>
				<circle cx="12" cy="12" r="4" fill="currentColor" />
			</svg>
			<span class="heading-display">ÓRBITA</span>
		</a>

		<nav class="header__nav" aria-label="Navegação principal">
			{#each LINKS as link}
				<a
					href={link.href}
					class="header__link"
					class:active={activeId === link.href.slice(1)}
					aria-current={activeId === link.href.slice(1) ? 'true' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="header__actions">
			<ThemeToggle />
			<a href="#configurador" class="header__cta">Comprar</a>
			<button
				class="header__burger"
				class:open={menuOpen}
				bind:this={burgerEl}
				aria-expanded={menuOpen}
				aria-controls="menu-mobile"
				aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
				onclick={toggleMenu}
			>
				<span></span>
				<span></span>
			</button>
		</div>
	</div>
</header>

<div class="mobile-menu" id="menu-mobile" class:open={menuOpen} inert={!menuOpen}>
	<nav class="mobile-menu__nav" aria-label="Navegação do menu" bind:this={mobileNavEl}>
		{#each LINKS as link, i}
			<a
				href={link.href}
				class="mobile-menu__link"
				style="--d: {menuOpen ? 120 + i * 60 : 0}ms"
				onclick={closeMenu}
			>
				{link.label}
			</a>
		{/each}
	</nav>
	<a
		href="#configurador"
		class="mobile-menu__cta"
		style="--d: {menuOpen ? 120 + LINKS.length * 60 : 0}ms"
		onclick={closeMenu}
	>
		Comprar ÓRBITA
	</a>
</div>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 200;
		border-bottom: 1px solid transparent;
		transition: background-color var(--dur-standard) var(--ease-in-out),
			border-color var(--dur-standard) var(--ease-in-out);
		animation: header-in var(--dur-dramatic) var(--ease-out-expo) both;
	}

	@keyframes header-in {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: none;
		}
	}

	.header.scrolled {
		background: color-mix(in srgb, var(--bg) 82%, transparent);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-bottom-color: var(--border);
	}

	.header.menu-open {
		background: var(--bg);
	}

	.header__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-6);
		height: var(--header-h);
	}

	.header__logo {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		color: var(--text);
		transition: color var(--dur-micro);
	}

	.header__logo span {
		font-size: 1.05rem;
		letter-spacing: 0.04em;
	}

	.header__logo-mark {
		width: 22px;
		height: 22px;
		transition: transform var(--dur-dramatic) var(--ease-out-expo);
	}

	.header__logo:hover .header__logo-mark {
		transform: rotate(180deg);
	}

	.header__nav {
		display: flex;
		align-items: center;
		gap: var(--sp-8);
	}

	.header__link {
		position: relative;
		padding: var(--sp-2) 0;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-muted);
		transition: color var(--dur-micro);
	}

	.header__link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 2px;
		border-radius: 1px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-standard) var(--ease-out-expo);
	}

	.header__link:hover {
		color: var(--text);
	}

	.header__link:hover::after,
	.header__link.active::after {
		transform: scaleX(1);
	}

	.header__link.active {
		color: var(--text);
	}

	.header__actions {
		display: flex;
		align-items: center;
		gap: var(--sp-3);
	}

	.header__cta {
		padding: var(--sp-2) var(--sp-6);
		background: var(--accent);
		color: #0a0a0f;
		font-weight: 600;
		font-size: 0.85rem;
		border-radius: 100px;
		transition: transform var(--dur-micro) var(--ease-out-back),
			box-shadow var(--dur-standard) var(--ease-out-expo);
	}

	.header__cta:hover {
		transform: scale(1.05);
		box-shadow: 0 0 24px rgba(232, 160, 64, 0.3);
	}

	.header__burger {
		display: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--surface);
		border: 1px solid var(--border);
		transition: border-color var(--dur-micro);
	}

	.header__burger:hover {
		border-color: var(--accent);
	}

	.header__burger span {
		display: block;
		width: 18px;
		height: 2px;
		border-radius: 1px;
		background: var(--text);
		transition: transform var(--dur-standard) var(--ease-out-expo);
	}

	.header__burger.open span:nth-child(1) {
		transform: translateY(4px) rotate(45deg);
	}

	.header__burger.open span:nth-child(2) {
		transform: translateY(-4px) rotate(-45deg);
	}

	.mobile-menu {
		position: fixed;
		inset: 0;
		z-index: 150;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: calc(var(--header-h) + var(--sp-12)) var(--sp-6) var(--sp-12);
		background: var(--bg);
		visibility: hidden;
		opacity: 0;
		transition: opacity var(--dur-standard) var(--ease-in-out),
			visibility 0s linear var(--dur-standard);
	}

	.mobile-menu.open {
		visibility: visible;
		opacity: 1;
		transition: opacity var(--dur-standard) var(--ease-in-out);
	}

	.mobile-menu__nav {
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
	}

	.mobile-menu__link {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(2rem, 9vw, 3rem);
		line-height: 1.3;
		color: var(--text);
		opacity: 0;
		transform: translateY(24px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo) var(--d, 0ms),
			transform var(--dur-dramatic) var(--ease-out-expo) var(--d, 0ms),
			color var(--dur-micro);
	}

	.mobile-menu.open .mobile-menu__link {
		opacity: 1;
		transform: none;
	}

	.mobile-menu__link:hover {
		color: var(--accent);
	}

	.mobile-menu__cta {
		align-self: flex-start;
		padding: var(--sp-4) var(--sp-8);
		background: var(--accent);
		color: #0a0a0f;
		font-weight: 600;
		border-radius: 100px;
		opacity: 0;
		transform: translateY(24px);
		transition: opacity var(--dur-dramatic) var(--ease-out-expo) var(--d, 0ms),
			transform var(--dur-dramatic) var(--ease-out-expo) var(--d, 0ms);
	}

	.mobile-menu.open .mobile-menu__cta {
		opacity: 1;
		transform: none;
	}

	@media (max-width: 768px) {
		.header__nav,
		.header__cta {
			display: none;
		}

		.header__burger {
			display: flex;
		}
	}

	@media (min-width: 769px) {
		.mobile-menu {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.header {
			animation: none;
		}

		.mobile-menu,
		.mobile-menu__link,
		.mobile-menu__cta {
			transition: none;
		}
	}
</style>
