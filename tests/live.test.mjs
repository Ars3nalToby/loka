// Run: node --test   The /api/live function: safe text, safe links, fixed sources, today's window.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const live = require('../api/live.js'), T = live._test;
test('text() strips markup and scripts to plain text and cuts length', () => {
  assert.equal(T.text('<b>Hi</b> &amp; <script>alert(1)</script>bye'), 'Hi & alert(1) bye');
  assert.equal(T.text('<![CDATA[ Current ]]>'), 'Current');
  assert.equal(T.text('x'.repeat(50), 10).length, 10);
});
test('link() keeps only https links on the source domain', () => {
  assert.equal(T.link('http://reg.bom.gov.au/qld/warnings/heatwave.shtml', 'bom.gov.au'), 'https://reg.bom.gov.au/qld/warnings/heatwave.shtml');
  assert.equal(T.link('javascript:alert(1)', 'bom.gov.au'), '');
  assert.equal(T.link('https://evil.example/bom.gov.au', 'bom.gov.au'), '');
  assert.equal(T.link('https://bom.gov.au.evil.example/', 'bom.gov.au'), '');
});
test('parseRss() reads Translink-style items with categories', () => {
  const xml = `<rss><channel><item><title>⚠ Beenleigh line &lt;changes&gt;</title><link>https://translink.com.au/updates/1</link><description>Start date: 16/11/2026</description><category><![CDATA[ Current ]]></category><category><![CDATA[ Minor ]]></category></item><item><title><img src=x onerror=alert(1)>Bad</title><link>https://evil.example/</link></item></channel></rss>`;
  const r = T.parseRss(xml, 'translink.com.au');
  assert.equal(r.length, 2); assert.equal(r[0].t, '⚠ Beenleigh line <changes>'); assert.deepEqual(r[0].cat, ['Current', 'Minor']);
  assert.equal(r[1].t, 'Bad'); assert.equal(r[1].u, '');
});
test('events window runs from now to the end of tomorrow, Brisbane time', () => {
  const now = Date.parse('2026-11-18T08:00:00Z'); // 6pm in Brisbane
  const u = new URL(T.eventUrls(now)[0]);
  assert.equal(u.hostname, 'data.brisbane.qld.gov.au');
  assert.match(u.searchParams.get('where'), /end_datetime > '2026-11-18T08:00:00Z' and start_datetime < '2026-11-19T14:00:00Z'/);
});
test('shapeEvents() drops booked-out and duplicate events and bad links', () => {
  const r = T.shapeEvents([{ results: [
    { subject: 'Yoga', start_datetime: '2026-11-18T23:00:00+00:00', end_datetime: '2026-11-19T00:00:00+00:00', venue: 'Park', cost: 'Free', web_link: 'https://www.brisbane.qld.gov.au/trumba?x=1' },
    { subject: 'Yoga', start_datetime: '2026-11-18T23:00:00+00:00', end_datetime: '2026-11-19T00:00:00+00:00', venue: 'Park', cost: 'Free' },
    { subject: 'BOOKED OUT - Ballet', start_datetime: '2026-11-18T23:00:00+00:00' },
    { subject: 'Talk', start_datetime: '2026-11-19T01:00:00+00:00', web_link: 'javascript:alert(1)' }] }]);
  assert.equal(r.length, 2); assert.equal(r[0].u, 'https://www.brisbane.qld.gov.au/trumba?x=1'); assert.equal(r[1].u, '');
});
function mockRes() { const r = { h: {}, code: 0, body: '' }; r.setHeader = (k, v) => { r.h[k] = v }; r.status = c => { r.code = c; return r }; r.end = b => { r.body = b || ''; return r }; return r; }
test('handler refuses unknown feeds and non-GET methods without calling out', async () => {
  let called = false; const f = globalThis.fetch; globalThis.fetch = () => { called = true; throw new Error('no') };
  const a = mockRes(); await live({ method: 'GET', query: { k: 'https://evil.example' } }, a); assert.equal(a.code, 400);
  const b = mockRes(); await live({ method: 'POST', query: { k: 'events' } }, b); assert.equal(b.code, 405);
  const c = mockRes(); await live({ method: 'GET', query: { k: '__proto__' } }, c); assert.equal(c.code, 400);
  globalThis.fetch = f; assert.equal(called, false);
});
test('handler returns 502 and no-store when the source fails', async () => {
  const f = globalThis.fetch; globalThis.fetch = async () => ({ ok: false, status: 503, text: async () => '' });
  const r = mockRes(); await live({ method: 'GET', query: { k: 'transit' } }, r); globalThis.fetch = f;
  assert.equal(r.code, 502); assert.equal(r.h['Cache-Control'], 'no-store');
});
