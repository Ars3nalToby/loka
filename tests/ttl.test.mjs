import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
// Pull ttl() out of js/ui.js (classic browser script) and run it with a fake language setting.
const src = readFileSync(new URL('../js/ui.js', import.meta.url), 'utf8');
const body = src.match(/const CJK=[^\n]+\nfunction ttl[^\n]+/)[0];
const make = lang => new Function('S', body + '; return ttl;')({ lang });
test('bilingual titles show the reader\'s half', () => {
  assert.equal(make('zh')('Sunny room near UQ, own bathroom · 近UQ带独卫'), '近UQ带独卫');
  assert.equal(make('en')('Sunny room near UQ, own bathroom · 近UQ带独卫'), 'Sunny room near UQ, own bathroom');
  assert.equal(make('en')('近UQ带独卫 · Sunny room'), 'Sunny room');
});
test('other titles are shown exactly as written', () => {
  assert.equal(make('zh')('Master room · big'), 'Master room · big');
  assert.equal(make('en')('主卧 · 带阳台'), '主卧 · 带阳台');
  assert.equal(make('zh')('A · B · 中文'), 'A · B · 中文');
  assert.equal(make('en')(''), '');
});
