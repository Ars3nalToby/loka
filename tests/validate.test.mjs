// Run: node --test   Records from other phones or a server must never crash Loka or carry markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ S: {}, seed: () => ({ homes: [] }), Date });
vm.runInContext(`const HT={room:1,unit:1,student:1},LEVEL={easy:1,mid:1,hard:1},SPORT={bad:1,run:1,ride:1,social:1},ROLE={owner:1,head:1,agent:1};`, ctx);
vm.runInContext(readFileSync(new URL('../js/validate.js', import.meta.url), 'utf8'), ctx);
const clean = (d) => JSON.parse(JSON.stringify(vm.runInContext(`cleanData(${JSON.stringify(d)})`, ctx)));

test('drops records with unsafe or duplicate ids', () => {
  const d = clean({ homes: [{ id: 'h1' }, { id: '"><img src=x>' }, { id: 'h1' }, { id: '' }, null, 'x'] });
  assert.deepEqual(d.homes.map(h => h.id), ['h1']);
});
test('unknown enum values fall back to safe defaults', () => {
  const d = clean({ homes: [{ id: 'a', type: 'castle', agr: 'forever', role: 'king' }], squads: [{ id: 's', sport: 'chess', level: 'god' }] });
  assert.equal(d.homes[0].type, 'room'); assert.equal(d.homes[0].agr, 'room'); assert.equal(d.homes[0].role, '');
  assert.equal(d.squads[0].sport, 'social'); assert.equal(d.squads[0].level, 'easy');
});
test('numbers are finite and in range', () => {
  const h = clean({ homes: [{ id: 'a', rent: 'abc', bond: -5, adv: 1e9 }] }).homes[0];
  assert.equal(h.rent, 0); assert.equal(h.bond, 0); assert.equal(h.adv, 52);
});
test('long text is cut', () => assert.equal(clean({ homes: [{ id: 'a', title: 'x'.repeat(5000) }] }).homes[0].title.length, 140));
test('squad players keep name and paid status; plain names are upgraded', () => {
  const q = clean({ squads: [{ id: 's', players: ['Mei', { n: 'Kel', paid: true }, { n: '' }, 5] }] }).squads[0];
  assert.deepEqual(q.players, [{ n: 'Mei', paid: false }, { n: 'Kel', paid: true }]);
});
test('reports must point at a real list', () =>
  assert.deepEqual(clean({ reports: [{ k: 'homes', id: 'h1' }, { k: '__proto__', id: 'h1' }, { k: 'homes', id: '<b>' }] }).reports.map(r => r.k), ['homes']));
test('garbage in, a usable object out', () => { const d = clean(null); assert.ok(Array.isArray(d.homes)); });
