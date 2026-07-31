import path from 'node:path';

// Constrói um app com o prefixo /p/<slug>/. O executor e a checagem de
// existência entram por injeção para que os testes não precisem rodar Vite.
//
// Cada stack resolve o prefixo de um jeito:
//   vite      — flag --base na linha de comando
//   astro     — CLI própria (`astro build`), flag --base; saída já é dist/
//   sveltekit — nem uma coisa nem outra: resolve por kit.paths.base no
//               svelte.config.js, patchado na cópia em apps/qwen-01/

export async function buildApp(project, deps) {
  const { run, exists } = deps;
  const cwd = project.dir;
  const builder = project.builder ?? 'vite';
  const outDir = project.outDir ?? (builder === 'sveltekit' ? 'build' : 'dist');

  if (!exists(path.join(cwd, 'package.json'))) {
    return { ok: false, reason: `diretório do app não encontrado: ${cwd}`, outDir };
  }

  const install = exists(path.join(cwd, 'package-lock.json'))
    ? ['ci', '--no-audit', '--no-fund']
    : ['install', '--no-audit', '--no-fund'];

  const inst = await run('npm', install, cwd);
  if (inst.code !== 0) {
    return { ok: false, reason: `instalação de dependências falhou: ${inst.stderr}`, outDir };
  }

  const base = `--base=/p/${project.slug}/`;
  const buildArgs =
    builder === 'sveltekit' ? ['--no-install', 'vite', 'build']
    : builder === 'astro' ? ['--no-install', 'astro', 'build', base]
    : ['--no-install', 'vite', 'build', base, '--outDir', outDir];

  const built = await run('npx', buildArgs, cwd);
  if (built.code !== 0) {
    return { ok: false, reason: `build falhou: ${built.stderr}`, outDir };
  }

  return { ok: true, outDir };
}
