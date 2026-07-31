import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../lib/build-app.mjs';

const vite = { slug: 'qwen', dir: 'apps/qwen', builder: 'vite', outDir: 'dist' };
const svelte = { slug: 'qwen-01', dir: 'apps/qwen-01', builder: 'sveltekit', outDir: 'build' };
const astro = { slug: 'kimi-qwen-code', dir: 'apps/kimi-qwen-code', builder: 'astro', outDir: 'dist' };

function fakeDeps({ codes = [0, 0], lock = true } = {}) {
  const commands = [];
  let i = 0;
  return {
    commands,
    deps: {
      run: async (cmd, args) => {
        commands.push([cmd, ...args]);
        const code = codes[i] ?? 0;
        i += 1;
        return { code, stderr: code === 0 ? '' : `falhou: ${cmd}` };
      },
      exists: (p) => (p.endsWith('package-lock.json') ? lock : true),
    },
  };
}

test('usa npm ci quando existe lockfile', async () => {
  const { deps, commands } = fakeDeps({ lock: true });
  await buildApp(vite, deps);
  assert.deepEqual(commands[0], ['npm', 'ci', '--no-audit', '--no-fund']);
});

test('usa npm install quando nao existe lockfile', async () => {
  const { deps, commands } = fakeDeps({ lock: false });
  await buildApp(vite, deps);
  assert.deepEqual(commands[0], ['npm', 'install', '--no-audit', '--no-fund']);
});

test('vite recebe base e outDir na linha de comando', async () => {
  const { deps, commands } = fakeDeps();
  await buildApp(vite, deps);
  assert.deepEqual(commands[1], [
    'npx', '--no-install', 'vite', 'build', '--base=/p/qwen/', '--outDir', 'dist',
  ]);
});

test('sveltekit nao recebe base nem outDir', async () => {
  const { deps, commands } = fakeDeps();
  await buildApp(svelte, deps);
  assert.deepEqual(commands[1], ['npx', '--no-install', 'vite', 'build']);
});

test('astro usa a CLI propria e recebe base', async () => {
  const { deps, commands } = fakeDeps();
  await buildApp(astro, deps);
  assert.deepEqual(commands[1], [
    'npx', '--no-install', 'astro', 'build', '--base=/p/kimi-qwen-code/',
  ]);
});

test('astro nao recebe outDir na linha de comando', async () => {
  // O default do Astro ja e dist/ e a flag nao e suportada de forma estavel.
  const { deps, commands } = fakeDeps();
  await buildApp(astro, deps);
  assert.ok(!commands[1].includes('--outDir'));
  assert.equal((await buildApp(astro, fakeDeps().deps)).outDir, 'dist');
});

test('devolve o outDir do projeto', async () => {
  const { deps } = fakeDeps();
  assert.equal((await buildApp(svelte, deps)).outDir, 'build');
  assert.equal((await buildApp(vite, fakeDeps().deps)).outDir, 'dist');
});

test('assume vite e dist quando o manifesto omite', async () => {
  const { deps, commands } = fakeDeps();
  const res = await buildApp({ slug: 'x', dir: 'apps/x' }, deps);
  assert.equal(res.outDir, 'dist');
  assert.ok(commands[1].includes('--base=/p/x/'));
});

test('retorna ok em caso de sucesso', async () => {
  const { deps } = fakeDeps({ codes: [0, 0] });
  assert.equal((await buildApp(vite, deps)).ok, true);
});

test('falha de instalacao aborta antes do build', async () => {
  const { deps, commands } = fakeDeps({ codes: [1] });
  const res = await buildApp(vite, deps);
  assert.equal(res.ok, false);
  assert.match(res.reason, /instala/i);
  assert.equal(commands.length, 1);
});

test('falha de build retorna motivo', async () => {
  const { deps } = fakeDeps({ codes: [0, 1] });
  const res = await buildApp(vite, deps);
  assert.equal(res.ok, false);
  assert.match(res.reason, /build/i);
});

test('diretorio ausente falha sem rodar comando', async () => {
  const commands = [];
  const deps = {
    run: async (...a) => { commands.push(a); return { code: 0, stderr: '' }; },
    exists: () => false,
  };
  const res = await buildApp(vite, deps);
  assert.equal(res.ok, false);
  assert.match(res.reason, /não encontrado/i);
  assert.equal(commands.length, 0);
});
