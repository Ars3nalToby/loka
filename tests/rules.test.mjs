// Run: node --test tests/
// Loads js/rules.js the way the browser does (a classic script in one global scope)
// and checks the Queensland limits Loka must enforce. See HANDOFF.md "Rules that must survive".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({ t: (en) => en });
vm.runInContext(readFileSync(new URL('../js/rules.js', import.meta.url), 'utf8'), ctx);
const run = (code) => vm.runInContext(code, ctx);
const gate = (rent, bond, adv, agr) => run(`publishBlock(${rent},${bond},${adv},${JSON.stringify(agr)})`);
const flags = (h) => run(`homeFlags(${JSON.stringify(h)})`);

test('limits match Queensland rules', () => {
  assert.equal(run('RULES.bondWeeks'), 4);
  assert.equal(run('RULES.advRoom'), 2);
  assert.equal(run('RULES.advFixedWeeks'), 4);
});

test('bond of exactly 4 weeks is allowed', () => assert.equal(gate(300, 1200, 2, 'room'), null));
test('bond above 4 weeks is refused', () => assert.equal(gate(300, 1201, 2, 'room'), 'bond'));
test('room agreement: 2 weeks advance allowed', () => assert.equal(gate(300, 0, 2, 'room'), null));
test('room agreement: 3 weeks advance refused', () => assert.equal(gate(300, 0, 3, 'room'), 'advance'));
test('fixed term: 4 weeks advance allowed', () => assert.equal(gate(300, 0, 4, 'fixed'), null));
test('fixed term: 5 weeks advance refused', () => assert.equal(gate(300, 0, 5, 'fixed'), 'advance'));
test('bond is checked before advance', () => assert.equal(gate(300, 2000, 9, 'room'), 'bond'));

test('homeFlags warns on a sample that breaks the rules', () => {
  const f = flags({ rent: 260, bond: 1560, adv: 4, agr: 'room', note: '' });
  assert.equal(f.length, 2);
  assert.match(f[0], /Bond is 6\.0 weeks/);
  assert.match(f[1], /4 weeks of rent in advance/);
});
test('homeFlags is quiet on a clean listing', () => {
  assert.deepEqual([...flags({ rent: 320, bond: 1280, adv: 2, agr: 'room', note: '' })], []);
});
test('sub-let by a tenant without consent is flagged', () => {
  assert.equal(flags({ rent: 300, bond: 0, adv: 0, role: 'head', consent: false }).length, 1);
});
test('job under the casual minimum is flagged', () => {
  assert.equal(run('jobFlags({pay:20,casual:true}).length'), 1);
  assert.equal(run('jobFlags({pay:40,casual:true}).length'), 0);
});
