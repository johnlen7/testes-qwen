import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderHub } from '../lib/render-hub.mjs';

const projeto = {
  slug: 'qwen',
  title: 'ÓRBITA por Qwen',
  model: 'Qwen',
  score: 86,
  accent: '#ff5c1a',
  stack: 'vanilla TS · Vite',
  date: '2026-07-23',
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

test('mostra a stack do projeto', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /vanilla TS · Vite/);
});

test('mostra a data do projeto em formato brasileiro', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /23\/07\/2026/);
});

test('usa datetime ISO no elemento time', () => {
  const html = renderHub([projeto], ok);
  assert.match(html, /<time[^>]*datetime="2026-07-23"/);
});

test('omite stack e data quando ausentes', () => {
  const semMeta = { ...projeto, stack: undefined, date: undefined };
  const html = renderHub([semMeta], ok);
  assert.doesNotMatch(html, /class="card-tech"/);
});

test('cabecalho traz a data da avaliacao', () => {
  const html = renderHub([projeto], ok, { avaliadoEm: '2026-07-31' });
  assert.match(html, /31\/07\/2026/);
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

function ordemDe(html) {
  return [...html.matchAll(/href="\/p\/([^/]+)\//g)].map((m) => m[1]);
}

test('ordena por nota, da maior para a menor', () => {
  const lista = [
    { ...projeto, slug: 'baixo', score: 70 },
    { ...projeto, slug: 'alto', score: 93 },
    { ...projeto, slug: 'meio', score: 86 },
  ];
  const status = new Map(lista.map((p) => [p.slug, { ok: true }]));
  assert.deepEqual(ordemDe(renderHub(lista, status)), ['alto', 'meio', 'baixo']);
});

test('empate preserva a ordem do manifesto', () => {
  const lista = [
    { ...projeto, slug: 'primeiro', score: 88 },
    { ...projeto, slug: 'segundo', score: 88 },
  ];
  const status = new Map(lista.map((p) => [p.slug, { ok: true }]));
  assert.deepEqual(ordemDe(renderHub(lista, status)), ['primeiro', 'segundo']);
});

test('projeto sem nota vai para o fim', () => {
  const lista = [
    { ...projeto, slug: 'sem-nota', score: null },
    { ...projeto, slug: 'com-nota', score: 70 },
  ];
  const status = new Map(lista.map((p) => [p.slug, { ok: true }]));
  assert.deepEqual(ordemDe(renderHub(lista, status)), ['com-nota', 'sem-nota']);
});

test('ordenar nao altera o array recebido', () => {
  const lista = [
    { ...projeto, slug: 'baixo', score: 70 },
    { ...projeto, slug: 'alto', score: 93 },
  ];
  const status = new Map(lista.map((p) => [p.slug, { ok: true }]));
  renderHub(lista, status);
  assert.deepEqual(lista.map((p) => p.slug), ['baixo', 'alto']);
});

test('mostra a posicao no ranking', () => {
  const lista = [
    { ...projeto, slug: 'alto', score: 93 },
    { ...projeto, slug: 'baixo', score: 70 },
  ];
  const status = new Map(lista.map((p) => [p.slug, { ok: true }]));
  const html = renderHub(lista, status);
  assert.match(html, /class="card-rank">1</);
  assert.match(html, /class="card-rank">2</);
});
