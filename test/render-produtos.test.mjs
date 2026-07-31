import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProdutos } from '../lib/render-produtos.mjs';

const base = {
  slug: 'qwen-02', title: 'ÓRBITA por Qwen', model: 'Qwen', accent: '#f5a83c',
  design: 18, enabled: true,
};

test('gera documento HTML completo', () => {
  const html = renderProdutos([base]);
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<\/html>\s*$/);
});

test('referencia o recorte do produto', () => {
  assert.match(renderProdutos([base]), /produto\/qwen-02\.png/);
});

test('ordena pela nota de design, maior primeiro', () => {
  const lista = [
    { ...base, slug: 'baixo', design: 9 },
    { ...base, slug: 'alto', design: 18 },
    { ...base, slug: 'meio', design: 14 },
  ];
  const ordem = [...renderProdutos(lista).matchAll(/produto\/([a-z0-9-]+)\.png/g)].map((m) => m[1]);
  assert.deepEqual(ordem, ['alto', 'meio', 'baixo']);
});

test('projeto desabilitado nao aparece', () => {
  assert.doesNotMatch(renderProdutos([{ ...base, enabled: false }]), /qwen-02/);
});

test('linka para a implementacao', () => {
  assert.match(renderProdutos([base]), /href="\/p\/qwen-02\/"/);
});

test('tem link de volta para o hub', () => {
  assert.match(renderProdutos([base]), /href="\/"/);
});

test('declara que a nota de design e julgamento estetico', () => {
  assert.match(renderProdutos([base]), /est[ée]tico/i);
});

test('omite a nota quando design é ausente', () => {
  const html = renderProdutos([{ ...base, design: undefined }]);
  assert.doesNotMatch(html, /class="prod-nota"/);
});

test('escapa HTML nos campos de texto', () => {
  const html = renderProdutos([{ ...base, model: '<script>alert(1)</script>' }]);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
});

test('nao altera o array recebido', () => {
  const lista = [{ ...base, slug: 'a', design: 9 }, { ...base, slug: 'b', design: 18 }];
  renderProdutos(lista);
  assert.deepEqual(lista.map((p) => p.slug), ['a', 'b']);
});
