import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHub } from '../lib/render-hub.mjs';

const projeto = {
  slug: 'qwen',
  title: 'ÓRBITA por Qwen',
  model: 'Qwen',
  score: 86,
  accent: '#ff5c1a',
  enabled: true,
};

const ok = new Map([['qwen', { ok: true }]]);

test('gera documento HTML completo', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<\/html>\s*$/);
  assert.match(html, /lang="pt-BR"/);
});

test('projeto construido vira link para /p/<slug>/', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /href="\/p\/qwen\/"/);
});

test('mostra modelo e nota', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /Qwen/);
  assert.match(html, /86/);
});

test('omite a nota quando é null', () => {
  const html = renderHub([{ ...projeto, score: null }], ok);
  assert.doesNotMatch(html, /class="card-score"/);
});

test('declara que as notas sao preliminares', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /preliminar/i);
});

test('projeto desabilitado nao aparece', () => {
  const html = renderHub([{ ...projeto, enabled: false }], new Map());
  assert.doesNotMatch(html, /ÓRBITA por Qwen/);
});

test('build falhado vira card sem link', () => {
  const falhou = new Map([['qwen', { ok: false, reason: 'npm ci deu erro' }]]);
  const html = renderHub([projeto], falhou);
  assert.doesNotMatch(html, /href="\/p\/qwen\/"/);
  assert.match(html, /indisponível/i);
});

test('escapa HTML nos campos de texto', () => {
  const perigoso = { ...projeto, title: 'ÓRBITA <script>alert(1)</script>' };
  const html = renderHub([perigoso], ok);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('injeta a cor de destaque como custom property', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /--accent:\s*#ff5c1a/);
});

test('referencia o screenshot do projeto', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /shots\/qwen\.png/);
});

test('preserva a ordem do array', () => {
  const lista = [
    projeto,
    { ...projeto, slug: 'flash', title: 'ÓRBITA por Flash' },
    { ...projeto, slug: 'qwen-flash', title: 'ÓRBITA por Qwen Flash' },
  ];
  const status = new Map(lista.map((p) => [p.slug, { ok: true }]));
  const html = renderHub(lista, status);
  const ordem = [...html.matchAll(/href="\/p\/([^/]+)\//g)].map((m) => m[1]);
  assert.deepEqual(ordem, ['qwen', 'flash', 'qwen-flash']);
});
