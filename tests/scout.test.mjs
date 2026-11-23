// Scout invites (js/scout.js): a link carries ROOM details only, never the landlord's contact.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const store = {};
const ctx = vm.createContext({
  t: (en) => en, esc: (s) => String(s), btoa, atob, escape, unescape, encodeURIComponent, decodeURIComponent,
  HT: { room: ['🛏', 'Room', '单间'], whole: ['🏠', 'Whole place', '整套'] },
  location: { origin: 'https://lokabne.au', hash: '', pathname: '/', search: '' },
  localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
});
vm.runInContext(readFileSync(new URL('../js/scout.js', import.meta.url), 'utf8'), ctx);
const run = (c) => vm.runInContext(c, ctx);
const good = { type: 'room', title: 'Sunny room near Griffith', area: 'Sunnybank', near: 'Griffith Nathan', rent: 230, bond: 920, bills: true, furn: true, note: '两位安静室友 · quiet house' };

test('round trip keeps the room details, in Chinese too', () => {
  ctx.o = good; const d = run('scoutDecode(scoutEncode(o))');
  for (const k of ['type', 'title', 'area', 'near', 'rent', 'bond', 'bills', 'furn', 'note']) assert.deepEqual(d[k], good[k], k);
});
test('the link is a #fragment on lokabne.au (never sent to a server)', () => {
  ctx.o = good; assert.match(run('scoutUrl(scoutEncode(o))'), /^https:\/\/lokabne\.au\/#\/draft\/[\w-]+$/);
});
test('contact details are refused: phone, email, WeChat', () => {
  for (const note of ['call 0412 345 678', 'Ph: +61 412345678', 'email me a@b.com', '微信 abc123', 'wechat: abc', 'wx: lisa88', 'vx：lisa88'])
  { ctx.o = { ...good, note }; assert.equal(run('scoutEncode(o)'), null, note); }
  ctx.o = { ...good, title: 'Room 0412345678' }; assert.equal(run('scoutEncode(o)'), null, 'phone in title');
});
test('ordinary notes are not mistaken for phone numbers', () => {
  for (const note of ['Available 1 12 2026', 'bond 4 weeks ($920), 5 min to bus 130', '2 rooms, 3 bathrooms, 10 mins to UQ', 'Rent $230 per week, bond $920']) { ctx.o = { ...good, note }; assert.notEqual(run('scoutEncode(o)'), null, note); }
  for (const note of ['(07) 3123 4567', '0412-345-678', '+61 412 345 678']) { ctx.o = { ...good, note }; assert.equal(run('scoutEncode(o)'), null, note); }
});
test('a crafted link with contact details or junk opens nothing', () => {
  const bad = Buffer.from(JSON.stringify({ ...good, note: 'text 0412 345 678' })).toString('base64url');
  ctx.c = bad; assert.equal(run('scoutDecode(c)'), null);
  for (const c of ['', 'x', '!!!!', 'a'.repeat(4000), 'bm90IGpzb24']) { ctx.c = c; assert.equal(run('scoutDecode(c)'), null, c.slice(0, 10)); }
});
test('unknown fields (like contact) never survive, and only known types/agreements pass', () => {
  ctx.o = { ...good, contact: 'lisa@x.com', owner: 'someone', type: 'castle', agr: 'forever', status: 'published' };
  const d = run('scoutClean(o)');
  for (const k of ['contact', 'owner', 'status', 'type', 'agr']) assert.equal(k in d, false, k);
});
test('text is trimmed, capped and stripped of markup', () => {
  ctx.o = { ...good, title: '<b>Room</b>   ' + 'x'.repeat(300), note: 'y'.repeat(900) };
  const d = run('scoutClean(o)');
  assert.ok(!/[<>]/.test(d.title)); assert.ok(d.title.length <= 140); assert.ok(d.note.length <= 400);
});
test('numbers must be sane; title and rent are required', () => {
  ctx.o = { ...good, bond: -5, rent: 230 }; assert.equal('bond' in run('scoutClean(o)'), false);
  ctx.o = { ...good, rent: 'abc' }; assert.equal(run('scoutClean(o)'), null);
  ctx.o = { ...good, title: '' }; assert.equal(run('scoutClean(o)'), null);
});
test('a waiting draft expires after 14 days and is removed once used', () => {
  ctx.o = good; run('scoutSave(scoutClean(o))'); assert.equal(run('scoutPending().title'), good.title);
  store['loka.draft'] = JSON.stringify({ d: good, at: Date.now() - 15 * 864e5 }); assert.equal(run('scoutPending()'), null);
  run('scoutSave(scoutClean(o))'); run('scoutDone()'); assert.equal(run('scoutPending()'), null);
});
test('messages name the noticeboard, say it is free, and let the landlord say no', () => {
  const m = run(`scoutMessages('https://lokabne.au/#/draft/abc','Sunnybank Plaza',true)`);
  assert.match(m.zh, /Sunnybank Plaza/); assert.match(m.zh, /创办人/); assert.match(m.zh, /免费/); assert.match(m.zh, /忽略/);
  assert.match(m.en, /I run Loka/); assert.match(m.en, /ignore/); assert.match(m.en, /lokabne\.au\/#\/draft\/abc$/);
  assert.match(run(`scoutMessages('u','',false)`).en, /I use Loka/);
});
test('the landlord form fill never touches contact, role or declarations', () => {
  const src = readFileSync(new URL('../js/scout.js', import.meta.url), 'utf8');
  const fill = src.slice(src.indexOf('function scoutFill'), src.indexOf('function scoutGo'));
  for (const id of ['h_contact', 'h_role', 'h_c1', 'h_c2', 'h_c3', 'h_c4', 'h_by']) assert.ok(!fill.includes(id), id);
});
