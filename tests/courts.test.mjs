// Run: node --test   Badminton venue list: safe ids, real https links, no guessed fields, sane places.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const ctx = vm.createContext({ t: (en) => en, ico: () => '', esc: (s) => String(s), hf: {}, campus: () => null, kmBetween: () => 0, CAMPUS_SHORT: {},
  MAPBOX: { lng0: 152.955, lng1: 153.145, lat0: -27.432, lat1: -27.655 } });
vm.runInContext(readFileSync(new URL('../js/courts.js', import.meta.url), 'utf8') + ';this.C=COURTS;this.onMap=onMap;this.dirUrl=dirUrl', ctx);
const C = JSON.parse(JSON.stringify(ctx.C));
test('every venue has a safe, unique id', () => {
  const ids = C.map(c => c.id); assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[A-Za-z0-9_-]{1,40}$/);
});
test('links are https only, phone numbers are digits and spaces', () => {
  for (const c of C) { if (c.url) assert.equal(new URL(c.url).protocol, 'https:'); if (c.tel) assert.match(c.tel, /^[0-9 ]{8,14}$/); }
});
test('every venue has a name, suburb and street address, and sits in South East Queensland', () => {
  for (const c of C) { assert.ok(c.name && c.area && c.addr); assert.ok(c.lat < -27.2 && c.lat > -27.8 && c.lng > 152.8 && c.lng < 153.3, c.id); }
});
test('directions link searches the address on Google Maps', () => {
  const u = new URL(ctx.dirUrl(C[0])); assert.equal(u.hostname, 'www.google.com'); assert.equal(u.searchParams.get('query'), C[0].addr);
});
test('bilingual fields come in English + Chinese pairs', () => {
  for (const c of C) for (const k of ['note', 'price']) if (c[k]) { assert.equal(c[k].length, 2); assert.match(c[k][1], /[一-鿿]/); }
});
