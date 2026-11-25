// Shared room links (#/room/<id>) must work for a first-time visitor: the room list comes from the
// database a moment after the page opens, so "not found" may only be said after dbLoad() has answered.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function load(dbOn) {
  const calls = { detail: [], toast: [] }, hist = [];
  const ctx = vm.createContext({
    t: (en) => en, esc: String, S: { homes: [] }, tab: 'home', render() {}, scrollTo() {},
    homeDetail: (id) => calls.detail.push(id), toast: (m) => calls.toast.push(m),
    authReady: () => true, DB: { on: dbOn }, addEventListener() {}, LI: {},
    location: { hash: '#/room/abc', pathname: '/', search: '', origin: 'https://lokabne.au' },
    history: { replaceState: (a, b, u) => hist.push(u) },
  });
  vm.runInContext(readFileSync(new URL('../js/share.js', import.meta.url), 'utf8'), ctx);
  return { ctx, calls, run: (c) => vm.runInContext(c, ctx) };
}
test('first visit: waits for the database, then opens the room', () => {
  const { run, calls } = load(false);
  run('openFromHash()');
  assert.equal(calls.detail.length, 0);
  assert.ok(!calls.toast.some((m) => /not on Loka/.test(m)), 'must not say "not found" before the database answers');
  run("S.homes=[{id:'abc'}]; openPendingRoom()");
  assert.deepEqual(calls.detail, ['abc']);
});
test('room really missing: says so once the database has answered', () => {
  const { run, calls } = load(false);
  run('openFromHash(); openPendingRoom()');
  assert.ok(calls.toast.some((m) => /not on Loka/.test(m)));
});
test('database already loaded: answers at once', () => {
  const { run, calls } = load(true);
  run('openFromHash()');
  assert.ok(calls.toast.some((m) => /not on Loka/.test(m)));
});
