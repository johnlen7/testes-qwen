import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPaths } from '../lib/check-paths.mjs';

test('aprova caminho relativo', () => {
  const html = '<script src="./assets/index-abc.js"></script>';
  assert.deepEqual(checkPaths(html, 'qwen'), []);
});

test('aprova caminho absoluto sob o proprio prefixo', () => {
  const html = '<script src="/p/qwen/assets/index-abc.js"></script>';
  assert.deepEqual(checkPaths(html, 'qwen'), []);
});

test('aprova _app do sveltekit sob o proprio prefixo', () => {
  const html = '<link href="/p/qwen-01/_app/immutable/entry/start.js">';
  assert.deepEqual(checkPaths(html, 'qwen-01'), []);
});

test('rejeita caminho absoluto na raiz do dominio', () => {
  const html = '<script src="/assets/index-abc.js"></script>';
  const found = checkPaths(html, 'qwen');
  assert.equal(found.length, 1);
  assert.match(found[0], /\/assets\/index-abc\.js/);
});

test('rejeita caminho absoluto de outro projeto', () => {
  const html = '<link href="/p/flash/assets/style.css">';
  assert.equal(checkPaths(html, 'qwen').length, 1);
});

test('nao confunde prefixo parcial de outro slug', () => {
  // /p/qwen-01/ nao pode passar por ser validado contra o slug 'qwen'.
  const html = '<script src="/p/qwen-01/assets/a.js"></script>';
  assert.equal(checkPaths(html, 'qwen').length, 1);
});

test('aprova URL externa', () => {
  const html = '<link href="https://fonts.googleapis.com/css2?family=Inter">';
  assert.deepEqual(checkPaths(html, 'qwen'), []);
});

test('aprova data URI', () => {
  const html = `<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">`;
  assert.deepEqual(checkPaths(html, 'qwen'), []);
});

test('aprova ancora de fragmento', () => {
  const html = '<a href="#main">pular</a>';
  assert.deepEqual(checkPaths(html, 'qwen'), []);
});

test('aprova URL protocol-relative', () => {
  const html = '<script src="//cdn.exemplo.com/x.js"></script>';
  assert.deepEqual(checkPaths(html, 'qwen'), []);
});

test('reporta todas as violacoes, nao apenas a primeira', () => {
  const html = '<script src="/assets/a.js"></script><link href="/assets/b.css">';
  assert.equal(checkPaths(html, 'qwen').length, 2);
});
