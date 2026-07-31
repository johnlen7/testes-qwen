<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import ScrollTelling from '$lib/components/ScrollTelling.svelte';
	import Configurator from '$lib/components/Configurator.svelte';
	import Features from '$lib/components/Features.svelte';
	import Testimonials from '$lib/components/Testimonials.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import FinalCTA from '$lib/components/FinalCTA.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<svelte:head>
	<title>ÓRBITA — Silêncio Absoluto. Som Infinito.</title>
</svelte:head>

<main id="conteudo" tabindex="-1">
	<Hero />
	<ScrollTelling />
	<Configurator />
	<Features />
	<Testimonials />
	<FAQ />
	<FinalCTA />
</main>

<SiteFooter />
