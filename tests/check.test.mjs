// Run: node --test   Loads rules.js + check.js like the browser (shared global scope).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ t: (en) => en, LI: {}, ico: () => '', esc: (s) => String(s), S: { homes: [], lang: 'en' }, zone: () => 'south', ZN: { south: ['South', '南区'] } });
for (const f of ['rules.js', 'check.js']) vm.runInContext(readFileSync(new URL('../js/' + f, import.meta.url), 'utf8'), ctx);
const run = (c) => vm.runInContext(c, ctx);
const clean = { id: 'x1', rent: 300, bond: 1200, adv: 2, agr: 'room', note: '' };

test('daily code: format LK-XXXX', () => assert.match(run(`lokaCode('h1',new Date(2026,10,17))`), /^LK-[A-Z0-9]{4}$/));
test('daily code: same listing, same day = same code', () =>
  assert.equal(run(`lokaCode('h1',new Date(2026,10,17,9))`), run(`lokaCode('h1',new Date(2026,10,17,22))`)));
test('daily code: changes the next day', () =>
  assert.notEqual(run(`lokaCode('h1',new Date(2026,10,17))`), run(`lokaCode('h1',new Date(2026,10,18))`)));
test('daily code: differs between listings', () =>
  assert.notEqual(run(`lokaCode('h1',new Date(2026,10,17))`), run(`lokaCode('h2',new Date(2026,10,17))`)));
test('verified needs all four checks', () => {
  assert.equal(run(`checkState(${JSON.stringify({ ...clean, checks: { id: '1/11', live: '1/11' } })}).all`), false);
  assert.equal(run(`checkState(${JSON.stringify({ ...clean, checks: { id: '1/11', live: '1/11', right: '2/11' } })}).all`), true);
});
test('a rule break fails the terms check even with every manual check done', () => {
  const s = run(`checkState(${JSON.stringify({ ...clean, bond: 1800, checks: { id: 'a', live: 'b', right: 'c' } })})`);
  assert.equal(s.c.terms, false); assert.equal(s.all, false); assert.equal(s.done, 3);
});
test('old saved data with verified:true counts as all manual checks', () =>
  assert.equal(run(`checkState(${JSON.stringify({ ...clean, verified: true, vdate: '1/1/2026' })}).all`), true));
