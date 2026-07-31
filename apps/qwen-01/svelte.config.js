import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
		// Vitrine ÓRBITA: este app é servido em /p/qwen-01/. O SvelteKit não
		// aceita o prefixo por linha de comando como o Vite aceita via --base,
		// então ele precisa estar aqui. Esta é a única edição feita numa cópia
		// em apps/ — o diretório original novo-desafio/qwen-01 não foi tocado.
		paths: { base: '/p/qwen-01' }
	}
};

export default config;
