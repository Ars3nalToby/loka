// One address for Loka (23 Nov 2026): every other host 301s to https://lokabne.au, so the
// home-screen app, saved data and email sign-in links all live on the same origin.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const v = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
for (const host of ['tobyloka.vercel.app', 'www.lokabne.au']) test(`${host} redirects to lokabne.au`, () => {
  const r = (v.redirects || []).find(x => x.has?.some(h => h.type === 'host' && h.value === host));
  assert.ok(r, 'missing redirect'); assert.equal(r.destination, 'https://lokabne.au/$1'); assert.equal(r.permanent, true); });
test('no app file still points people at the old address', () => {
  for (const f of ['index.html', 'js/auth.js', 'js/landed.js', 'api/live.js', 'manifest.webmanifest'])
    assert.ok(!fs.readFileSync(f, 'utf8').includes('tobyloka.vercel.app'), f); });
test('security headers survived', () => assert.ok(JSON.stringify(v.headers).includes('Content-Security-Policy')));
