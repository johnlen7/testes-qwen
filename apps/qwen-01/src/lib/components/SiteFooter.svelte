<footer class="footer">
	<div class="container footer__inner">
		<div class="footer__brand">
			<span class="footer__logo heading-display">ÓRBITA</span>
			<p class="footer__tagline text-muted">Silêncio absoluto. Som infinito.</p>
		</div>

		<nav class="footer__nav" aria-label="Links do rodapé">
			<a href="#como-funciona" class="footer__link">Como funciona</a>
			<a href="#configurador" class="footer__link">Configurador</a>
			<a href="#faq" class="footer__link">FAQ</a>
		</nav>

		<p class="footer__legal text-muted">
			Produto fictício para fins de demonstração. © 2026 ÓRBITA Audio.
		</p>
	</div>
</footer>

<style>
	.footer {
		padding-block: var(--sp-12);
		border-top: 1px solid var(--border);
	}

	.footer__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sp-6);
		text-align: center;
	}

	.footer__logo {
		font-size: 1.2rem;
		color: var(--accent);
	}

	.footer__tagline {
		font-size: 0.85rem;
		margin-top: var(--sp-1);
	}

	.footer__nav {
		display: flex;
		gap: var(--sp-6);
	}

	.footer__link {
		font-size: 0.85rem;
		color: var(--text-muted);
		transition: color var(--dur-micro);
	}

	.footer__link:hover {
		color: var(--text);
	}

	.footer__legal {
		font-size: 0.75rem;
	}
</style>
