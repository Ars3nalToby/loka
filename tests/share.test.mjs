// Run: node --test   Checks the share links use Meta's documented Threads Post Intent format.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ t: (en) => en, LI: {}, ico: () => '', esc: (s) => String(s), S: { homes: [], lang: 'en' }, zone: () => 'south', ZN: { south: ['South', '南区'] },
  location: { origin: 'https://tobyloka.vercel.app', pathname: '/', hash: '' }, addEventListener: () => {}, history: {} });
for (const f of ['rules.js', 'check.js', 'share.js']) vm.runInContext(readFileSync(new URL('../js/' + f, import.meta.url), 'utf8'), ctx);
const x = { id: 'h2', rent: 230, bond: 920, adv: 2, agr: 'room', title: 'Double room', area: 'Sunnybank Hills', checks: { id: 'a', live: 'b', right: 'c' } };
test('room link is a #/room/<id> link on the live site', () => assert.equal(vm.runInContext(`roomUrl('h2')`, ctx), 'https://tobyloka.vercel.app/#/room/h2'));
test('Threads link uses the official post intent with text and url', () => {
  const u = new URL(vm.runInContext(`threadsUrl(${JSON.stringify(x)})`, ctx));
  assert.equal(u.origin + u.pathname, 'https://www.threads.com/intent/post');
  assert.equal(u.searchParams.get('url'), 'https://tobyloka.vercel.app/#/room/h2');
  assert.match(u.searchParams.get('text'), /\$230\/wk/);
  assert.match(u.searchParams.get('text'), /Loka verified/);
});
test('share text stays well under the Threads 500-character limit', () =>
  assert.ok(vm.runInContext(`shareText(${JSON.stringify({ ...x, title: 'x'.repeat(200) })})`, ctx).length < 500));
