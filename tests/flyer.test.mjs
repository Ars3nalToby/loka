// Noticeboard flyers (js/flyer.js): the place tag can never carry personal data, first tag wins,
// and the QR links open the right place.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const src = readFileSync(new URL('../js/flyer.js', import.meta.url), 'utf8');
function load(search = '', hash = '', store = {}) {
  const calls = [];
  const ctx = vm.createContext({
    t: (en) => en, esc: (s) => String(s), URLSearchParams, Date,
    location: { origin: 'https://lokabne.au', pathname: '/', search, hash },
    history: { replaceState: (_a, _b, u) => calls.push(u) },
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  });
  vm.runInContext(src, ctx);
  return { ctx, store, calls, run: (c) => vm.runInContext(c, ctx) };
}

test('tags keep only lowercase letters, digits and dashes (max 24)', () => {
  const { run } = load();
  assert.equal(run('srcClean("Sunnybank Plaza")'), 'sunnybank-plaza');
  assert.equal(run('srcClean("<script>alert(1)</script>")'), 'scriptalert1script');
  assert.equal(run('srcClean("a@b.com 0412 345 678")'), 'abcom-0412-345-678'.slice(0, 24));
  assert.equal(run('srcClean("微信")'), '');
  assert.ok(run('srcClean("x".repeat(99))').length <= 24);
});
test('QR links: landlord opens the List form, renter opens 求租', () => {
  const { run } = load();
  assert.equal(run('flyerUrl("landlord","Market Square")'), 'https://lokabne.au/?src=market-square#/go/list');
  assert.equal(run('flyerUrl("renter","")'), 'https://lokabne.au/?src=flyer#/go/wanted');
});
test('arriving with ?src keeps the tag on this device and removes it from the address bar', () => {
  const { run, calls } = load('?src=sunnybank-plaza', '#/go/list');
  assert.equal(run('srcGet()'), 'sunnybank-plaza');
  assert.deepEqual(JSON.parse(JSON.stringify(run('srcData()'))), { src: 'sunnybank-plaza' });
  assert.equal(calls[0], '/#/go/list');
});
test('other query parameters (sign-in ?code=) survive', () => {
  const { calls } = load('?code=abc&src=uq', '');
  assert.equal(calls[0], '/?code=abc');
});
test('first tag wins; no tag means no metadata', () => {
  const a = load('?src=first');
  const a2 = load('?src=second', '', a.store); // second visit on the same device
  assert.equal(a2.run('srcGet()'), 'first');
  const b = load('');
  assert.equal(b.run('srcData()'), undefined);
});
test('a tag older than 60 days is ignored', () => {
  const { run, store } = load();
  store['loka-src'] = JSON.stringify({ s: 'old', at: Date.now() - 61 * 864e5 });
  assert.equal(run('srcGet()'), '');
});
