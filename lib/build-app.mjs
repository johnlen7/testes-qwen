import path from 'node:path';

// Constrói um app com o prefixo /p/<slug>/. O executor e a checagem de
// existência entram por injeção para que os testes não precisem rodar Vite.
//
// Vite aceita o prefixo por linha de comando. SvelteKit não: ele resolve por
// kit.paths.base no svelte.config.js, patchado na cópia em apps/qwen-01/.

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

  const buildArgs = builder === 'sveltekit'
    ? ['--no-install', 'vite', 'build']
    : ['--no-install', 'vite', 'build', `--base=/p/${project.slug}/`, '--outDir', outDir];

  const built = await run('npx', buildArgs, cwd);
  if (built.code !== 0) {
    return { ok: false, reason: `build falhou: ${built.stderr}`, outDir };
  }

  return { ok: true, outDir };
}
